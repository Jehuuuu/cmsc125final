import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge, Table, ListGroup } from 'react-bootstrap';
import { 
    PlayArrow as PlayArrowIcon, 
    Pause as PauseIcon, 
    Stop as StopIcon, 
    SkipNext as SkipNextIcon,
    Settings as SettingsIcon,
    Info as InfoIcon
} from '@mui/icons-material';
import { OSSimulator } from '../core/OSSimulator';
import QueueDisplay from '../components/QueueDisplay';
import MemoryDisplay from '../components/MemoryDisplay';
import LogDisplay from '../components/LogDisplay';
import StatisticsDisplay from '../components/StatisticsDisplay';
import ProcessForm from '../components/ProcessForm';
import AlgorithmSelector from '../components/AlgorithmSelector';
import './OSSimulation.css';

const OSSimulation = () => {
    // Simulator instance
    const simulatorRef = useRef(null);
    
    // Simulation state
    const [simulationState, setSimulationState] = useState(null);
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [autoRun, setAutoRun] = useState(false);
    const [speed, setSpeed] = useState(1000); // milliseconds
    
    // Configuration
    const [frameCount, setFrameCount] = useState(3);
    const [timeQuantum, setTimeQuantum] = useState(2);
    const [cpuAlgorithm, setCpuAlgorithm] = useState('FIFO');
    const [memoryAlgorithm, setMemoryAlgorithm] = useState('FIFO');
    
    // UI state
    const [showProcessForm, setShowProcessForm] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedScenario, setSelectedScenario] = useState('basic');
    
    // Auto-run interval
    const intervalRef = useRef(null);

    // Initialize simulator
    useEffect(() => {
        simulatorRef.current = new OSSimulator(frameCount, timeQuantum);
        simulatorRef.current.setStepCallback(setSimulationState);
        simulatorRef.current.setCPUSchedulingAlgorithm(cpuAlgorithm);
        simulatorRef.current.setPageReplacementAlgorithm(memoryAlgorithm);
        
        // Load default scenario
        simulatorRef.current.loadTestScenario(selectedScenario);
        setSimulationState(simulatorRef.current.getSimulationState());
        
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, []);

    // Handle auto-run
    useEffect(() => {
        if (autoRun && isRunning && !isPaused) {
            intervalRef.current = setInterval(() => {
                const continueRunning = simulatorRef.current.step();
                if (!continueRunning) {
                    setIsRunning(false);
                    setAutoRun(false);
                }
            }, speed);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [autoRun, isRunning, isPaused, speed]);

    // Control functions
    const handleStart = () => {
        if (!isRunning) {
            simulatorRef.current.start();
            setIsRunning(true);
            setIsPaused(false);
        } else if (isPaused) {
            setIsPaused(false);
        }
    };

    const handlePause = () => {
        setIsPaused(true);
    };

    const handleStop = () => {
        simulatorRef.current.stop();
        setIsRunning(false);
        setIsPaused(false);
        setAutoRun(false);
    };

    const handleReset = () => {
        simulatorRef.current.reset();
        simulatorRef.current.loadTestScenario(selectedScenario);
        setIsRunning(false);
        setIsPaused(false);
        setAutoRun(false);
    };

    const handleStep = () => {
        if (!isRunning) {
            simulatorRef.current.start();
            setIsRunning(true);
        }
        const continueRunning = simulatorRef.current.step();
        if (!continueRunning) {
            setIsRunning(false);
        }
    };

    const handleAutoRun = () => {
        if (!isRunning) {
            simulatorRef.current.start();
            setIsRunning(true);
        }
        setAutoRun(!autoRun);
        setIsPaused(false);
    };

    // Configuration handlers
    const handleCpuAlgorithmChange = (algorithm) => {
        setCpuAlgorithm(algorithm);
        simulatorRef.current.setCPUSchedulingAlgorithm(algorithm);
    };

    const handleMemoryAlgorithmChange = (algorithm) => {
        setMemoryAlgorithm(algorithm);
        simulatorRef.current.setPageReplacementAlgorithm(algorithm);
    };

    const handleFrameCountChange = (count) => {
        setFrameCount(count);
        simulatorRef.current.setFrameCount(count);
    };

    const handleTimeQuantumChange = (quantum) => {
        setTimeQuantum(quantum);
        simulatorRef.current.setTimeQuantum(quantum);
    };

    const handleScenarioChange = (scenario) => {
        setSelectedScenario(scenario);
        simulatorRef.current.loadTestScenario(scenario);
    };

    const handleAddProcess = (processData) => {
        simulatorRef.current.addProcess(
            processData.pid,
            processData.pageAccesses,
            processData.priority,
            processData.arrivalTime
        );
        setShowProcessForm(false);
    };

    const getStatusBadge = () => {
        if (!isRunning) return <Badge bg="secondary">Stopped</Badge>;
        if (isPaused) return <Badge bg="warning">Paused</Badge>;
        if (autoRun) return <Badge bg="success">Auto Running</Badge>;
        return <Badge bg="primary">Manual</Badge>;
    };

    // Get all processes from all queues
    const getAllProcesses = () => {
        if (!simulationState?.queues) return [];
        
        const allProcesses = [
            ...simulationState.queues.jobQueue,
            ...simulationState.queues.readyQueue,
            ...simulationState.queues.waitingQueue,
            ...simulationState.queues.terminatedQueue
        ];
        
        if (simulationState.queues.currentProcess) {
            allProcesses.push(simulationState.queues.currentProcess);
        }
        
        return allProcesses;
    };

    const getProcessStatusBadge = (status) => {
        const variants = {
            'new': 'secondary',
            'ready': 'primary',
            'running': 'success',
            'waiting': 'warning',
            'terminated': 'success'
        };
        return <Badge bg={variants[status] || 'secondary'} className="me-1">{status}</Badge>;
    };

    return (
        <Container fluid className="os-simulation">
            <Row className="mb-3">
                <Col md={6}>
                    <AlgorithmSelector
                        cpuAlgorithm={cpuAlgorithm}
                        memoryAlgorithm={memoryAlgorithm}
                        frameCount={frameCount}
                        timeQuantum={timeQuantum}
                        selectedScenario={selectedScenario}
                        onCpuAlgorithmChange={handleCpuAlgorithmChange}
                        onMemoryAlgorithmChange={handleMemoryAlgorithmChange}
                        onFrameCountChange={handleFrameCountChange}
                        onTimeQuantumChange={handleTimeQuantumChange}
                        onScenarioChange={handleScenarioChange}
                        disabled={isRunning}
                    />
                </Col>
                <Col md={6}>
                    <Card>
                        <Card.Header>
                            <h6>Process Management</h6>
                        </Card.Header>
                        <Card.Body>
                            <div className="mb-3">
                                <Button 
                                    variant="primary" 
                                    onClick={() => setShowProcessForm(true)}
                                    disabled={isRunning}
                                >
                                    Add Process
                                </Button>
                            </div>
                            
                            <div>
                                <h6 className="mb-2">Available Processes ({getAllProcesses().length})</h6>
                                <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                    {getAllProcesses().length === 0 ? (
                                        <div className="text-center py-3">
                                            <p className="text-muted mb-2">No processes available.</p>
                                            {selectedScenario === 'custom' ? (
                                                <div className="alert alert-info py-2 mb-0">
                                                    <small>
                                                        <strong>Custom Scenario:</strong> Click "Add Process" to create your own processes, 
                                                        or select a different test scenario to load pre-defined processes.
                                                    </small>
                                                </div>
                                            ) : (
                                                <small className="text-muted">Add a process or load a test scenario.</small>
                                            )}
                                        </div>
                                    ) : (
                                        <ListGroup variant="flush">
                                            {getAllProcesses().map((process, index) => (
                                                <ListGroup.Item key={`${process.pid}-${index}`} className="px-0 py-2">
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div>
                                                            <strong>{process.pid}</strong>
                                                            <div className="small text-muted">
                                                                Pages: [{process.pageAccesses.join(', ')}]
                                                                {process.priority > 0 && ` | Priority: ${process.priority}`}
                                                                {process.arrivalTime > 0 && ` | Arrival: ${process.arrivalTime}`}
                                                            </div>
                                                        </div>
                                                        <div className="text-end">
                                                            {getProcessStatusBadge(process.status)}
                                                            <div className="small text-muted">
                                                                {process.currentAccessIndex}/{process.pageAccesses.length}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    )}
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <Card>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <h4 className="mb-0">
                                <InfoIcon className="me-2" />
                                Operating System Simulator
                            </h4>
                            {getStatusBadge()}
                        </Card.Header>
                        <Card.Body>
                            <Row>
                                <Col md={6}>
                                    <div className="control-panel">
                                        <h6>Simulation Controls</h6>
                                        <div className="btn-group me-2" role="group">
                                            <Button 
                                                variant="success" 
                                                onClick={handleStart}
                                                disabled={isRunning && !isPaused}
                                            >
                                                <PlayArrowIcon /> Start
                                            </Button>
                                            <Button 
                                                variant="warning" 
                                                onClick={handlePause}
                                                disabled={!isRunning || isPaused}
                                            >
                                                <PauseIcon /> Pause
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                onClick={handleStop}
                                                disabled={!isRunning}
                                            >
                                                <StopIcon /> Stop
                                            </Button>
                                        </div>
                                        <div className="btn-group me-2" role="group">
                                            <Button 
                                                variant="info" 
                                                onClick={handleStep}
                                                disabled={autoRun}
                                            >
                                                <SkipNextIcon /> Step
                                            </Button>
                                            <Button 
                                                variant={autoRun ? "danger" : "primary"} 
                                                onClick={handleAutoRun}
                                                disabled={isPaused}
                                            >
                                                {autoRun ? "Stop Auto" : "Auto Run"}
                                            </Button>
                                        </div>
                                        <Button 
                                            variant="secondary" 
                                            onClick={handleReset}
                                        >
                                            Reset
                                        </Button>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="simulation-info">
                                        <h6>Current Time: {simulationState?.currentTime || 0}</h6>
                                        <Form.Group className="mb-2">
                                            <Form.Label>Speed (ms)</Form.Label>
                                            <Form.Range
                                                min={100}
                                                max={3000}
                                                value={speed}
                                                onChange={(e) => setSpeed(parseInt(e.target.value))}
                                                disabled={autoRun}
                                            />
                                            <small>{speed}ms per step</small>
                                        </Form.Group>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

          

            <Row className="mb-3">
                <Col md={4}>
                    <QueueDisplay 
                        queues={simulationState?.queues}
                        currentTime={simulationState?.currentTime}
                    />
                </Col>
                <Col md={4}>
                    <MemoryDisplay 
                        memory={simulationState?.memory}
                        stats={simulationState?.memoryStats}
                    />
                </Col>
                <Col md={4}>
                    <LogDisplay 
                        logs={simulationState?.logs || []}
                        maxHeight="400px"
                    />
                </Col>
            </Row>

            <Row className="mb-3">
                <Col>
                    <StatisticsDisplay 
                        memoryStats={simulationState?.memoryStats}
                        schedulerStats={simulationState?.schedulerStats}
                        algorithms={simulationState?.algorithms}
                    />
                </Col>
            </Row>

            {/* Process Form Modal */}
            {showProcessForm && (
                <ProcessForm
                    show={showProcessForm}
                    onHide={() => setShowProcessForm(false)}
                    onSubmit={handleAddProcess}
                />
            )}

            {/* Info Alert */}
            <Alert variant="info" className="mt-3">
                <Alert.Heading>How to Use</Alert.Heading>
                <p>
                    1. Add custom processes or use default scenario<br/>
                    2. Use controls to start, pause, step through, or auto-run the simulation<br/>
                    3. Watch how processes move through queues and how memory is managed<br/>
                    4. Monitor statistics and logs for detailed analysis
                </p>
            </Alert>
        </Container>
    );
};

export default OSSimulation; 