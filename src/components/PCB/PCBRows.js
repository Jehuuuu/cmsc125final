// Delete icon from Material-UI
import DeleteIcon from '@mui/icons-material/DeleteOutlineOutlined';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Arrow icon from Material-UI
import ArrowIcon from '@mui/icons-material/ArrowRightOutlined';

// useEffect and useState hooks from React
import { useEffect, useState } from 'react';

// Data manipulation functions
import { deleteRow, getRows } from '../data-funcs';

// NoData component
import NoData from './NoData';

// Importing data from JSON file
import jsonData from '../data.json';

// Import Modal for process details
import { Modal, ProgressBar, Tooltip, OverlayTrigger } from 'react-bootstrap';

// Defining a functional component named PCBRows
export default function PCBRows(props){
    // State variable to hold data
    const [data, setData] = useState([]);
    const [selectedProcess, setSelectedProcess] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [processToDelete, setProcessToDelete] = useState(null);

    // useEffect hook to fetch data on component mount or when jsonData changes
    useEffect(() => {
        async function fetchData() {
            // Fetching rows from "pcb"
            const rows = await getRows("pcb");

            if(rows.length > 0) {
                // If rows are found, set data with calculated metrics
                const enhancedRows = rows.map(row => ({
                    ...row,
                    progress: row.init_burst ? ((row.init_burst - row.burst_time) / row.init_burst * 100) : 0,
                    turnaround_time: row.status === 'Terminated' ? (row.completion_time || 0) - row.arrival_time : 0,
                    response_time: row.first_response_time ? row.first_response_time - row.arrival_time : 0
                }));
                setData(enhancedRows);
            } else {
                // If no rows are found, set data to empty array
                setData([]);
            }
        }
        // Calling fetchData function
        fetchData();
    }, [jsonData]) // Dependency array to re-run effect when jsonData changes

    // Function to delete a row by ID with confirmation
    async function deleteRowID(id) {
        const process = data.find(p => p.id === id);
        setProcessToDelete(process);
        setShowDeleteConfirm(true);
    }

    // Confirm deletion
    async function confirmDelete() {
        if (processToDelete) {
            await deleteRow(processToDelete.id, "pcb");
            setShowDeleteConfirm(false);
            setProcessToDelete(null);
        }
    }

    // Show process details
    function showProcessDetails(process) {
        setSelectedProcess(process);
        setShowDetailsModal(true);
    }

    // Get status icon
    function getStatusIcon(status) {
        switch(status.toLowerCase()) {
            case 'running': return <PlayArrowIcon className="status-icon running" />;
            case 'ready': return <HourglassEmptyIcon className="status-icon ready" />;
            case 'waiting': return <PauseIcon className="status-icon waiting" />;
            case 'terminated': return <CheckCircleIcon className="status-icon terminated" />;
            default: return null;
        }
    }

    // Get priority color class
    function getPriorityClass(priority) {
        if (priority <= 3) return 'priority-high';
        if (priority <= 6) return 'priority-medium';
        return 'priority-low';
    }

    return (
        <div className="pcb-table">
            {/* Displaying NoData component if no data is available */}
            {data.length === 0 ?
            <NoData />
            : data.map(row => {
                return (
                    // Displaying each row in the PCB with enhanced styling
                    <div className={`pcb-row ${row.status.toLowerCase() === "running" ? "pcb-row-active" : ""} ${row.status.toLowerCase()}`} key={row.id}>
                        {/* Arrow icon, active if row status is running */}
                        <div className={"pcb-cell " + (row.status.toLowerCase() === "running" ? "" : "pcb-cell-inactive")}>
                            <ArrowIcon className='ms-1' />
                        </div>

                        {/* Displaying process id cell with click handler for details */}
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Click for process details</Tooltip>}
                        >
                            <div className="pcb-cell process-id-cell" onClick={() => showProcessDetails(row)}>
                                {row.process_id}
                                <InfoIcon className="info-icon-small" />
                            </div>
                        </OverlayTrigger>

                        {/* Displaying burst time cell with progress */}
                        <div className="pcb-cell burst-time-cell">
                            <div className="burst-time-display">
                                <span className="burst-time-text">{row.burst_time}</span>
                                {row.init_burst && (
                                    <div className="burst-progress">
                                        <ProgressBar 
                                            now={row.progress} 
                                            variant={row.progress > 75 ? "success" : row.progress > 25 ? "warning" : "danger"}
                                            size="sm"
                                        />
                                        <small className="progress-text">{row.progress.toFixed(0)}%</small>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Displaying memory size cell */}
                        <div className="pcb-cell">{row.memory_size} KB</div>

                        {/* Displaying arrival time cell */}
                        <div className="pcb-cell">{row.arrival_time}</div>

                        {/* Displaying priority cell with color coding */}
                        <div className={`pcb-cell priority-cell ${getPriorityClass(row.priority)} ${props.policy !== "Priority" ? "color-gray" : ""}`}>
                            <span className="priority-value">{row.priority}</span>
                            {props.policy === "Priority" && (
                                <span className="priority-indicator"></span>
                            )}
                        </div>

                        {/* Displaying status cell with icon */}
                        <div className={`pcb-cell status-cell ${row.status.toLowerCase()}`}>
                            {getStatusIcon(row.status)}
                            <span className="status-text">{row.status}</span>
                        </div>

                        {/* Displaying waiting time cell */}
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Time spent waiting in ready queue</Tooltip>}
                        >
                            <div className="pcb-cell waiting-time-cell">{row.waiting_time}</div>
                        </OverlayTrigger>

                        {/* Displaying I/O event and I/O time cells */}
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>I/O event occurs at burst time {row.io_when}</Tooltip>}
                        >
                            <div className="pcb-cell">{row.io_when}</div>
                        </OverlayTrigger>
                        
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Remaining I/O time</Tooltip>}
                        >
                            <div className="pcb-cell io-time-cell">
                                {row.io_time}
                                {row.status.toLowerCase() === 'waiting' && (
                                    <div className="io-progress">
                                        <div className="io-indicator"></div>
                                    </div>
                                )}
                            </div>
                        </OverlayTrigger>

                        {/* Delete icon with confirmation */}
                        <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>Delete process</Tooltip>}
                        >
                            <DeleteIcon 
                                id='Delete' 
                                className="delete-icon" 
                                onClick={() => deleteRowID(row.id)} 
                            />
                        </OverlayTrigger>
                    </div>
                )
            })}

            {/* Process Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Process Details - {selectedProcess?.process_id}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedProcess && (
                        <div className="process-details">
                            <div className="row">
                                <div className="col-md-6">
                                    <h6>Basic Information</h6>
                                    <table className="table table-sm">
                                        <tbody>
                                            <tr><td><strong>Process ID:</strong></td><td>{selectedProcess.process_id}</td></tr>
                                            <tr><td><strong>Status:</strong></td><td>
                                                <span className={`status-badge ${selectedProcess.status.toLowerCase()}`}>
                                                    {getStatusIcon(selectedProcess.status)}
                                                    {selectedProcess.status}
                                                </span>
                                            </td></tr>
                                            <tr><td><strong>Priority:</strong></td><td>
                                                <span className={`priority-badge ${getPriorityClass(selectedProcess.priority)}`}>
                                                    {selectedProcess.priority}
                                                </span>
                                            </td></tr>
                                            <tr><td><strong>Memory Size:</strong></td><td>{selectedProcess.memory_size} KB</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md-6">
                                    <h6>Timing Information</h6>
                                    <table className="table table-sm">
                                        <tbody>
                                            <tr><td><strong>Arrival Time:</strong></td><td>{selectedProcess.arrival_time}</td></tr>
                                            <tr><td><strong>Initial Burst Time:</strong></td><td>{selectedProcess.init_burst || 'N/A'}</td></tr>
                                            <tr><td><strong>Remaining Burst Time:</strong></td><td>{selectedProcess.burst_time}</td></tr>
                                            <tr><td><strong>Waiting Time:</strong></td><td>{selectedProcess.waiting_time}</td></tr>
                                            <tr><td><strong>Execution Progress:</strong></td><td>
                                                <ProgressBar 
                                                    now={selectedProcess.progress} 
                                                    label={`${selectedProcess.progress.toFixed(1)}%`}
                                                    variant={selectedProcess.progress > 75 ? "success" : selectedProcess.progress > 25 ? "warning" : "danger"}
                                                />
                                            </td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="row mt-3">
                                <div className="col-12">
                                    <h6>I/O Information</h6>
                                    <table className="table table-sm">
                                        <tbody>
                                            <tr><td><strong>I/O Event Time:</strong></td><td>{selectedProcess.io_when}</td></tr>
                                            <tr><td><strong>I/O Duration:</strong></td><td>{selectedProcess.io_time}</td></tr>
                                            <tr><td><strong>Steps Executed:</strong></td><td>{selectedProcess.steps}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete process <strong>{processToDelete?.process_id}</strong>?
                    <br />
                    <small className="text-muted">This action cannot be undone.</small>
                </Modal.Body>
                <Modal.Footer>
                    <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                    </button>
                    <button className="btn btn-danger" onClick={confirmDelete}>
                        Delete Process
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    )
}