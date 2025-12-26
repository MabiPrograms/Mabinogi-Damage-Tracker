import { PieChart } from '@mui/x-charts/PieChart';
import { useDrawingArea } from '@mui/x-charts/hooks';
import { useSeries } from '@mui/x-charts/hooks';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';

const settings = {
    margin: { right: 5 },
    width: 225,
    height: 225,
    hideLegend: false,
};

const customColors = [
    "#8684BF",
    "#81B7C7",
    "#7ECFA1",
    "#9CD67A",
    "#DECC76",
    "#E67470",
    "#ED6BCD",
    "#A564F5",
    "#5D95FC",
    "#54FFE5",
    "#4AFF53",
    "#CFFF40",
    "#FF9036",
    "#FF2B72",
    "#E121FF"
];

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

function CustomLegend() {
    const series = useSeries();
    const firstSeriesId = series.pie.seriesOrder[0];
    const firstSeriesData = series.pie.series[firstSeriesId].data;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, marginLeft: "24px" }}>
            {firstSeriesData.map((item) => (
                <Box
                    key={item.label}
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        flexWrap: 'wrap',
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', marginRight: 4 }}>
                        <CircleIcon
                            sx={{
                                color: item.color ?? 'gray',
                                fontSize: 14,
                                marginRight: '8px',
                            }}
                        />
                        <Typography variant="body2">{item.label}</Typography>
                    </Box>
                    <Typography variant="body2" color='primary'>{formatLargeNumber(item.value)}</Typography>
                </Box>
            ))}
        </Box>
    );
}


function PieCenterLabel({ children }) {
    const { width, height, left, top } = useDrawingArea();

    return (
        <text
            x={left + width / 2}
            y={top + height / 2}
            textAnchor="middle"
            dominantBaseline="central"
            style={{ fill: 'currentColor', fontSize: 20 }}
        >
            {children}
        </text>
    );
}

export default function PlayerDamagePieChart({ chartData }) {
    const totalDamage = (chartData || []).reduce((prev, curr) => prev + curr.value, 0);
     

    return (
        <Paper square={false} sx={{ padding: "16px", height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h4">Total Damage</Typography>
            <PieChart
                series={[
                    {
                        data: chartData,
                        innerRadius: 70,
                        highlightScope: { fade: 'global', highlight: 'item' },
                        faded: { innerRadius: 50, additionalRadius: -30, color: 'gray' },
                        formatLargeNumber,
                    },
                ]}
                slots={{
                    legend: (props) => <CustomLegend series={chartData} {...props} />,
                }}
                colors={customColors}
                {...settings}
            >
                {totalDamage > 0 ? <PieCenterLabel>{formatLargeNumber(totalDamage)}</PieCenterLabel> : <></>}
            </PieChart>
        </Paper>
    );
}
