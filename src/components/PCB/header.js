// Importing necessary dependencies
import { useState, useEffect } from "react";

// Importing Dropdown component from react-bootstrap for creating dropdown menus
import { Dropdown, Badge, ButtonGroup } from "react-bootstrap";

// Importing functions for data manipulation
import { addRow, getLastRowID, getProcessID, getRows, filterRows, editRow, deleteRow, getSum } from "../data-funcs";

// Importing NewCustomRow component for adding a custom row
import NewCustomRow from "./NewCustomRow";

// Importing Memory component to show the memory modal
import Memory from '../Memory/MemoryModal';

// Importing VoiceCommands component for voice command functionality
import VoiceCommands from "../../voice/VoiceCommands";

// Import Material-UI icons
import SortIcon from '@mui/icons-material/Sort';
import RefreshIcon from '@mui/icons-material/Refresh';
import BarChartIcon from '@mui/icons-material/BarChart';

// Defining a functional component named Header
export default function Header(props) {
    // Defining state variables using useState hook

    // State to manage the visibility of NewCustomRow modal
    const [open, setOpen] = useState(false); 

    // State to manage the visibility of Memory modal
    const [openMemory, setOpenMemory] = useState(false);

    // State for process statistics
    const [processStats, setProcessStats] = useState({
        total: 0,
        running: 0,
        ready: 0,
        waiting: 0,
        terminated: 0
    });

    // State for sorting
    const [sortBy, setSortBy] = useState('arrival_time');
    const [sortOrder, setSortOrder] = useState('asc');

    // Calculate process statistics
    useEffect(() => {
        async function calculateStats() {
            try {
                const allProcesses = await getRows("pcb");
                const stats = {
                    total: allProcesses.length,
                    running: allProcesses.filter(p => p.status.toLowerCase() === 'running').length,
                    ready: allProcesses.filter(p => p.status.toLowerCase() === 'ready').length,
                    waiting: allProcesses.filter(p => p.status.toLowerCase() === 'waiting').length,
                    terminated: allProcesses.filter(p => p.status.toLowerCase() === 'terminated').length
                };
                setProcessStats(stats);
            } catch (error) {
                console.error('Error calculating process statistics:', error);
            }
        }
        
        calculateStats();
        // Update stats every 2 seconds when simulation is running
        const interval = setInterval(calculateStats, 2000);
        return () => clearInterval(interval);
    }, [props.time]);

    // Asynchronous function to add a new row to the PCB
    async function addNewRow(type) {
        // Check if simulation is stopped before allowing new processes
        if (props.simulationState === 'stopped') {
            alert('Please start the simulation before adding processes');
            return;
        }

        if(type === "random")  {
            try {
                // Get the current highest ID from both PCB and queue to ensure uniqueness
                let currentId = Number(await getLastRowID("pcb")) || 0;
                const queueId = Number(await getLastRowID("queue")) || 0;
                
                // Use the higher of the two IDs and increment by 1
                currentId = Math.max(currentId, queueId) + 1;

                // Create a new row with unique ID and random values
                const finalRow = {
                    process_id: currentId.toString(),
                    burst_time: Math.floor(Math.random() * 8) + 3,
                    memory_size: Math.floor(Math.random() * 10) + 1,
                    arrival_time: props.time,
                    priority: Math.floor(Math.random() * 10) + 1,
                    status: "Ready",
                    waiting_time: 0,
                    steps: 0
                }

                // Initialize io event and io time properties for the new row
                finalRow.init_burst = finalRow.burst_time;
                finalRow.io_when = Math.floor(Math.random() * (finalRow.burst_time - 2)) + 2;
                finalRow.io_time = Math.floor(Math.random() * 10) + 1;
                finalRow.io_completed = false; // Track if I/O event has been triggered

                // Add the new row to the "queue"
                await addRow(finalRow, "queue");
                
                // Immediately process the job queue to move process to PCB if memory is available
                await processJobQueueImmediately();
                
            } catch (error) {
                console.error('Error adding random process:', error);
                alert('Error adding process. Please try again.');
            }
        } else {
            // Open the NewCustomRow modal for custom process
            setOpen(true);
        }
    }

    // Function to refresh process data
    async function refreshData() {
        // Force a refresh by updating the time prop or triggering a re-render
        window.location.reload();
    }

    // Get status badge variant
    function getStatusBadgeVariant(status) {
        switch(status) {
            case 'running': return 'success';
            case 'ready': return 'warning';
            case 'waiting': return 'danger';
            case 'terminated': return 'secondary';
            default: return 'light';
        }
    }

    // Function to immediately process job queue (copied from Main.js)
    async function processJobQueueImmediately() {
        try {
            function isEmptyObject(obj) {
                return Object.keys(obj).length === 0 && obj.constructor === Object;
            }

            // get jobQueues
            var queue = await getRows("queue")
            
            var i = 0;
            // for each queue, search memory space to
            while (i < queue.length) {
              const memory = await filterRows("status", "Free", "memory")
              var job = queue[i]
              var smallestFragmentation = {}
                for (var idx = 0; idx < memory.length; idx++){
                  var currMemory = memory[idx]
                  if (isEmptyObject(smallestFragmentation) && currMemory.splittable && currMemory.block_size >= job.memory_size) {
                    // Split the segment
                    if (parseInt(currMemory.block_size) - parseInt(job.memory_size) > 0) {
                      var remainingSegment = {
                        process_id: "",
                        job_size: "",
                        row_id: "",
                        status: "Free",
                        Fragmentation: "None",
                        block_size: parseInt(currMemory.block_size) - parseInt(job.memory_size),
                        splittable: true
                      }
                      // add to memory and pcb, delete it from queue
                        await addRow(remainingSegment, "memory")
                    }
                    
                    // Create another segment
                    var segment = {
                      id: currMemory.id,
                      block_size: parseInt(job.memory_size),              
                      process_id: job.process_id,
                      row_id: job.id,
                      job_size: parseInt(job.memory_size),
                      status: "Busy",
                      fragmentation: 0,
                      splittable: false
                    }
                    await addRow(job, "pcb")
                    await deleteRow(job.id, "queue")
                    await editRow(segment, "memory")
                    queue = await getRows("queue");
                    i--

                    break;
                  } else if(currMemory.block_size >= job.memory_size) {
                    var fragmentation = memory[idx].block_size - job.memory_size
                    if(isEmptyObject(smallestFragmentation) || fragmentation < smallestFragmentation.fragmentation) {
                      smallestFragmentation = memory[idx]
                      smallestFragmentation.fragmentation = fragmentation
                      smallestFragmentation.process_id = job.process_id
                      smallestFragmentation.row_id = job.id
                      smallestFragmentation.job_size = job.memory_size
                      smallestFragmentation.status = "Busy"
                    } else {
                      continue
                    }
                  }
                }
                if (!isEmptyObject(smallestFragmentation)) {
                  await editRow(smallestFragmentation, "memory")
                  await addRow(job, "pcb")
                  await deleteRow(job.id, "queue")
                  queue = await getRows("queue");
                  i--
                }

                i++
            }
        } catch (error) {
            console.error('Error processing job queue:', error);
        }
    }

    return (
        // The component returns a div containing the enhanced header for the PCB
        <div className="pcb-header">
        
        <div className="title-contain">
          <h1>Process Control Block</h1>
          
          {/* Process Statistics */}
          <div className="process-stats">
            <Badge bg="primary" className="stat-badge">
                Total: {processStats.total}
            </Badge>
            <Badge bg={getStatusBadgeVariant('running')} className="stat-badge">
                Running: {processStats.running}
            </Badge>
            <Badge bg={getStatusBadgeVariant('ready')} className="stat-badge">
                Ready: {processStats.ready}
            </Badge>
            <Badge bg={getStatusBadgeVariant('waiting')} className="stat-badge">
                Waiting: {processStats.waiting}
            </Badge>
            <Badge bg={getStatusBadgeVariant('terminated')} className="stat-badge">
                Completed: {processStats.terminated}
            </Badge>
          </div>
          
          <div className="btn-badge-wrapper">
                {/* Button to open the Memory modal */}
                <button className="btn-primary" onClick={()=>setOpenMemory(true)}>
                  <BarChartIcon className="me-1" />
                  Job Queue
                </button>
                
                {/* Display a badge with the number of jobs in the job queue */}
                {props.jobQueue > 0 && (
                  <span className="btn-badge">{props.jobQueue}</span>
                )}
            </div>
        </div>
        
            <div className="btn-cont">
                {/* Control buttons */}
                <ButtonGroup className="control-buttons me-3">
                    {/* Refresh button */}
                    <button 
                        className="btn btn-outline-primary btn-sm"
                        onClick={refreshData}
                        title="Refresh process data"
                    >
                        <RefreshIcon />
                    </button>
                    
                    {/* Sort dropdown */}
                    <Dropdown>
                        <Dropdown.Toggle 
                            variant="outline-primary" 
                            size="sm"
                            title="Sort processes"
                        >
                            <SortIcon className="me-1" />
                            Sort
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                            <Dropdown.Header>Sort by:</Dropdown.Header>
                            <Dropdown.Item onClick={() => setSortBy('process_id')}>
                                Process ID
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => setSortBy('arrival_time')}>
                                Arrival Time
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => setSortBy('burst_time')}>
                                Burst Time
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => setSortBy('priority')}>
                                Priority
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => setSortBy('waiting_time')}>
                                Waiting Time
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                                {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </ButtonGroup>

                {/* VoiceCommands component for voice command functionality */}
                <VoiceCommands/>

                {/* Dropdown menu to add a new process */}
                <Dropdown className="dropdown">
                    <Dropdown.Toggle 
                        className="new-process" 
                        id="New"
                        disabled={props.simulationState === 'stopped'}
                    >
                        Add New Process
                    </Dropdown.Toggle>

                    <Dropdown.Menu>
                        {/* Dropdown item to generate a random process */}
                        <Dropdown.Item 
                            id='Random' 
                            onClick={() => addNewRow("random")}
                            disabled={props.simulationState === 'stopped'}
                        >
                            🎲 Generate Random Process
                        </Dropdown.Item>

                        {/* Dropdown item to add a custom process */}
                        <Dropdown.Item 
                            id='Custom' 
                            onClick={() => addNewRow("custom")}
                            disabled={props.simulationState === 'stopped'}
                        >
                            ⚙️ Add Custom Process
                        </Dropdown.Item>
                        
                        <Dropdown.Divider />
                        
                        {/* Quick add presets */}
                        <Dropdown.Header>Quick Add:</Dropdown.Header>
                        <Dropdown.Item 
                            onClick={() => addMultipleProcesses(3)}
                            disabled={props.simulationState === 'stopped'}
                        >
                            📦 Add 3 Random Processes
                        </Dropdown.Item>
                        <Dropdown.Item 
                            onClick={() => addMultipleProcesses(5)}
                            disabled={props.simulationState === 'stopped'}
                        >
                            📦 Add 5 Random Processes
                        </Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                
                {/* Simulation state indicator */}
                {props.simulationState === 'stopped' && (
                    <div className="simulation-hint">
                        <small style={{color: '#6c757d', marginLeft: '10px'}}>
                            ⚠️ Start simulation to add processes
                        </small>
                    </div>
                )}
            </div>

            {/* Modal for adding a custom process */}
            <NewCustomRow 
                show={open} 
                hide={() => setOpen(false)} 
                time={props.time} 
                policy={props.policy}
                simulationState={props.simulationState}
            />

            {/* Modal for displaying memory */}
            <Memory open={openMemory} close={() => setOpenMemory(false)}/>
        </div>
    )

    // Function to add multiple random processes
    async function addMultipleProcesses(count) {
        try {
            // Get the current highest ID to start from
            let currentId = Number(await getLastRowID("pcb")) || 0;
            const queueId = Number(await getLastRowID("queue")) || 0;
            
            // Use the higher of the two IDs to ensure uniqueness
            currentId = Math.max(currentId, queueId);
            
            for (let i = 0; i < count; i++) {
                // Increment ID for each new process
                currentId += 1;
                
                // Create a new row with unique ID and random values
                const finalRow = {
                    process_id: currentId.toString(),
                    burst_time: Math.floor(Math.random() * 8) + 3,
                    memory_size: Math.floor(Math.random() * 10) + 1,
                    arrival_time: props.time,
                    priority: Math.floor(Math.random() * 10) + 1,
                    status: "Ready",
                    waiting_time: 0,
                    steps: 0
                }

                // Initialize io event and io time properties for the new row
                finalRow.init_burst = finalRow.burst_time;
                finalRow.io_when = Math.floor(Math.random() * (finalRow.burst_time - 2)) + 2;
                finalRow.io_time = Math.floor(Math.random() * 10) + 1;
                finalRow.io_completed = false; // Track if I/O event has been triggered

                // Add the row to the "queue" and wait for completion
                await addRow(finalRow, "queue");
                
                // Small delay to ensure database consistency
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            
            // Immediately process the job queue to move processes to PCB if memory is available
            await processJobQueueImmediately();
            
            // Show success message
            alert(`Successfully added ${count} processes with IDs ${(currentId - count + 1)} to ${currentId}`);
            
        } catch (error) {
            console.error('Error adding multiple processes:', error);
            alert('Error adding processes. Please try again.');
        }
    }
}