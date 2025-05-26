import { Modal } from "react-bootstrap";
import { MemoryHeader } from "./MemoryHeader";
import { MemoryRows } from "./MemoryRows";
import JobQueueHeader from "./JobQueueHeader";
import JobQueueRows from "./JobQueueRows";
import jsonData from '../data.json';
import { deleteRow, getRows, getMemoryStats } from '../data-funcs';
import { useEffect, useState } from 'react';

export function MemoryModal(props) {
    const [memory, setMemory] = useState([]);
    const [queue, setQueue] = useState([]);
    const [memoryStats, setMemoryStats] = useState({
        totalPages: 0,
        busyPages: 0,
        freePages: 0,
        totalInternalFragmentation: 0,
        utilizationPercentage: 0
    });
  
    async function fetchData() {
        // Fetch memory data
        const memory = await getRows("memory");
        
        if(memory.length > 0) {
            setMemory(memory);
        } else {
            setMemory([]);
        }
        
        // Fetch job queue data
        const queue = await getRows("queue");
        if(queue.length > 0) {
            setQueue(queue);
        } else {
            setQueue([]);
        }
        
        // Get memory statistics
        const stats = await getMemoryStats();
        if (stats) {
            setMemoryStats(stats);
        }
    }
  
    useEffect(() => {
        fetchData();
    }, [jsonData])

    return (
        <Modal show={props.open} onHide={props.close} size="lg" className="policy-info centered-modal">
            {/* Memory Statistics */}
            <div style={{padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '5px', marginBottom: '20px'}}>
                <h3>Memory Statistics</h3>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '10px'}}>
                    <div><strong>Total Pages:</strong> {memoryStats.totalPages}</div>
                    <div><strong>Used Pages:</strong> {memoryStats.busyPages}</div>
                    <div><strong>Free Pages:</strong> {memoryStats.freePages}</div>
                    <div><strong>Utilization:</strong> {memoryStats.utilizationPercentage}%</div>
                    <div><strong>Internal Fragmentation:</strong> {memoryStats.totalInternalFragmentation} units</div>
                </div>
            </div>

            {/* Memory section */}
            <h1>Memory Pages</h1>
            <MemoryHeader />
            <MemoryRows rows={memory} />

            {/* Job Queue section */}
            <h1 style={{"paddingTop": "50px"}}>Job Queue</h1>
            <JobQueueHeader/>
            <JobQueueRows rows={queue} />
        </Modal>
    )
}

export default MemoryModal;