import { useState, useEffect } from 'react'
import { Paper, Typography, Box } from '@mui/material'
import {
    GaugeContainer,
    GaugeValueArc,
    GaugeValueText,
    GaugeReferenceArc,
    useGaugeState,
    gaugeClasses
} from '@mui/x-charts/Gauge';

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

function GaugePointer({ }) {
    const { valueAngle, outerRadius, cx, cy } = useGaugeState();

    if (valueAngle === null) {
        // No value to display
        return null;
    }

    const target = {
        x: cx + outerRadius * Math.sin(valueAngle),
        y: cy - outerRadius * Math.cos(valueAngle),
    };
    return (
        <g>
            <circle cx={cx} cy={cy} r={5} fill="red" />
            <path
                d={`M ${cx} ${cy} L ${target.x} ${target.y}`}
                stroke="red"
                strokeWidth={3}
            />
        </g>
    );
}

export default function PlayerDamageGauge({ value = 7500, averageDPS }) {
    const [valueMax, setValueMax] = useState(0);

    useEffect(() => {
        // polling rate will effect the accuracy of the Max DPS value
        // as we only take the last index of the damage over time line graph data
        // as our dps value. but multiple time buckets could have elapsed if 
        // polling rate > 1000ms
        setValueMax(prev => value > prev ? value : prev)
    }, [value])

    return (
        <Paper square={false} sx={{ padding: "16px", height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Typography variant="h4">Damage Meter</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around' }}>
                <GaugeContainer
                    width={300}
                    height={300}
                    valueMin={0}
                    valueMax={valueMax}
                    startAngle={-110}
                    endAngle={110}
                    value={value}
                    sx={(theme) => ({
                        [`& .${gaugeClasses.valueText}`]: {
                            fontSize: 25,
                            transform: 'translateY(25px)'
                        },
                    })}
                >
                    <GaugeReferenceArc />
                    <GaugeValueArc />
                    <GaugeValueText text={({ value }) => { return `${formatLargeNumber(value)}` }} />
                    <GaugePointer />
                </GaugeContainer>
                <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px', width: '200px'}}>
                    <Box sx={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <Typography>Max DPS</Typography>
                        <Typography variant="h5">{formatLargeNumber(valueMax)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>DPS</Typography>
                        <Typography variant="h5">{formatLargeNumber(value)}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>Average DPS</Typography>
                        <Typography variant="h5">{formatLargeNumber(averageDPS)}</Typography>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
}