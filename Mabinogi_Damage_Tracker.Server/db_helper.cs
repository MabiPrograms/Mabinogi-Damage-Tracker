using System.Diagnostics;
using System.Text.Json;
using System.Xml.Linq;
using Mabinogi_Damage_tracker.Models;
using Mabinogi_Damage_Tracker;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Data.Sqlite;

namespace Mabinogi_Damage_tracker
{
    public class db_helper
    {
        private static string db_connection = @"Data Source=trackerdb.db;";

        public static void Initalize_db()
        {
            using (SqliteConnection connection = new SqliteConnection(db_connection))
            {
                connection.Open();
                SqliteCommand sqliteCommand = connection.CreateCommand();
                //create the playerid table
                string create_playerid = @"
                CREATE TABLE IF NOT EXISTS players (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    playerid NUMERIC NOT NULL UNIQUE,
                    playername VARCHAR(48) NOT NULL )";

                //create the damage table
                string create_damage = @"
                CREATE TABLE IF NOT EXISTS damages (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    playerid NUMERIC NOT NULL,
                    damage NUMERIC NOT NULL,
                    wound NUMERIC,
                    manadamage NUMERIC,
                    enemyid NUMERIC NOT NULL,
                    skill INT NOT NULL,
                    subskill INT NOT NULL,
                    dt TEXT NOT NULL,
                    ut INTEGER NOT NULL)";

                //create the healing table
                string create_heal = @"
                CREATE TABLE IF NOT EXISTS heals (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    healer NUMERIC NOT NULL,
                    heal NUMERIC NOT NULL,
                    recipient NUMERIC NOT NULL,
                    dt TEXT NOT NULL,
                    ut INTEGER NOT NULL)";

                //create the recording table
                string create_recording = @"
                CREATE TABLE IF NOT EXISTS recordings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    start_ut INTEGER NOT NULL,
                    end_ut INTEGER)";

                string create_adapter = @"
                    CREATE TABLE IF NOT EXISTS local_adapter(
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        adapter TEXT
                    )";


                sqliteCommand.CommandText = create_playerid;
                sqliteCommand.ExecuteNonQuery();
                sqliteCommand.CommandText = create_damage;
                sqliteCommand.ExecuteNonQuery();
                sqliteCommand.CommandText = create_heal;
                sqliteCommand.ExecuteNonQuery();
                sqliteCommand.CommandText = create_recording;
                sqliteCommand.ExecuteNonQuery();
                sqliteCommand.CommandText = create_adapter;
                sqliteCommand.ExecuteNonQuery();
            }
        }

