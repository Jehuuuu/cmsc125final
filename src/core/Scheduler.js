/**
 * Scheduler class for managing process queues and CPU scheduling
 */
export class Scheduler {
    constructor() {
        this.jobQueue = [];        // New processes waiting to enter ready queue
        this.readyQueue = [];      // Processes ready to execute
        this.waitingQueue = [];    // Processes waiting for I/O (page faults)
        this.terminatedQueue = []; // Completed processes
        this.currentProcess = null; // Currently running process
        this.algorithm = 'FIFO';   // Default scheduling algorithm
        this.timeQuantum = 2;      // Time slice for Round Robin
        this.currentTimeSlice = 0; // Current time slice counter
    }

    /**
     * Set the scheduling algorithm
     */
    setAlgorithm(algorithm) {
        this.algorithm = algorithm;
        // Reset time slice when changing algorithm
        this.currentTimeSlice = 0;
    }

    /**
     * Set time quantum for Round Robin
     */
    setTimeQuantum(quantum) {
        this.timeQuantum = quantum;
    }

    /**
     * Add process to job queue
     */
    addToJobQueue(process) {
        process.status = 'new';
        this.jobQueue.push(process);
    }

    /**
     * Move process from job queue to ready queue
     */
    admitProcess(process) {
        const index = this.jobQueue.indexOf(process);
        if (index !== -1) {
            this.jobQueue.splice(index, 1);
            process.status = 'ready';
            this.readyQueue.push(process);
            this.sortReadyQueue();
        }
    }

    /**
     * Move process to waiting queue (due to page fault)
     */
    blockProcess(process) {
        if (this.currentProcess === process) {
            this.currentProcess = null;
            this.currentTimeSlice = 0;
        }
        
        const readyIndex = this.readyQueue.indexOf(process);
        if (readyIndex !== -1) {
            this.readyQueue.splice(readyIndex, 1);
        }
        
        process.status = 'waiting';
        this.waitingQueue.push(process);
    }

    /**
     * Move process from waiting queue back to ready queue
     */
    unblockProcess(process) {
        const index = this.waitingQueue.indexOf(process);
        if (index !== -1) {
            this.waitingQueue.splice(index, 1);
            process.status = 'ready';
            this.readyQueue.push(process);
            this.sortReadyQueue();
        }
    }

    /**
     * Terminate a process
     */
    terminateProcess(process, currentTime) {
        if (this.currentProcess === process) {
            this.currentProcess = null;
            this.currentTimeSlice = 0;
        }
        
        const readyIndex = this.readyQueue.indexOf(process);
        if (readyIndex !== -1) {
            this.readyQueue.splice(readyIndex, 1);
        }
        
        process.status = 'terminated';
        process.completionTime = currentTime;
        process.turnaroundTime = process.completionTime - process.arrivalTime;
        this.terminatedQueue.push(process);
    }

    /**
     * Select next process to run based on scheduling algorithm
     */
    selectNextProcess() {
        if (this.readyQueue.length === 0) {
            return null;
        }

        let selectedProcess = null;

        switch (this.algorithm) {
            case 'FIFO':
                selectedProcess = this.selectFIFO();
                break;
            case 'SJF':
                selectedProcess = this.selectSJF();
                break;
            case 'Priority':
                selectedProcess = this.selectPriority();
                break;
            case 'RoundRobin':
                selectedProcess = this.selectRoundRobin();
                break;
            default:
                selectedProcess = this.selectFIFO();
        }

        if (selectedProcess) {
            selectedProcess.status = 'running';
            this.currentProcess = selectedProcess;
            
            // Initialize time slice for Round Robin
            if (this.algorithm === 'RoundRobin') {
                selectedProcess.timeSliceRemaining = this.timeQuantum;
                this.currentTimeSlice = 0;
            }
        }

        return selectedProcess;
    }

    /**
     * FIFO (First-In, First-Out) scheduling
     */
    selectFIFO() {
        // Sort by arrival time, then by order added to ready queue
        this.readyQueue.sort((a, b) => {
            if (a.arrivalTime !== b.arrivalTime) {
                return a.arrivalTime - b.arrivalTime;
            }
            return a.pid - b.pid; // Use PID as tiebreaker
        });
        
        return this.readyQueue.shift();
    }

