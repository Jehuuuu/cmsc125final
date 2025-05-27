import React, { useState } from 'react';
import { Card, Button, Collapse, Badge, Row, Col } from 'react-bootstrap';
import { Help as HelpIcon, VolumeUp as VoiceIcon, Mic as MicIcon } from '@mui/icons-material';

const IDEVoiceGuide = () => {
    const [showGuide, setShowGuide] = useState(false);

    const voiceCommands = [
        {
            category: "File Operations",
            icon: "📁",
            commands: [
                { command: "new file", description: "Create a new file" },
                { command: "open file", description: "Open an existing file" },
                { command: "save file", description: "Save current file" },
                { command: "save as file", description: "Save file with new name" },
                { command: "download file", description: "Download current file" }
            ]
        },
        {
            category: "Edit Operations",
            icon: "✏️",
            commands: [
                { command: "undo", description: "Undo last action" },
                { command: "redo", description: "Redo last undone action" },
                { command: "cut", description: "Cut selected text" },
                { command: "copy", description: "Copy selected text" },
                { command: "paste", description: "Paste from clipboard" },
                { command: "select all", description: "Select all text" },
                { command: "delete all", description: "Delete all text" }
            ]
        },
        {
            category: "Text Formatting",
            icon: "🎨",
            commands: [
                { command: "bold", description: "Apply bold formatting" },
                { command: "italic", description: "Apply italic formatting" },
                { command: "strikethrough", description: "Apply strikethrough" },
                { command: "code format", description: "Apply code formatting" },
                { command: "bullet list", description: "Create bullet list" },
                { command: "numbered list", description: "Create numbered list" },
                { command: "code block", description: "Create code block" }
            ]
        },
        {
            category: "Text Alignment",
            icon: "📐",
            commands: [
                { command: "align left", description: "Align text to left" },
                { command: "align center", description: "Center align text" },
                { command: "align right", description: "Align text to right" },
                { command: "justify text", description: "Justify text" }
            ]
        },
        {
            category: "Tab Management",
            icon: "📑",
            commands: [
                { command: "new tab", description: "Create a new tab" },
                { command: "close tab", description: "Close current tab" },
                { command: "next tab", description: "Switch to next tab" },
                { command: "previous tab", description: "Switch to previous tab" }
            ]
        },
        {
            category: "View Controls",
            icon: "🔍",
            commands: [
                { command: "zoom in", description: "Increase zoom level" },
                { command: "zoom out", description: "Decrease zoom level" },
                { command: "focus editor", description: "Focus on the editor" }
            ]
        },
        {
            category: "Quick Insertions",
            icon: "⚡",
            commands: [
                { command: "insert hello", description: "Insert 'Hello, World!'" },
                { command: "insert date", description: "Insert current date" },
                { command: "insert time", description: "Insert current time" },
                { command: "insert function", description: "Insert function template" },
                { command: "insert comment", description: "Insert comment template" },
                { command: "insert console log", description: "Insert console.log()" }
            ]
        },
        {
            category: "Editor Utilities",
            icon: "🛠️",
            commands: [
                { command: "word count", description: "Show word and character count" },
                { command: "clear editor", description: "Clear all editor content" },
                { command: "line break", description: "Insert line break" }
            ]
        }
    ];

    return (
        <Card className="mt-3 voice-guide-card">
            <Card.Header className="voice-guide-header">
                <Button
                    variant="outline-primary"
                    onClick={() => setShowGuide(!showGuide)}
                    className="d-flex align-items-center voice-guide-toggle"
                    style={{
                        background: 'linear-gradient(135deg, #FEFAE0 0%, #ECD9B9 100%)',
                        borderColor: '#DDA15E',
                        color: '#552C08',
                        fontFamily: 'Poppins, sans-serif',
                        fontWeight: '600'
                    }}
                >
                    <MicIcon className="me-2" />
                    IDE Voice Commands Guide
                    <HelpIcon className="ms-2" />
                </Button>
            </Card.Header>
            <Collapse in={showGuide}>
                <Card.Body style={{ fontFamily: 'Poppins, sans-serif' }}>
                    <div className="mb-3">
                        <Badge 
                            bg="info" 
                            className="me-2"
                            style={{ 
                                background: '#DDA15E', 
                                color: '#552C08',
                                fontSize: '0.9em'
                            }}
                        >
                            How to use:
                        </Badge>
                        <span style={{ color: '#552C08', fontWeight: '500' }}>
                            Say <strong>"Honey"</strong> (or "Darling" or "IDE") followed by your command, then end with <strong>"Please"</strong> (or "Thanks")
                        </span>
                    </div>
                    
                    <div className="mb-3">
                        <Badge 
                            bg="success" 
                            className="me-2"
                            style={{ 
                                background: '#C19A6B', 
                                color: '#FEFAE0',
                                fontSize: '0.9em'
                            }}
                        >
                            Examples:
                        </Badge>
                        <div className="mt-2">
                            <em style={{ color: '#552C08' }}>"Honey, save file, please"</em><br/>
                            <em style={{ color: '#552C08' }}>"Darling, make this bold, thanks"</em><br/>
                            <em style={{ color: '#552C08' }}>"IDE, new tab, please"</em>
                        </div>
                    </div>

                    <Row>
                        {voiceCommands.map((category, index) => (
                            <Col md={6} lg={4} key={index} className="mb-4">
                                <div 
                                    className="command-category-card h-100"
                                    style={{
                                        border: '2px solid #DDA15E',
                                        borderRadius: '12px',
                                        padding: '16px',
                                        background: 'linear-gradient(135deg, #FEFAE0 0%, #ECD9B9 100%)'
                                    }}
                                >
                                    <h6 
                                        className="text-primary mb-3"
                                        style={{ 
                                            color: '#552C08 !important',
                                            fontWeight: '700'
                                        }}
                                    >
                                        <span className="me-2" style={{ fontSize: '1.2em' }}>
                                            {category.icon}
                                        </span>
                                        {category.category}
                                    </h6>
                                    <div className="commands-list">
                                        {category.commands.map((cmd, cmdIndex) => (
                                            <div key={cmdIndex} className="command-item mb-2">
                                                <div 
                                                    className="fw-bold text-success command-text"
                                                    style={{ 
                                                        color: '#C19A6B !important',
                                                        fontSize: '0.9em',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    "{cmd.command}"
                                                </div>
                                                <small 
                                                    className="text-muted command-description"
                                                    style={{ 
                                                        color: '#AC9B85 !important',
                                                        fontSize: '0.8em'
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

                    <div 
                        className="alert mt-4"
                        style={{
                            background: 'linear-gradient(135deg, #ECD9B9 0%, #DDBB99 100%)',
                            border: '2px solid #C19A6B',
                            borderRadius: '12px',
                            color: '#552C08'
                        }}
                    >
                        <div className="d-flex align-items-start">
                            <VoiceIcon className="me-2 mt-1" style={{ color: '#C19A6B' }} />
                            <div>
                                <strong>💡 Pro Tips:</strong>
                                <ul className="mb-0 mt-2" style={{ fontSize: '0.9em' }}>
                                    <li>Speak clearly and at a normal pace</li>
                                    <li>Use the microphone button to toggle voice commands on/off</li>
                                    <li>Watch for visual feedback - green means listening, orange means command mode</li>
                                    <li>Try saying "honey help please" for quick assistance</li>
                                    <li>You can also say "honey show commands please" to hear available categories</li>
                                    <li>Use "type this [your text] please" to insert custom text</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div 
                        className="alert mt-3"
                        style={{
                            background: 'rgba(172, 155, 133, 0.1)',
                            border: '1px solid #AC9B85',
                            borderRadius: '8px',
                            color: '#552C08'
                        }}
                    >
                        <small>
                            <strong>🌐 Browser Compatibility:</strong> Voice commands work best in Chrome, Firefox, and Edge. 
                            Make sure to allow microphone access when prompted.
                        </small>
                    </div>
                </Card.Body>
            </Collapse>
        </Card>
    );
};

export default IDEVoiceGuide; 