        public static void add_player(string playername, Int64 playerid)
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand add_command = new SqliteCommand(@"
                    INSERT OR IGNORE INTO players (playerid, playername)
                        VALUES(@playerid,@playername)
                    ", connection);
                    add_command.Parameters.AddWithValue("@playerid", playerid);
                    add_command.Parameters.AddWithValue("@playername", playername);
                    add_command.ExecuteNonQueryAsync();
                }
            }
            catch
            {
                Debug.WriteLine("could not send sql command");
            }
        }

        public static List<object> Get_All_Players()
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand command = new SqliteCommand(@"
                    SELECT * FROM players
                    ", connection);

                    using (SqliteDataReader reader = command.ExecuteReader())
                    {
                        if (reader.HasRows == false) { return null; }
                        var query_results = new List<object>();
                        while (reader.Read())
                        {
                            int id = reader.GetInt32(reader.GetOrdinal("id"));
                            long playerId = reader.GetInt64(reader.GetOrdinal("playerid"));
                            string playerName = reader["playername"]?.ToString() ?? $"Player {playerId}";

                            query_results.Add(new 
                            { 
                                id = id,
                                playerId = playerId,
                                playerName = playerName
                            });
                        }

                        return query_results;
                    }
                }
            }
            catch
            {
                return null;
            }
        }

        public static void add_damage(Int64 playerid, double damage, double wound, int manadamage, Int64 enemyid, int skill, int subskill)
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand add_command = new SqliteCommand(@"
                    INSERT INTO damages (playerid, damage, wound, manadamage, enemyid, skill, subskill, dt, ut)
                        VALUES(@id,@dmg,@wound,@manadamage,@enemyid,@skill,@subskill,datetime(), unixepoch())
                    ", connection);
                    add_command.Parameters.AddWithValue("@id", playerid);
                    add_command.Parameters.AddWithValue("@dmg", damage);
                    add_command.Parameters.AddWithValue("@wound", wound);
                    add_command.Parameters.AddWithValue("@manadamage", manadamage);
                    add_command.Parameters.AddWithValue("@enemyid", enemyid);
                    add_command.Parameters.AddWithValue("@skill", skill);
                    add_command.Parameters.AddWithValue("@subskill", subskill);
                    add_command.ExecuteNonQueryAsync();
                }
            }
            catch 
            {
                Debug.WriteLine("couldnt send sql command");
            }
        }

        public static Damage_Simple Get_Largest_Single_Damage_Instance(int start_ut, int end_ut)
        {
            return Get_ListOf_Distinct_Largest_Single_Damage_Instance(start_ut, end_ut, 1)[0];
        }

        public static List<Damage_Simple> Get_ListOf_Distinct_Largest_Single_Damage_Instance(int start_ut, int end_ut, int count)
        {
            List<Damage_Simple> query_results = new List<Damage_Simple>();
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand command = new SqliteCommand(@"
                    SELECT distinct damages.playerid, MAX(damage) AS mx_damage, playername, damages.ut
                    FROM damages
                    left join players on damages.playerid = players.playerid
                    WHERE ut BETWEEN @start_ut AND @end_ut
                    GROUP by damages.playerid 
                    order by mx_damage DESC
                    limit @count
                    ", connection);

                    command.Parameters.AddWithValue("@start_ut", start_ut);
                    command.Parameters.AddWithValue("@end_ut", end_ut);
                    command.Parameters.AddWithValue("@count", count);

                    using (SqliteDataReader reader = command.ExecuteReader())
                    {
                        if (reader.HasRows == false) { return null; }
                        while (reader.Read())
                        {
                            long playerId = reader.GetInt64(reader.GetOrdinal("playerid"));
                            string playerName = reader.IsDBNull(reader.GetOrdinal("playername")) ? $"{playerId}" : reader.GetString(reader.GetOrdinal("playername"));
                            double dmg = reader.GetDouble(reader.GetOrdinal("mx_damage"));
                            Int32 ut = reader.GetInt32(reader.GetOrdinal("ut"));
                            query_results.Add(new Damage_Simple( dmg, playerId, playerName, ut));
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
            return query_results;
           
        }

        public static Int64 Get_Last_Damage_Row_Id()
        {
            Int64 query_results = 0;
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand command = new SqliteCommand(@"
                    SELECT MAX(id) FROM damages;
                    ", connection);
                    query_results = (Int64)command.ExecuteScalar();
                }
            }
            catch
            {
                return 0;
            }
            return query_results;
        }

        public static void add_heal (UInt64 healer, UInt64 recipient, UInt32 heal)
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand add_command = new SqliteCommand(@"
                    INSERT INTO heals (healer, heal, recipient, dt, ut)
                        VALUES(@healer,@heal,@rec,datetime(), unixepoch())
                    ", connection);
                    add_command.Parameters.AddWithValue("@healer", healer);
                    add_command.Parameters.AddWithValue("@heal", heal);
                    add_command.Parameters.AddWithValue("@rec", recipient);
                    add_command.ExecuteNonQueryAsync();
                }
            }
            catch
            {
                Debug.WriteLine("couldnt send sql command");
            }
        }

        public static int Get_SumHeals_BetweenUT(int start_ut, int end_ut)
        {
            int query_result = 0;
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand command = new SqliteCommand(@"
                    SELECT SUM(heals.heal) from heals
                    WHERE heals.ut BETWEEN @start_ut AND @end_ut
                    ", connection);
                    command.Parameters.AddWithValue("@start_ut", start_ut);
                    command.Parameters.AddWithValue("@end_ut", end_ut);
                    object result = command.ExecuteScalar();
                    return result == DBNull.Value ? 0 : Convert.ToInt32(result);
                }
            }
            catch
            {
                return 0;
            }
        }

        public static void add_recording(string name, int start_ut, int end_ut)
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand add_command = new SqliteCommand(@"
                    INSERT INTO recordings (name, start_ut, end_ut)
                        VALUES(@name,@start_ut,@end_ut)
                    ", connection);
                    add_command.Parameters.AddWithValue("@name", name);
                    add_command.Parameters.AddWithValue("@start_ut", start_ut);
                    add_command.Parameters.AddWithValue("@end_ut", end_ut);
                    add_command.ExecuteNonQueryAsync();
                }
            }
            catch
            {
                Debug.WriteLine("couldnt send sql command");
            }
        }

        public static void delete_recording(int id)
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand delete_command = new SqliteCommand(@"
                    DELETE FROM recordings
                    WHERE recordings.id = @id
                    ", connection);
                    delete_command.Parameters.AddWithValue("@id", id);
                    delete_command.ExecuteNonQueryAsync();
                }
            }
            catch
            {
                Debug.WriteLine("Couldn't Delete Recording Id: ", id);
            }
        }

        public static void update_recording_name(int id, string name)
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand add_command = new SqliteCommand(@"
                    UPDATE recordings
                    SET name = @name
                    WHERE id = @id
                    ", connection);
                    add_command.Parameters.AddWithValue("@name", name);
                    add_command.Parameters.AddWithValue("@id", id);
                    add_command.ExecuteNonQueryAsync();
                }
            }
            catch
            {
                Debug.WriteLine("couldnt send sql command");
            }
        }

        public static List<Models.Damage_Simple> Get_TotalDamage_ByPlayers()
        {
            List<Models.Damage_Simple> query_results = new List<Models.Damage_Simple>();
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand command = new SqliteCommand(@"
                    SELECT damages.playerid, SUM( damage), playername
                        FROM damages
                        left join players on damages.playerid = players.playerid
                        group by damages.playerid 
                    ", connection);
                    using (SqliteDataReader reader = command.ExecuteReader())
                    {
                        if (reader.HasRows == false) { return null; }
                        while (reader.Read())
                        {
                            string name = "";
                            if (reader.IsDBNull(2) != true)
                            {
                                name = reader.GetString(2);
                            }
                            if (name == "")
                            {
                                name = reader.GetInt64(0).ToString();
                            }
                            query_results.Add(new Models.Damage_Simple(reader.GetDouble(1), reader.GetInt64(0), name));
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
            return query_results;
        }

        public static List<Models.Damage_Simple> Get_Damages_Between_Ut(Int32 start_ut, Int32 end_ut)
        {
            List<Models.Damage_Simple> query_results = new List<Models.Damage_Simple>();
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    using (SqliteCommand command = new SqliteCommand(@"
                        SELECT damages.id, damages.playerid, damage, playername, ut
                        FROM damages
                        left join players on damages.playerid = players.playerid
                        WHERE damages.ut BETWEEN @start_ut and @end_ut
                        ORDER BY ut ASC;
                    ", connection))
                    {

                        command.Parameters.AddWithValue("@start_ut", start_ut);
                        command.Parameters.AddWithValue("@end_ut", end_ut);

                        using (SqliteDataReader reader = command.ExecuteReader())
                        {
                            if (reader.HasRows == false) { return null; }

                            while (reader.Read())
                            {
                                long playerId = reader.GetInt64(reader.GetOrdinal("playerid"));
                                string playerName = reader.IsDBNull(reader.GetOrdinal("playername")) ? $"{playerId}" : reader.GetString(reader.GetOrdinal("playername"));
                                double dmg = reader.GetDouble(reader.GetOrdinal("damage"));
                                Int32 ut = reader.GetInt32(reader.GetOrdinal("ut"));

                                query_results.Add(new Damage_Simple(dmg, playerId, playerName, ut));
                            }
                        }

                        return query_results;
                    }

                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception: " + ex.ToString());
                return null;
            }

        }

        public static object Get_AllDamages_GroupedByPlayers_AfterId(Int32 lastFetchedId)
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    using (SqliteCommand command = new SqliteCommand(@"
                        SELECT damages.id, damages.playerid, damage, playername, ut
                        FROM damages
                        left join players on damages.playerid = players.playerid
                        WHERE damages.id > @lastFetchedId
                        ORDER BY ut ASC;
                    ", connection))
                    {

                        command.Parameters.AddWithValue("@lastFetchedId", lastFetchedId);


                        var players = new Dictionary<long, string>();
                        var buckets = new Dictionary<long, Dictionary<long, double>>();

                        long firstUt = -1;
                        long lastUt = -1;
                        long last_id = 0;

                        using (SqliteDataReader reader = command.ExecuteReader())
                        {
                            if (reader.HasRows == false) { return null; }

                            while (reader.Read())
                            {
                                last_id = reader.GetInt64(reader.GetOrdinal("id"));
                                long playerId = reader.GetInt64(reader.GetOrdinal("playerid"));
                                string playerName = reader.IsDBNull(reader.GetOrdinal("playername")) ? $"{playerId}" : reader.GetString(reader.GetOrdinal("playername"));
                                double dmg = reader.GetDouble(reader.GetOrdinal("damage"));
                                long ut = reader.GetInt64(reader.GetOrdinal("ut"));

                                // mark the first timestamp
                                if (firstUt == -1) firstUt = ut;
                                // keep updating to know the last timestamp
                                lastUt = ut;

                                players[playerId] = playerName;

                                if (!buckets.ContainsKey(ut)) // have we seen this second before?
                                    // Initialize this seconds Dictionary of PlayerIDs and their Damage for this second
                                    buckets[ut] = new Dictionary<long, double>();

                                if (!buckets[ut].ContainsKey(playerId)) // have we seen this player do damage during this bucket (second)?
                                    // If the player does not exist in this timestamps dictionary add them.
                                    buckets[ut][playerId] = 0;

                                // this represents the accumulated damage that a player did at a particular second of time
                                buckets[ut][playerId] += dmg;
                            }
                        }

                        // We do this to fill in any holes where no damage was done.
                        var filledBuckets = new List<long>();
                        for (long ut = firstUt; ut <= lastUt; ut++)
                        {
                            filledBuckets.Add(ut);
                            if (!buckets.ContainsKey(ut))
                                buckets[ut] = new Dictionary<long, double>(); // empty bucket
                        }

                        var finalSeries = new List<object>();

                        // iterate through all the players building their json
                        foreach (var p in players)
                        {
                            long playerId = p.Key;
                            string playerName = p.Value;

                            // this data structure holds the timeline of damages in buckets of seconds for each player. 
                            var dataArray = new List<double>();

                            // For each second in the buckets array
                            foreach (var b in filledBuckets)
                            {
                                // If a player did damage during this second add it to the data array otherwise add 0 for this second
                                double v = buckets[b].ContainsKey(playerId)
                                    ? buckets[b][playerId]
                                    : 0;

                                dataArray.Add(v);
                            }

                            // final json of player
                            finalSeries.Add(new
                            {
                                id = playerId,
                                label = playerName,
                                data = dataArray
                            });
                        }
                        // we return a reference to the last_id so that the next query can use it instead of having to call Get_Last_Damage_Row_Id()
                        object result = new { lastId = last_id, data = finalSeries };
                        return result;
                    }

                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Exception: " + ex.ToString());
                return null;
            }
        }

        public static List<object> Get_AllDamages_GroupedByPlayers_BetweenUT(Int32 start_ut, Int32 end_ut)
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    using (SqliteCommand command = new SqliteCommand(@"
                        SELECT damages.playerid, damage, playername, ut
                        FROM damages
                        left join players on damages.playerid = players.playerid
                        where ut BETWEEN @start_ut AND @end_ut
                        ORDER BY ut;
                    ", connection))
                    {

                        command.Parameters.AddWithValue("@start_ut", start_ut);
                        command.Parameters.AddWithValue("@end_ut", end_ut);


                        var players = new Dictionary<long, string>();
                        var buckets = new Dictionary<long, Dictionary<long, double>>();

                        using (SqliteDataReader reader = command.ExecuteReader())
                        {
                            if (reader.HasRows == false) { return null; }
                            while (reader.Read())
                            {
                                long playerId = reader.GetInt64(reader.GetOrdinal("playerid"));
                                string playerName = reader.IsDBNull(reader.GetOrdinal("playername")) ? $"{playerId}" : reader.GetString(reader.GetOrdinal("playername"));
                                double dmg = reader.GetDouble(reader.GetOrdinal("damage"));
                                long ut = reader.GetInt64(reader.GetOrdinal("ut"));

                                long bucket = ut;

                                players[playerId] = playerName;

                                if (!buckets.ContainsKey(bucket))
                                    buckets[bucket] = new Dictionary<long, double>();

                                if (!buckets[bucket].ContainsKey(playerId))
                                    buckets[bucket][playerId] = 0;

                                buckets[bucket][playerId] += dmg;
                            }
                        }

                        var sortedBuckets = buckets.Keys.OrderBy(x => x).ToList();

                        var finalSeries = new List<object>();

                        // iterate through all the players building their json
                        foreach (var p in players)
                        {
                            long playerId = p.Key;
                            string playerName = p.Value;

                            var dataArray = new List<double>();

                            // Build data array for player
                            foreach (var b in sortedBuckets)
                            {
                                double v = buckets[b].ContainsKey(playerId)
                                    ? buckets[b][playerId]
                                    : 0;

                                dataArray.Add(v);
                            }

                            // final json of player
                            finalSeries.Add(new
                            {
                                id = playerId,
                                label = playerName,
                                data = dataArray
                            });
                        }

                        return finalSeries;
                    }

                }
            }
            catch
            {
                return null;
            }
        }

        //rewrite so this calls get_damage_groupedbypalyers_betweenUT
        public static List<object> Get_AggregatedDamage_GroupedByPlayers_BetweenUT(int start_ut, int end_ut)
        {
            try
            {
                using (var connection = new SqliteConnection(db_connection))
                {
                    connection.Open();

                    using (var command = new SqliteCommand(@"
                        SELECT damages.playerid, damage, playername, ut
                        FROM damages
                        left join players on damages.playerid = players.playerid
                        where ut BETWEEN @start_ut AND @end_ut
                        ORDER BY ut;
                    ", connection))
                    {
                        command.Parameters.AddWithValue("@start_ut", start_ut);
                        command.Parameters.AddWithValue("@end_ut", end_ut);

                        var players = new Dictionary<long, string>();
                        var buckets = new Dictionary<long, Dictionary<long, double>>();

                        using (var reader = command.ExecuteReader())
                        {
                            while (reader.Read())
                            {
                                long playerId = reader.GetInt64(reader.GetOrdinal("playerid"));
                                string playerName = reader.IsDBNull(reader.GetOrdinal("playername")) ? $"{playerId}" : reader.GetString(reader.GetOrdinal("playername"));
                                double dmg = reader.GetDouble(reader.GetOrdinal("damage"));
                                long ut = reader.GetInt64(reader.GetOrdinal("ut"));

                                players[playerId] = playerName;

                                if (!buckets.ContainsKey(ut))
                                    buckets[ut] = new Dictionary<long, double>();

                                if (!buckets[ut].ContainsKey(playerId))
                                    buckets[ut][playerId] = 0;

                                buckets[ut][playerId] += dmg;
                            }
                        }

                        var cumulative = new Dictionary<long, double>(); // playerId -> cumulative damage

                        // We do this to fill in any holes where no damage was done.
                        var filledBuckets = new List<long>();
                        for (long ut = start_ut; ut <= end_ut; ut++) 
                        {
                            filledBuckets.Add(ut);
                            if (!buckets.ContainsKey(ut))
                                buckets[ut] = new Dictionary<long, double>();
                        }

                        var finalSeries = new List<object>();

                        foreach (var p in players)
                        {
                            long playerId = p.Key;
                            string playerName = p.Value;

                            cumulative[playerId] = 0; // initialize cumulative damage
                            var dataArray = new List<double>();

                            foreach (var b in filledBuckets)
                            {
                                // add damage for this bucket if present
                                if (buckets[b].ContainsKey(playerId))
                                    cumulative[playerId] += buckets[b][playerId];

                                // always push cumulative value
                                dataArray.Add(cumulative[playerId]);
                            }

                            finalSeries.Add(new
                            {
                                id = playerId,
                                label = playerName,
                                data = dataArray
                            });
                        }

                        return finalSeries;
                    }
                }
            }
            catch
            {
                return null;
            }
        }

        //add method to aggaragte damage from all players overtime

        public static List<Models.Recording_Simple> Get_Recordings()
        {
            List<Models.Recording_Simple> query_results = new List<Models.Recording_Simple>();
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand command = new SqliteCommand(@"
                    SELECT * FROM recordings
                    ", connection);
                    using (SqliteDataReader reader = command.ExecuteReader())
                    {
                        if (reader.HasRows == false) { return null; }
                        while (reader.Read())
                        {
                            query_results.Add(new Models.Recording_Simple(reader.GetInt16(0), reader.GetString(1), reader.GetInt32(2), reader.GetInt32(3)));
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
            return query_results;
        }

        public static Damage_Simple Get_Biggest_BurstofDamage_InUT_BetweenTimes(int start_ut, int end_ut, int burst_timeframe)
        {
            return Get_ListOf_Distinct_Biggest_BurstofDamage_InUT_BetweenTimes(start_ut, end_ut, burst_timeframe, 1)[0];
        }

        /// <summary>
        /// returns back the largest burst over a time period. Unique per player id so if you pass a 3 count it will give you the 3 top bursts with no repeat playerids
        /// not completely accurate because depending on how the time gets chopped up a large burst could be split between 2 time sections. worst for reall small and really large timeframes
        /// </summary>
        /// <param name="start_ut"></param>
        /// <param name="end_ut"></param>
        /// <param name="burst_timeframe"></param>
        /// <returns>damage_simple.unix_timestamp marks the begining section of the burst</returns>
        public static List<Damage_Simple> Get_ListOf_Distinct_Biggest_BurstofDamage_InUT_BetweenTimes(int start_ut, int end_ut, int burst_timeframe, int count)
        {
            List<Damage_Simple> damages = new List<Damage_Simple>();
            try
            {
                using (var connection = new SqliteConnection(db_connection))
                {
                    connection.Open();

                    using (var command = new SqliteCommand(@"
                    select DISTINCT MAX(sum_dmg), plyr.playername, chunk_start, bigselect.playerid
                    FROM(
	                    select sum(damage) as sum_dmg, (ut/@burst_timeframe)*@burst_timeframe as chunk_start, playerid
	                    from damages
	                    where ut > @start_ut and ut < @end_ut
	                    group by playerid, chunk_start
	
	                    union select sum(damage) as sum_dmg, ((ut/@burst_timeframe)*@burst_timeframe)+(@burst_timeframe/4) as chunk_start, playerid
	                    from damages
	                    where ut > @start_ut and ut < @end_ut
	                    group by playerid, chunk_start
	
	                    union select sum(damage) as sum_dmg, ((ut/@burst_timeframe)*@burst_timeframe)+(@burst_timeframe/4)*2 as chunk_start, playerid
	                    from damages
	                    where ut > @start_ut and ut < @end_ut
	                    group by playerid, chunk_start
	
	                    union select sum(damage) as sum_dmg, ((ut/@burst_timeframe)*@burst_timeframe)+(@burst_timeframe/4)*3 as chunk_start, playerid
	                    from damages
	                    where ut > @start_ut and ut < @end_ut
	                    group by playerid, chunk_start
	                    ) as bigselect
                        left join players as plyr on bigselect.playerid = plyr.playerid
					    Group by bigselect.playerid
					    order by sum_dmg DESC
					    limit @count
                    ", connection))
                    {
                        command.Parameters.AddWithValue("@start_ut", start_ut);
                        command.Parameters.AddWithValue("@end_ut", end_ut);
                        command.Parameters.AddWithValue("@burst_timeframe", burst_timeframe);
                        command.Parameters.AddWithValue("@count", count);
                        Damage_Simple results;
                        using (SqliteDataReader reader = command.ExecuteReader())
                        {
                            if (reader.HasRows == false) { return null; }
                            while (reader.Read())
                            {
                                results = new Damage_Simple(reader.GetDouble(0), reader.GetInt64(3), reader.GetString(1), reader.GetInt32(2));
                                damages.Add(results);
                            }
                            return damages;
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
        }

        public static List<Damage_Simple> Get_Chunked_Damage_OverUT(int start_ut, int end_ut, int chunk_size)
        {
            List<Damage_Simple> results = new List<Damage_Simple>();
            try
            {
                using (var connection = new SqliteConnection(db_connection))
                {
                    connection.Open();

                    using (var command = new SqliteCommand(@"
                        select sum(damage) as sum_dmg, (ut/@chunk_size)*@chunk_size as chunk_start, dmgs.playerid, playername
                        from damages as dmgs
                        left join players as plyr on dmgs.playerid = plyr.playerid
                        where ut > @start_ut and ut < @end_ut
                        group by dmgs.playerid, chunk_start
                        order by chunk_start ASC", connection))
                    {
                        command.Parameters.AddWithValue("@start_ut", start_ut);
                        command.Parameters.AddWithValue("@end_ut", end_ut);
                        command.Parameters.AddWithValue("@chunk_size", chunk_size);
                        using (SqliteDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read() == true)
                            {
                                results.Add(new Damage_Simple(reader.GetDouble(0), reader.GetInt64(2), reader.GetString(3), reader.GetInt32(1)));
                            }
                            return results;
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
        }

        public static List<string> Get_Players_From_Recording(int start_ut, int end_ut)
        {
            List<string> results = new List<string>();
            try
            {
                using (var connection = new SqliteConnection(db_connection))
                {
                    connection.Open();

                    using (var command = new SqliteCommand(@"
                        select DISTINCT playername
                        from damages
                        left join players on damages.playerid = players.playerid
                        where damages.ut between @start_ut and @end_ut
                        group by damages.playerid", connection))
                    {
                        command.Parameters.AddWithValue("@start_ut", start_ut);
                        command.Parameters.AddWithValue("@end_ut", end_ut);
                        using (SqliteDataReader reader = command.ExecuteReader())
                        {
                            while (reader.Read() == true)
                            {
                                results.Add(reader.GetString(0));
                            }
                            return results;
                        }
                    }
                }
            }
            catch
            {
                return null;
            }
        }

        public static void Clear_Damage_DB()
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand add_command = new SqliteCommand(@"
                    DELETE FROM damages
                    ", connection);
                    add_command.ExecuteNonQueryAsync();
                }
            }
            catch
            {
                Debug.WriteLine("couldnt clear damage db");
            }
        }

        public static string Get_Local_Adapter()
        {
            string adapter = "";
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand command = new SqliteCommand(@"
                    select adapter from local_adapter order by id DESC limit 1
                    ", connection);
                    object results = command.ExecuteScalar();
                    if (results != DBNull.Value && (string)results != "" && results != null)
                    {
                        adapter = (string)results;
                    }
                }
            }
            catch
            {
                Debug.WriteLine("could not send sql command");
            }
            return adapter;
        }
        public static void Set_Local_Adapter(string adapter)
        {
            try
            {
                using (SqliteConnection connection = new SqliteConnection(db_connection))
                {
                    connection.Open();
                    SqliteCommand command = new SqliteCommand(@"
                        delete from local_adapter;
                        insert into local_adapter (adapter)
                            values(@adapter)
                    ", connection);
                    command.Parameters.AddWithValue("@adapter", adapter);
                    command.ExecuteNonQuery();
                }
            }
            catch
            {
                Debug.WriteLine("could not send sql command");
            }
        }


    }
}