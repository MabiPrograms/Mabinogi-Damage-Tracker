using Mabinogi_Damage_Tracker;
using PacketDotNet;
using SharpPcap.LibPcap;
using SharpPcap;
using System.Buffers.Binary;
using System.ComponentModel;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.Text;
using Microsoft.AspNetCore.Identity.UI.Services;
using System;
using System.Linq.Expressions;
using System.Reflection.Metadata.Ecma335;
using SQLitePCL;



namespace Mabinogi_Damage_tracker
{
    public static class Parser
    {
        static CaptureFileWriterDevice captureFileWriter = new CaptureFileWriterDevice("out.pcapng");
        static bool savenextpacket = false;
        static BindingList<Name> character_names = new BindingList<Name>();
        static UInt64 last_healer = 0;
        public static string adapter_description;
        public static List<string> adapters = new List<string>();
        
        
        public static bool pause = false;
        #if DEBUG_LIVE || RELEASE
            static LibPcapLiveDevice device = null;
        #endif
        #if DEBUG_FILE
            static CaptureFileReaderDevice device = new CaptureFileReaderDevice("C:/packets/full glenn vhm run.pcapng");
        #endif
        static Thread reader;


        //i am unconvinced this is the best way to handle the thread managing the event handler
        public static bool Stop()
        {
            
            device.Close();
            device.StopCapture();
            device.OnPacketArrival -= Device_OnPacketArrival;
            
            Stopwatch watchdog = Stopwatch.StartNew();
            while (watchdog.ElapsedMilliseconds < 5000 && (device.Opened == true || reader.ThreadState == System.Threading.ThreadState.Running))
            {
                Thread.Sleep(50);
            }
            if(reader.ThreadState == System.Threading.ThreadState.Running || device.Opened == true)
            {
                LogsController.WriteLog("Could not stop thread. Try restarting server");
                return false;
            }
            return true;
        }
        public static void Start()
        {
            reader = new Thread(Reader);
            reader.Name = "Reader Thread";
            reader.Start();
        }

        private static void Reader()
        {
            Debug.WriteLine("starting Parser");
            LogsController.WriteLog("Starting Parser.");

            string filter = "ip and tcp and tcp portrange 11020-11023";
#if DEBUG_LIVE || RELEASE
            //populate a list of adapters for the front end
            adapters = LibPcapLiveDeviceList.Instance.Select(a => a.Description).ToList();
            //check if we have a saved adapter
            adapter_description = db_helper.Get_Local_Adapter();
            if(adapter_description != null && adapter_description !="")
            {
                try
                {
                    device = LibPcapLiveDeviceList.Instance.First(a => a.Description == adapter_description);
                    LogsController.WriteLog(string.Format("Starting with saved adapter: {0}", adapter_description));
                }
                catch
                {
                    device = null;
                }
            }
            if (adapter_description == null || adapter_description == "" || device == null)
            {
                foreach (var dev in LibPcapLiveDeviceList.Instance)
                {
                    Debug.WriteLine(dev.Description.ToString());
                    dev.Open(DeviceModes.Promiscuous, 1000);
                    dev.Filter = filter;

                    Stopwatch watchdog = Stopwatch.StartNew();

                    GetPacketStatus status;
                    PacketCapture pack;
                    //lets walk through each adapter and see if we can get a packet
                    while (watchdog.ElapsedMilliseconds < 2000 && device == null)
                    {
                        status = dev.GetNextPacket(out pack);
                        if (status == GetPacketStatus.PacketRead)
                        {
                            adapter_description = dev.Description;
                            Debug.WriteLine("found adapater");
                            LogsController.WriteLog("Found an adapter " + dev.Description);
                            LogsController.WriteLog("Save this adapter's name in the settings menu to skip scanning next time");
                            device = dev;
                            break;
                        }
                    }
                    dev.Close();
                    if (device != null) { break; }
                }
            }
            if (device == null)
            {
                LogsController.WriteLog("Could not find an adapter. Are you sure Mabi is running?");
                LogsController.WriteLog("Restart Parser and try moving while scanning. Check your setup and wireshark to confirm data received.");
                return;
            }
            #endif

            try
             {
                device.Open(DeviceModes.Promiscuous);
                device.Filter = filter;
                device.OnPacketArrival += Device_OnPacketArrival;
                captureFileWriter.Open();
#if DEBUG_FILE
                device.Capture();
#endif
#if DEBUG_LIVE || RELEASE
                device.StartCapture();
#endif
            }
            catch(Exception ex)
            {
                LogsController.WriteLog("Failed to start parser. execption: " + ex.Message);
            }
        }

