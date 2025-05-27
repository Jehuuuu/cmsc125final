// Importing Modal and Table components from react-bootstrap for creating the modal and table
import { Modal, Table } from "react-bootstrap";

// Importing functions for data manipulation
import { addRow, getLastRowID, getProcessID, getRows, filterRows, editRow, deleteRow, getSum } from "../data-funcs";

// Importing useEffect and useState hooks from React
import { useEffect, useState } from "react";

// Defining a functional component named NewCustomRow
export default function NewCustomRow(props) {
    // Defining state variable using useState hook
    // State to hold the current row data
    const [row, setRow] = useState({});
    
    // Asynchronous function to initialize row data
    async function initialData() {
        try {
            // Get the current highest ID from both PCB and queue to ensure uniqueness
            let currentId = Number(await getLastRowID("pcb")) || 0;
            const queueId = Number(await getLastRowID("queue")) || 0;
            
            // Use the higher of the two IDs and increment by 1
            const nextId = Math.max(currentId, queueId) + 1;
            
            // Set initial row data
            setRow({
                process_id: nextId.toString(),
                burst_time: 0,
                memory_size: 0,
                arrival_time: props.time,
                priority: 1, // Default priority to 1 instead of 0
                status: "Ready",
                waiting_time: 0, // Set to 0 instead of '-'
                steps: 0
            })
        } catch (error) {
            console.error('Error initializing process data:', error);
            // Fallback to a timestamp-based ID if database queries fail
            const fallbackId = Date.now().toString().slice(-6);
            setRow({
                process_id: fallbackId,
                burst_time: 0,
                memory_size: 0,
                arrival_time: props.time,
                priority: 1,
                status: "Ready",
                waiting_time: 0,
                steps: 0
            })
        }
    }

    // useEffect hook to initialize row data when the component is mounted or props.show change
    useEffect(() => {
        initialData();
    }, [props.show, true]);

    // Asynchronous function to add a new row to the PCB
    async function addNewRow() {
        // Check if simulation is stopped
        if (props.simulationState === 'stopped') {
            alert('Cannot add process while simulation is stopped. Please start the simulation first.');
            props.hide();
            return;
        }

        // Validate input values
        if (row.burst_time <= 0 || row.memory_size <= 0) {
            alert('Burst time and memory size must be greater than 0');
            return;
        }

        if (row.memory_size > 24) {
            alert('Memory size cannot exceed 24 units (total available memory)');
            return;
        }

        try {
            // Get a fresh unique ID right before adding to prevent race conditions
            let currentId = Number(await getLastRowID("pcb")) || 0;
            const queueId = Number(await getLastRowID("queue")) || 0;
            const freshId = Math.max(currentId, queueId) + 1;

            // Create the final row with fresh ID and validated data
            const finalRow = {
                ...row,
                process_id: freshId.toString(),
                waiting_time: 0,   // Set initial waiting time
                init_burst: parseInt(row.burst_time),    // Set initial burst time
                burst_time: parseInt(row.burst_time),    // Ensure it's a number
                memory_size: parseInt(row.memory_size),  // Ensure it's a number
                priority: parseInt(row.priority),        // Ensure it's a number
                io_when: Math.floor(Math.random() * (parseInt(row.burst_time) - 1)) + 1,  // Set random io event
                io_time: Math.floor(Math.random() * 10) + 1,   // Set random io time
                io_completed: false // Track if I/O event has been triggered
            };

            // Add the row to the "queue"
            await addRow(finalRow, "queue");
            
            // Immediately process the job queue to move process to PCB if memory is available
            await processJobQueueImmediately();
            
            // Show success message
            alert(`Process ${freshId} added successfully!`);
            
            // Hide the modal
            props.hide();
            
        } catch (error) {
            console.error('Error adding custom process:', error);
            alert('Error adding process. Please try again.');
        }
    }

    // Function to immediately process job queue (same as in header.js)
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

    // Function to handle input change
    function handleChange(e) {
        // Update the corresponding field in row state
        setRow({...row, [e.target.id]: e.target.value});
    }

    return (
        // The component returns a modal for adding a custom row
        <Modal dialogClassName="custom-row" show={props.show} onHide={props.hide} centered>
            <Modal.Header>
                <Modal.Title>Add Custom Process</Modal.Title>
                {props.simulationState === 'stopped' && (
                    <div style={{color: '#dc3545', fontSize: '0.875rem', marginTop: '0.5rem'}}>
                        ⚠️ Simulation must be running to add processes
                    </div>
                )}
            </Modal.Header>
            <Modal.Body>
                {/* Table for displaying row data */}
                <Table>
                    <thead>
                        <tr>
                            <th className="row-cell">Process ID</th>
                            <th className="row-cell">Burst Time</th>
                            <th className="row-cell">Memory Size</th>
                            <th className="row-cell">Arrival Time</th>
                            <th className={"row-cell " +
                                (props.policy !== "Priority" ? "color-gray" : "")}>
                                Priority
                            </th>
                            <th className="row-cell">Status</th>
                            <th className="row-cell">Waiting Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>
                                {/* Displaying Process ID */}
                                <div className="row-cell">{row.process_id}</div>
                            </td>
                            <td>
                                {/* Input for Burst Time */}
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="20"
                                    id="burst_time" 
                                    className="row-cell" 
                                    defaultValue={row.burst_time} 
                                    onChange={(e) => handleChange(e)}
                                    disabled={props.simulationState === 'stopped'}
                                />
                            </td>
                            <td>
                                {/* Input for Memory Size */}
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="24"
                                    id="memory_size" 
                                    className="row-cell" 
                                    defaultValue={row.memory_size} 
                                    onChange={(e) => handleChange(e)}
                                    disabled={props.simulationState === 'stopped'}
                                />
                            </td>
                            <td>
                                {/* Displaying Arrival Time */}
                                <div className="row-cell">{row.arrival_time}</div>    
                            </td>
                            <td>
                                {/* Input for Priority */}
                                <input 
                                    type="number" 
                                    min="1" 
                                    max="10"
                                    id="priority" 
                                    className="row-cell" 
                                    defaultValue={row.priority}
                                    disabled={props.policy !== "Priority" || props.simulationState === 'stopped'} 
                                    onChange={(e) => handleChange(e)} 
                                />
                            </td>
                            <td>
                                {/* Displaying Status */}
                                <div className="row-cell">{row.status}</div>
                            </td>
                            <td>
                                {/* Displaying Waiting Time */}
                                <div className="row-cell">{row.waiting_time}</div>
                            </td>
                        </tr>
                    </tbody>
                </Table>

                {/* Input validation messages */}
                <div style={{marginTop: '1rem', fontSize: '0.875rem', color: '#6c757d'}}>
                    <div>• Burst Time: 1-20 units (CPU cycles needed)</div>
                    <div>• Memory Size: 1-24 units (total available: 24)</div>
                    <div>• Priority: 1-10 (1 = highest priority, only for Priority scheduling)</div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                {/* Close button to hide the modal */}
                <button 
                    id='Close' 
                    className="btn-primary" 
                    onClick={props.hide}
                >
                    Close
                </button>
                {/* Button to add a new row */}
                <button 
                    id='Add New Row' 
                    className="btn-primary btn-add" 
                    onClick={() => addNewRow()}
                    disabled={props.simulationState === 'stopped'}
                >
                    Add Process
                </button>
            </Modal.Footer>
        </Modal>
    )
}