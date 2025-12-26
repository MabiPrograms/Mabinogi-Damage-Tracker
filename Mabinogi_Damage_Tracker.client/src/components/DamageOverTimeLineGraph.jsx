import { LineChart } from '@mui/x-charts/LineChart';
import { Paper, Typography } from '@mui/material';

function formatLargeNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '0';

    const absNum = Math.abs(num);
    let formatted;

    if (absNum >= 1e12) {
        formatted = (num / 1e12).toFixed(1) + 'T';
    } else if (absNum >= 1e9) {
        formatted = (num / 1e9).toFixed(1) + 'B';
    } else if (absNum >= 1e6) {
        formatted = (num / 1e6).toFixed(1) + 'M';
    } else if (absNum >= 1e3) {
        formatted = (num / 1e3).toFixed(1) + 'K';
    } else {
        formatted = num.toFixed(0);
    }

    return formatted.replace(/\.0(?=[A-Z])/, '');
}

export default function DamageOverTimeLineGraph({ chartData, start_ut }) {
    const dataLength = chartData[0]?.data?.length || 0;

    return (
        <Paper square={false} sx={{ padding: "16px", height: "100%" }}>
            <Typography variant="h4" sx={{ marginBottom: "20px" }}>Damage Over Time</Typography>
            <LineChart
                height={300}
                series={chartData.length ? chartData : [{ data: [] }]}
                xAxis={[
                    {
                        scaleType: 'point',
                        data: Array.from({ length: dataLength }).map(
                            (_, i) => new Date((start_ut * 1000) + (i * 1000)).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
                        ),
                        disableTicks: true
                    },
                ]}
                yAxis={[{ width: 50, valueFormatter: formatLargeNumber }]}
                margin={{ right: 24 }}
            />
        </Paper>
    );
}