        private static void Device_OnPacketArrival(object s, PacketCapture e)
        {
            if(pause == true)
            {
                return;
            }

            //type of message
            DateTime time = e.Header.Timeval.Date;
            int len = e.Data.Length;
            RawCapture raw = e.GetPacket();

            if (savenextpacket)
            {
                savenextpacket = false;
                captureFileWriter.Write(raw);
            }

            Packet packet = PacketDotNet.Packet.ParsePacket(raw.LinkLayerType, raw.Data);

            TcpPacket tcp = packet.Extract<PacketDotNet.TcpPacket>();

            if(tcp == null) { return; }

            #region packet info
            //each packet has sub packets
            //the first byte of the packet is 'sign' ? dont know what it does
            //the next 4 bytes (byte[1-4]) are a little eden unit32 'length' of the sub packet
            //byte 5 is 'flag' sometimes used as a heart beat or keep alive should always be less than 4
            //packet must have more than 6 bytes + 13 bytes 6 for header 13 for data
            //
            //that completes the header
            //the body starts with an 'opcode' big eden uint32          data packets use opcode 0x7926
            //then an big eden uint64 'id'
            //the next type is a variable int with a max of 64bits. a custom function needs to be written like golang's binary.Uvarint where each byte is checked if its greater than 0x80 and bit shifted until one less than 0x80 is found
            //the above vaiable int is not used for anything
            //
            //then the data of the packet
            //
            //the first byte[0] is how many items are in the data packet this is also a uvarint but we do not care because damage packets are less than 1 byte big (128)
            //the next byte[1] should always be 0
            //the next byte[2] is the data type of the following number using this enumarator
            //          1,2,3,4,5,6,7 
            //          byte, short, int32, long, float, string, bin
            //the reaminder of the packet is data
            //damage packets have a subsub packet that contains the damage. the header of the subpacket (that we are in so far) contains the following
            //uint32 actionpack-id
            //uint32 prev-actionpack-id
            //byte hit
            //byte ttype
            //byte unk1
            //byte flag
            //      we must check flag for 0 if flag is a non zero then the attack was blocked and there is more data, atm these packets are just skipped for future refence it is an int, int, long we could possibly skip this section
            //int subsubpacket-count
            //
            //a sub sub packet is made up of an int and a bin
            //      we skip the int in the subpacket dont know what it does
            //inside the bin of the subsub packet we have the info we want
            //      uint32 combatActionID
            //      uint64 entityID
            //      byte ttype
            //      uint16 stun
            //      uint16 skillid
            //      uint16 subskillid
            //      unit16 unk1
            // we then have to check bits 1 and 2 with a bitewise and on ttype to make sure they are 1 this is done is 2 seperate sup sup packets
            //bitwise and 2 != 0 packet gives the following:
            //              uint64 targetID
            //              uint32 options
            //              byte usedWeaponset
            //              byte weaponParameterType
            //              uint32 unk1
            //              uint32 posX
            //              uint32 posY
            //a bitewise and 1 != 0 packet gives the following:
            //              uint32 options
            //              float damage (wow ding ding ding)
            //              float wound
            //              uint32 manadamage
            //thats the packet structure.

            //main tcp packet
            //      sub game packet
            //          --header start--
            //          byte[1-4]   length        
            //          byte[5]     flag
            //          byte[6-9]   opcode        
            //          byte[10-18] id
            //          byte[19-?]  ?  unisgned, vairable int
            //          --header end--
            //          --sub sub packet beging--
            //          byte[0]     how many items are in the packet also a unsigned variable int but we dont need to check other than making sure its less than 0x80
            //          byte[1] should be 0
            //              --data chunk--
            //              byte[0] data type 1,2,3,4,5,6,7
            //              byte[1-?] data
            //              --end data chuck--
            //          the rest of the packet is data

            //Debug.WriteLine("packet read len {0}", raw.Data.Length);
            #endregion

            int cursor = 0;

            bool previous_healing_packet = false;
            List<healing> healing_packs = new List<healing>();
            

            while (cursor + 10 < tcp.PayloadData.Length)
            { 
                //parse sub packet header
                int begining_of_packet_cursor = cursor;
                byte sign = tcp.PayloadData[cursor];
                cursor += sizeof(byte);

                //we use AsSpan to not chop up the raw packet. this handles creating and disposing a section or snip of the data packet
                UInt32 sub_packet_length = BinaryPrimitives.ReadUInt32LittleEndian(tcp.PayloadData.AsSpan(cursor));
                if (sub_packet_length > 2000 || sub_packet_length == 0)
                {
                    //bad data skip packet
                    continue;
                }
                cursor += sizeof(UInt32);

                byte header_flag = tcp.PayloadData[cursor];
                cursor += sizeof(byte);

                if (sub_packet_length < 5) { cursor = (int)sub_packet_length + begining_of_packet_cursor; continue; }
                if (header_flag > 4 || header_flag == 1 || header_flag == 2) { cursor = (int)sub_packet_length + begining_of_packet_cursor; continue; }

                //header done next is opcode
                UInt32 opcode = BinaryPrimitives.ReadUInt32BigEndian(tcp.PayloadData.AsSpan(cursor));
                cursor += sizeof(UInt32);

                switch(opcode)
                {
                    case Op_Codes.healing:         //healing
                        pack_healing(tcp, cursor, ref healing_packs, (int)sub_packet_length, begining_of_packet_cursor);
                        break;
                    case Op_Codes.ChatMessage:
                        read_chat(tcp, cursor);
                        break;
                    case Op_Codes.CombatActionPack:
                        pack_damage(tcp, cursor, (int)sub_packet_length, begining_of_packet_cursor);
                        break;
                }
                cursor = (int)sub_packet_length + begining_of_packet_cursor; 
                continue; 
            }

            if(healing_packs.Count > 0)
            {
                healing_packs.ForEach(a => a.caster = last_healer);
                foreach (var item in healing_packs)
                {
                    if(item.heal > 10000) { return; }
                    db_helper.add_heal(item.caster, item.recepient, item.heal);
                    LogsController.WriteLog("[HEAL]" + item.caster + "->" + item.recepient + " for " + item.heal);
                    Debug.WriteLine("player {0}, was healed by {1}, for {2}",item.recepient,item.caster,item.heal);
                }
            }

            return;
        }

