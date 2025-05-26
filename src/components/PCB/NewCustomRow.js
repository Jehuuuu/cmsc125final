// Importing Modal and Table components from react-bootstrap for creating the modal and table
import { Modal, Table } from "react-bootstrap";

// Importing functions for data manipulation
import { addRow, getLastRowID, getProcessID } from "../data-funcs";

// Importing useEffect and useState hooks from React
import { useEffect, useState } from "react";

// Import toast for notifications
import { toast } from "react-hot-toast";

// Defining a functional component named NewCustomRow
export default function NewCustomRow(props) {
    // Defining state variable using useState hook
    // State to hold the current row data
    const [row, setRow] = useState({});
    
    // Asynchronous function to initialize row data
    async function initialData() {
        // Get the next process ID
        const id = Number(await getProcessID()) + 1;
        // Set initial row data
        setRow({
            process_id: id.toString(),
            burst_time: 0,
            memory_size: 0,
            arrival_time: props.time,
            priority: 0,
            status: "Ready",
            waiting_time: '-',
            steps: 0
        })
    }

    // useEffect hook to initialize row data when the component is mounted or props.show change
    useEffect(() => {
        initialData();
    }, [props.show, true]);

    // Updated addNewRow function in NewCustomRow.js
async function addNewRow() {
    // Check if simulation is stopped
    if (props.simulationState === 'stopped') {
        alert('Cannot add process while simulation is stopped. Please start the simulation first.');
        props.hide();
        return;
    }

    // Validate input values
    if (!row.burst_time || row.burst_time <= 0) {
        alert('Burst time must be greater than 0');
        return;
    }

    if (!row.memory_size || row.memory_size <= 0) {
        alert('Memory size must be greater than 0');
        return;
    }

    if (row.memory_size > 24) {
        alert('Memory size cannot exceed 24 units (total available memory)');
        return;
    }

    // Convert string inputs to numbers
    const processData = {
        ...row,
        burst_time: parseInt(row.burst_time),
        memory_size: parseInt(row.memory_size),
        priority: parseInt(row.priority) || 1,
        waiting_time: 0,
        init_burst: parseInt(row.burst_time),
        io_when: Math.floor(Math.random() * (parseInt(row.burst_time) - 1)) + 1,
        io_time: Math.floor(Math.random() * 10) + 1
    };

    console.log('Adding process to queue:', processData);

    try {
        // Add the row to the "queue"
        const result = await addRow(processData, "queue");
        
        if (result === 201) { // HTTP 201 Created
            console.log('Process successfully added to queue');
            toast.success(`Process ${processData.process_id} added to job queue`);
        } else {
            console.error('Failed to add process to queue, status:', result);
            toast.error('Failed to add process to queue');
        }
        
        // Hide the modal
        props.hide();
    } catch (error) {
        console.error('Error adding process:', error);
        toast.error('Error adding process to queue');
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