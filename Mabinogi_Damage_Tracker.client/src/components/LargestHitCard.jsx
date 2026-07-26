import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import StarIcon from '@mui/icons-material/Star';
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

export default function LargestHitCard({ largestDamageInstances, setGraphLargestDamageInstance }) {
    const { t } = useTranslation();
    const [currentlargestDamageInstance, setCurrentlargestDamageInstance] = useState(largestDamageInstances[0]);
    const [activeStep, setActiveStep] = useState(0);

    useEffect(() => {
        setCurrentlargestDamageInstance(largestDamageInstances[activeStep]);
        setGraphLargestDamageInstance(largestDamageInstances[activeStep]);
    }, [activeStep, largestDamageInstances, setGraphLargestDamageInstance])

    return (
        <Paper square={false} sx={{ padding: '16px 24px 36px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', position: 'relative' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <StarIcon color="action" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {t('analytics.largestHit', 'Largest Hit')}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 2, mb: 1 }}>
                <Typography variant="h4" sx={{ lineHeight: 1, fontWeight: 'normal' }}>
                    {formatLargeNumber(currentlargestDamageInstance.damage)}
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 'normal', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentlargestDamageInstance.player_name}
                </Typography>
            </Box>

            <Box sx={{ position: 'absolute', bottom: 4, left: '50%', transform: "translateX(-50%)" }} >
                <DotsMobileStepper steps={largestDamageInstances.length} activeStep={activeStep} setActiveStep={setActiveStep} />
            </Box>
        </Paper>
    );
}