    /**
     * SJF (Shortest Job First) scheduling based on remaining page accesses
     */
    selectSJF() {
        this.readyQueue.sort((a, b) => {
            const aRemaining = a.getRemainingAccesses();
            const bRemaining = b.getRemainingAccesses();
            
            if (aRemaining !== bRemaining) {
                return aRemaining - bRemaining;
            }
            return a.arrivalTime - b.arrivalTime; // Tiebreaker: arrival time
        });
        
        return this.readyQueue.shift();
    }

    /**
     * Priority scheduling
     */
    selectPriority() {
        this.readyQueue.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority; // Higher priority first
            }
            return a.arrivalTime - b.arrivalTime; // Tiebreaker: arrival time
        });
        
        return this.readyQueue.shift();
    }

    /**
     * Round Robin scheduling
     */
    selectRoundRobin() {
        if (this.currentProcess && 
            this.currentProcess.status === 'running' && 
            this.currentProcess.timeSliceRemaining > 0) {
            // Continue with current process if time slice not expired
            return this.currentProcess;
        }
        
        // Time slice expired or no current process, select next
        if (this.currentProcess && this.currentProcess.status === 'running') {
            // Move current process to end of ready queue
            this.currentProcess.status = 'ready';
            this.readyQueue.push(this.currentProcess);
            this.currentProcess = null;
        }
        
        // Select next process (FIFO order)
        return this.readyQueue.shift();
    }

    /**
     * Sort ready queue based on current algorithm
     */
    sortReadyQueue() {
        switch (this.algorithm) {
            case 'FIFO':
                this.readyQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
                break;
            case 'SJF':
                this.readyQueue.sort((a, b) => {
                    const aRemaining = a.getRemainingAccesses();
                    const bRemaining = b.getRemainingAccesses();
                    return aRemaining - bRemaining;
                });
                break;
            case 'Priority':
                this.readyQueue.sort((a, b) => b.priority - a.priority);
                break;
            case 'RoundRobin':
                // No sorting needed for Round Robin
                break;
        }
    }

    /**
     * Update waiting times for processes in ready queue
     */
    updateWaitingTimes() {
        this.readyQueue.forEach(process => {
            if (process !== this.currentProcess) {
                process.waitingTime++;
            }
        });
    }

    /**
     * Handle time slice for Round Robin
     */
    handleTimeSlice() {
        if (this.algorithm === 'RoundRobin' && this.currentProcess) {
            this.currentTimeSlice++;
            this.currentProcess.timeSliceRemaining--;
            
            if (this.currentProcess.timeSliceRemaining <= 0) {
                // Time slice expired, preempt process
                return true;
            }
        }
        return false;
    }

    /**
     * Get queue states
     */
    getQueueStates() {
        return {
            jobQueue: this.jobQueue.map(p => p.clone()),
            readyQueue: this.readyQueue.map(p => p.clone()),
            waitingQueue: this.waitingQueue.map(p => p.clone()),
            terminatedQueue: this.terminatedQueue.map(p => p.clone()),
            currentProcess: this.currentProcess ? this.currentProcess.clone() : null
        };
    }

    /**
     * Get scheduling statistics
     */
    getStatistics() {
        const completed = this.terminatedQueue;
        if (completed.length === 0) {
            return {
                averageWaitingTime: 0,
                averageTurnaroundTime: 0,
                throughput: 0,
                completedProcesses: 0
            };
        }

        const totalWaitingTime = completed.reduce((sum, p) => sum + p.waitingTime, 0);
        const totalTurnaroundTime = completed.reduce((sum, p) => sum + p.turnaroundTime, 0);

        return {
            averageWaitingTime: (totalWaitingTime / completed.length).toFixed(2),
            averageTurnaroundTime: (totalTurnaroundTime / completed.length).toFixed(2),
            throughput: completed.length,
            completedProcesses: completed.length
        };
    }

    /**
     * Reset scheduler
     */
    reset() {
        this.jobQueue = [];
        this.readyQueue = [];
        this.waitingQueue = [];
        this.terminatedQueue = [];
        this.currentProcess = null;
        this.currentTimeSlice = 0;
    }

    /**
     * Check if all processes are completed
     */
    isAllCompleted() {
        return this.jobQueue.length === 0 && 
               this.readyQueue.length === 0 && 
               this.waitingQueue.length === 0 && 
               this.currentProcess === null;
    }
} 