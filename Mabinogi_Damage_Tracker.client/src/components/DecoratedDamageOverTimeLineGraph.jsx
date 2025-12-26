import * as React from 'react';
import { useState } from 'react';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { LinePlot } from '@mui/x-charts/LineChart';
import { useLineSeries, useDrawingArea, useXAxis, useXScale, useYScale } from '@mui/x-charts/hooks';
import { ChartsSurface } from '@mui/x-charts/ChartsSurface';
import { ChartDataProvider } from '@mui/x-charts/ChartDataProvider';
import { ChartsLegend } from '@mui/x-charts/ChartsLegend';
import { ChartsTooltip } from '@mui/x-charts/ChartsTooltip';
import { ChartsAxisHighlight } from '@mui/x-charts/ChartsAxisHighlight';
import {
    Paper,
    Typography,
    Box,
    Popover,
    IconButton,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';


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

function DamageLabels({ largestDamageInstance }) {
    const lineSeries = useLineSeries();

    if (!lineSeries) {
        return null;
    }

    return (
        <div>
            {lineSeries.map((series, index) => {
                if (series.label === largestDamageInstance.player_name)
                    return (< React.Fragment key={`damage_label_${index}`}>
                        <SingleSeriesExtremaLabels series={series} largestDamageInstance={largestDamageInstance} />
                    </React.Fragment>)
                else
                    return null
            })}
        </div>
    );
}

function SingleSeriesExtremaLabels({ series, largestDamageInstance }) {
    const xAxis = useXAxis();
    const xDataIndex = new Date(largestDamageInstance.unix_timestamp * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })
    const index = xAxis.data.findIndex(element => element === xDataIndex)
    if (index === -1) return null;

    const point = series.data[index];

    return (
        <React.Fragment>
            <PointLabel
                x={formatTimeStamp(largestDamageInstance.unix_timestamp)}
                y={point}
                placement="above"
                color={series.color}
            />
        </React.Fragment>
    );
}

