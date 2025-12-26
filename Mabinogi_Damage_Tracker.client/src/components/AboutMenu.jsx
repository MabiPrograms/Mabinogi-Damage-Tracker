import { useEffect, useState } from 'react';
import Markdown from 'react-markdown'
import Box from '@mui/material/Box';

export default function AboutMenu() {
    const [aboutMarkdown, setAboutMarkdown] = useState("");

    useEffect(() => {
        fetch("/ABOUTPAGE.md")
            .then((res) => res.text())
            .then((text) => setAboutMarkdown(text))
            .catch((err) => console.error(err));
    }, []);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', width: "50vw" }}>
            <Markdown>{aboutMarkdown}</Markdown>
        </Box>
    );
}

