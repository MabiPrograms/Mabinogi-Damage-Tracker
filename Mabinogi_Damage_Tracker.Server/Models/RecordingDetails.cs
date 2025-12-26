using System.Text.Json.Serialization;
using Mabinogi_Damage_Tracker;

namespace Mabinogi_Damage_tracker.Models
{
    public class Recording_Simple
    {
        public Int16 Id { get; set; }
        public string Name { get; set; }
        public Int32 Start_ut { get; set;  }
        public Int32 End_ut { get; set;  }

        public Recording_Simple(Int16 id, string name, Int32 start_ut, Int32 end_ut) {
            Id = id;
            Name = name;
            Start_ut = start_ut;
            End_ut = end_ut;
        }

    }
}