function PointConnector({ x, y, labelLeft, labelTop, color }) {
    const xScale = useXScale();
    const yScale = useYScale();

    const pointX = xScale(x) ?? 0;
    const pointY = yScale(y) + 27.5 ?? 0; // 27.5 is arbitrary

    return (
        <svg style={{ position: 'absolute', left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
            <line
                x1={pointX}
                y1={pointY}
                x2={labelLeft}
                y2={labelTop}
                stroke={color}
                strokeWidth="2"
            />
            <circle
                cx={pointX}
                cy={pointY}
                r="5"
                fill={color}
                stroke="#fff"
                strokeWidth="2"
            />
        </svg>
    );
}

function PointLabel({ x, y, placement, color }) {
    const xAxisScale = useXScale();
    const yAxisScale = useYScale();

    const left = xAxisScale(x) ?? 0;
    const top = (yAxisScale(y) ?? 0) + (placement === 'below' ? 20 : -20);

    return (
        <React.Fragment>
            <PointConnector
                x={x}
                y={y}
                labelLeft={left}
                labelTop={top}
                color={color}
            />
            <Paper
                sx={{
                    position: 'absolute',
                    left,
                    top,
                    translate: '-50% -50%',
                    border: `2px solid ${color}`,
                    borderRadius: 1,
                    px: 1,
                }}
            >
                <Typography variant="caption">Largest Hit</Typography>
            </Paper>
        </React.Fragment>
    );
}

function DPSBands({ bands }) {
    const lineSeries = useLineSeries();
    const { top, left, width } = useDrawingArea();
    const xScale = useXScale();
    const stroke = 4 // thickness of bands line
    const bandGap = 20 // gap between the bands

    return (
        <g>
            {bands.map((b, index) => {
                const color = lineSeries.find((series) => series.label === b.player_name).color
                const xStart = xScale(b.start);
                const xEnd = xScale(b.end);
                if (xStart === undefined || xEnd === undefined) {
                    return null;
                }

                // Stick to the left of the drawing area boundaries
                let textX;
                if (xStart >= left && xStart <= left + width) {
                    textX = xStart;
                } else if (xEnd >= left && xEnd <= left + width) {
                    textX = left;
                } else {
                    return null;
                }

                return (
                    <React.Fragment key={index}>
                        <rect //left bar
                            x={textX}
                            y={top + (bandGap * index)}
                            width={stroke}
                            height={7.5}
                            fill={color}
                            opacity={1}
                        />
                        <rect //top bar
                            x={textX }
                            y={top + (bandGap * index) - stroke/2}
                            width={Math.min(xEnd, left + width) - textX}
                            height={stroke}
                            fill={color}
                            opacity={1}
                        />
                        <rect //right bar
                            x={Math.min(xEnd, left + width) - stroke}
                            y={top + (bandGap * index)}
                            width={stroke}
                            height={7.5}
                            fill={color}
                            opacity={1}
                        />
                        <text
                            x={((Math.min(xEnd, left + width) - textX) / 2) + textX - 8}
                            y={top + 7.5 + (bandGap * index) + stroke }
                            textAnchor="start"
                            dominantBaseline="auto"
                            fill={color}
                            fontSize="0.7rem"
                            fontWeight={500}
                            pointerEvents="none"
                        >
                            {b.label}
                        </text>
                    </React.Fragment>
                );
            })}
        </g>
    );
}

function GraphSettings({
    labelsVisible,
    setLabelsVisible,
    bandsVisible,
    setBandsVisible
}) {
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLabelClick = () => {
        setLabelsVisible(prev => !prev);
    };

    const handleBandClick = () => {
        setBandsVisible(prev => !prev);
    };


    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    return (
        <div>
            <IconButton aria-label="Example" onClick={handleClick}>
                <MoreVertIcon fontSize="small" />
            </IconButton>
            <Popover
                id={id}
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <List
                    sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
                    component="nav"
                    aria-labelledby="nested-list-subheader"
                >
                    <ListItemButton
                        key={'view_largest_hit'}
                        onClick={handleLabelClick}
                    >
                        <ListItemIcon>
                            {labelsVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </ListItemIcon>
                        <ListItemText primary="Largest Hit" />
                    </ListItemButton>
                    <ListItemButton
                        key={'view_damage_band' }
                        onClick={handleBandClick}
                    >
                        <ListItemIcon>
                            {bandsVisible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                        </ListItemIcon>
                        <ListItemText primary="Damage Bands" />
                    </ListItemButton>
                </List>
            </Popover>
        </div>
        
    )
}

export default function DecoratedDamageOverTimeLineGraph({ chartData, bands, largestDamageInstance, start_ut }) {
    const dataLength = chartData[0]?.data?.length || 0;
    const [labelsVisible, setLabelsVisible] = useState(true);
    const [bandsVisible, setBandsVisible] = useState(true);

    return (
        <Paper square={false} sx={{ padding: "16px", height: "100%" }}>
            <Box sx={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <Typography variant="h4" sx={{ marginBottom: "20px" }}>Damage Over Time</Typography>
                <GraphSettings
                    labelsVisible={labelsVisible}
                    setLabelsVisible={setLabelsVisible}
                    bandsVisible={bandsVisible}
                    setBandsVisible={setBandsVisible}
                />
            </Box>
            <Box sx={{ position: 'relative', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ChartDataProvider
                    height={300}
                    series={chartData.length ? chartData : [{ type: "line", data: [] }]}
                    xAxis={[
                        {
                            id: 'x',
                            scaleType: 'point',
                            data: Array.from({ length: dataLength }).map(
                                (_, i) => new Date((start_ut * 1000) + (i * 1000)).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
                            ),
                            disableTicks: true
                        },
                    ]}
                    yAxis={[{
                        id: 'y',
                        width: 50,
                        valueFormatter: formatLargeNumber
                    }]}
                    margin={{ right: 24 }}
                    colors={customColors}
                >
                    <ChartsLegend />
                    <ChartsTooltip />
                    <ChartsSurface>                        
                        <ChartsXAxis />
                        <ChartsYAxis />
                        <LinePlot />
                        {bandsVisible &&
                            <DPSBands bands={bands} />
                        }
                        <ChartsAxisHighlight x="line"/>
                    </ChartsSurface>
                    {labelsVisible && < DamageLabels largestDamageInstance={largestDamageInstance} />}
                    </ChartDataProvider>
            </Box>
        </Paper>
    );
}
