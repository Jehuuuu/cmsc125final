import { Process } from './Process.js';
import { Scheduler } from './Scheduler.js';
import { MemoryManager } from './MemoryManager.js';

/**
 * Main Operating System Simulator class
 * Coordinates CPU scheduling and memory management
 */
export class OSSimulator {
    constructor(frameCount = 3, timeQuantum = 2) {
        this.scheduler = new Scheduler();
        this.memoryManager = new MemoryManager(frameCount);
        this.currentTime = 0;
        this.isRunning = false;
        this.logs = [];
        this.stepCallback = null; // Callback for UI updates
        
        // Set default time quantum
        this.scheduler.setTimeQuantum(timeQuantum);
    }

    /**
     * Set callback function for step-by-step updates
     */
    setStepCallback(callback) {
        this.stepCallback = callback;
    }

    /**
     * Add a process to the simulation
     */
    addProcess(pid, pageAccesses, priority = 0, arrivalTime = 0) {
        const process = new Process(pid, pageAccesses, priority, arrivalTime);
        this.scheduler.addToJobQueue(process);
        this.log(`Process ${pid} added to job queue`, 'info');
        return process;
    }

    /**
     * Set CPU scheduling algorithm
     */
    setCPUSchedulingAlgorithm(algorithm) {
        this.scheduler.setAlgorithm(algorithm);
        this.log(`CPU scheduling algorithm changed to ${algorithm}`, 'info');
    }

    /**
     * Set page replacement algorithm
     */
    setPageReplacementAlgorithm(algorithm) {
        this.memoryManager.setAlgorithm(algorithm);
        this.log(`Page replacement algorithm changed to ${algorithm}`, 'info');
    }

    /**
     * Set time quantum for Round Robin
     */
    setTimeQuantum(quantum) {
        this.scheduler.setTimeQuantum(quantum);
        this.log(`Time quantum set to ${quantum}`, 'info');
    }

    /**
     * Set number of memory frames
     */
    setFrameCount(frameCount) {
        this.memoryManager = new MemoryManager(frameCount);
        this.memoryManager.setAlgorithm(this.memoryManager.algorithm);
        this.log(`Memory frame count set to ${frameCount}`, 'info');
    }

    /**
     * Start the simulation
     */
    start() {
        this.isRunning = true;
        this.currentTime = 0;
        this.log('Simulation started', 'success');
        
        // Admit initial processes based on arrival time
        this.admitProcesses();
        
        if (this.stepCallback) {
            this.stepCallback(this.getSimulationState());
        }
    }

    /**
     * Stop the simulation
     */
    stop() {
        this.isRunning = false;
        this.log('Simulation stopped', 'info');
    }

    /**
     * Reset the simulation
     */
    reset() {
        this.isRunning = false;
        this.currentTime = 0;
        this.scheduler.reset();
        this.memoryManager.reset();
        this.logs = [];
        this.log('Simulation reset', 'info');
        
        if (this.stepCallback) {
            this.stepCallback(this.getSimulationState());
        }
    }

    /**
     * Execute one simulation step
     */
    step() {
        if (!this.isRunning) {
            return false;
        }

        this.log(`\n=== Time Unit ${this.currentTime} ===`, 'time');

        // 1. Admit processes that have arrived
        this.admitProcesses();

        // 2. Handle Round Robin time slice expiration
        if (this.scheduler.handleTimeSlice()) {
            this.log(`Time slice expired for process ${this.scheduler.currentProcess.pid}`, 'scheduler');
            this.scheduler.currentProcess.status = 'ready';
            this.scheduler.readyQueue.push(this.scheduler.currentProcess);
            this.scheduler.currentProcess = null;
        }

        // 3. Select next process if no current process
        if (!this.scheduler.currentProcess) {
            const nextProcess = this.scheduler.selectNextProcess();
            if (nextProcess) {
                this.log(`Scheduler selected process ${nextProcess.pid} (${this.scheduler.algorithm})`, 'scheduler');
            }
        }

        // 4. Execute current process
        if (this.scheduler.currentProcess) {
            this.executeCurrentProcess();
        }

        // 5. Update waiting times
        this.scheduler.updateWaitingTimes();

        // 6. Move waiting processes back to ready if page load is complete
        this.handlePageLoads();

        // 7. Increment time
        this.currentTime++;

        // 8. Update UI
        if (this.stepCallback) {
            this.stepCallback(this.getSimulationState());
        }

        // 9. Check if simulation is complete
        if (this.scheduler.isAllCompleted()) {
            this.isRunning = false;
            this.log('All processes completed. Simulation finished.', 'success');
            return false;
        }

        return true;
    }

    /**
     * Admit processes from job queue based on arrival time
     */
    admitProcesses() {
        const processesToAdmit = this.scheduler.jobQueue.filter(
            process => process.arrivalTime <= this.currentTime
        );

        processesToAdmit.forEach(process => {
            this.scheduler.admitProcess(process);
            this.log(`Process ${process.pid} admitted to ready queue`, 'scheduler');
        });
    }

