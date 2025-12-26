using System.Diagnostics;
using System.Text.Json.Serialization;
using Mabinogi_Damage_tracker.Models;
using Microsoft.AspNetCore.Mvc;

namespace Mabinogi_Damage_tracker.Controllers
{
    
    public class HomeController : Controller
    {
        Damage_View damage_view = new Damage_View();
        private string last_dt_dps = "";
        private readonly ILogger<HomeController> _logger;


        public HomeController(ILogger<HomeController> logger)
        {
            _logger = logger;
            
        }

        public IActionResult Index()
        {
            if (Parser.pause) { damage_view.PauseButton_Text = "Unpause"; }
            damage_view.damage_piechart = db_helper.Get_TotalDamage_ByPlayers();
            return Json(new { message = "Backend is running" });
        }

        public IActionResult GetTotalPlayerDamage()
        {
            List<Damage_Simple> damages = db_helper.Get_TotalDamage_ByPlayers();
            if (damages == null) { return NotFound(); }
            return Ok(Json(damages));
        }

        public IActionResult GetRecordings()
        {
            List<Recording_Simple> recordings = db_helper.Get_Recordings();
            if (recordings == null) { return NotFound(); }
            return Ok(Json(recordings));
        }

        public IActionResult DeleteRecordings([FromBody] int[] ids)
        {
            Console.WriteLine(ids);
            for (int i = 0; i < ids.Length; i++)
            {
                db_helper.delete_recording(ids[i]);
            }
            return Ok(Json(ids));
        }

        public IActionResult PostRecording([FromBody] Recording_Simple recording)
        {
            db_helper.add_recording(recording.Name, recording.Start_ut, recording.End_ut);
            return Ok(Json(recording));
        }

        public IActionResult UpdateRecordingName([FromBody] Recording_Simple recording)
        {
            db_helper.update_recording_name(recording.Id, recording.Name);
            return Ok(Json(recording));
        }

        public IActionResult GetAllPlayers()
        {
            List<object> players = db_helper.Get_All_Players();
            if (players == null) { return NotFound(); }
            return Ok(Json(players));
        }

        public JsonResult GetDamagesBetweenUt(int start_ut, int end_ut)
        {
            List<Damage_Simple> damages = db_helper.Get_Damages_Between_Ut(start_ut, end_ut);
            return Json(damages);
        }

        public JsonResult GetAllDamagesGroupedByPlayersAfterId(int lastFetchedId)
        {
            object damage_series = db_helper.Get_AllDamages_GroupedByPlayers_AfterId(lastFetchedId);
            return Json(damage_series);
        }

        public JsonResult GetTotalPlayerHealing(int start_ut, int end_ut)
        {
            Int64 total_healing = db_helper.Get_SumHeals_BetweenUT(start_ut, end_ut);
            return Json(total_healing);
        }

        public JsonResult GetLargestSingleDamageInstance(int start_ut, int end_ut)
        {
            Damage_Simple largest_hit = db_helper.Get_Largest_Single_Damage_Instance(start_ut, end_ut);
            return Json(largest_hit);
        }

        public JsonResult GetBiggestBurst(int start_ut, int end_ut, int burst_timeframe)
        {
            return Json(db_helper.Get_Biggest_BurstofDamage_InUT_BetweenTimes(start_ut,end_ut,burst_timeframe));
        }
        public JsonResult GetChunkedDamageOverUT(int start_ut, int end_ut, int chunk_size)
        {
            return Json(db_helper.Get_Chunked_Damage_OverUT(start_ut, end_ut, chunk_size));
        }

        public JsonResult GetListOfDistinctBiggestBurstofDamageInUTBetweenTimes(int start_ut, int end_ut, int burst_timeframe, int count)
        {
            return Json(db_helper.Get_ListOf_Distinct_Biggest_BurstofDamage_InUT_BetweenTimes(start_ut, end_ut, burst_timeframe, count));
        }

        public JsonResult GetListOfDistinctLargestSingleDamageInstance(int start_ut, int end_ut, int count)
        {
            return Json(db_helper.Get_ListOf_Distinct_Largest_Single_Damage_Instance(start_ut, end_ut, count));
        }

        public JsonResult GetLastDamageRowId()
        {
            Int64 row_id = db_helper.Get_Last_Damage_Row_Id();
            return Json(new {data = row_id});
        }

        public JsonResult GetPlayersFromRecording(int start_ut, int end_ut)
        {
            List<string> playernames = db_helper.Get_Players_From_Recording(start_ut, end_ut);
            return Json(playernames);
        }

        public JsonResult GetDamageSeriesGroupedByPlayers(int start_ut, int end_ut)
        {
            List<object> damage_series = db_helper.Get_AllDamages_GroupedByPlayers_BetweenUT(start_ut, end_ut);
            return Json(damage_series);
        }

        public JsonResult GetAggregatedDamageSeriesGroupedByPlayers(int start_ut, int end_ut)
        {
            List<object> damage_series = db_helper.Get_AggregatedDamage_GroupedByPlayers_BetweenUT(start_ut, end_ut);
            return Json(damage_series);
        }

        public ActionResult Pause_parser()
        {
            Parser.pause = !Parser.pause;
            Debug.WriteLine("Parser.pause = {0}", Parser.pause);
            LogsController.WriteLog("Parser Toggled");
            return RedirectToAction("index");
        }

        public bool RestartParser()
        {
            if(Parser.Stop() == false) { return false; }
            Parser.Start();
            return true;
        }
        public void Stop_Parser()
        {
            Parser.Stop();
        }
        public void Start_Parser()
        {
            Parser.Start();
        }

        public JsonResult GetAllAdapters()
        {
            return Json(Parser.adapters);
        }
        public JsonResult GetCurrentAdapter()
        {
            return Json(Parser.adapter_description);
        }
        
        public IActionResult SaveAdapter(string adapter)
        {
            db_helper.Set_Local_Adapter(adapter);
            return Ok(adapter);
        }

        public ActionResult Clear_Damage_DB()
        {
            db_helper.Clear_Damage_DB();
            Debug.WriteLine("Cleared Damage DB");
            return RedirectToAction("index");
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
