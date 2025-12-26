import * as React from 'react';
import { SparkLineChart } from '@mui/x-charts/SparkLineChart';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

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

export default function DamageCard({ chartData, totalDamage }) {
    

    return (
        <Paper square={false} sx={{ padding: "32px", gap: "20px", height: "100%", display: 'flex', flexDirection: 'column' }}>
            <AutoAwesomeIcon fontSize="large" sx={{ marginBottom: "1%" }} />
            <Box sx={{ display: "flex", flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, sm: 4, md: 8 } }}>
                <Box sx={{ gap: "10px", flexGrow: "2"}}>
                    <Typography variant="subtitle1">Total Damage</Typography>
                    <Typography variant="h3">{formatLargeNumber(totalDamage)}</Typography>
                </Box>
                <SparkLineChart
                    height={40}
                    width={150}
                    color="#8684BF"
                    data={chartData}
                />
            </Box>
        </Paper>
    );
}

