import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { AppContext } from '../AppContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import NumberField from './NumberField';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Button from '@mui/material/Button';

export default function SettingsMenu() {
    const { mode, setMode } = useContext(AppContext);
    const { pollingRate, setPollingRate } = useContext(AppContext);
    const { burstCount, setBurstCount } = useContext(AppContext);
    const { largestDamageInstanceCount, setLargestDamageInstantCount } = useContext(AppContext);
    const [themeChecked, setThemeChecked] = useState(mode === 'dark' ? true : false);
    const [adapters, setAdapters] = useState([]);
    const [selectedAdapter, setSelectedAdapter] = useState('');
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState("success");
    const [AlertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        // Fetch adapter settings
        fetch(`http://${window.location.hostname}:5004/Home/GetCurrentAdapter`)
            .then(response => response.json())
            .then(data => {
                setSelectedAdapter(data);
            })
            .catch(error => console.error('Error:', error));


        fetch(`http://${window.location.hostname}:5004/Home/GetAllAdapters`)
            .then(response => response.json())
            .then(data => {
                setAdapters(data);
            })
            .catch(error => console.error('Error:', error));
    }, []);

    const handleThemeChange = (event) => {
        const mode = event.target.checked ? 'dark' : 'light';
        setMode(mode);
        setThemeChecked(event.target.checked);
    };

    const handleAdapterChange = async (event) => {
        if (event.target.value === undefined) return;

        setSelectedAdapter(event.target.value);
        const response = await fetch(`http://${window.location.hostname}:5004/Home/SaveAdapter?adapter=${event.target.value}`);
        setOpen(true);
        if (response.ok) {
            setSeverity('success');
            setAlertMessage("Adapter Saved Successfully.");
        } else {
            setSeverity('error');
            setAlertMessage("Error Saving Adapter.");
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: "40vw", gap: '40px' }}>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>Color Theme</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>Sets the color mode for the application to light or dark mode</Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', grow: 2, alignSelf: 'flex-end' }}>
                    <Typography>Light</Typography>
                    <Switch checked={themeChecked} onChange={handleThemeChange} />
                    <Typography>Dark</Typography>
                </Stack>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>Number of Burst</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>Sets the number of unique damage burst to view in the analytics page.</Typography>
                </Box>
                <NumberField label="Number Field" min={1} max={16}
                    value={burstCount}
                    onValueChange={(value) => {
                        setBurstCount(value);
                    }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>Number of Largest Hits</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>Sets the number of unique single largest damage instances to view in the analytics page.</Typography>
                </Box>
                <NumberField label="Number Field" min={1} max={16}
                    value={largestDamageInstanceCount}
                    onValueChange={(value) => {
                        setLargestDamageInstantCount(value);
                    }} />
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>Polling Rate</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>Sets the interval for receving data while recording.</Typography>
                </Box>
                <NumberField label="Number Field" min={10} max={10000} units="ms"
                    value={pollingRate}
                    onValueChange={(value) => {

                        setPollingRate(value);
                    }} />
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>Select Adapter</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>Sets the adapter for the parser to use.</Typography>
                </Box>
                <FormControl sx={{ m: 1, minWidth: 180 }}>
                    <InputLabel id="adapter-InputLabel">Adapter</InputLabel>
                    <Select
                        labelId="adapter-selector"
                        id="adapter-selector"
                        value={selectedAdapter}
                        onChange={handleAdapterChange}
                        sx={{ minWidth: 100 }}
                        label="Adapter"
                    >
                        {adapters.length ?
                            adapters.map((item) => <MenuItem value={item}>{item}</MenuItem>)
                            :
                            (<Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Typography>No Adapters Available</Typography>
                            </Box>)}
                    </Select>
                    {selectedAdapter === "" ? <Typography variant="caption" color='warning'>No Adapter Saved</Typography> : <></>}
                </FormControl>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>Restart Parse</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>Restarts the parser service</Typography>
                </Box>
                <Button color="error" variant="contained"
                    onClick={async () => {
                        const response = await fetch(`http://${window.location.hostname}:5004/Home/RestartParser`)
                        setOpen(true);
                        if (response.ok) {
                            setSeverity('success');
                            setAlertMessage("Adapter Restarted Successfully.");
                        } else {
                            setSeverity('error');
                            setAlertMessage("Failed to restart adapter.");
                        }
                    }}
                    >
                Restart</Button>
            </Box>

            {/* Feedback component */}
            <Snackbar open={open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={severity}
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {AlertMessage}
                </Alert>
            </Snackbar>
        </Box>
    );
}
