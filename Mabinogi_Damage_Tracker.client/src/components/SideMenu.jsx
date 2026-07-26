import * as React from 'react';
import { useState, useEffect } from 'react';
import { styled } from '@mui/material/styles';
import MuiDrawer, { drawerClasses } from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import MenuContent from './MenuContent';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

const drawerWidth = 240;

const Drawer = styled(MuiDrawer)({
    width: drawerWidth,
    flexShrink: 0,
    boxSizing: 'border-box',
    mt: 10,
    [`& .${drawerClasses.paper}`]: {
        width: drawerWidth,
        boxSizing: 'border-box',
    },
});

export default function SideMenu() {
    const { t, i18n } = useTranslation();
    //GitHub Update check
    const [updateLink, setUpdateLink] = useState(null);
    const [latestVersion, setLatestVersion] = useState("");

    // ALWAYS UPDATE THIS TO THE VERSION PUBLISHED TO GITHUB
    const CURRENT_VERSION = "v2.1.0";

    useEffect(() => {
        fetch("https://api.github.com/repos/MabiPrograms/Mabinogi-Damage-Tracker/releases/latest")
            .then((response) => response.json())
            .then((data) => {
                if (data.tag_name && data.tag_name !== CURRENT_VERSION) {
                    setLatestVersion(data.tag_name);
                    setUpdateLink(data.html_url);
                }
            })
            .catch((error) => console.error("Failed to check for updates", error));
    }, []);
    // --------------------------------

    return (
        <Drawer
            variant="permanent"
            sx={{
                display: { xs: 'none', md: 'block' },
                [`& .${drawerClasses.paper}`]: {
                    backgroundColor: 'background.paper',
                },
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', gap: '12px' }}>
                <img src="mabinogi.png" alt="M" width="100" height="100" />
                <Typography>Mabinogi Damage Tracker</Typography>
            </Box>
            <Divider />
            <Box
                sx={{
                    overflow: 'auto',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Update Alert Banner */}
                {updateLink && (
                    <Box sx={{ p: 2, pb: 0 }}>
                        <Alert
                            severity="info"
                            sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}
                        >
                            {t('sideMenu.updateavail')} {latestVersion}
                            <Button
                                variant="outlined"
                                color="info"
                                size="small"
                                href={updateLink}
                                target="_blank"
                                sx={{ mt: 1, width: '100%' }}
                            >
                                Download
                            </Button>
                        </Alert>
                    </Box>
                )}
                {/* -------------------------------- */}

                <MenuContent />
            </Box>
        </Drawer>
    );
}