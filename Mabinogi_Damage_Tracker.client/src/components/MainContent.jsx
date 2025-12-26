import * as React from 'react';
import { useEffect, useState } from 'react';
import HomeMenu from './HomeMenu';
import AnalyticsMenu from './AnalyticsMenu';
import RecordingsMenu from './RecordingsMenu';
import LiveMenu from './LiveMenu';
import PlayersMenu from './PlayersMenu';
import SettingsMenu from './SettingsMenu';
import AboutMenu from './AboutMenu';
import { Paper } from '../../node_modules/@mui/material/index';

const menuListItems = {
    "Home": HomeMenu,
    "Analytics": AnalyticsMenu,
    "Live": LiveMenu,
    "Recordings": RecordingsMenu,
    "Settings": SettingsMenu,
    "Players": PlayersMenu,
    "About": AboutMenu,
}


export default function MainContent({ menu, props }) {
    const [currentMenu, setCurrentMenu] = useState(menu);
    const MenuComponent = menuListItems[currentMenu];

    useEffect(() => {
        setCurrentMenu(menu)
    }, [menu])

    return (
        <Paper
            elevation={0}
            sx={{
                padding: '2vw',
                width: '100%',
                minHeight: '100vh',
                maxHeight: '100%',
            }}
        >
            {MenuComponent ? <MenuComponent {...props} /> : null}
        </Paper>
    );
}