        private static void pack_healing(TcpPacket tcp, int cursor, ref List<healing> healing_packs, int sub_packet_length, int begining_of_packet_cursor)
        {
            #region healing packet notes
            //healing packets have 2 back to back opcodes the firstpacket has plain text 'healing'
            //the first packet starts with the caster uid uint64
            //then a flag,
            //0x0A = has the recepient id and the healing value -- it apears that the 2 bytes before the value indicate if it was, hp, mana, stamina, wound
            //0x19 = healing cast which is a packet that says who casted healing on who
            //0x28 = party healing cast
            //0x13 = hands of restoration cast -- note hands of restoration seems to return a 0 when the receptient is at full hp or at all times? all HS skils behaive this way
            //??? = voices of vitality
            //??? = echos of salvation

            //then at location 16 a string indicator with a length of 8 that says 'healing'
            //then a uint64 for the recepiant id
            
            //then right after there should be another healing packet
            //the first section of the packet is a uint64 for the recepient id
            //skip a byte
            //uint16
            //skip 2 bytes
            //byte
            //uint32 healing received
            #endregion
            try
            {
                byte heal_type = tcp.PayloadData[cursor + sizeof(UInt64)];
                healing healpack = new healing();

                switch (heal_type)
                {
                    case 0x0A:  //healing received
                        healpack.recepient = BinaryPrimitives.ReadUInt64BigEndian(tcp.PayloadData.AsSpan(cursor));
                        healpack.heal = BinaryPrimitives.ReadUInt32BigEndian(tcp.PayloadData.AsSpan(cursor + 17));
                        healing_packs.Add(healpack);
                        break;
                    case 0x19: //healing cast
                        last_healer = BinaryPrimitives.ReadUInt64BigEndian(tcp.PayloadData.AsSpan(cursor));
                        break;
                    case 0x28: //party healing
                        last_healer = BinaryPrimitives.ReadUInt64BigEndian(tcp.PayloadData.AsSpan(cursor));
                        //get the string length
                        cursor += 19;
                        int stringlength = tcp.PayloadData[cursor];
                        cursor += stringlength;
                        //multiple player ids possible check that we arnt over the sub packet and that they are uint64s
                        while (cursor < sub_packet_length + begining_of_packet_cursor)
                        {
                            if (tcp.PayloadData[cursor] != 4) { break; }
                            healing multiheal = new healing();
                            multiheal.recepient = BinaryPrimitives.ReadUInt64BigEndian(tcp.PayloadData.AsSpan(cursor + 1));
                            multiheal.caster = last_healer;
                            healing_packs.Add(multiheal);
                            cursor += sizeof(UInt64);
                        }
                        break;
                }
            }
            catch
            {
            }
        }

