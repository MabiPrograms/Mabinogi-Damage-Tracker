import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useTranslation } from 'react-i18next';

function formatTimeLength(length_ut) {
    if (length_ut === null || length_ut === undefined || length_ut < 0 || Number.isNaN(length_ut)) return '0';

    const numberOfHours = Math.floor(length_ut / (60 * 60));
    const numberOfMinutes = Math.floor((length_ut % (60 * 60)) / 60);
    const numberOfSeconds = Math.floor(length_ut % 60);

    const parts = [];
    if (numberOfHours > 0) parts.push(`${numberOfHours}h`);
    if (numberOfMinutes > 0 || numberOfHours > 0) parts.push(`${numberOfMinutes}m`);
    parts.push(`${numberOfSeconds}s`);

    return parts.join('');
}

export default function TimeCard({ length_ut, original_length_ut = null, excluded_length_ut = null }) {
    const { t } = useTranslation();
    const showExcludedSummary = original_length_ut !== null || excluded_length_ut !== null;

    return (
        <Paper square={false} sx={{ padding: '16px 24px', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <AccessTimeIcon color="action" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {showExcludedSummary ? t('analytics.analyzedDuration') : t('recordings.recordingLength')}
                </Typography>
            </Box>

            <Box sx={{ display: "flex", flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="h4" sx={{ lineHeight: 1 }}>{formatTimeLength(length_ut)}</Typography>
            </Box>

            {showExcludedSummary ? (
                <Box sx={{ display: 'flex', flexDirection: 'row', gap: 3, mt: 1.5, pt: 1.5, borderTop: 1, borderColor: 'divider' }}>
                    <Box>
                        <Typography variant="caption" color="text.secondary">{t('analytics.elapsedDuration')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{formatTimeLength(original_length_ut ?? length_ut)}</Typography>
                    </Box>
                    <Box>
                        <Typography variant="caption" color="text.secondary">{t('analytics.excludedDuration')}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>{formatTimeLength(excluded_length_ut ?? 0)}</Typography>
                    </Box>
                </Box>
            ) : null}
        </Paper>
    );
}