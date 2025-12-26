import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography'
import AccessTimeIcon from '@mui/icons-material/AccessTime';

function formatTimeLength(length_ut) {
    if (length_ut === null || length_ut === undefined || length_ut < 0 || isNaN(length_ut)) return '0'

    const numberOfHours = Math.floor(length_ut / (60 * 60))
    const numberOfMinutes = Math.floor((length_ut % (60 * 60)) / 60)
    const numberOfSeconds = Math.floor(length_ut % 60)

    const parts = []
    if (numberOfHours > 0) parts.push(`${numberOfHours}h`)
    if (numberOfMinutes > 0 || numberOfHours > 0) parts.push(`${numberOfMinutes}m`)
    parts.push(`${numberOfSeconds}s`)

    return parts.join('')
}


export default function TimeCard({ length_ut }) {
    

    return (
        <Paper square={false} sx={{ 'padding-left': "32px", 'padding-top': "10px", gap: "20px", height: "100%", display: 'flex', flexDirection: 'column'}}>
            <AccessTimeIcon fontSize="large" sx={{ marginBottom: "5%"}} />
            <Box sx={{ display: "flex", flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 2, sm: 4, md: 8 } }}>
                <Box sx={{ gap: "0px", flexGrow: "1" }}>
                    <Typography variant="subtitle1">Recording Length</Typography>
                    <Typography variant="h3">{formatTimeLength(length_ut)}</Typography>
                </Box>
            </Box>
        </Paper>
    );
}