        private static void pack_damage(TcpPacket tcp, int cursor, int sub_packet_length, int begining_of_packet_cursor)
        {
            UInt32 _subsub_pack_len = 0;

            try
            {
#if DEBUG_FILE
                Random rand = new Random();
                Thread.Sleep(rand.Next(55));
#endif

                UInt64 sub_packet_id = BinaryPrimitives.ReadUInt64BigEndian(tcp.PayloadData.AsSpan(cursor));
                cursor += sizeof(UInt64);

                //we found a good opcode ok lets continue to parse the damage packet
                //read the uvint64 
                UInt64 throwaway_uvint64;
                int variable_int_bytesread;
                read_variable_length_uint64(tcp.PayloadData.AsSpan(cursor), out throwaway_uvint64, out variable_int_bytesread);
                cursor += variable_int_bytesread;

                //lets start parsing the sub sub packet
                byte sub_item_count = tcp.PayloadData[cursor]; //when do we start eating the first byte?
                cursor += sizeof(byte);

                //check to make sure the next byte is 0 as it always should be
                if (tcp.PayloadData[cursor] != 0) { cursor = (int)sub_packet_length + begining_of_packet_cursor; return; }
                cursor++;

                //now we read the header of the sub packet that contains data, all data chucnks have an extra byte at the begining to tell what type of data it is
                //at the moment we just assume the packet is formed correctly.

                cursor++;
                UInt32 actionpack_id = BinaryPrimitives.ReadUInt32BigEndian(tcp.PayloadData.AsSpan(cursor));
                cursor += sizeof(UInt32);


                cursor++;
                UInt32 prev_actionpack_id = BinaryPrimitives.ReadUInt32BigEndian(tcp.PayloadData.AsSpan(cursor));
                cursor += sizeof(UInt32);


                cursor++;
                byte hit = tcp.PayloadData[cursor];
                cursor += sizeof(byte);


                cursor++;
                byte ttype = tcp.PayloadData[cursor];
                cursor += sizeof(byte);


                cursor++;
                byte unk1 = tcp.PayloadData[cursor];
                cursor += sizeof(byte);


                cursor++;
                byte sub_header_flag = tcp.PayloadData[cursor];
                cursor += sizeof(byte);

                //check if the attack was blocked. if it is blocked there is more data at the moment we just skip these packets
                if ((sub_header_flag & 0x1) != 0)
                {
                    cursor++;
                    cursor++;
                    cursor++;
                    cursor += sizeof(UInt32);
                    cursor += sizeof(UInt32);
                    cursor += sizeof(UInt64);
                }

                cursor++;
                UInt32 subsub_packet_count = BinaryPrimitives.ReadUInt32BigEndian(tcp.PayloadData.AsSpan(cursor));
                cursor += sizeof(UInt32);

                UInt64 attacker_id = 0;
                UInt64 enemy_id = 0;
                SkillId skill = 0;
                SkillId subskill = 0;
                string throwawaypacket = "";

                //now we have to parse each sub packet
                for (int i = 0; i < subsub_packet_count; i++)
                {
                    int subsub_pack_start_cursor = cursor + 8;
                    //get the subsub packet length
                    cursor++;
                    UInt32 subsub_pack_len = BinaryPrimitives.ReadUInt32BigEndian(tcp.PayloadData.AsSpan(cursor)); ;
                    _subsub_pack_len = subsub_pack_len;

                    //we have to skip the header of the subsub packet
                    cursor += 22;

                    cursor++;

                    UInt32 combatActionID = BinaryPrimitives.ReadUInt32BigEndian(tcp.PayloadData.AsSpan(cursor));
                    cursor += sizeof(UInt32);

                    cursor++;
                    UInt64 entityID = BinaryPrimitives.ReadUInt64BigEndian(tcp.PayloadData.AsSpan(cursor)); //possibly player id
                    cursor += sizeof(UInt64);

                    cursor++;
                    byte subsub_ttype = tcp.PayloadData[cursor];
                    cursor += sizeof(byte);

                    cursor++;
                    UInt16 stun = BinaryPrimitives.ReadUInt16BigEndian(tcp.PayloadData.AsSpan(cursor));
                    cursor += sizeof(UInt16);

                    cursor++;
                    UInt16 skillid = BinaryPrimitives.ReadUInt16BigEndian(tcp.PayloadData.AsSpan(cursor));
                    cursor += sizeof(UInt16);

                    cursor++;
                    UInt16 subskillid = BinaryPrimitives.ReadUInt16BigEndian(tcp.PayloadData.AsSpan(cursor));
                    cursor += sizeof(UInt16);

                    cursor++;
                    UInt16 subsub_unk1 = BinaryPrimitives.ReadUInt16BigEndian(tcp.PayloadData.AsSpan(cursor));
                    cursor += sizeof(UInt16);


                    if ((subsub_ttype & 2) != 0)
                    {
                        attacker_id = entityID;
                        skill = (SkillId)skillid;
                        subskill = (SkillId)subskillid;

                        throwawaypacket = ("throw away packet: " + BitConverter.ToString(tcp.PayloadData, subsub_pack_start_cursor + 43, (int)subsub_pack_len));
                        #region extrapacketinfo
                        //cursor++;
                        //cursor += sizeof(UInt64);

                        //cursor++;
                        //cursor += sizeof(UInt32);

                        //cursor++;
                        //cursor += sizeof(byte);

                        //cursor++;
                        //cursor += sizeof(byte);

                        //cursor++;
                        //cursor += sizeof(UInt32);

                        //cursor++;
                        //cursor += sizeof(UInt32);

                        //cursor++;
                        //cursor += sizeof(UInt32);
                        #endregion
                    }

                    if ((subsub_ttype & 1) != 0)
                    {
                        enemy_id = entityID;
                        cursor++;
                        UInt32 options = BinaryPrimitives.ReadUInt32BigEndian(tcp.PayloadData.AsSpan(cursor));
                        cursor += sizeof(UInt32);

                        cursor++;
                        float damage = BinaryPrimitives.ReadSingleLittleEndian(tcp.PayloadData.AsSpan(cursor));
                        cursor += sizeof(float);

                        cursor++;
                        float wound = BinaryPrimitives.ReadSingleLittleEndian(tcp.PayloadData.AsSpan(cursor));
                        cursor += sizeof(float);

                        cursor++;
                        UInt32 manaDamage = BinaryPrimitives.ReadUInt32BigEndian(tcp.PayloadData.AsSpan(cursor));
                        cursor += sizeof(UInt32);
                        #region extra packet info
                        ////unk1
                        //cursor++;
                        //cursor += sizeof(UInt32);
                        ////unk2
                        //cursor++;
                        //cursor += sizeof(UInt32);
                        ////xdist
                        //cursor++;
                        //cursor += sizeof(float);
                        ////ydist
                        //cursor++;
                        //cursor += sizeof(float);
                        #endregion

                        //where were at
                        if ((options & 33554432) != 0)
                        {
                            Debug.WriteLine("multiline found saving packet");
                            //captureFileWriter.Write(raw);
                            //multi hit unkown datatypes atm
                            // hit count, unk2, unk3, unk4
                        }
                        #region extra packet info
                        //// effect flags, delay, attacker id, unk3, attacker id
                        //cursor++;
                        //cursor += sizeof(float);
                        //cursor++;
                        //cursor += sizeof(float);
                        //cursor++;
                        //cursor += sizeof(UInt32);
                        //cursor++;
                        //cursor += sizeof(byte);
                        //cursor++;
                        //cursor += sizeof(UInt32);

                        ////??
                        //cursor++;
                        //cursor += sizeof(UInt64);
                        //cursor++;
                        //cursor += sizeof(UInt32);
                        //cursor++;
                        //cursor += sizeof(UInt64);
                        #endregion

                        //check to make sure were only looking at player outgoing damage
                        if (attacker_id < 0x0010000000000001 || attacker_id > 0x0010010000000001)
                        { break; }

                        if(damage < 0 || damage > 100000000 || skillid == 601 || skillid == 512 || skillid == 590) { break; }

                        LogsController.WriteLog(string.Format("[DAMAGE] Attacker: {0} -> Enemy: {1} for {2}", attacker_id, enemy_id, damage));
                        Debug.WriteLine("Damage {0}, Wound {1}, mana Damage {2}, Attacker {3} {4} -> Enemy {5}, with {6} : {7}", damage.ToString("0.0"), wound.ToString("0.0"), manaDamage, attacker_id, "", enemy_id, skill, subskill);
                        db_helper.add_damage((Int64)attacker_id, damage, wound, (int)manaDamage, (Int64)enemy_id, skillid, subskillid);
                    }
                    cursor = subsub_pack_start_cursor + (int)subsub_pack_len;
                }
            }
            catch (ArgumentOutOfRangeException ex)
            {
                Debug.WriteLine("Cursor out of range, saving this packet and the next. cursor at {0}, packet length {1}, sub packet length {2}, sub sub packet length {3}", cursor, tcp.PayloadData.Length, sub_packet_length, _subsub_pack_len);
                cursor = (int)sub_packet_length + begining_of_packet_cursor;
                savenextpacket = true;
                //captureFileWriter.Write(raw);
            }
            catch (Exception ex)
            {
                cursor = (int)sub_packet_length + begining_of_packet_cursor;
                Debug.WriteLine("caught an execption after finding a damage packet: ex {0}", ex.ToString());
            }
        }

