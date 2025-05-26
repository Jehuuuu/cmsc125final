import React from 'react';
import { Card, Row, Col, Badge, Table, ProgressBar } from 'react-bootstrap';
import { Memory as MemoryIcon, Storage as StorageIcon } from '@mui/icons-material';

const MemoryDisplay = ({ memory, stats }) => {
    if (!memory || !stats) {
        return (
            <Card>
                <Card.Header>
                    <h6><MemoryIcon className="me-2" />Physical Memory</h6>
                </Card.Header>
                <Card.Body>
                    <p>No memory data available</p>
                </Card.Body>
            </Card>
        );
    }

    const getFrameColor = (pageNumber) => {
        if (pageNumber === null) return 'bg-light text-muted';
        
        // Use different colors for different pages
        const colors = [
            'bg-primary text-white',
            'bg-success text-white', 
            'bg-warning text-dark',
            'bg-info text-white',
            'bg-secondary text-white',
            'bg-danger text-white',
            'bg-dark text-white'
        ];
        
        return colors[pageNumber % colors.length];
    };

    const FrameDisplay = ({ frames, algorithm }) => (
        <div className="memory-frames mb-3">
            <h6>Memory Frames</h6>
            <Row>
                {frames.map((page, index) => (
                    <Col key={index} className="mb-2">
                        <div 
                            className={`frame-box p-3 text-center border rounded ${getFrameColor(page)}`}
                            style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            <div>
                                <div><strong>Frame {index}</strong></div>
                                <div>{page !== null ? `Page ${page}` : 'Empty'}</div>
                            </div>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
    );

    const StatisticsCard = ({ stats }) => (
        <Card className="mb-3">
            <Card.Header>
                <h6><StorageIcon className="me-2" />Memory Statistics</h6>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <div className="mb-2">
                            <strong>Page Faults:</strong> 
                            <Badge bg="danger" className="ms-2">{stats.pageFaults}</Badge>
                        </div>
                        <div className="mb-2">
                            <strong>Page Hits:</strong> 
                            <Badge bg="success" className="ms-2">{stats.pageHits}</Badge>
                        </div>
                        <div className="mb-2">
                            <strong>Total Accesses:</strong> 
                            <Badge bg="info" className="ms-2">{stats.totalAccesses}</Badge>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="mb-2">
                            <strong>Fault Rate:</strong> {stats.faultRate}%
                            <ProgressBar 
                                variant="danger" 
                                now={parseFloat(stats.faultRate)} 
                                className="mt-1"
                                style={{ height: '8px' }}
                            />
                        </div>
                        <div className="mb-2">
                            <strong>Hit Rate:</strong> {stats.hitRate}%
                            <ProgressBar 
                                variant="success" 
                                now={parseFloat(stats.hitRate)} 
                                className="mt-1"
                                style={{ height: '8px' }}
                            />
                        </div>
                    </Col>
                </Row>
            </Card.Body>
        </Card>
    );

    const AccessOrderDisplay = ({ accessOrder, algorithm }) => {
        if (!accessOrder || accessOrder.length === 0) return null;
        
        return (
            <Card className="mb-3">
                <Card.Header>
                    <h6>Access Order</h6>
                </Card.Header>
                <Card.Body>
                    <div className="d-flex flex-wrap">
                        {accessOrder.map((page, index) => (
                            <Badge 
                                key={index} 
                                bg="secondary" 
                                className="me-1 mb-1"
                                style={{ fontSize: '0.8em' }}
                            >
                                {page}
                                {index === accessOrder.length - 1 && 
                                    <span className="ms-1">(newest)</span>
                                }
                                {index === 0 && accessOrder.length > 1 && 
                                    <span className="ms-1">(oldest)</span>
                                }
                            </Badge>
                        ))}
                    </div>
                    <small className="text-muted">
                        Access order (oldest → newest)
                    </small>
                </Card.Body>
            </Card>
        );
    };

    return (
        <div>
            <Card className="mb-3">
                <Card.Header>
                    <h5><MemoryIcon className="me-2" />Physical Memory</h5>
                </Card.Header>
            </Card>

            <FrameDisplay 
                frames={memory.frames} 
                algorithm={memory.algorithm}
            />

            <StatisticsCard stats={stats} />

            <AccessOrderDisplay 
                accessOrder={memory.accessOrder} 
                algorithm={memory.algorithm}
            />


        </div>
    );
};

export default MemoryDisplay; 