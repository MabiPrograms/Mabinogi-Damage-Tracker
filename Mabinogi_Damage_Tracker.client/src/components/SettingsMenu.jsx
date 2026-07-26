import * as React from 'react';
import { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
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
    const { t, i18n } = useTranslation();
    const { mode, setMode } = useContext(AppContext);
    const { pollingRate, setPollingRate } = useContext(AppContext);
    const { burstCount, setBurstCount } = useContext(AppContext);
    const { largestDamageInstanceCount, setLargestDamageInstantCount } = useContext(AppContext);
    const { skillUsageTopN, setSkillUsageTopN } = useContext(AppContext);
    const { topEnemyCount, setTopEnemyCount } = useContext(AppContext);
    const { showBattleSummary, setShowBattleSummary } = useContext(AppContext);
    const [themeChecked, setThemeChecked] = useState(mode === 'dark' ? true : false);
    const [adapters, setAdapters] = useState([]);
    const [selectedAdapter, setSelectedAdapter] = useState('');
    const [open, setOpen] = useState(false);
    const [severity, setSeverity] = useState("success");
    const [AlertMessage, setAlertMessage] = useState("");

    const [flushEnabled, setFlushEnabled] = useState(null);
    const [flushMs, setFlushMs] = useState("");

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

        // Fetch Flush Settings
        fetch(`http://${window.location.hostname}:5004/Home/GetFlushSettings`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    setFlushEnabled(data.enable !== 0);
                    setFlushMs(data.ms);
                }
            })
            .catch(error => console.error('Error fetching flush settings:', error));
    }, []);

    const handleThemeChange = (event) => {
        const mode = event.target.checked ? 'dark' : 'light';
        setMode(mode);
        setThemeChecked(event.target.checked);
    };

    const handleLanguageChange = (event) => {
        const selectedLanguage = event.target.value;
        i18n.changeLanguage(selectedLanguage);
        localStorage.setItem('lang', selectedLanguage);
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

    //flush settings
    const handleFlushEnableChange = async (event) => {
        const isEnabled = event.target.checked;
        setFlushEnabled(isEnabled);
        await saveFlushSettings(isEnabled, flushMs);
    };

    const handleFlushMsChange = async (value) => {
        setFlushMs(value);
        await saveFlushSettings(flushEnabled, value);
    };

    
    const saveFlushSettings = async (enabled, ms) => {
        const enableInt = enabled ? 1 : 0;
        try {
            const response = await fetch(`http://${window.location.hostname}:5004/Home/SaveFlushSettings?enable=${enableInt}&ms=${ms}`);
            setOpen(true);
            if (response.ok) {
                setSeverity('success');
                setAlertMessage("Database Flush Settings Saved.");
            } else {
                setSeverity('error');
                setAlertMessage("Error Saving Flush Settings.");
            }
        } catch (error) {
            console.error("Error saving flush settings", error);
        }
    };
    // ------------------------------------

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
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{t('common.language')}</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>{t('settings.languageLabel')}</Typography>
                </Box>
                <FormControl sx={{ m: 1, minWidth: 180 }}>
                    <InputLabel id="language-selector-label">{t('common.language')}</InputLabel>
                    <Select
                        labelId="language-selector-label"
                        id="language-selector"
                        value={t('common.SettingValue')}
                        onChange={handleLanguageChange}
                        label={t('common.language')}
                    >   //add new langauges here!
                        <MenuItem value="en">{t('common.english')}</MenuItem>
                        <MenuItem value="ja">{t('common.japanese')}</MenuItem>
                        <MenuItem value="cn">{t('common.traditionalChinese')}</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{t('settings.colorTheme')}</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>{t('settings.colorThemeDescription')}</Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center', grow: 2, alignSelf: 'flex-end' }}>
                    <Typography>{t('common.light')}</Typography>
                    <Switch checked={themeChecked} onChange={handleThemeChange} />
                    <Typography>{t('common.dark')}</Typography>
                </Stack>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{t('settings.numberOfBurst')}</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>{t('settings.numberOfBurstDescription')}</Typography>
                </Box>
                <NumberField label="Number Field" min={1} max={16}
                    value={burstCount}
                    onValueChange={(value) => {
                        setBurstCount(value);
                    }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{t('settings.numberOfLargestHits')}</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>{t('settings.numberOfLargestHitsDescription')}</Typography>
                </Box>
                <NumberField label="Number Field" min={1} max={16}
                    value={largestDamageInstanceCount}
                    onValueChange={(value) => {
                        setLargestDamageInstantCount(value);
                    }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{t('settings.skillUsageTopN')}</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>{t('settings.skillUsageTopNDescription')}</Typography>
                </Box>
                <FormControl sx={{ m: 1, minWidth: 180 }}>
                    <InputLabel id="skill-usage-top-n-settings-label">{t('settings.skillUsageTopN')}</InputLabel>
                    <Select
                        labelId="skill-usage-top-n-settings-label"
                        value={skillUsageTopN}
                        label={t('settings.skillUsageTopN')}
                        onChange={(event) => setSkillUsageTopN(Number(event.target.value))}
                    >
                        {[5, 10, 15, 20, 30].map((value) => (
                            <MenuItem key={value} value={value}>{value}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{t('settings.topEnemyCount')}</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>{t('settings.topEnemyCountDescription')}</Typography>
                </Box>
                <NumberField label="Top Enemy Count" min={1} max={10}
                    value={topEnemyCount}
                    onValueChange={(value) => {
                        setTopEnemyCount(value);
                    }} />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{t('settings.showBattleSummary')}</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>{t('settings.showBattleSummaryDescription')}</Typography>
                </Box>
                <Switch
                    checked={showBattleSummary}
                    onChange={(event) => setShowBattleSummary(event.target.checked)}
                />
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{t('settings.pollingRate')}</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>{t('settings.pollingRateDescription')}</Typography>
                </Box>
                <NumberField label="Number Field" min={10} max={10000} units="ms" step={100}
                    value={pollingRate}
                    onValueChange={(value) => {

                        setPollingRate(value);
                    }} />
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{t('settings.selectAdapter')}</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>{t('settings.selectAdapterDescription')}</Typography>
                </Box>
                <FormControl sx={{ m: 1, minWidth: 180 }}>
                    <InputLabel id="adapter-InputLabel">{t('settings.adapter')}</InputLabel>
                    <Select
                        labelId="adapter-selector"
                        id="adapter-selector"
                        value={selectedAdapter}
                        onChange={handleAdapterChange}
                        sx={{ minWidth: 100 }}
                        label={t('settings.adapter')}
                    >
                        {adapters.length ?
                            adapters.map((item) => <MenuItem key={item} value={item}>{item}</MenuItem>)
                            :
                            (<Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Typography>{t('settings.noAdaptersAvailable')}</Typography>
                            </Box>)}
                    </Select>
                    {selectedAdapter === "" ? <Typography variant="caption" color='warning'>{t('settings.noAdapterSaved')}</Typography> : <></>}
                </FormControl>
            </Box>
            <Divider />

            {/*Database Que and Flush Settings Block*/}
            {flushEnabled !== null && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                        <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'> {t('settings.flushsettingstitle')}</Typography>
                        <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle2' color="text.secondary">
                            {t('settings.flushsettingsdescription', { returnObjects: true }).map((line, index, array) => (
                                <React.Fragment key={index}>
                                    {line}
                                    {index < array.length - 1 && <br />}
                                </React.Fragment>
                            ))}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>{t('settings.flushsettingenable')}</Typography>
                        <Switch checked={flushEnabled} onChange={handleFlushEnableChange} />
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>{t('settings.flushsettingtime')}</Typography>
                        <NumberField
                            label={t('common.delay')}
                            min={100}
                            max={60000}
                            step={100}
                            units="ms"
                            value={flushMs}
                            onValueChange={handleFlushMsChange}
                        />
                    </Box>
                </Box>
            )}
            <Divider />
            {/* ------------------------------------------------ */}

            <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between' }}>
                <Box>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='h4'>{t('settings.restartParse')}</Typography>
                    <Typography sx={{ alignSelf: 'flex-start' }} variant='subtitle'>{t('settings.restartDescription')}</Typography>
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
                    {t('settings.restart')}</Button>
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