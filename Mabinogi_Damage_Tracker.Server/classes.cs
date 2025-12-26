using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Runtime.CompilerServices;
using System.Text;
using System.Threading.Tasks;

namespace Mabinogi_Damage_Tracker
{
    public class Damage
    {
        public float damage { get; set; }
        public float wound { get; set; }
        public uint mana_damage { get; set; }
        public UInt64 player_id { get; set; }
        public UInt64 enemy_id{ get; set; }
        public SkillId skillid { get; set; }
        public SkillId subskillid { get; set; }
        public string player_name { get; set; }

        public Damage(float dmg, float wnd, uint mana_dmg, UInt64 plyr_id, UInt64 enmy_id, SkillId skill, SkillId subskill, string plyr_name = "")
        {
            damage = dmg;
            wound = wnd;
            mana_damage = mana_dmg;
            player_id = plyr_id;
            enemy_id = enmy_id;
            skillid = skill;
            subskillid = subskill;
            player_name = plyr_name;

        }
    }
    public class Name
    {
        public string name { get; set; }
        public UInt64 player_id { get; set; }

        public Name(string nme, UInt64 ply_id)
        {
            name = nme;
            player_id = ply_id;
        }
    }

    public class healing
    {
        public UInt64 caster {  get; set; }
        public UInt64 recepient { get; set; }
        public UInt32 heal {  get; set; }
        public healing (UInt64 Caster, UInt64 Recepient, UInt32 Heal)
        {
            caster = Caster;
            recepient = Recepient;
            heal = Heal;
        }
        public healing()
        { }
    }

    public static class Op_Codes
    {
        public const int ChannelCharacterInfoRequestR = 0x5209;
        public const int EntityAppears = 0x520C;
        public const int EntitiesAppear = 0x5334;
        public const int CombatActionPack = 0x7926;
        public const int PuppetControl = 0x702C;
        public const int Run = 0x0F213303;
        public const int Running = 0x0F44BBA3;
        public const int FlyTo = 0x65AE;
        public const int FlyingTo = 0x65AF;
        public const int VehicleInfo = 0x1FBD4;
        public const int ChatMessage = 21100;
        public const int healing = 37011;
    }
}
