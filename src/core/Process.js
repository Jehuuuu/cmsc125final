/**
 * Process class representing a process in the operating system simulation
 */
export class Process {
    constructor(pid, pageAccesses, priority = 0, arrivalTime = 0) {
        this.pid = pid;
        this.pageAccesses = pageAccesses; // Array of page numbers to access
        this.priority = priority;
        this.arrivalTime = arrivalTime;
        this.currentAccessIndex = 0; // Current position in page accesses
        this.status = 'new'; // new, ready, running, waiting, terminated
        this.waitingTime = 0;
        this.turnaroundTime = 0;
        this.completionTime = 0;
        this.pageFaults = 0;
        this.timeSliceRemaining = 0; // For Round Robin
    }

    /**
     * Get the current page access
     */
    getCurrentPageAccess() {
        if (this.currentAccessIndex < this.pageAccesses.length) {
            return this.pageAccesses[this.currentAccessIndex];
        }
        return null;
    }

    /**
     * Move to the next page access
     */
    nextPageAccess() {
        this.currentAccessIndex++;
        return this.getCurrentPageAccess();
    }

    /**
     * Check if process has completed all page accesses
     */
    isCompleted() {
        return this.currentAccessIndex >= this.pageAccesses.length;
    }

    /**
     * Get remaining page accesses count
     */
    getRemainingAccesses() {
        return this.pageAccesses.length - this.currentAccessIndex;
    }

    /**
     * Reset process to initial state
     */
    reset() {
        this.currentAccessIndex = 0;
        this.status = 'new';
        this.waitingTime = 0;
        this.turnaroundTime = 0;
        this.completionTime = 0;
        this.pageFaults = 0;
        this.timeSliceRemaining = 0;
    }

    /**
     * Clone the process
     */
    clone() {
        const cloned = new Process(this.pid, [...this.pageAccesses], this.priority, this.arrivalTime);
        cloned.currentAccessIndex = this.currentAccessIndex;
        cloned.status = this.status;
        cloned.waitingTime = this.waitingTime;
        cloned.turnaroundTime = this.turnaroundTime;
        cloned.completionTime = this.completionTime;
        cloned.pageFaults = this.pageFaults;
        cloned.timeSliceRemaining = this.timeSliceRemaining;
        return cloned;
    }
} 