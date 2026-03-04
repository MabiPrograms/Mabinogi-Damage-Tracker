import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
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
export default function BurstCard({ bands, graphBands, setGraphBands }) {
    const cardLabel = bands[0].label
    const [activeStep, setActiveStep] = useState(0);

    const currentBurst = bands[activeStep];

    useEffect(() => {
        setGraphBands(prev =>
            prev.map(band =>
                band.label === cardLabel ? bands[activeStep] : band
            )
        );
    }, [activeStep, cardLabel, bands, setGraphBands])

    return (
        <Paper square={false} sx={{ position: 'relative', "padding-left": "32px","padding-top":"20px", gap: "10px", height: "100%", display: 'flex', flexDirection: 'column'}}>
            <AutoAwesomeIcon fontSize="medium" />
            <Box sx={{ display: "flex", flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, sm: 4, md: 8 }}}>
                <Box sx={{ gap: "5px", flexGrow: "2"}} >
                    <Typography variant="subtitle1">Largest {currentBurst.label} burst</Typography>
                    <Typography variant="h3">{currentBurst.player_name}</Typography>
                    <Typography variant="h3">{formatLargeNumber(currentBurst.damage)}</Typography>
                    <Typography variant="subtitle1">Started at {currentBurst.start}</Typography>
                </Box>
            </Box>
            <Box sx={{ position: 'absolute', bottom: 25 , left: '50%', transform: "translate(-50%, 50%)" }} >
                <DotsMobileStepper steps={bands.length} activeStep={activeStep} setActiveStep={setActiveStep}/>
            </Box>
        </Paper>
    );
}

