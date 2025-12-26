import { useState, useEffect } from 'react';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';


export default function LogStream() {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        const eventSource = new EventSource(`http://${window.location.hostname}:5004/api/logs/stream`);

        eventSource.onmessage = (event) => {
            setLogs(prev => [...prev.slice(-5), event.data])
        }

        return () => eventSource.close()
    }, [])


    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: "150px" }}>
            <Typography variant="h5">Event Logs</Typography>
            <Divider />
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflowY: "auto" }}>
                {logs.map((log, i) => {
                const opacity = (i + 1) / logs.length;

                return (
                    <Typography
                        variant="subtitle"
                        key={i}
                        sx={{ opacity }}
                    >
                        {log}
                    </Typography>
                );
                })}
            </div>
        </div>
    );
}
