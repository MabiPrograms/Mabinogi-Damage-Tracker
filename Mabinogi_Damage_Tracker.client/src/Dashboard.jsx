import './App.css';
import AppTheme from './theme/AppTheme';
import { CssBaseline } from '@mui/material';
import { Box } from '@mui/system';
import SideMenu from './components/SideMenu';
import { AppContext } from './AppContext'
import { useEffect, useState } from "react"
import MainContent from './components/MainContent';


function Dashboard() {
    const [menu, setMenu] = useState({ name: "Home" })
    const [mode, setMode] = useState(
        () => localStorage.getItem('mode') || 'light'
    );
    const [pollingRate, setPollingRate] = useState(
        () => localStorage.getItem('pollingRate') || 2500
    );
    const [burstCount, setBurstCount] = useState(
        () => localStorage.getItem('burstCount') || 8
    );

    const [largestDamageInstanceCount, setLargestDamageInstantCount] = useState(
        () => localStorage.getItem('largestDamageInstanceCount') || 8
    );
    const [skillUsageTopN, setSkillUsageTopN] = useState(
        () => Number(localStorage.getItem('skillUsageTopN')) || 10
    );
    const [topEnemyCount, setTopEnemyCount] = useState(
        () => Number(localStorage.getItem('topEnemyCount')) || 3
    );
    const [showBattleSummary, setShowBattleSummary] = useState(
        () => localStorage.getItem('showBattleSummary') === 'true'
    );

    useEffect(() => {
        document.documentElement.setAttribute('data-mui-color-scheme', mode);
        localStorage.setItem('mode', mode);
    }, [mode]);

    useEffect(() => {
        localStorage.setItem('pollingRate', pollingRate);
    }, [pollingRate])

    useEffect(() => {
        localStorage.setItem('burstCount', burstCount);
    }, [burstCount])

    useEffect(() => {
        localStorage.setItem('largestDamageInstanceCount', largestDamageInstanceCount) 
    }, [largestDamageInstanceCount])

    useEffect(() => {
        localStorage.setItem('skillUsageTopN', skillUsageTopN)
    }, [skillUsageTopN])

    useEffect(() => {
        localStorage.setItem('topEnemyCount', topEnemyCount)
    }, [topEnemyCount])

    useEffect(() => {
        localStorage.setItem('showBattleSummary', showBattleSummary);
    }, [showBattleSummary])

    return (
        <AppContext.Provider
            value={{
                menu,
                setMenu,
                mode,
                setMode,
                pollingRate,
                setPollingRate,
                burstCount,
                setBurstCount,
                largestDamageInstanceCount,
                setLargestDamageInstantCount,
                skillUsageTopN,
                setSkillUsageTopN,
                topEnemyCount,
                setTopEnemyCount,
                showBattleSummary,
                setShowBattleSummary,
            }}
        >
            <AppTheme mode={mode}>
                <CssBaseline enableColorScheme />
                <Box sx={{ display: 'flex' }}>
                    <SideMenu />
                    {/* Main Content */}
                    <MainContent key={menu.name} menu={menu.name} props={menu.props} />
                </Box>
            </AppTheme>
        </AppContext.Provider>
    );
}

export default Dashboard;
