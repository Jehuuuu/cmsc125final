import React, { useState } from 'react';
import { Card, Button, Collapse, Badge } from 'react-bootstrap';
import { Help as HelpIcon, VolumeUp as VoiceIcon } from '@mui/icons-material';

const OSVoiceGuide = () => {
    const [showGuide, setShowGuide] = useState(false);

    const voiceCommands = [
        {
            category: "Simulation Controls",
            commands: [
                { command: "start simulation", description: "Start the OS simulation" },
                { command: "pause simulation", description: "Pause the running simulation" },
                { command: "stop simulation", description: "Stop the simulation completely" },
                { command: "step simulation", description: "Execute one step of the simulation" },
                { command: "auto run", description: "Start automatic continuous execution" },
                { command: "stop auto run", description: "Stop automatic execution" },
                { command: "reset simulation", description: "Reset simulation to initial state" }
            ]
        },
        {
            category: "Process Management",
            commands: [
                { command: "add process", description: "Open the add process form" }
            ]
        },
        {
            category: "CPU Scheduling Algorithms",
            commands: [
                { command: "set fifo cpu", description: "Set CPU algorithm to FIFO" },
                { command: "set shortest job first", description: "Set CPU algorithm to SJF" },
                { command: "set priority scheduling", description: "Set CPU algorithm to Priority" },
                { command: "set round robin", description: "Set CPU algorithm to Round Robin" }
            ]
        },
        {
            category: "Memory Management Algorithms",
            commands: [
                { command: "set fifo memory", description: "Set memory algorithm to FIFO" },
                { command: "set lru memory", description: "Set memory algorithm to LRU" },
                { command: "set optimal memory", description: "Set memory algorithm to Optimal" }
            ]
        },
        {
            category: "Test Scenarios",
            commands: [
                { command: "load basic scenario", description: "Load basic test scenario" },
                { command: "load page fault scenario", description: "Load page fault heavy scenario" },
                { command: "load priority scenario", description: "Load priority test scenario" },
                { command: "load round robin scenario", description: "Load round robin test scenario" },
                { command: "load custom scenario", description: "Load custom empty scenario" }
            ]
        }
    ];

    return (
        <Card className="mt-3">
            <Card.Header>
                <Button
                    variant="outline-primary"
                    onClick={() => setShowGuide(!showGuide)}
                    className="d-flex align-items-center"
                >
                    <VoiceIcon className="me-2" />
                    Voice Commands Guide
                    <HelpIcon className="ms-2" />
                </Button>
            </Card.Header>
            <Collapse in={showGuide}>
                <Card.Body>
                    <div className="mb-3">
                        <Badge bg="info" className="me-2">How to use:</Badge>
                        <span>Say <strong>"Honey"</strong> followed by your command, then end with <strong>"please"</strong></span>
                    </div>
                    
                    <div className="mb-3">
                        <Badge bg="success" className="me-2">Example:</Badge>
                        <em>"Honey, start simulation, please"</em>
                    </div>

                    {voiceCommands.map((category, index) => (
                        <div key={index} className="mb-4">
                            <h6 className="text-primary mb-3">
                                <Badge bg="primary" className="me-2">{category.category}</Badge>
                            </h6>
                            <div className="row">
                                {category.commands.map((cmd, cmdIndex) => (
                                    <div key={cmdIndex} className="col-md-6 mb-2">
                                        <div className="border rounded p-2 h-100">
                                            <div className="fw-bold text-success">"{cmd.command}"</div>
                                            <small className="text-muted">{cmd.description}</small>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    <div className="alert alert-warning mt-3">
                        <strong>Note:</strong> Voice commands are disabled while the simulation is running for algorithm changes and scenario loading. 
                        Stop the simulation first to change these settings.
                    </div>
                </Card.Body>
            </Collapse>
        </Card>
    );
};

export default OSVoiceGuide; 