import { useState, useRef } from 'react';
import { LinePlot } from '@mui/x-charts/LineChart';
import { ChartDataProvider } from '@mui/x-charts/ChartDataProvider';
import { ChartsSurface } from '@mui/x-charts/ChartsSurface';
import { ChartsAxis } from '@mui/x-charts/ChartsAxis';
import {
    useBrush,
    useDrawingArea,
    useLineSeries,
    useXScale,
} from '@mui/x-charts/hooks';
import { Paper, Typography, TextField, FormControl, Button, Divider, Box, Snackbar, Alert } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ContentCutIcon from '@mui/icons-material/ContentCut';

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

function CustomBrushOverlay({ onBrushChange }) {
    const theme = useTheme();
    const drawingArea = useDrawingArea();
    const brush = useBrush();
    const rafRef = useRef(null);
    const xScale = useXScale();
    const series = useLineSeries("trim");

    const getIndex = (x) =>
        Math.floor(
            (x - Math.min(...xScale.range()) + xScale.step() / 2) / xScale.step(),
        );

    const { left, top, width, height } = drawingArea;

    if (!brush || !series?.data) return;

    // Clamp coordinates to drawing area
    const clampX = (x) => Math.max(left, Math.min(left + width, x));
    const clampedStartX = clampX(brush.start.x);
    const clampedCurrentX = clampX(brush.current.x);

    const minX = Math.min(clampedStartX, clampedCurrentX);
    const maxX = Math.max(clampedStartX, clampedCurrentX);
    const rectWidth = maxX - minX;

    const color = theme.palette.primary.main;

    // Calculate the approximate data indices based on x position
    const startIndex = getIndex(clampedStartX);
    const currentIndex = getIndex(clampedCurrentX);

    const difference = Math.abs(currentIndex - startIndex);

    // Get the time labels
    const startTime = xScale.domain()[startIndex] || '';
    const currentTime = xScale.domain()[currentIndex] || '';

    // update based on animationframe
    if (startIndex !== currentIndex && startIndex >= 0 && currentIndex < series.data.length) {
        if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(() => {
                onBrushChange(startIndex, currentIndex);
                rafRef.current = null;
            });
        }
    }
    

    return (
        <g>
            {/* Start line */}
            <line
                x1={clampedStartX}
                y1={top}
                x2={clampedStartX}
                y2={top + height}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="5,5"
                pointerEvents="none"
            />
            {/* Current line */}
            <line
                x1={clampedCurrentX}
                y1={top}
                x2={clampedCurrentX}
                y2={top + height}
                stroke={color}
                strokeWidth={2}
                strokeDasharray="5,5"
                pointerEvents="none"
            />
            {/* Selection rectangle */}
            <rect
                x={minX}
                y={top}
                width={rectWidth}
                height={height}
                fill={color}
                fillOpacity={0.1}
                pointerEvents="none"
            />
            {/* Start label */}
            <g transform={`translate(${clampedStartX}, ${top + 15})`}>
                <rect x={-30} y={-5} width={60} height={30} fill={color} rx={4} />
                {/* Date label */}
                <text x={0} y={16} textAnchor="middle" fill="white" fontSize={10}>
                    {startTime}
                </text>
            </g>

            {/* End label */}
            <g transform={`translate(${clampedCurrentX}, ${top + 15})`}>
                <rect x={-30} y={-5} width={60} height={30} fill={color} rx={4} />
                {/* Date label */}
                <text x={0} y={16} textAnchor="middle" fill="white" fontSize={10}>
                    {currentTime}
                </text>
            </g>

            {/* Difference label in the middle */}
            <g transform={`translate(${(minX + maxX) / 2}, ${top + height - 30})`}>
                <rect
                    x={-50}
                    y={0}
                    width={100}
                    height={26}
                    fill={
                        difference >= 0 ? theme.palette.success.main : theme.palette.error.main
                    }
                    rx={4}
                />
                <text
                    x={0}
                    y={17}
                    textAnchor="middle"
                    fill="white"
                    fontSize={12}
                    fontWeight="bold"
                >
                    {difference} (s)
                </text>
            </g>
        </g>
    );
}