    /**
     * Execute the current process (one memory access)
     */
    executeCurrentProcess() {
        const process = this.scheduler.currentProcess;
        const pageNumber = process.getCurrentPageAccess();

        if (pageNumber === null) {
            // Process completed all page accesses
            this.scheduler.terminateProcess(process, this.currentTime);
            this.log(`Process ${process.pid} completed and terminated`, 'scheduler');
            return;
        }

        // Get future accesses for optimal algorithm
        const futureAccesses = process.pageAccesses.slice(process.currentAccessIndex + 1);

        // Access the page
        const memoryResult = this.memoryManager.accessPage(pageNumber, futureAccesses);

        if (memoryResult.hit) {
            // Page hit - continue execution
            this.log(`Process ${process.pid}: Page ${pageNumber} HIT`, 'memory');
            process.nextPageAccess();

            // Check if process completed
            if (process.isCompleted()) {
                this.scheduler.terminateProcess(process, this.currentTime);
                this.log(`Process ${process.pid} completed and terminated`, 'scheduler');
            }
        } else {
            // Page fault - block process
            this.log(`Process ${process.pid}: Page ${pageNumber} FAULT`, 'memory');
            process.pageFaults++;

            if (memoryResult.replacement) {
                this.log(
                    `Page replacement: ${memoryResult.replacement.victim} → ${pageNumber} (${memoryResult.replacement.algorithm})`,
                    'memory'
                );
            }

            // Block the process (simulate page load time)
            this.scheduler.blockProcess(process);
            this.log(`Process ${process.pid} blocked for page load`, 'scheduler');
        }

        this.log(`Memory frames: [${this.memoryManager.frames.join(', ')}]`, 'memory');
    }

    /**
     * Handle page loads (simulate I/O completion)
     */
    handlePageLoads() {
        // For simplicity, assume page load takes 1 time unit
        // In a real system, this would be much longer
        const waitingProcesses = [...this.scheduler.waitingQueue];
        
        waitingProcesses.forEach(process => {
            // Move process back to ready queue and advance to next page access
            process.nextPageAccess();
            this.scheduler.unblockProcess(process);
            this.log(`Process ${process.pid} page load completed, moved to ready queue`, 'scheduler');
        });
    }

    /**
     * Run simulation automatically with specified interval
     */
    async runAutomatic(intervalMs = 1000) {
        return new Promise((resolve) => {
            const interval = setInterval(() => {
                if (!this.step()) {
                    clearInterval(interval);
                    resolve();
                }
            }, intervalMs);
        });
    }

    /**
     * Log simulation events
     */
    log(message, type = 'info') {
        const logEntry = {
            time: this.currentTime,
            message,
            type,
            timestamp: new Date().toISOString()
        };
        this.logs.push(logEntry);
        
        // Keep only last 1000 log entries to prevent memory issues
        if (this.logs.length > 1000) {
            this.logs.shift();
        }
    }

    /**
     * Get current simulation state
     */
    getSimulationState() {
        return {
            currentTime: this.currentTime,
            isRunning: this.isRunning,
            queues: this.scheduler.getQueueStates(),
            memory: this.memoryManager.getFrameState(),
            memoryStats: this.memoryManager.getStatistics(),
            schedulerStats: this.scheduler.getStatistics(),
            logs: this.logs.slice(-50), // Return last 50 log entries
            algorithms: {
                cpu: this.scheduler.algorithm,
                memory: this.memoryManager.algorithm,
                timeQuantum: this.scheduler.timeQuantum
            }
        };
    }

    /**
     * Get detailed statistics
     */
    getDetailedStatistics() {
        const memoryStats = this.memoryManager.getStatistics();
        const schedulerStats = this.scheduler.getStatistics();
        
        return {
            memory: {
                ...memoryStats,
                frameCount: this.memoryManager.frameCount,
                algorithm: this.memoryManager.algorithm,
                replacements: this.memoryManager.replacements
            },
            scheduler: {
                ...schedulerStats,
                algorithm: this.scheduler.algorithm,
                timeQuantum: this.scheduler.timeQuantum,
                totalProcesses: this.scheduler.jobQueue.length + 
                               this.scheduler.readyQueue.length + 
                               this.scheduler.waitingQueue.length + 
                               this.scheduler.terminatedQueue.length +
                               (this.scheduler.currentProcess ? 1 : 0)
            },
            simulation: {
                currentTime: this.currentTime,
                isRunning: this.isRunning,
                totalLogs: this.logs.length
            }
        };
    }

    /**
     * Load predefined test scenarios
     */
    loadTestScenario(scenarioName) {
        this.reset();
        
        switch (scenarioName) {
            case 'basic':
                this.addProcess('P1', [1, 2, 3, 2, 4], 1, 0);
                this.addProcess('P2', [2, 1, 4, 3], 2, 1);
                this.addProcess('P3', [3, 4, 1, 2], 0, 2);
                break;
                
            case 'page_fault_heavy':
                this.addProcess('P1', [1, 2, 3, 4, 5, 6, 7, 8], 1, 0);
                this.addProcess('P2', [8, 7, 6, 5, 4, 3, 2, 1], 2, 0);
                break;
                
            case 'priority_test':
                this.addProcess('P1', [1, 2, 3], 1, 0);
                this.addProcess('P2', [4, 5, 6], 3, 0);
                this.addProcess('P3', [7, 8, 9], 2, 0);
                break;
                
            case 'round_robin_test':
                this.addProcess('P1', [1, 2, 3, 4, 5], 0, 0);
                this.addProcess('P2', [2, 3, 4, 5, 6], 0, 0);
                this.addProcess('P3', [3, 4, 5, 6, 7], 0, 0);
                break;
                
            default:
                this.addProcess('P1', [1, 2, 3, 2, 4], 1, 0);
                this.addProcess('P2', [2, 1, 4, 3], 2, 1);
        }
        
        this.log(`Loaded test scenario: ${scenarioName}`, 'info');
    }
} 