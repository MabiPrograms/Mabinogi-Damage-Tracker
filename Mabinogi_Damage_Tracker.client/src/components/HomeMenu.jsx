import { useEffect, useState } from 'react';
import Markdown from 'react-markdown'
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';

export default function HomeMenu() {
    const [recogintionsMarkdown, setrecoginitionsMarkdown] = useState("");
    const [enMarkdown, setenMarkdown] = useState("");
    const [krMarkdown, setkrMarkdown] = useState("");

    useEffect(() => {
        fetch("/RECOGNITIONS.md")
            .then((res) => res.text())
            .then((text) => setrecoginitionsMarkdown(text))
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        fetch("/TONEXONEN.md")
            .then((res) => res.text())
            .then((text) => setenMarkdown(text))
            .catch((err) => console.error(err));
    }, []);

    useEffect(() => {
        fetch("/TONEXONKR.md")
            .then((res) => res.text())
            .then((text) => setkrMarkdown(text))
            .catch((err) => console.error(err));
    }, []);


    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: "80vw" }}>
            <Box sx={{ display: 'flex', flexDirection: 'column',  justifyContent: 'center', alignItems: 'center' }}> 
                <Markdown>{"## Dear Nexon Devs / Community Managers / Game Masters and Decision Makers,"}</Markdown>
                <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', width: '100%' }}>
                    <Box sx={{  width: "30vw" }}>
                        <Markdown>{enMarkdown}</Markdown>
                    </Box>
                    <Divider orientation='vertical' variant='middle' flexItem />
                    <Box sx={{ width: "30vw" }}>
                        <Markdown>{krMarkdown}</Markdown>
                    </Box>
                </Box>
            </Box>
            <Markdown>{recogintionsMarkdown}</Markdown>
        </Box>
    );
}

