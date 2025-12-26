import { ScatterChart } from '@mui/x-charts/ScatterChart';
import { ChartsTooltipContainer, useItemTooltip } from '@mui/x-charts/ChartsTooltip';
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';

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
    "#E121FF",
];

function formatTimeStamp(ut) {
    return new Date((ut) * 1000).toLocaleTimeString(
        [],
        { hour: 'numeric', minute: '2-digit', second: '2-digit' }
    );
}

const chartSetting = {
    yAxis: [{ width: 50, scaleType: 'log', base: 2, zoom: true, }],
    xAxis: [{ valueFormatter: (v) => (v ? formatTimeStamp(v) : ''), zoom: true, }],
};

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

const TooltipPaper = styled('div', {
    name: 'Tooltip',
    slot: 'Paper',
})(({ theme }) => {
    return {
        padding: theme.spacing(1),
        backgroundColor: (theme.vars || theme).palette.background.paper,
        color: (theme.vars || theme).palette.text.primary,
        borderRadius: (theme.vars || theme).shape?.borderRadius,
        border: `solid ${(theme.vars || theme).palette.divider} 1px`,
    };
});

function CustomTooltip() {
    const item = useItemTooltip();

    return (
        <ChartsTooltipContainer trigger="item">
            <TooltipPaper>
                <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                    <Box
                        sx={{
                            width: 20,
                            height: 20,
                            backgroundColor: item?.color,
                            borderRadius: 1,
                            mr: 2,
                        }}
                    />
                    <Typography>{item?.label}</Typography>
                </Box>
                <Divider sx={{ my: 1 }} />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                    }}
                >
                    <Typography sx={{ mr: 3 }}>{formatTimeStamp(item?.value.x)}</Typography>
                    <Typography>
                        {item?.value.y == null
                            ? 'NaN'
                            : formatLargeNumber(item?.value.y)}
                    </Typography>
                </Box>
            </TooltipPaper>
        </ChartsTooltipContainer>
    );
}

export default function DamageScatterPlot({ series }) {

    return (
        <Paper square={false} sx={{ padding: "6px", height: "100%" }}>
            <Typography variant="h4" sx={{ marginBottom: "10px" }}>Damage Scatter Plot</Typography>
            <ScatterChart
                height={400}
                series={series}
                grid={{ horizontal: true, vertical: true }}
                voronoiMaxRadius={20}
                colors={customColors}
                slots={{ tooltip: CustomTooltip }}
                {...chartSetting}
            />
        </Paper>
    );
}