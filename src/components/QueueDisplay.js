import React from 'react';
import { Card, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { 
    Queue as QueueIcon, 
    PlayArrow as PlayArrowIcon, 
    Pause as PauseIcon, 
    CheckCircle as CheckCircleIcon,
    HourglassEmpty as HourglassEmptyIcon
} from '@mui/icons-material';

const QueueDisplay = ({ queues, currentTime }) => {
    if (!queues) {
        return (
            <Card>
                <Card.Header>
                    <h6><QueueIcon className="me-2" />Process Queues</h6>
                </Card.Header>
                <Card.Body>
                    <p>No queue data available</p>
                </Card.Body>
            </Card>
        );
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'new': return <HourglassEmptyIcon className="text-secondary" />;
            case 'ready': return <PlayArrowIcon className="text-primary" />;
            case 'running': return <PlayArrowIcon className="text-success" />;
            case 'waiting': return <PauseIcon className="text-warning" />;
            case 'terminated': return <CheckCircleIcon className="text-success" />;
            default: return <HourglassEmptyIcon className="text-muted" />;
        }
    };

    const getStatusBadge = (status) => {
        const variants = {
            'new': 'secondary',
            'ready': 'primary',
            'running': 'success',
            'waiting': 'warning',
            'terminated': 'success'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status}</Badge>;
    };

    const ProcessItem = ({ process, showDetails = false }) => (
        <ListGroup.Item className="d-flex justify-content-between align-items-center">
            <div>
                <strong>{process.pid}</strong>
                {showDetails && (
                    <div className="small text-muted">
                        Pages: [{process.pageAccesses.join(', ')}]
                        {process.priority > 0 && ` | Priority: ${process.priority}`}
                        {process.arrivalTime > 0 && ` | Arrival: ${process.arrivalTime}`}
                        <br />
                        Progress: {process.currentAccessIndex}/{process.pageAccesses.length}
                        {process.waitingTime > 0 && ` | Wait: ${process.waitingTime}`}
                        {process.pageFaults > 0 && ` | Faults: ${process.pageFaults}`}
                    </div>
                )}
            </div>
            <div className="d-flex align-items-center">
                {getStatusIcon(process.status)}
                <span className="ms-2">{getStatusBadge(process.status)}</span>
            </div>
        </ListGroup.Item>
    );

    const QueueSection = ({ title, processes, variant, icon, emptyMessage }) => (
        <Card className="mb-3">
            <Card.Header className={`bg-${variant} text-white`}>
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                        {icon} {title}
                    </h6>
                    <Badge bg="light" text="dark">{processes.length}</Badge>
                </div>
            </Card.Header>
            <Card.Body style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {processes.length === 0 ? (
                    <p className="text-muted mb-0">{emptyMessage}</p>
                ) : (
                    <ListGroup variant="flush">
                        {processes.map((process, index) => (
                            <ProcessItem 
                                key={`${process.pid}-${index}`} 
                                process={process} 
                                showDetails={true}
                            />
                        ))}
                    </ListGroup>
                )}
            </Card.Body>
        </Card>
    );

    return (
        <div>
            <Card className="mb-3">
                <Card.Header>
                    <h5><QueueIcon className="me-2" />Process Queues</h5>
                </Card.Header>
            </Card>

            <Row>
                <Col md={6}>
                    <QueueSection
                        title="Job Queue"
                        processes={queues.jobQueue}
                        variant="secondary"
                        icon={<HourglassEmptyIcon />}
                        emptyMessage="No processes waiting to be admitted"
                    />
                    
                    <QueueSection
                        title="Ready Queue"
                        processes={queues.readyQueue}
                        variant="primary"
                        icon={<PlayArrowIcon />}
                        emptyMessage="No processes ready to execute"
                    />
                </Col>
                <Col md={6}>
                    <QueueSection
                        title="Waiting Queue"
                        processes={queues.waitingQueue}
                        variant="warning"
                        icon={<PauseIcon />}
                        emptyMessage="No processes waiting for I/O"
                    />
                    
                    <QueueSection
                        title="Terminated Queue"
                        processes={queues.terminatedQueue}
                        variant="success"
                        icon={<CheckCircleIcon />}
                        emptyMessage="No completed processes"
                    />
                </Col>
            </Row>

            {/* Currently Running Process */}
            {queues.currentProcess && (
                <Card className="mt-3">
                    <Card.Header className="bg-success text-white">
                        <h6 className="mb-0">
                            <PlayArrowIcon className="me-2" />
                            Currently Running
                        </h6>
                    </Card.Header>
                    <Card.Body>
                        <ProcessItem process={queues.currentProcess} showDetails={true} />
                        <div className="mt-2 small text-muted">
                            Current page access: {queues.currentProcess.getCurrentPageAccess() || 'Completed'}
                            {queues.currentProcess.timeSliceRemaining > 0 && 
                                ` | Time slice remaining: ${queues.currentProcess.timeSliceRemaining}`
                            }
                        </div>
                    </Card.Body>
                </Card>
            )}
        </div>
    );
};

export default QueueDisplay; 