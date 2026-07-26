import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

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

export default function HealingCard({ totalHealing }) {
    return (
        <Paper square={false} sx={{ padding: "16px 24px", height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <LocalHospitalIcon color="action" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Healing
                </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="h4" sx={{ lineHeight: 1 }}>{formatLargeNumber(totalHealing)}</Typography>
            </Box>
        </Paper>
    );
}