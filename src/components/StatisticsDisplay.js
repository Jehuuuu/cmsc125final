import React from 'react';
import { Card, Row, Col, ProgressBar, Badge, Table } from 'react-bootstrap';
import { 
    BarChart, 
    Timer,
    Memory,
    Schedule
} from '@mui/icons-material';

const StatisticsDisplay = ({ memoryStats, schedulerStats, algorithms }) => {
    if (!memoryStats || !schedulerStats || !algorithms) {
        return (
            <Card>
                <Card.Header>
                    <h6><BarChart className="me-2" />Statistics</h6>
                </Card.Header>
                <Card.Body>
                    <p>No statistics available</p>
                </Card.Body>
            </Card>
        );
    }

    const MemoryStatsCard = () => (
        <Card className="mb-3">
            <Card.Header className="bg-info text-white">
                <h6 className="mb-0">
                    <Memory className="me-2" />
                    Memory Management Statistics
                </h6>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <strong>Page Faults:</strong>
                                <Badge bg="danger">{memoryStats.pageFaults}</Badge>
                            </div>
                            <ProgressBar 
                                variant="danger" 
                                now={parseFloat(memoryStats.faultRate)} 
                                label={`${memoryStats.faultRate}%`}
                                style={{ height: '20px' }}
                            />
                        </div>
                        
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <strong>Page Hits:</strong>
                                <Badge bg="success">{memoryStats.pageHits}</Badge>
                            </div>
                            <ProgressBar 
                                variant="success" 
                                now={parseFloat(memoryStats.hitRate)} 
                                label={`${memoryStats.hitRate}%`}
                                style={{ height: '20px' }}
                            />
                        </div>
                    </Col>
                    
                    <Col md={6}>
                        <Table size="sm" className="mb-0">
                            <tbody>
                                <tr>
                                    <td><strong>Total Accesses:</strong></td>
                                    <td><Badge bg="info">{memoryStats.totalAccesses}</Badge></td>
                                </tr>

                                <tr>
                                    <td><strong>Fault Rate:</strong></td>
                                    <td className="text-danger">{memoryStats.faultRate}%</td>
                                </tr>
                                <tr>
                                    <td><strong>Hit Rate:</strong></td>
                                    <td className="text-success">{memoryStats.hitRate}%</td>
                                </tr>
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                
                <div className="mt-3">
                    <small className="text-muted">
                        <strong>Performance Indicator:</strong> 
                        {parseFloat(memoryStats.hitRate) >= 70 && 
                            <span className="text-success ms-1">Excellent (High hit rate)</span>
                        }
                        {parseFloat(memoryStats.hitRate) >= 50 && parseFloat(memoryStats.hitRate) < 70 && 
                            <span className="text-warning ms-1">Good (Moderate hit rate)</span>
                        }
                        {parseFloat(memoryStats.hitRate) < 50 && 
                            <span className="text-danger ms-1">Poor (Low hit rate)</span>
                        }
                    </small>
                </div>
            </Card.Body>
        </Card>
    );

    const SchedulerStatsCard = () => (
        <Card className="mb-3">
            <Card.Header className="bg-primary text-white">
                <h6 className="mb-0">
                    <Schedule className="me-2" />
                    CPU Scheduling Statistics
                </h6>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <Table size="sm" className="mb-0">
                            <tbody>

                                <tr>
                                    <td><strong>Completed Processes:</strong></td>
                                    <td><Badge bg="success">{schedulerStats.completedProcesses}</Badge></td>
                                </tr>
                                <tr>
                                    <td><strong>Throughput:</strong></td>
                                    <td><Badge bg="info">{schedulerStats.throughput}</Badge></td>
                                </tr>
                                {algorithms.cpu === 'RoundRobin' && (
                                    <tr>
                                        <td><strong>Time Quantum:</strong></td>
                                        <td><Badge bg="warning">{algorithms.timeQuantum}</Badge></td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </Col>
                    
                    <Col md={6}>
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <strong>Avg Waiting Time:</strong>
                                <Badge bg="warning">{schedulerStats.averageWaitingTime}</Badge>
                            </div>
                            <div className="small text-muted">
                                Time processes spend waiting in ready queue
                            </div>
                        </div>
                        
                        <div className="mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1">
                                <strong>Avg Turnaround Time:</strong>
                                <Badge bg="info">{schedulerStats.averageTurnaroundTime}</Badge>
                            </div>
                            <div className="small text-muted">
                                Total time from arrival to completion
                            </div>
                        </div>
                    </Col>
                </Row>
                
                <div className="mt-3">
                    <small className="text-muted">
                        <strong>Efficiency Indicator:</strong> 
                        {parseFloat(schedulerStats.averageWaitingTime) <= 5 && 
                            <span className="text-success ms-1">Excellent (Low waiting time)</span>
                        }
                        {parseFloat(schedulerStats.averageWaitingTime) > 5 && parseFloat(schedulerStats.averageWaitingTime) <= 10 && 
                            <span className="text-warning ms-1">Good (Moderate waiting time)</span>
                        }
                        {parseFloat(schedulerStats.averageWaitingTime) > 10 && 
                            <span className="text-danger ms-1">Poor (High waiting time)</span>
                        }
                    </small>
                </div>
            </Card.Body>
        </Card>
    );



    return (
        <div>
            <Card className="mb-3">
                <Card.Header>
                    <h5><BarChart className="me-2" />Performance Statistics</h5>
                </Card.Header>
            </Card>

            <MemoryStatsCard />
            <SchedulerStatsCard />
        </div>
    );
};

export default StatisticsDisplay; 