import React, { useState } from 'react';
import { Card, Button, Collapse, Badge, Row, Col } from 'react-bootstrap';
import { Help as HelpIcon, VolumeUp as VoiceIcon, Mic as MicIcon, Schedule as ScheduleIcon } from '@mui/icons-material';

const CPUVoiceGuide = () => {
    const [showGuide, setShowGuide] = useState(false);

    const voiceCommands = [
        {
            category: "Scheduling Policies",
            icon: "⚙️",
            commands: [
                { command: "simulate first come first serve", description: "Switch to FCFS scheduling algorithm" },
                { command: "simulate shortest job first", description: "Switch to SJF scheduling algorithm" },
                { command: "simulate priority", description: "Switch to Priority scheduling algorithm" },
                { command: "simulate round robin", description: "Switch to Round Robin scheduling algorithm" }
            ]
        },
        {
            category: "Simulation Controls",
            icon: "🎮",
            commands: [
                { command: "play simulation", description: "Start or resume the simulation" },
                { command: "start simulation", description: "Begin the scheduling simulation" },
                { command: "pause simulation", description: "Pause the running simulation" },
                { command: "stop simulation", description: "Stop the simulation completely" },
                { command: "resume simulation", description: "Continue paused simulation" }
            ]
        },
        {
            category: "Process Management",
            icon: "📋",
            commands: [
                { command: "add new process", description: "Add a new process to the queue" },
                { command: "add custom process", description: "Open custom process creation form" },
                { command: "generate random process", description: "Create a random process automatically" },
                { command: "delete process", description: "Remove selected process from queue" }
            ]
        },
        {
            category: "Process Control Block (PCB)",
            icon: "🗂️",
            commands: [
                { command: "add row", description: "Add new row to Process Control Block" },
                { command: "close", description: "Close current dialog or form" },
                { command: "yes", description: "Confirm current action" },
                { command: "no", description: "Cancel current action" }
            ]
        },
        {
            category: "OS Simulator Controls",
            icon: "💻",
            commands: [
                { command: "start simulation", description: "Start OS simulation" },
                { command: "step simulation", description: "Execute one simulation step" },
                { command: "auto run", description: "Start automatic execution" },
                { command: "stop auto run", description: "Stop automatic execution" },
                { command: "reset simulation", description: "Reset simulation to initial state" },
                { command: "add process", description: "Open add process form" }
            ]
        },
        {
            category: "CPU Algorithm Selection",
            icon: "🧠",
            commands: [
                { command: "set fifo cpu", description: "Set CPU algorithm to FIFO" },
                { command: "set shortest job first", description: "Set CPU algorithm to SJF" },
                { command: "set priority scheduling", description: "Set CPU algorithm to Priority" },
                { command: "set round robin", description: "Set CPU algorithm to Round Robin" }
            ]
        },
        {
            category: "Memory Algorithm Selection",
            icon: "💾",
            commands: [
                { command: "set fifo memory", description: "Set memory algorithm to FIFO" },
                { command: "set lru memory", description: "Set memory algorithm to LRU" },
                { command: "set optimal memory", description: "Set memory algorithm to Optimal" }
            ]
        },
        {
            category: "Test Scenarios",
            icon: "🧪",
            commands: [
                { command: "load basic scenario", description: "Load basic test scenario" },
                { command: "load page fault scenario", description: "Load page fault heavy scenario" },
                { command: "load priority scenario", description: "Load priority test scenario" },
                { command: "load round robin scenario", description: "Load round robin test scenario" },
                { command: "load custom scenario", description: "Load custom empty scenario" }
            ]
        }
    ];

    const usageTips = [
        {
            title: "Getting Started",
            tip: "Make sure your microphone is enabled and say 'Honey' to activate voice commands"
        },
        {
            title: "Command Format",
            tip: "Always use the format: 'Honey [command] please' for best recognition"
        },
        {
            title: "Scheduling Policies",
            tip: "You can switch between algorithms anytime by saying 'Honey simulate [policy name] please'"
        },
        {
            title: "Process Management",
            tip: "Add processes before starting simulation for better visualization"
        },
        {
            title: "Simulation Control",
            tip: "Use 'pause' and 'resume' to control simulation speed and observe process states"
        }
    ];

    return (
        <Card className="mt-3 cpu-voice-guide-card">
            <Card.Header className="cpu-voice-guide-header">
                <Button
                    variant="outline-primary"
                    onClick={() => setShowGuide(!showGuide)}
                    className="d-flex align-items-center cpu-voice-guide-toggle"
                    style={{
                        background: 'linear-gradient(135deg, #E8F4FD 0%, #B3D9F2 100%)',
                        borderColor: '#4A90E2',
                        color: '#1E3A8A',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: '600',
                        fontSize: '1.1em'
                    }}
                >
                    <ScheduleIcon className="me-2" />
                    CPU Scheduling Voice Commands
                    <MicIcon className="ms-2" />
                </Button>
            </Card.Header>
            <Collapse in={showGuide}>
                <Card.Body style={{ fontFamily: 'Poppins, sans-serif', backgroundColor: '#F8FAFC' }}>
                    <div className="mb-4">
                        <Badge 
                            bg="info" 
                            className="me-2"
                            style={{ 
                                background: '#4A90E2', 
                                color: '#FFFFFF',
                                fontSize: '1em',
                                padding: '8px 12px'
                            }}
                        >
                            🎤 How to use:
                        </Badge>
                        <span style={{ color: '#1E3A8A', fontWeight: '500', fontSize: '1.1em' }}>
                            Say <strong>"Honey"</strong> followed by your command, then end with <strong>"Please"</strong>
                        </span>
                    </div>
                    
                    <div className="mb-4">
                        <Badge 
                            bg="success" 
                            className="me-2"
                            style={{ 
                                background: '#10B981', 
                                color: '#FFFFFF',
                                fontSize: '1em',
                                padding: '8px 12px'
                            }}
                        >
                            💡 Examples:
                        </Badge>
                        <div className="mt-2" style={{ backgroundColor: '#E0F2FE', padding: '12px', borderRadius: '8px', border: '1px solid #B3E5FC' }}>
                            <div style={{ color: '#1E3A8A', marginBottom: '8px' }}>
                                <strong>"Honey, simulate round robin, please"</strong> - Switch to Round Robin algorithm
                            </div>
                            <div style={{ color: '#1E3A8A', marginBottom: '8px' }}>
                                <strong>"Honey, add new process, please"</strong> - Add a new process to the queue
                            </div>
                            <div style={{ color: '#1E3A8A', marginBottom: '8px' }}>
                                <strong>"Honey, start simulation, please"</strong> - Begin the scheduling simulation
                            </div>
                            <div style={{ color: '#1E3A8A' }}>
                                <strong>"Honey, pause simulation, please"</strong> - Pause the running simulation
                            </div>
                        </div>
                    </div>

                    <Row>
                        {voiceCommands.map((category, index) => (
                            <Col md={6} lg={4} key={index} className="mb-4">
                                <div 
                                    className="cpu-command-category-card h-100"
                                    style={{
                                        border: '2px solid #4A90E2',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
                                        boxShadow: '0 4px 6px rgba(74, 144, 226, 0.1)'
                                    }}
                                >
                                    <h6 
                                        className="text-primary mb-3"
                                        style={{ 
                                            color: '#1E3A8A !important',
                                            fontWeight: '700',
                                            fontSize: '1.1em'
                                        }}
                                    >
                                        <span className="me-2" style={{ fontSize: '1.3em' }}>
                                            {category.icon}
                                        </span>
                                        {category.category}
                                    </h6>
                                    <div className="cpu-commands-list">
                                        {category.commands.map((cmd, cmdIndex) => (
                                            <div key={cmdIndex} className="cpu-command-item mb-3">
                                                <div 
                                                    className="fw-bold text-success cpu-command-text"
                                                    style={{ 
                                                        color: '#059669 !important',
                                                        fontSize: '0.95em',
                                                        fontWeight: '600',
                                                        marginBottom: '4px'
                                                    }}
                                                >
                                                    🎯 "{cmd.command}"
                                                </div>
                                                <small 
                                                    className="text-muted cpu-command-description"
                                                    style={{ 
                                                        color: '#64748B !important',
                                                        fontSize: '0.85em',
                                                        lineHeight: '1.4'
                                                    }}
                                                >
                                                    {cmd.description}
                                                </small>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Col>
                        ))}
                    </Row>

                    <div className="mt-4">
                        <h6 style={{ color: '#1E3A8A', fontWeight: '700', marginBottom: '16px' }}>
                            💡 Pro Tips for CPU Scheduling
                        </h6>
                        <Row>
                            {usageTips.map((tip, index) => (
                                <Col md={6} key={index} className="mb-3">
                                    <div 
                                        style={{
                                            backgroundColor: '#FEF3C7',
                                            border: '1px solid #F59E0B',
                                            borderRadius: '8px',
                                            padding: '12px'
                                        }}
                                    >
                                        <div style={{ color: '#92400E', fontWeight: '600', marginBottom: '4px' }}>
                                            {tip.title}
                                        </div>
                                        <small style={{ color: '#78350F' }}>
                                            {tip.tip}
                                        </small>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </div>

                    <div className="mt-4 p-3" style={{ backgroundColor: '#DBEAFE', borderRadius: '8px', border: '1px solid #93C5FD' }}>
                        <h6 style={{ color: '#1E40AF', fontWeight: '600', marginBottom: '8px' }}>
                            🔧 Troubleshooting
                        </h6>
                        <ul style={{ color: '#1E40AF', fontSize: '0.9em', marginBottom: '0' }}>
                            <li>Ensure microphone permissions are granted</li>
                            <li>Speak clearly and at normal pace</li>
                            <li>Wait for "Command mode activated" confirmation</li>
                            <li>Use exact command phrases for best recognition</li>
                            <li>Check browser compatibility (Chrome/Firefox recommended)</li>
                        </ul>
                    </div>

                    <div className="mt-3 text-center">
                        <Badge 
                            bg="secondary"
                            style={{ 
                                background: '#6B7280', 
                                color: '#FFFFFF',
                                fontSize: '0.9em',
                                padding: '6px 10px'
                            }}
                        >
                            🌐 Browser Support: Chrome, Firefox, Edge | Limited: Safari
                        </Badge>
                    </div>
                </Card.Body>
            </Collapse>
        </Card>
    );
};

export default CPUVoiceGuide; 