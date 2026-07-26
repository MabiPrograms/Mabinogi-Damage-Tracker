import * as React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { useTranslation } from 'react-i18next';

export default function PlayerCountCard({ count }) {
    const { t } = useTranslation();

    return (
        <Paper square={false} sx={{ padding: "16px 24px", height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <GroupIcon color="action" fontSize="small" />
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {t('common.numberOfPlayers')}
                </Typography>
            </Box>
            <Box sx={{ display: "flex", flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 2 }}>
                <Typography variant="h4" sx={{ lineHeight: 1 }}>{count}</Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '120px' }}>
                    {Array.from({ length: count }).map((_, i) => (
                        <PersonIcon key={i} sx={{ color: '#8684BF', fontSize: '1.2rem' }} />
                    ))}
                </Box>
            </Box>
        </Paper>
    );
}