function ChartFormController({ range, rangeUt }) {
    const [name, setName] = useState("");
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState("success");
    const [AlertMessage, setAlertMessage] = useState("");
    const duration = rangeUt[1] - rangeUt[0]

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    async function handleButtonClick() {
        try {
            const formData = {
                name: name,
                start_ut: rangeUt[0],
                end_ut: rangeUt[1],
            }

            const response = await fetch(`http://${window.location.hostname}:5004/Home/PostRecording`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(formData),
            });

            setOpen(true)
            if (!response.ok) {
                setSeverity('error');
                setAlertMessage('Failed to create new record.')
                throw new Error(`HTTP error! status: ${response.status}`);
            } else {
                setSeverity('success');
                setAlertMessage('Successfully created new record.')
            }

        } catch (error) {
            console.error("error making the post request:", error)
        }
    }

    return (
        <FormControl sx={{ width: 300, gap: 2 }}>
            <TextField id="outlined-basic" label="Name" variant="standard" value={name} onChange={(e) => setName(e.target.value)} />
            <Typography>Start Time: {range[0]}</Typography>
            <Typography>End Time: {range[1]}</Typography>
            <Typography>Duration: {duration} (s)</Typography>
            <Button variant="outlined" startIcon={<ContentCutIcon />} disabled={(name === "" || duration === 0) ? true : false} onClick={handleButtonClick}>
                Trim Recording
            </Button>
            <Divider />
            <Typography variant="caption">Trimmed recordings are viewable as new entries in recordings table</Typography>

            {/* Feedback component */}
            <Snackbar open={open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {AlertMessage}
                </Alert>
            </Snackbar>
        </FormControl>
    )
}

export default function TrimLineGraph({ chartData, start_ut, end_ut }) {
    // Chart Utility
    const series = 
        [{
            id: "trim",
            label: "Total Damage",
            type: 'line',
            data: chartData || [],
            area: true,
            showMark: false
        }]
    const dataLength = series[0].data?.length || 0;
    const xAxis = [
        {
            scaleType: 'point',
            data: Array.from({ length: dataLength }).map(
                (_, i) => new Date((start_ut * 1000) + (i * 1000)).toLocaleTimeString(
                    [],
                    { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
            ),
            disableTicks: true,
        },
    ]

    const timeStart = new Date(start_ut * 1000).toLocaleTimeString(
        [],
        { hour: 'numeric', minute: '2-digit', second: '2-digit' }
    );
    const timeEnd = new Date(end_ut * 1000).toLocaleTimeString(
        [],
        { hour: 'numeric', minute: '2-digit', second: '2-digit' }
    );
    const [range, setRange] = useState([timeStart, timeEnd]);
    const [rangeUt, setRangeUt] = useState([]);

    function onBrushChange(startIndex, endIndex) {
        const minIndex = Math.min(startIndex, endIndex);
        const maxIndex = Math.max(startIndex, endIndex);

        const startLabel = xAxis[0].data[minIndex] || timeStart;
        const endLabel = xAxis[0].data[maxIndex] || timeEnd;

        const newStartUt = start_ut + minIndex;
        const newEndUt = start_ut + maxIndex;

        setRange([startLabel, endLabel]);
        setRangeUt([newStartUt, newEndUt]);
    }

    return (
        <Paper square={false} sx={{ padding: "32px", gap: "20px", width: "100%", height: "100%", display: 'flex' }}>
            <Box sx={{ width: '100%' }}>
                <Typography variant="h4" sx={{ marginBottom: "20px" }}>Trim Recording</Typography>
                <ChartDataProvider
                    height={300}
                    series={series}
                    hideLegend={true}
                    brushConfig={{ enabled: true }}
                    xAxis={xAxis}
                    colors={customColors}
                    yAxis={[{ width: 50, valueFormatter: formatLargeNumber }]}
                    margin={{ right: 24 }}
                >
                    <ChartsSurface>
                        <LinePlot />
                        <ChartsAxis />
                        <CustomBrushOverlay onBrushChange={onBrushChange} />
                    </ChartsSurface>
                </ChartDataProvider>
            </Box>
            <Divider orientation="vertical" />
            <ChartFormController range={range} rangeUt={rangeUt} />
        </Paper>
    );
}
