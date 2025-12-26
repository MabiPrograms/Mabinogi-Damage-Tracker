import { useState, useEffect, useContext } from 'react'
import { AppContext } from '../AppContext';
import { DataGrid } from '@mui/x-data-grid';
import Paper from '@mui/material/Paper';
import { Box, Typography, Button, IconButton, InputBase, CircularProgress, Tooltip } from '@mui/material';
import MovingIcon from '@mui/icons-material/Moving';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const paginationModel = { page: 0, pageSize: 10 };

function transformRowData(rowData) {
    return rowData.map(item => ({
        id: item.id,
        name: item.name,
        date: new Date(item.start_ut * 1000),
        start_ut: item.start_ut,
        end_ut: item.end_ut,
        duration: item.end_ut - item.start_ut,
        view: item.id
    }));
}

function NameEditorCell(props) {
    const { params } = props;
    const [value, setValue] = useState(params.value);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('passive');

    const handleSave = async () => {
        setLoading(true)
        if (loading) return 

        try {
            await sleep(500);
            if (value === "") {
                setStatus('error')
                return
            }

            const response = await fetch(`http://${window.location.hostname}:5004/Home/UpdateRecordingName`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: params.id,
                    name: value,
                }),
            });

            if (!response.ok) {
                setStatus('error')
            } else {
                setStatus('success')
            }

            setLoading(false)
        } catch (error) {
            setStatus('error');
            console.error(error);
        } finally {
            setLoading(false);

            setTimeout(() => {
                setStatus("passive");
            }, 2000);
        }
    };

    return (
        <div>
            <InputBase value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => e.stopPropagation()} />
            <IconButton color="primary" onClick={handleSave}>
                {loading ?
                    <CircularProgress enableTrackSlot size="30px" /> :
                    <>
                        {(status === "passive") &&
                        <Tooltip title="Rename" disableInteractive>
                            <KeyboardDoubleArrowRightIcon color="primary" />
                        </Tooltip>
                        }
                        {(status === "success") && <CheckCircleOutlineIcon color="success"/>}
                        {(status === "error") && <ErrorOutlineIcon color="error"/>}
                    </>
                }
            </IconButton>
        </div>
    );
}

export default function RecordingsMenu() {
    const { setMenu } = useContext(AppContext)
    const [rows, setRows] = useState([]);
    const [selected, setSelected] = useState({ ids: 0 });

    const columns = [
        { field: 'id', headerName: 'ID', type: 'int', width: 75, flex: 0 },
        { field: 'name', headerName: 'Name', type: 'string', width: 220, flex: 0, renderCell: (params) => <NameEditorCell params={params} /> },
        { field: 'date', headerName: 'Date', type: 'date', width: 130, flex: 0 },
        {
            field: 'start_ut', headerName: 'Start Time', type: 'string', width: 130, flex: 0,
            renderCell: (params) => (
                <Box sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Typography>{new Date(params.row.start_ut * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</Typography>
                </Box>
            )
        },
        {
            field: 'end_ut', headerName: 'End Time', type: 'string', width: 130, flex: 0,
            renderCell: (params) => (
                <Box sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <Typography>{new Date(params.row.end_ut * 1000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}</Typography>
                </Box>
            )
        },
        { field: 'duration', headerName: 'Duration (s)', type: 'int', width: 130, flex: 0 },
        { field: 'view', headerName: 'View', width: 80, flex: 0, renderCell: (params) => (
            <Tooltip title="Open for details" disableInteractive>
                <IconButton
                    variant="text"
                    color="primary"
                    onClick={() => {
                        setMenu({ name: "Analytics", props: { start_ut: params.row.start_ut, end_ut: params.row.end_ut } })
                    }}
                >
                    <MovingIcon />
                </IconButton>
            </Tooltip>
            ),
        }
    ];

    const handleDeleteSelected = async () => {
        // Call Backend API to remove from database below:
        // <--- insert code here ---
        const response = await fetch(`http://${window.location.hostname}:5004/Home/DeleteRecordings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([...selected.ids]),
        });

        if (!response.ok) {
            console.error("Error Deleting Recordings: ", response.error)
        } 
        // Remove from frontend 
        setRows(prevRows => prevRows.filter(row => !selected.ids.has(row.id)));
    };

    useEffect(() => {
        // Call Backend API to fetch recordings below:
        fetch(`http://${window.location.hostname}:5004/Home/GetRecordings`)
            .then(response => response.json())
            .then(data => {
                const newRows = transformRowData(data.value)
                setRows(newRows)
            })
            .catch(error => console.error('Error:', error));
    }, [])

    return (
        <Box>
            <Typography variant="h2" sx={{ marginBottom: "24px" }}>Recordings</Typography>
            <Paper sx={{ height: "100%", width: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
               <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSizeOptions={[5, 10,20,30,60]}
                    checkboxSelection
                    disableColumnResize
                    disableRowSelectionOnClick
                    disableRowSelectionExcludeModel
                    initialState={{
                        pagination: { paginationModel },
                        sorting: {
                            sortModel: [{ field: 'id', sort: 'desc' }],
                        },
                    }}
                    onRowSelectionModelChange={(newSelection) => {
                        setSelected(newSelection);
                    }}
                    sx={{
                        border: 1, borderColor: 'divider'
                    }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center'}}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteSelected}
                        disabled={selected.ids.size === 0}
                        sx={{ width: 200, margin: 1 }}
                    >
                        Delete Selected {selected.ids.size > 0 ? `(${selected.ids.size})`:""}
                    </Button>
                </Box>
                
            </Paper>
        </Box>
    );
}
