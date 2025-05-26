import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Timeline as TimelineIcon, Schedule as ScheduleIcon } from '@mui/icons-material';

const TimelineDisplay = ({ simulationState, logs }) => {
    if (!simulationState || !logs) {
        return (
            <Card>
                <Card.Header>
                    <h6><TimelineIcon className="me-2" />Process Execution Timeline</h6>
                </Card.Header>
                <Card.Body>
                    <p>No timeline data available</p>
                </Card.Body>
            </Card>
        );
    }

    // Extract process execution events from logs
    const getProcessExecutionHistory = () => {
        const executionHistory = [];
        const processExecutionMap = new Map(); // Track when each process starts/stops
        
        // First pass: collect all process-related events
        logs.forEach((log) => {
            // Process selection events
            if (log.type === 'scheduler' && log.message.includes('Scheduler selected process')) {
                const match = log.message.match(/process (\w+)/);
                if (match) {
                    const processId = match[1];
                    if (!processExecutionMap.has(processId)) {
                        processExecutionMap.set(processId, []);
                    }
                    processExecutionMap.get(processId).push({
                        type: 'start',
                        time: log.time,
                        processId: processId
                    });
                }
            }
            
            // Process execution events
            if (log.type === 'scheduler' && log.message.includes('Executing process')) {
                const match = log.message.match(/process (\w+)/);
                if (match) {
                    const processId = match[1];
                    if (!processExecutionMap.has(processId)) {
                        processExecutionMap.set(processId, []);
                    }
                    processExecutionMap.get(processId).push({
                        type: 'execute',
                        time: log.time,
                        processId: processId
                    });
                }
            }
            
            // Process termination events
            if (log.type === 'scheduler' && log.message.includes('completed and terminated')) {
                const match = log.message.match(/process (\w+)/);
                if (match) {
                    const processId = match[1];
                    if (!processExecutionMap.has(processId)) {
                        processExecutionMap.set(processId, []);
                    }
                    processExecutionMap.get(processId).push({
                        type: 'terminate',
                        time: log.time,
                        processId: processId
                    });
                }
            }
            
            // Process blocking events (for page faults)
            if (log.type === 'scheduler' && log.message.includes('blocked for page load')) {
                const match = log.message.match(/process (\w+)/);
                if (match) {
                    const processId = match[1];
                    if (!processExecutionMap.has(processId)) {
                        processExecutionMap.set(processId, []);
                    }
                    processExecutionMap.get(processId).push({
                        type: 'block',
                        time: log.time,
                        processId: processId
                    });
                }
            }
        });

        // Second pass: create execution segments
        const allEvents = [];
        processExecutionMap.forEach((events, processId) => {
            events.forEach(event => {
                allEvents.push(event);
            });
        });
        
        // Sort all events by time
        allEvents.sort((a, b) => a.time - b.time);
        
        // Build execution timeline
        let currentRunningProcess = null;
        let currentStartTime = 0;
        
        allEvents.forEach((event, index) => {
            if (event.type === 'start' || event.type === 'execute') {
                // End previous process if different
                if (currentRunningProcess && currentRunningProcess !== event.processId) {
                    executionHistory.push({
                        process: currentRunningProcess,
                        startTime: currentStartTime,
                        endTime: event.time,
                        duration: event.time - currentStartTime
                    });
                }
                
                // Start new process
                if (currentRunningProcess !== event.processId) {
                    currentRunningProcess = event.processId;
                    currentStartTime = event.time;
                }
            } else if (event.type === 'terminate' || event.type === 'block') {
                // End current process
                if (currentRunningProcess === event.processId) {
                    executionHistory.push({
                        process: currentRunningProcess,
                        startTime: currentStartTime,
                        endTime: event.time + (event.type === 'terminate' ? 1 : 0),
                        duration: (event.time + (event.type === 'terminate' ? 1 : 0)) - currentStartTime
                    });
                    currentRunningProcess = null;
                }
            }
        });

        // Handle case where simulation is still running
        if (currentRunningProcess && simulationState.currentTime > currentStartTime) {
            executionHistory.push({
                process: currentRunningProcess,
                startTime: currentStartTime,
                endTime: simulationState.currentTime,
                duration: simulationState.currentTime - currentStartTime
            });
        }

        // If no execution history from logs, try to get current process
        if (executionHistory.length === 0 && simulationState.queues?.currentProcess) {
            const currentProcess = simulationState.queues.currentProcess;
            executionHistory.push({
                process: currentProcess.pid,
                startTime: 0,
                endTime: simulationState.currentTime,
                duration: simulationState.currentTime
            });
        }

        return executionHistory;
    };

    // Calculate total simulation time needed
    const getTotalSimulationTime = () => {
        const allProcesses = [
            ...(simulationState.queues?.jobQueue || []),
            ...(simulationState.queues?.readyQueue || []),
            ...(simulationState.queues?.waitingQueue || []),
            ...(simulationState.queues?.terminatedQueue || [])
        ];
        
        if (simulationState.queues?.currentProcess) {
            allProcesses.push(simulationState.queues.currentProcess);
        }

        // Estimate total time based on page accesses and arrival times
        let maxTime = simulationState.currentTime;
        allProcesses.forEach(process => {
            const estimatedTime = process.arrivalTime + process.pageAccesses.length;
            maxTime = Math.max(maxTime, estimatedTime);
        });

        // If simulation is complete, use the actual completion time
        const completedProcesses = simulationState.queues?.terminatedQueue || [];
        if (completedProcesses.length > 0) {
            const lastCompletionTime = Math.max(...completedProcesses.map(p => p.completionTime || 0));
            maxTime = Math.max(maxTime, lastCompletionTime);
        }

        return Math.max(maxTime, 10); // Minimum timeline of 10 units
    };

    const executionHistory = getProcessExecutionHistory();
    const totalTime = getTotalSimulationTime();
    const currentTime = simulationState.currentTime;

    // Generate color for each process
    const getProcessColor = (processId) => {
        const colors = [
            '#007bff', '#28a745', '#ffc107', '#dc3545', 
            '#6f42c1', '#fd7e14', '#20c997', '#6c757d'
        ];
        const hash = processId.split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0);
        return colors[Math.abs(hash) % colors.length];
    };

    // Create timeline segments
    const createTimelineSegments = () => {
        const segments = [];
        
        // Fill gaps with idle time
        let lastEndTime = 0;
        
        executionHistory.forEach((execution, index) => {
            // Add idle time if there's a gap
            if (execution.startTime > lastEndTime) {
                segments.push({
                    type: 'idle',
                    startTime: lastEndTime,
                    endTime: execution.startTime,
                    duration: execution.startTime - lastEndTime
                });
            }
            
            segments.push({
                type: 'process',
                ...execution
            });
            
            lastEndTime = execution.endTime;
        });

        // Add final idle time if needed
        if (lastEndTime < totalTime) {
            segments.push({
                type: 'idle',
                startTime: lastEndTime,
                endTime: totalTime,
                duration: totalTime - lastEndTime
            });
        }

        return segments;
    };

    const timelineSegments = createTimelineSegments();

    return (
        <Card>
            <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-0">
                        <TimelineIcon className="me-2" />
                        Process Execution Timeline
                    </h6>
                    <div className="d-flex align-items-center">
                        <Badge bg="info" className="me-2">
                            Current: {currentTime}
                        </Badge>
                        <Badge bg="secondary">
                            Total: {totalTime}
                        </Badge>
                    </div>
                </div>
            </Card.Header>
            <Card.Body>
                {/* Timeline visualization */}
                <div className="timeline-container mb-3">
                    <div className="timeline-bar" style={{ 
                        display: 'flex', 
                        height: '40px', 
                        border: '1px solid #dee2e6',
                        borderRadius: '4px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        {timelineSegments.map((segment, index) => {
                            const widthPercentage = (segment.duration / totalTime) * 100;
                            
                            return (
                                <div
                                    key={index}
                                    style={{
                                        width: `${widthPercentage}%`,
                                        backgroundColor: segment.type === 'process' 
                                            ? getProcessColor(segment.process)
                                            : '#f8f9fa',
                                        border: '1px solid #fff',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: segment.type === 'process' ? 'white' : '#6c757d',
                                        fontSize: '12px',
                                        fontWeight: 'bold',
                                        minWidth: '20px'
                                    }}
                                    title={segment.type === 'process' 
                                        ? `${segment.process}: ${segment.startTime}-${segment.endTime} (${segment.duration} units)`
                                        : `Idle: ${segment.startTime}-${segment.endTime} (${segment.duration} units)`
                                    }
                                >
                                    {segment.type === 'process' ? segment.process : 'IDLE'}
                                </div>
                            );
                        })}
                        
                        {/* Current time indicator */}
                        <div
                            style={{
                                position: 'absolute',
                                left: `${(currentTime / totalTime) * 100}%`,
                                top: 0,
                                bottom: 0,
                                width: '2px',
                                backgroundColor: '#dc3545',
                                zIndex: 10
                            }}
                            title={`Current Time: ${currentTime}`}
                        />
                    </div>
                    
                    {/* Time markers */}
                    <div className="timeline-markers mt-2" style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        fontSize: '12px',
                        color: '#6c757d'
                    }}>
                        {Array.from({ length: Math.min(totalTime + 1, 11) }, (_, i) => {
                            const timePoint = Math.floor((i / 10) * totalTime);
                            return (
                                <span key={i} style={{ textAlign: 'center' }}>
                                    {timePoint}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {/* Process legend */}
                <div className="process-legend">
                    <h6 className="mb-2">
                        <ScheduleIcon className="me-2" />
                        Process Legend
                    </h6>
                    <div className="d-flex flex-wrap">
                        {Array.from(new Set(executionHistory.map(e => e.process))).map(processId => (
                            <div key={processId} className="d-flex align-items-center me-3 mb-2">
                                <div
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        backgroundColor: getProcessColor(processId),
                                        marginRight: '8px',
                                        borderRadius: '2px'
                                    }}
                                />
                                <span className="small">{processId}</span>
                            </div>
                        ))}
                        <div className="d-flex align-items-center me-3 mb-2">
                            <div
                                style={{
                                    width: '16px',
                                    height: '16px',
                                    backgroundColor: '#f8f9fa',
                                    border: '1px solid #dee2e6',
                                    marginRight: '8px',
                                    borderRadius: '2px'
                                }}
                            />
                            <span className="small">CPU Idle</span>
                        </div>
                    </div>
                </div>

                {/* Execution summary */}
                {executionHistory.length > 0 && (
                    <div className="execution-summary mt-3">
                        <h6>Execution Summary</h6>
                        <div className="small">
                            <div className="row">
                                <div className="col-md-6">
                                    <strong>Total Execution Segments:</strong> {executionHistory.length}
                                </div>
                                <div className="col-md-6">
                                    <strong>CPU Utilization:</strong> {
                                        ((executionHistory.reduce((sum, e) => sum + e.duration, 0) / totalTime) * 100).toFixed(1)
                                    }%
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default TimelineDisplay; 