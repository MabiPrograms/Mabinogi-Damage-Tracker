using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Threading.Channels;

[ApiController]
[Route("api/[controller]")]
public class DataStreamController : ControllerBase
{
    private static readonly Channel<object> _DamageStream = Channel.CreateUnbounded<object>(); // All Damage Packets get streamed here
    private static readonly Channel<object> _DoTstream = Channel.CreateUnbounded<object>(); // Damage over Time Line Chart
    private static readonly Channel<object> _TotalDamagestream = Channel.CreateUnbounded<object>(); // Total Damage Pie Chart

    public static void WriteDamageStream(object data)
    {
        _DamageStream.Writer.TryWrite(data);
    }
    public static void WriteDoTData(object data)
    {
        _DoTstream.Writer.TryWrite(data);
    }

    public static void WriteTotalDamageData(object data)
    {
        _TotalDamagestream.Writer.TryWrite(data);
    }

    [HttpGet("DamagePacketStream")]
    public async Task DamagePacketStream()
    {
        Response.Headers.Add("Cache-Control", "no-cache");
        Response.Headers.Add("Content-Type", "application/json");
        Response.Headers.Add("Connection", "keep-alive");

        Response.StatusCode = 200;

        var writer = Response.BodyWriter;

        await foreach (var logMessage in _DamageStream.Reader.ReadAllAsync())
        {
            var sseLine = $"data: {logMessage}\n\n";
            var bytes = Encoding.UTF8.GetBytes(sseLine);

            await writer.WriteAsync(bytes);
            await writer.FlushAsync();

            if (HttpContext.RequestAborted.IsCancellationRequested)
                break;
        }
    }

    [HttpGet("DamageOverTime")]
    public async Task StreamDoT()
    {
        Response.Headers.Add("Cache-Control", "no-cache");
        Response.Headers.Add("Content-Type", "application/json");
        Response.Headers.Add("Connection", "keep-alive");

        Response.StatusCode = 200;

        var writer = Response.BodyWriter;

        await foreach (var logMessage in _DoTstream.Reader.ReadAllAsync())
        {
            var sseLine = $"data: {logMessage}\n\n";
            var bytes = Encoding.UTF8.GetBytes(sseLine);

            await writer.WriteAsync(bytes);
            await writer.FlushAsync();

            if (HttpContext.RequestAborted.IsCancellationRequested)
                break;
        }
    }

    [HttpGet("TotalDamage")]
    public async Task StreamTotalDamage()
    {
        Response.Headers.Add("Cache-Control", "no-cache");
        Response.Headers.Add("Content-Type", "application/json");
        Response.Headers.Add("Connection", "keep-alive");

        Response.StatusCode = 200;

        var writer = Response.BodyWriter;

        await foreach (var logMessage in _DoTstream.Reader.ReadAllAsync())
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