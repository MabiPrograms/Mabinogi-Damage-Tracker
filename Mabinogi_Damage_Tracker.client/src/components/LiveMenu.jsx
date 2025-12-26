import { useState, useEffect, useRef, useContext } from 'react';
import { AppContext } from '../AppContext';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import PlayerDamagePieChart from './PlayerDamagePieChart';
import PlayerDamageGage from './PlayerDamageGauge';
import DamangeOverTimeLineGraph from './DamageOverTimeLineGraph';
import LinearProgress from '@mui/material/LinearProgress';
import LogStream from './LogStream'
import PlayerDamageGauge from './PlayerDamageGauge';

const RecordingButtonStyle = {
    width: '100%',
    height: 125,
};

function transformDataPieDamage(apiData) {
    return apiData.map(item => ({
        label: item.label,
        value: item.data.reduce((sum, d) => sum + d, 0)
    }));
}

function transformDataLineChartDamage(apiData) {
    return apiData.map(item => ({
        id: item.id,
        label: item.label,
        data: item.data,
        area: false,
        showMark: false,
    }));
}

export default function LiveMenu() {
    const { pollingRate } = useContext(AppContext);
    const [recording, setRecording] = useState(false);
    const [damagePieChartData, setDamagePieChartData] = useState([]); // for the piechart
    const [, setTotalDamage] = useState(0); // for the center number
    const [damageOverTimeData, setDamageOverTimeData] = useState([]); // for the damage line graph
    const [startUT, setStartUT] = useState(0);
    const lastFetchedIdRef = useRef(0);

    // for the dps meter
    const [averageDPS, setAverageDPS] = useState(0);
    const [DPS, setDPS] = useState(0);
    const lastTotalDamageRef = useRef(0);

     
    async function GetNewDamageData(lastId) {
        
        await fetch(`http://${window.location.hostname}:5004/Home/GetAllDamagesGroupedByPlayersAfterId?lastFetchedId=${lastId}`)
            .then(response => response.json())
            .then(res => {
                if (!res) return null

                lastFetchedIdRef.current = res.lastId
                const data = res.data
                // ---
                // Damage Pie Chart
                // ---
                const newPieChartData = transformDataPieDamage(data);
                setDamagePieChartData(prev => {
                    const prevMap = new Map(prev.map(item => [item.label, item.value]));

                    newPieChartData.forEach(({ label, value }) => {
                        prevMap.set(label, (prevMap.get(label) || 0) + value);
                    });

                    const newData = Array.from(prevMap, ([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);

                    return newData
                });

                const newTotalDamage = newPieChartData.reduce((prev, curr) => prev + curr.value, 0)
                setTotalDamage((prev) => prev + newTotalDamage)

                // ---
                // Damage Line Chart
                // ---
                const newDoTData = transformDataLineChartDamage(data);

                setDamageOverTimeData(prev => {
                    const prevMap = new Map(prev.map(p => [p.id, { ...p }]));
                    const updatedIds = new Set(); // keep track of which players did damage this interval
                    const pointsAdded =
                        newDoTData.length > 0
                            ? newDoTData[0].data.length
                            : 0; // keep track of how many new data points where added

                    newDoTData.forEach(({ id, label, data, area, showMark }) => {
                        updatedIds.add(id);

                        if (prevMap.has(id)) {
                            // if we have seen this player already in a previous response
                            // we can just concat() the new data with the old data.
                            const existingData = prevMap.get(id).data;
                            const lastTotal = existingData[existingData.length - 1] || 0;

                            // append new cumulative data based on last total
                            // we do this because the line chart data is supposed to be strictly in monotonically increasing order
                            // but the query returns total damage on a per second basis
                            const cumulativeData = data.reduce((acc, dmg, i) => {
                                if (i === 0) {
                                    acc.push(lastTotal + dmg);
                                } else {
                                    acc.push(acc[i - 1] + dmg);
                                }
                                return acc;
                            }, []);
                            // concatenation step where we merge the old and new data together.
                            prevMap.get(id).data = existingData.concat(cumulativeData);
                        } else {
                            // first appearance of player -> we have to fake their history [0,0,0,0,0, ...newData]
                            const longestHistory =
                                prev.length === 0
                                    ? 0
                                    : Math.max(...prev.map(p => p.data.length));
                            const zeroHistory = new Array(longestHistory).fill(0);
                            const cumulativeData = data.reduce((acc, dmg, i) => {
                                // accumuliation step to maintain invariant (monotonically increasing order)
                                acc.push((acc[i - 1] || 0) + dmg);
                                return acc;
                            }, []);

                            // concatenate fake history with new data for the final result
                            const newData = zeroHistory.concat(cumulativeData)

                            prevMap.set(id, { id, label, data: newData, area, showMark });
                        }
                    });

                    // extend players with no damage this tick
                    if (pointsAdded > 0) {
                        for (const player of prevMap.values()) {
                            if (!updatedIds.has(player.id)) {
                                const existingData = player.data;
                                const lastTotal =
                                    existingData.length > 0
                                        ? existingData[existingData.length - 1]
                                        : 0;

                                player.data = existingData.concat(
                                    new Array(pointsAdded).fill(lastTotal)
                                );
                            }
                        }
                    }

                    const newDamageOverTimeData = Array.from(prevMap.values())
                    return newDamageOverTimeData
                });
            })
            .catch(error => console.error('Error:', error))
    }

    useEffect(() => {
        if (!recording) return;
        setDamagePieChartData([])
        setTotalDamage(0)
        setDamageOverTimeData([])

        const poll = async () => {
            await GetNewDamageData(lastFetchedIdRef.current);
        };

        poll();

        const interval = setInterval(poll, pollingRate); 

        return () => {
            clearInterval(interval)
        };
    }, [recording, pollingRate]);

    // DPS meter updates
    useEffect(() => {
        const currentTotalDamage = damageOverTimeData.reduce((sum, series) => {
            const last = series?.data?.at(-1) ?? 0;
            return sum + last;
        }, 0);

        const timePoints =
            damageOverTimeData.length > 0
                ? damageOverTimeData[0].data.length
                : 1;

        setAverageDPS(currentTotalDamage / timePoints)

        const delta = currentTotalDamage - lastTotalDamageRef.current;
        setDPS(delta);

        lastTotalDamageRef.current = currentTotalDamage;
    }, [damageOverTimeData])


    const toggleRecording = async () => {
        if (recording) {
            const endUT = Math.floor(Date.now() / 1000);
            fetch(`http://${window.location.hostname}:5004/Home/PostRecording`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: "unnamed",
                    start_ut: startUT,
                    end_ut: endUT,
                })
            })
                .then(response => {
                    return response.json()
                })
                .catch(error => console.error('Error:', error));

        } else {
            const startTime = Math.floor(Date.now() / 1000);
            setStartUT(startTime)
        }

        
        await fetch(`http://${window.location.hostname}:5004/Home/GetLastDamageRowId`)
            .then(response => response.json())
            .then(res => {
                lastFetchedIdRef.current = res.data;
            })
            .catch(error => console.error('Error:', error));

        setRecording(prev => !prev)
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2}}>
            <Typography variant="h2" sx={{ marginBottom: "24px" }}>Live</Typography>
            <Paper sx={{ height: "100%", padding: 2}}>
                <Grid container spacing={2}>
                    <Grid item size={2} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' } }>
                        {recording ?
                            <Button sx={RecordingButtonStyle} variant="outlined" color="error" onClick={toggleRecording}>
                                End Recording
                            </Button>
                            :
                            <Button sx={RecordingButtonStyle} variant="contained" color="error" onClick={toggleRecording}>
                                Start Recording
                            </Button>
                        }
                    </Grid>
                    <Grid item size={10}>
                        <LogStream />
                        <LinearProgress value={0} variant={recording ? "indeterminate" : "determinate"} color="error" />
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={2} alignItems="stretch" sx={{ flexGrow: 1 }}>
                <Grid item size={{ xs: 12, sm: 12, lg: 8, xl: 4 }}>
                    <PlayerDamagePieChart chartData={damagePieChartData} />
                </Grid>
                <Grid item size={{ xs: 12, sm: 12, lg: 12, xl: 8 }}>
                    <DamangeOverTimeLineGraph chartData={damageOverTimeData} start_ut={startUT}/>
                </Grid>
                <Grid item size={{ xs: 12, sm: 12, lg: 8, xl: 4 }}>
                    <PlayerDamageGauge value={DPS} averageDPS={averageDPS} />
                </Grid>
            </Grid>
             
        </Box>
    );
}
