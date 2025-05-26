import React, { useEffect, useRef } from 'react';
import { Card, Badge, ListGroup } from 'react-bootstrap';
import { 
    Article as ArticleIcon, 
    Schedule as ScheduleIcon, 
    Memory as MemoryIcon, 
    Info as InfoIcon,
    CheckCircle as CheckCircleIcon,
    Error as ErrorIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';

const LogDisplay = ({ logs, maxHeight = '300px' }) => {
    const logEndRef = useRef(null);

    // Auto-scroll to bottom when new logs are added
    useEffect(() => {
        if (logEndRef.current) {
            logEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs]);

    const getLogIcon = (type) => {
        switch (type) {
            case 'scheduler': return <ScheduleIcon className="text-primary" />;
            case 'memory': return <MemoryIcon className="text-info" />;
            case 'success': return <CheckCircleIcon className="text-success" />;
            case 'error': return <ErrorIcon className="text-danger" />;
            case 'time': return <AccessTimeIcon className="text-warning" />;
            default: return <InfoIcon className="text-secondary" />;
        }
    };

    const getLogBadge = (type) => {
        const variants = {
            'scheduler': 'primary',
            'memory': 'info',
            'success': 'success',
            'error': 'danger',
            'time': 'warning',
            'info': 'secondary'
        };
        return <Badge bg={variants[type] || 'secondary'}>{type}</Badge>;
    };

    const getLogTextClass = (type) => {
        switch (type) {
            case 'scheduler': return 'text-primary';
            case 'memory': return 'text-info';
            case 'success': return 'text-success';
            case 'error': return 'text-danger';
            case 'time': return 'text-warning fw-bold';
            default: return 'text-dark';
        }
    };

    const formatMessage = (message) => {
        // Handle time unit headers
        if (message.includes('=== Time Unit')) {
            return message;
        }
        
        // Add indentation for non-time messages
        return message.startsWith('\n') ? message : `  ${message}`;
    };

    return (
        <Card>
            <Card.Header>
                <h6><ArticleIcon className="me-2" />Simulation Log</h6>
            </Card.Header>
            <Card.Body 
                style={{ 
                    maxHeight, 
                    overflowY: 'auto',
                    backgroundColor: '#f8f9fa',
                    fontFamily: 'monospace',
                    fontSize: '0.85em'
                }}
            >
                {logs.length === 0 ? (
                    <p className="text-muted mb-0">No log entries yet</p>
                ) : (
                    <div>
                        {logs.map((log, index) => (
                            <div 
                                key={index} 
                                className={`log-entry mb-2 p-2 rounded ${
                                    log.type === 'time' ? 'bg-light border' : ''
                                }`}
                            >
                                <div className="d-flex align-items-start">
                                    <div className="me-2">
                                        {getLogIcon(log.type)}
                                    </div>
                                    <div className="flex-grow-1">
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <small className="text-muted">
                                                Time {log.time}
                                            </small>
                                            {getLogBadge(log.type)}
                                        </div>
                                        <div className={getLogTextClass(log.type)}>
                                            {formatMessage(log.message)}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={logEndRef} />
                    </div>
                )}
            </Card.Body>
            <Card.Footer className="text-muted small">
                <div className="d-flex justify-content-between">
                    <span>Total entries: {logs.length}</span>
                    <span>Auto-scroll enabled</span>
                </div>
            </Card.Footer>
        </Card>
    );
};

export default LogDisplay; 