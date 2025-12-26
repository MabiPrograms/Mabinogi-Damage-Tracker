import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import StarIcon from '@mui/icons-material/Star';
import DotsMobileStepper from './DotsMobileStepper';

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

export default function LargestHitCard({ largestDamageInstances, setGraphLargestDamageInstance }) {
    const [currentlargestDamageInstance, setCurrentlargestDamageInstance] = useState(largestDamageInstances[0]);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        setCurrentlargestDamageInstance(largestDamageInstances[activeStep]);
        setGraphLargestDamageInstance(largestDamageInstances[activeStep]);
    }, [activeStep, largestDamageInstances, setGraphLargestDamageInstance])

    return (
        <Paper square={false} sx={{ 'padding-left': "32px",'padding-top':"10px", gap: "10px", height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <StarIcon fontSize="large" sx={{ marginBottom: "8%" }} />
            <Box sx={{ display: "flex", flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, sm: 4, md: 8 } }}>
                <Box sx={{ gap: "10px", flexGrow: "2" }}>
                    <Typography variant="subtitle1">Largest Hit by {currentlargestDamageInstance.player_name}</Typography>
                    <Typography variant="h3">{formatLargeNumber(currentlargestDamageInstance.damage)}</Typography>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center' }} >
                <DotsMobileStepper steps={largestDamageInstances.length} activeStep={activeStep} setActiveStep={setActiveStep} />
            </Box>
        </Paper>
    );
}

