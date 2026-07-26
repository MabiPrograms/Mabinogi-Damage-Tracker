import * as React from 'react';
import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DotsMobileStepper from './DotsMobileStepper';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
    const [activeStep, setActiveStep] = useState(0);
    const hasBands = Array.isArray(bands) && bands.length > 0 && !!bands[0];
    const cardLabel = hasBands ? bands[0].label : null;

    useEffect(() => {
        if (!hasBands) {
            return;
        }

        setGraphBands(prev =>
            prev.map(band =>
                band.label === cardLabel ? bands[activeStep] : band
            )
        );
    }, [activeStep, cardLabel, bands, hasBands, setGraphBands])

    if (!hasBands) {
        return null;
    }

    const currentBurst = bands[activeStep];

    return (
        <Paper square={false} sx={{ padding: '16px 24px 36px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AutoAwesomeIcon color="action" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('analytics.largestBurst', { label: currentBurst.label })}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                <Typography variant="h4" sx={{ lineHeight: 1, fontWeight: 'normal' }}>
                    {formatLargeNumber(currentBurst.damage)}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentBurst.player_name}
                </Typography>
            </Box>

            <Box sx={{ position: 'absolute', bottom: 4, left: '50%', transform: "translateX(-50%)" }} >
                <DotsMobileStepper steps={bands.length} activeStep={activeStep} setActiveStep={setActiveStep} />
            </Box>
        </Paper>
    );
}