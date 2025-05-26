import React from 'react';
import { Card, Row, Col, ProgressBar, Badge, Table } from 'react-bootstrap';
import { 
    BarChart, 
    TrendingUp, 
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
                                    <td><strong>Algorithm:</strong></td>
                                    <td><Badge bg="primary">{algorithms.memory}</Badge></td>
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
                                    <td><strong>Algorithm:</strong></td>
                                    <td><Badge bg="primary">{algorithms.cpu}</Badge></td>
                                </tr>
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

    const AlgorithmComparisonCard = () => (
        <Card>
            <Card.Header>
                <h6><TrendingUp className="me-2" />Algorithm Information</h6>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <h6 className="text-primary">CPU Scheduling: {algorithms.cpu}</h6>
                        <div className="small text-muted mb-3">
                            {algorithms.cpu === 'FIFO' && 
                                'First-In-First-Out: Processes are executed in order of arrival. Simple but may cause long waiting times for short processes.'
                            }
                            {algorithms.cpu === 'SJF' && 
                                'Shortest Job First: Executes processes with fewest remaining page accesses first. Minimizes average waiting time.'
                            }
                            {algorithms.cpu === 'Priority' && 
                                'Priority Scheduling: Executes highest priority processes first. Can cause starvation of low-priority processes.'
                            }
                            {algorithms.cpu === 'RoundRobin' && 
                                `Round Robin: Each process gets ${algorithms.timeQuantum} time units before being preempted. Fair but may increase turnaround time.`
                            }
                        </div>
                    </Col>
                    
                    <Col md={6}>
                        <h6 className="text-info">Memory Management: {algorithms.memory}</h6>
                        <div className="small text-muted">
                            {algorithms.memory === 'FIFO' && 
                                'First-In-First-Out: Replaces the oldest page in memory. Simple but may not consider page usage patterns.'
                            }
                            {algorithms.memory === 'LRU' && 
                                'Least Recently Used: Replaces the page that has not been accessed for the longest time. Good performance but requires tracking.'
                            }
                            {algorithms.memory === 'OPT' && 
                                'Optimal: Replaces the page that will not be used for the longest time. Best possible performance but requires future knowledge.'
                            }
                        </div>
                    </Col>
                </Row>
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
            <AlgorithmComparisonCard />
        </div>
    );
};

export default StatisticsDisplay; 