using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Threading.Channels;

[ApiController]
[Route("api/[controller]")]
public class LogsController : ControllerBase
{
    private static readonly Channel<string> _logStream = Channel.CreateUnbounded<string>();

    public static void WriteLog(string message)
    {
        _logStream.Writer.TryWrite(DateTime.Now + ": " + message);
    }

    [HttpGet("stream")]
    public async Task StreamLogs()
    {
        Response.Headers.Add("Cache-Control", "no-cache");
        Response.Headers.Add("Content-Type", "text/event-stream");
        Response.Headers.Add("Connection", "keep-alive");

        Response.StatusCode = 200;

        var writer = Response.BodyWriter;

        await foreach (var logMessage in _logStream.Reader.ReadAllAsync())
        {
            var sseLine = $"data: {logMessage}\n\n";
            var bytes = Encoding.UTF8.GetBytes(sseLine);

            await writer.WriteAsync(bytes);
            await writer.FlushAsync();

            if (HttpContext.RequestAborted.IsCancellationRequested)
                break;
        }
    }
}