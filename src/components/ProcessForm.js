import React, { useState } from 'react';
import { Modal, Form, Button, Alert, Badge, InputGroup } from 'react-bootstrap';
import { Add, AccountBox } from '@mui/icons-material';

const ProcessForm = ({ show, onHide, onSubmit }) => {
    const [formData, setFormData] = useState({
        pid: '',
        pageAccesses: '',
        priority: 0,
        arrivalTime: 0
    });
    const [errors, setErrors] = useState({});
    const [isValid, setIsValid] = useState(false);

    const validateForm = (data) => {
        const newErrors = {};

        // Validate PID
        if (!data.pid.trim()) {
            newErrors.pid = 'Process ID is required';
        } else if (!/^[A-Za-z0-9_-]+$/.test(data.pid)) {
            newErrors.pid = 'Process ID can only contain letters, numbers, hyphens, and underscores';
        }

        // Validate page accesses
        if (!data.pageAccesses.trim()) {
            newErrors.pageAccesses = 'Page accesses are required';
        } else {
            try {
                const pages = data.pageAccesses.split(',').map(p => {
                    const num = parseInt(p.trim());
                    if (isNaN(num) || num < 0) {
                        throw new Error('Invalid page number');
                    }
                    return num;
                });
                if (pages.length === 0) {
                    newErrors.pageAccesses = 'At least one page access is required';
                }
            } catch (e) {
                newErrors.pageAccesses = 'Page accesses must be comma-separated positive integers (e.g., 1,2,3,2,4)';
            }
        }

        // Validate priority
        if (data.priority < 0 || data.priority > 10) {
            newErrors.priority = 'Priority must be between 0 and 10';
        }

        // Validate arrival time
        if (data.arrivalTime < 0) {
            newErrors.arrivalTime = 'Arrival time cannot be negative';
        }

        setErrors(newErrors);
        setIsValid(Object.keys(newErrors).length === 0);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (field, value) => {
        const newData = { ...formData, [field]: value };
        setFormData(newData);
        validateForm(newData);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm(formData)) {
            return;
        }

        try {
            const pageAccesses = formData.pageAccesses
                .split(',')
                .map(p => parseInt(p.trim()))
                .filter(p => !isNaN(p));

            const processData = {
                pid: formData.pid.trim(),
                pageAccesses,
                priority: parseInt(formData.priority),
                arrivalTime: parseInt(formData.arrivalTime)
            };

            onSubmit(processData);
            handleReset();
        } catch (error) {
            setErrors({ submit: 'Failed to create process. Please check your inputs.' });
        }
    };

    const handleReset = () => {
        setFormData({
            pid: '',
            pageAccesses: '',
            priority: 0,
            arrivalTime: 0
        });
        setErrors({});
        setIsValid(false);
    };

    const handleClose = () => {
        handleReset();
        onHide();
    };

    const getPageAccessesPreview = () => {
        try {
            if (!formData.pageAccesses.trim()) return null;
            
            const pages = formData.pageAccesses
                .split(',')
                .map(p => parseInt(p.trim()))
                .filter(p => !isNaN(p));
            
            if (pages.length === 0) return null;
            
            return (
                <div className="mt-2">
                    <small className="text-muted">Preview: </small>
                    {pages.map((page, index) => (
                        <Badge key={index} bg="secondary" className="me-1">
                            {page}
                        </Badge>
                    ))}
                    <small className="text-muted ms-2">({pages.length} accesses)</small>
                </div>
            );
        } catch (e) {
            return null;
        }
    };

    const presetExamples = [
        { name: 'Simple', pages: '1,2,3,2,4', priority: 1, arrival: 0 },
        { name: 'Complex', pages: '1,2,3,4,5,1,2,3', priority: 2, arrival: 1 },
        { name: 'High Priority', pages: '5,6,7,5,6', priority: 5, arrival: 0 },
        { name: 'Delayed Start', pages: '8,9,10,8', priority: 1, arrival: 3 }
    ];

    const loadPreset = (preset) => {
        const newData = {
            pid: `P${Date.now().toString().slice(-4)}`, // Generate unique PID
            pageAccesses: preset.pages,
            priority: preset.priority,
            arrivalTime: preset.arrival
        };
        setFormData(newData);
        validateForm(newData);
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg">
            <Modal.Header closeButton>
                <Modal.Title>
                    <Add className="me-2" />
                    Add New Process
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    {errors.submit && (
                        <Alert variant="danger">{errors.submit}</Alert>
                    )}

                    <div className="mb-3">
                        <Form.Label>Process ID</Form.Label>
                        <InputGroup>
                            <InputGroup.Text><AccountBox /></InputGroup.Text>
                            <Form.Control
                                type="text"
                                value={formData.pid}
                                onChange={(e) => handleInputChange('pid', e.target.value)}
                                placeholder="e.g., P1, Process_A, Task-1"
                                isInvalid={!!errors.pid}
                            />
                        </InputGroup>
                        {errors.pid && (
                            <Form.Control.Feedback type="invalid">
                                {errors.pid}
                            </Form.Control.Feedback>
                        )}
                        <Form.Text className="text-muted">
                            Unique identifier for the process
                        </Form.Text>
                    </div>

                    <div className="mb-3">
                        <Form.Label>Page Accesses</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.pageAccesses}
                            onChange={(e) => handleInputChange('pageAccesses', e.target.value)}
                            placeholder="e.g., 1,2,3,2,4"
                            isInvalid={!!errors.pageAccesses}
                        />
                        {errors.pageAccesses && (
                            <Form.Control.Feedback type="invalid">
                                {errors.pageAccesses}
                            </Form.Control.Feedback>
                        )}
                        <Form.Text className="text-muted">
                            Comma-separated list of page numbers the process will access
                        </Form.Text>
                        {getPageAccessesPreview()}
                    </div>

                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <Form.Label>Priority (0-10)</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    max="10"
                                    value={formData.priority}
                                    onChange={(e) => handleInputChange('priority', e.target.value)}
                                    isInvalid={!!errors.priority}
                                />
                                {errors.priority && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.priority}
                                    </Form.Control.Feedback>
                                )}
                                <Form.Text className="text-muted">
                                    Higher numbers = higher priority
                                </Form.Text>
                            </div>
                        </div>
                        
                        <div className="col-md-6">
                            <div className="mb-3">
                                <Form.Label>Arrival Time</Form.Label>
                                <Form.Control
                                    type="number"
                                    min="0"
                                    value={formData.arrivalTime}
                                    onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
                                    isInvalid={!!errors.arrivalTime}
                                />
                                {errors.arrivalTime && (
                                    <Form.Control.Feedback type="invalid">
                                        {errors.arrivalTime}
                                    </Form.Control.Feedback>
                                )}
                                <Form.Text className="text-muted">
                                    Time unit when process arrives
                                </Form.Text>
                            </div>
                        </div>
                    </div>

                    <hr />
                    
                    <div className="mb-3">
                        <Form.Label>Quick Presets</Form.Label>
                        <div className="d-flex flex-wrap gap-2">
                            {presetExamples.map((preset, index) => (
                                <Button
                                    key={index}
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => loadPreset(preset)}
                                >
                                    {preset.name}
                                </Button>
                            ))}
                        </div>
                        <Form.Text className="text-muted">
                            Click a preset to quickly fill the form with example data
                        </Form.Text>
                    </div>
                </Form>
            </Modal.Body>
            
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
                    Add Process
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProcessForm; 