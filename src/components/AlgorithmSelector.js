import React from 'react';
import { Card, Form, Row, Col, Badge } from 'react-bootstrap';
import { Settings, Memory, Computer } from '@mui/icons-material';

const AlgorithmSelector = ({
    cpuAlgorithm,
    memoryAlgorithm,
    frameCount,
    timeQuantum,
    selectedScenario,
    onCpuAlgorithmChange,
    onMemoryAlgorithmChange,
    onFrameCountChange,
    onTimeQuantumChange,
    onScenarioChange,
    disabled = false
}) => {
    const cpuAlgorithms = [
        { value: 'FIFO', label: 'FIFO (First-In, First-Out)', description: 'Processes executed in arrival order' },
        { value: 'SJF', label: 'SJF (Shortest Job First)', description: 'Shortest remaining page accesses first' },
        { value: 'Priority', label: 'Priority Scheduling', description: 'Highest priority processes first' },
        { value: 'RoundRobin', label: 'Round Robin', description: 'Time-sliced execution' }
    ];

    const memoryAlgorithms = [
        { value: 'FIFO', label: 'FIFO (First-In, First-Out)', description: 'Replace oldest page in memory' },
        { value: 'LRU', label: 'LRU (Least Recently Used)', description: 'Replace least recently accessed page' },
        { value: 'OPT', label: 'OPT (Optimal)', description: 'Replace page not used for longest time (future knowledge)' }
    ];

    const testScenarios = [
        { value: 'basic', label: 'Basic Test', description: '3 processes with simple page patterns' },
        { value: 'page_fault_heavy', label: 'Page Fault Heavy', description: '2 processes with many unique pages' },
        { value: 'priority_test', label: 'Priority Test', description: '3 processes with different priorities' },
        { value: 'round_robin_test', label: 'Round Robin Test', description: '3 processes for time-slicing demo' }
    ];

    return (
        <Card>
                    <Card.Header>
            <h6><Settings className="me-2" />Algorithm Configuration</h6>
        </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>
                        <div className="mb-3">
                            <Form.Label className="fw-bold">
                                <Computer className="me-1" />
                                CPU Scheduling Algorithm
                            </Form.Label>
                            <Form.Select
                                value={cpuAlgorithm}
                                onChange={(e) => onCpuAlgorithmChange(e.target.value)}
                                disabled={disabled}
                            >
                                {cpuAlgorithms.map(algo => (
                                    <option key={algo.value} value={algo.value}>
                                        {algo.label}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-muted">
                                {cpuAlgorithms.find(a => a.value === cpuAlgorithm)?.description}
                            </Form.Text>
                        </div>

                        {cpuAlgorithm === 'RoundRobin' && (
                            <div className="mb-3">
                                <Form.Label>Time Quantum</Form.Label>
                                <Form.Range
                                    min={1}
                                    max={5}
                                    value={timeQuantum}
                                    onChange={(e) => onTimeQuantumChange(parseInt(e.target.value))}
                                    disabled={disabled}
                                />
                                <div className="d-flex justify-content-between">
                                    <small>1</small>
                                    <Badge bg="warning">{timeQuantum} time units</Badge>
                                    <small>5</small>
                                </div>
                            </div>
                        )}
                    </Col>

                    <Col md={6}>
                        <div className="mb-3">
                            <Form.Label className="fw-bold">
                                <Memory className="me-1" />
                                Page Replacement Algorithm
                            </Form.Label>
                            <Form.Select
                                value={memoryAlgorithm}
                                onChange={(e) => onMemoryAlgorithmChange(e.target.value)}
                                disabled={disabled}
                            >
                                {memoryAlgorithms.map(algo => (
                                    <option key={algo.value} value={algo.value}>
                                        {algo.label}
                                    </option>
                                ))}
                            </Form.Select>
                            <Form.Text className="text-muted">
                                {memoryAlgorithms.find(a => a.value === memoryAlgorithm)?.description}
                            </Form.Text>
                        </div>

                        <div className="mb-3">
                            <Form.Label>Memory Frames</Form.Label>
                            <Form.Range
                                min={2}
                                max={6}
                                value={frameCount}
                                onChange={(e) => onFrameCountChange(parseInt(e.target.value))}
                                disabled={disabled}
                            />
                            <div className="d-flex justify-content-between">
                                <small>2</small>
                                <Badge bg="info">{frameCount} frames</Badge>
                                <small>6</small>
                            </div>
                        </div>
                    </Col>
                </Row>

                <hr />

                <div className="mb-3">
                    <Form.Label className="fw-bold">Test Scenario</Form.Label>
                    <Form.Select
                        value={selectedScenario}
                        onChange={(e) => onScenarioChange(e.target.value)}
                        disabled={disabled}
                    >
                        {testScenarios.map(scenario => (
                            <option key={scenario.value} value={scenario.value}>
                                {scenario.label}
                            </option>
                        ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                        {testScenarios.find(s => s.value === selectedScenario)?.description}
                    </Form.Text>
                </div>

                {disabled && (
                    <div className="alert alert-warning mb-0">
                        <small>
                            <strong>Note:</strong> Algorithm settings are disabled while simulation is running. 
                            Stop the simulation to change configurations.
                        </small>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
};

export default AlgorithmSelector; 