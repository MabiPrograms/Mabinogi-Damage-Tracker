import { useState, useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

const columns = [
    { field: 'playerId', headerName: 'Player ID', width: 200 },
    { field: 'playerName', headerName: 'Player name', width: 170 },
];

const paginationModel = { page: 0, pageSize: 20 };

export default function PlayersMenu() {
    const [players, setPlayers] = useState([])

    useEffect(() => {
        fetch(`http://${window.location.hostname}:5004/Home/GetAllPlayers`)
            .then(response => response.json())
            .then(data => {
                setPlayers(data.value)
            })
            .catch(error => console.error('Error:', error));
    }, [])

    return (
        <Box>
            <Typography variant="h2" sx={{ marginBottom: "24px" }}>Players</Typography>
             <DataGrid
                rows={players}
                columns={columns}
                initialState={{ pagination: { paginationModel } }}
                pageSizeOptions={[5, 10, 20]}
                disableColumnResize
                sx={{ border: 1, borderColor: 'divider' }}
            />
            
        </Box >
    );
}
