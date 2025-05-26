import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Alert, Badge } from 'react-bootstrap';
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

    return (
        <Container fluid className="os-simulation">
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
                            <Button 
                                variant="primary" 
                                onClick={() => setShowProcessForm(true)}
                                disabled={isRunning}
                                className="me-2"
                            >
                                Add Process
                            </Button>
                            <Button 
                                variant="outline-secondary" 
                                onClick={() => setShowSettings(true)}
                            >
                                <SettingsIcon /> Settings
                            </Button>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col md={8}>
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
            </Row>

            <Row className="mb-3">
                <Col md={6}>
                    <StatisticsDisplay 
                        memoryStats={simulationState?.memoryStats}
                        schedulerStats={simulationState?.schedulerStats}
                        algorithms={simulationState?.algorithms}
                    />
                </Col>
                <Col md={6}>
                    <LogDisplay 
                        logs={simulationState?.logs || []}
                        maxHeight="400px"
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
                    1. Select CPU scheduling and page replacement algorithms<br/>
                    2. Choose a test scenario or add custom processes<br/>
                    3. Use controls to start, pause, step through, or auto-run the simulation<br/>
                    4. Watch how processes move through queues and how memory is managed<br/>
                    5. Monitor statistics and logs for detailed analysis
                </p>
            </Alert>
        </Container>
    );
};

export default OSSimulation; 