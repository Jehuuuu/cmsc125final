// Updated Main.js with paged memory management
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import toast from 'react-hot-toast';

import InfoOutlined from '@mui/icons-material/InfoOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import './Main.css';

import Policy from "../components/policy";
import ConfirmSwitch from "../components/ConfirmSwitch";
import PCBRows from "../components/PCB/PCBRows";
import Header from "../components/PCB/header";
import TableHeader from "../components/PCB/tableHeader";
import Simulation from "../components/Simulation/Simulation";

import { 
    addRow, 
    deleteAllRows, 
    deleteRow, 
    editRow, 
    filterRows, 
    getRows,
    initializePagedMemory,
    allocatePages,
    deallocatePages,
    getMemoryStats
} from "../components/data-funcs";
import { FCFS } from "../policies/FCFS";
import { Priority } from "../policies/Priority";
import { RoundRobin } from "../policies/RoundRobin";
import { SJF } from "../policies/SJF";
import jsonData from "../components/data.json";

export default function Main() {
    const location = useLocation();

    /*<-------------- VARIABLES -------------->*/
    const [openInfo, setOpenInfo] = useState(false);
    const [data, setData] = useState([]);
    const [time, setTime] = useState(0);
    const [currProcess, setCurrProcess] = useState({});
    const [changePolicy, setChangePolicy] = useState(false);
    const [toPolicy, setToPolicy] = useState("First Come, First Serve");
    const [processingQueue, setProcessingQueue] = useState(false);
    const [selectedPolicy, setSelectedPolicy] = useState(
        location.state 
        ? location.state.policy 
        : 'First Come, First Serve');   

    const [avgTime, setAvgTime] = useState({
        total_time: 0,
        total_rows: 0,
        avg_time: 0
    });
    
    const [jobQueue, setJobQueue] = useState(0)
    const [simulationState, setSimulationState] = useState('stopped');
    const [isSimulationRunning, setIsSimulationRunning] = useState(false);
    const intervalRef = useRef(null);

    const policies = [
        'First Come, First Serve',
        'Shortest Job First',
        'Priority',
        'Round Robin',
    ];

    /*<-------------- SIMULATION CONTROL FUNCTIONS -------------->*/
    
    const playSimulation = () => {
        if (simulationState === 'stopped') {
            setSimulationState('playing');
            setIsSimulationRunning(true);
            toast.success('Simulation started');
        } else if (simulationState === 'paused') {
            setSimulationState('playing');
            setIsSimulationRunning(true);
            toast.success('Simulation resumed');
        }
    };

    const pauseSimulation = () => {
        if (simulationState === 'playing') {
            setSimulationState('paused');
            setIsSimulationRunning(false);
            toast('Simulation paused');
        }
    };

    const stopSimulation = async () => {
        setSimulationState('stopped');
        setIsSimulationRunning(false);
        setTime(0);
        
        // Clear all processes and reset memory
        await deleteAllRows("pcb");
        await deleteAllRows("queue");
        
        // Initialize paged memory system
        await initializePagedMemory();
        
        // Reset statistics
        setAvgTime({
            total_time: 0,
            total_rows: 0,
            avg_time: 0
        });
        setCurrProcess({});
        
        toast.error('Simulation stopped and reset');
    };

    /*<-------------- EXISTING FUNCTIONS WITH PAGED MEMORY -------------->*/
    
    useEffect(() => {
        async function fetchData() {
            setData(await getRows("pcb"));
        }
        fetchData()
    }, []);

    async function clickPolicy(e) {
        const policy = e.target.value;
        setToPolicy(policy);
        setChangePolicy(true);
    }

    useEffect(() => {
        var obj = avgTime;
        const running = data.filter(item => item.status === "Running");

        if(running.length > 0) {
            if(running[0].id !== currProcess.id) { 
                obj.total_time += running[0].waiting_time;
                obj.total_rows += 1;
                obj.avg_time = parseFloat(obj.total_time / obj.total_rows).toFixed(2);
                setCurrProcess(running[0]);
            }
        }

        setAvgTime(obj);
    }, [data]);

    async function changeWaitTime() {
        var allRows = await filterRows("status", "Ready", "pcb");

        allRows.forEach(async row => {
            row.waiting_time += 1;
            row.steps = 0;
            await editRow(row, "pcb");
        })
    }

    async function changeIOTime() {
        const waiting = await filterRows("status", "Waiting", "pcb");

        waiting.forEach(async item => {
            if(item.io_time > 0) {
                item.io_time--;
            } else {
                item.status = "Ready";
            }
            
            item.steps = 0;
            await editRow(item, "pcb");
        })
    }

    useEffect(() => {
        if (isSimulationRunning) {
            intervalRef.current = setInterval(async () => {
                // Check job queue first to move processes from queue to PCB
                await checkJobQueuePaged();
                
                // Then run the scheduling policy
                if(selectedPolicy === "First Come, First Serve") {
                    FCFS(false, deleteRowPaged);
                } else if(selectedPolicy === "Shortest Job First") {
                    SJF(deleteRowPaged);
                } else if(selectedPolicy === "Priority") {
                    Priority(deleteRowPaged);
                } else if(selectedPolicy === "Round Robin") { 
                    RoundRobin(deleteRowPaged);
                }
            
                changeWaitTime();
                changeIOTime();
                setTime(time => time + 1);
                
                // Update data to trigger re-render
                setData(await getRows("pcb"));
              
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isSimulationRunning, selectedPolicy]); 

    useEffect(() => {
        async function updateIOEvent() {
            const running = await filterRows("status", "Running", "pcb");
            var row = running[0] ? running[0] : "";
            
            if(row !== "") {
                if(row.burst_time === row.io_when) {
                    row.status = "Waiting";
                    row.steps = row.init_burst - row.io_when;
                    await editRow(row, "pcb");
                }
            }
        }

        updateIOEvent();
    }, [data]);

    // Updated job queue function for paged memory
    async function checkJobQueuePaged() {
        // Prevent concurrent queue processing
        if (processingQueue) {
            console.log('Queue processing already in progress, skipping...');
            return;
        }
        
        try {
            setProcessingQueue(true);
            
            const queue = await getRows("queue");
            setJobQueue(queue.length);
            
            if (queue.length === 0) {
                return;
            }
            
            console.log(`Processing job queue with ${queue.length} waiting processes`);
            
            // Sort queue by arrival time for fairness
            const sortedQueue = queue.sort((a, b) => a.arrival_time - b.arrival_time);
            
            // Process jobs one at a time
            for (const job of sortedQueue) {
                console.log(`Attempting to allocate memory for process ${job.process_id} (${job.memory_size} units)`);
                
                // Try to allocate pages for the job
                const allocationResult = await allocatePages(job.process_id, job.memory_size);
                
                if (allocationResult.success) {
                    console.log(`Successfully allocated memory for process ${job.process_id}`);
                    
                    // Create PCB entry with proper initialization
                    const pcbEntry = {
                        ...job,
                        status: "Ready",
                        waiting_time: 0,
                        steps: 0,
                        allocated_pages: Math.ceil(job.memory_size / 6)
                    };
                    
                    // Move process from queue to PCB
                    await addRow(pcbEntry, "pcb");
                    await deleteRow(job.id, "queue");
                    
                    toast.success(`Process ${job.process_id} allocated ${Math.ceil(job.memory_size / 6)} page(s)`);
                    
                    // Process one job per cycle to avoid overwhelming the system
                    break;
                } else {
                    console.log(`Process ${job.process_id} still waiting: ${allocationResult.message}`);
                }
            }
        } catch (error) {
            console.error('Error in checkJobQueuePaged:', error);
        } finally {
            setProcessingQueue(false);
        }
    }
    

    // Updated deleteRow function for paged memory
    const deleteRowPaged = async (process_id, table) => {
        try {
            const response = await deleteRow(process_id, table);
            
            if (table === "pcb") {
                // Deallocate pages for the process
                const result = await deallocatePages(process_id.toString());
                if (result.success) {
                    console.log(`Pages deallocated for process ${process_id}`);
                    toast.success(`Memory freed for process ${process_id}`);
                    
                    // After freeing memory, check if any queued processes can now run
                    setTimeout(async () => {
                        await checkJobQueuePaged();
                    }, 100);
                }
            }
            
            return response;
        } catch (error) {
            console.error('Error in deleteRowPaged:', error);
        }
    };

    useEffect(() => {
        (async () => await checkJobQueuePaged())()
    }, [jsonData])

    // Initialize paged memory on component mount
    useEffect(() => {
        const initializeSimulation = async () => {
            if (simulationState === 'stopped') {
                await deleteAllRows("pcb");
                await deleteAllRows("queue");
                await initializePagedMemory();
            }
        };
        
        initializeSimulation();
    }, []);

    return (
        <div className="main">
            {/* scheduling policy */}
            <div className="policy-cont cont-template">
                <h1>Scheduling Policies</h1>
                <div className="policies">
                    {policies.map(policy => {
                        return (
                            <button 
                                id={policy}
                                className={"btn-primary " + (selectedPolicy === policy ? "selected-policy" : "")} 
                                value={policy} 
                                key={policy}
                                onClick={e => clickPolicy(e)}
                                disabled={selectedPolicy === policy ? true : false}>
                                {policy}
                            </button>
                        )
                    })}
                </div>

                {/* Simulation Controls */}
                <div className="simulation-controls">
                    <button 
                        className={`control-btn play-btn ${simulationState === 'playing' ? 'active' : ''}`}
                        onClick={playSimulation}
                        disabled={simulationState === 'playing'}
                        title="Play/Resume Simulation"
                    >
                        <PlayArrowIcon />
                        {simulationState === 'paused' ? 'Resume' : 'Play'}
                    </button>
                    
                    <button 
                        className={`control-btn pause-btn ${simulationState === 'paused' ? 'active' : ''}`}
                        onClick={pauseSimulation}
                        disabled={simulationState !== 'playing'}
                        title="Pause Simulation"
                    >
                        <PauseIcon />
                        Pause
                    </button>
                    
                    <button 
                        className="control-btn stop-btn"
                        onClick={stopSimulation}
                        disabled={simulationState === 'stopped'}
                        title="Stop and Reset Simulation"
                    >
                        <StopIcon />
                        Stop
                    </button>
                    
                    <div className="simulation-status">
                        <span className={`status-indicator ${simulationState}`}></span>
                        <span className="status-text">
                            {simulationState === 'playing' && 'Running'}
                            {simulationState === 'paused' && 'Paused'}
                            {simulationState === 'stopped' && 'Stopped'}
                        </span>
                        <span className="time-display"> | Time: {time}</span>
                    </div>
                </div>

                <InfoOutlined className="info" onClick={() => setOpenInfo(true)} />
                <Policy policy={selectedPolicy} open={openInfo} close={() => setOpenInfo(false)} />
            </div>

            {/* simulation */}
            <div className="sim-cont mt-3">
                <Simulation avgTime={avgTime.avg_time} />
            </div>

            {/* PCB */}
            <div className="pcb-cont cont-template">
                <Header 
                    time={time} 
                    policy={selectedPolicy} 
                    jobQueue={jobQueue}
                    simulationState={simulationState}
                />

                <TableHeader data={data} policy={selectedPolicy} />
                <PCBRows policy={selectedPolicy} />
            </div>

            <ConfirmSwitch open={changePolicy} close={() => setChangePolicy(false)} to_policy={toPolicy} />
        </div>
    );
}