        private static void read_chat(TcpPacket packet, int cursor)
        {
            try
            {
                //the next uint64 is the palyer id
                UInt64 playerid = BinaryPrimitives.ReadUInt64BigEndian(packet.PayloadData.AsSpan(cursor));

                if (playerid < 0x0010000000000001 || playerid > 0x0010010000000001)
                {
                    return;
                }

                if (character_names.Select(a => a.player_id).Contains(playerid))
                {
                    return;
                }

                cursor = 25;
                byte namelength = packet.PayloadData[25];

                if (namelength > 36 || namelength <= 1) { return; }
                cursor++;
                //the next [namelength] bytes is the name

                string playername = Encoding.UTF8.GetString(packet.PayloadData, cursor, (int)namelength - 1);

                if (string.IsNullOrWhiteSpace(playername)) { return; }
                playername = playername.Trim();
                if (playername.Any(char.IsControl)) { return; }

                //character_names.Add(new Name(playername, playerid));
                db_helper.add_player(playername, (Int64)playerid);
                LogsController.WriteLog("[PLAYER DISCOVERED]" + playerid.ToString() + " -> " + playername);
                Debug.WriteLine("chat message read, playerid: {0}, username {1}", playerid.ToString(), playername);
            }
            catch
            {
                Debug.WriteLine("couldnt parse a name packet saving packet");
                captureFileWriter.Write(packet.PayloadData);
            }
        }

        private static void read_variable_length_uint64(Span<byte> bytes, out UInt64 parsedint, out int bytesread)
        {
            bytesread = 0;
            parsedint = 0;
            foreach (byte b in bytes)
            {
                if (bytesread == 10)
                {
                    //we read more bytes than we should have return an error
                    parsedint = 0;
                    bytesread = -1;
                    return;
                }
                if (b < 0x80)
                {
                    if (b > 1 && bytesread == 9)
                    {
                        //we read more bytes than we should have return an error
                        parsedint = 0;
                        bytesread = -1;
                        return;
                    }
                    parsedint = parsedint | (UInt64)b << bytesread * 8;
                    bytesread += 1;
                    return;
                }
                parsedint |= (UInt64)(b & 127) << (bytesread * 8) - bytesread;
                bytesread += 1;
            }
            parsedint = 0;
            bytesread = -1;
            return;
        }

    }
}

