/**
 * MemoryManager class for handling physical memory and page replacement
 */
export class MemoryManager {
    constructor(frameCount = 3) {
        this.frameCount = frameCount;
        this.frames = new Array(frameCount).fill(null); // Physical memory frames
        this.accessOrder = []; // For FIFO and LRU tracking
        this.pageFaults = 0;
        this.pageHits = 0;
        this.replacements = [];
        this.algorithm = 'FIFO'; // Default algorithm
    }

    /**
     * Set the page replacement algorithm
     */
    setAlgorithm(algorithm) {
        this.algorithm = algorithm;
    }

    /**
     * Check if a page is in memory
     */
    isPageInMemory(pageNumber) {
        return this.frames.includes(pageNumber);
    }

    /**
     * Access a page in memory
     */
    accessPage(pageNumber, futureAccesses = []) {
        const result = {
            pageNumber,
            hit: false,
            fault: false,
            replacement: null,
            frameState: [...this.frames]
        };

        if (this.isPageInMemory(pageNumber)) {
            // Page hit
            result.hit = true;
            this.pageHits++;
            
            // Update access order for LRU
            if (this.algorithm === 'LRU') {
                this.updateLRUOrder(pageNumber);
            }
        } else {
            // Page fault
            result.fault = true;
            this.pageFaults++;
            
            const emptyFrameIndex = this.frames.indexOf(null);
            
            if (emptyFrameIndex !== -1) {
                // Empty frame available
                this.frames[emptyFrameIndex] = pageNumber;
                this.accessOrder.push(pageNumber);
            } else {
                // Need to replace a page
                const victimPage = this.selectVictimPage(futureAccesses);
                const victimIndex = this.frames.indexOf(victimPage);
                
                result.replacement = {
                    victim: victimPage,
                    frameIndex: victimIndex,
                    algorithm: this.algorithm
                };
                
                this.frames[victimIndex] = pageNumber;
                this.updateAccessOrderAfterReplacement(victimPage, pageNumber);
                
                this.replacements.push({
                    time: Date.now(),
                    victim: victimPage,
                    newPage: pageNumber,
                    algorithm: this.algorithm
                });
            }
        }

        result.frameState = [...this.frames];
        return result;
    }

    /**
     * Select victim page based on the current algorithm
     */
    selectVictimPage(futureAccesses = []) {
        switch (this.algorithm) {
            case 'FIFO':
                return this.selectFIFOVictim();
            case 'LRU':
                return this.selectLRUVictim();
            case 'OPT':
                return this.selectOptimalVictim(futureAccesses);
            default:
                return this.selectFIFOVictim();
        }
    }

    /**
     * FIFO page replacement
     */
    selectFIFOVictim() {
        // Find the page that was loaded first (oldest in accessOrder)
        for (let page of this.accessOrder) {
            if (this.frames.includes(page)) {
                return page;
            }
        }
        return this.frames[0]; // Fallback
    }

    /**
     * LRU page replacement
     */
    selectLRUVictim() {
        // Find the page that was accessed least recently
        for (let i = 0; i < this.accessOrder.length; i++) {
            const page = this.accessOrder[i];
            if (this.frames.includes(page)) {
                return page;
            }
        }
        return this.frames[0]; // Fallback
    }

    /**
     * Optimal page replacement
     */
    selectOptimalVictim(futureAccesses) {
        let farthestPage = null;
        let farthestDistance = -1;

        for (let page of this.frames) {
            if (page === null) continue;
            
            const nextUseIndex = futureAccesses.indexOf(page);
            
            if (nextUseIndex === -1) {
                // Page will never be used again
                return page;
            }
            
            if (nextUseIndex > farthestDistance) {
                farthestDistance = nextUseIndex;
                farthestPage = page;
            }
        }

        return farthestPage || this.frames[0];
    }

    /**
     * Update LRU order when a page is accessed
     */
    updateLRUOrder(pageNumber) {
        // Remove page from current position and add to end (most recently used)
        const index = this.accessOrder.indexOf(pageNumber);
        if (index !== -1) {
            this.accessOrder.splice(index, 1);
        }
        this.accessOrder.push(pageNumber);
    }

    /**
     * Update access order after page replacement
     */
    updateAccessOrderAfterReplacement(victimPage, newPage) {
        const index = this.accessOrder.indexOf(victimPage);
        if (index !== -1) {
            this.accessOrder.splice(index, 1);
        }
        this.accessOrder.push(newPage);
    }

    /**
     * Get memory statistics
     */
    getStatistics() {
        const totalAccesses = this.pageFaults + this.pageHits;
        return {
            pageFaults: this.pageFaults,
            pageHits: this.pageHits,
            totalAccesses,
            faultRate: totalAccesses > 0 ? (this.pageFaults / totalAccesses * 100).toFixed(2) : 0,
            hitRate: totalAccesses > 0 ? (this.pageHits / totalAccesses * 100).toFixed(2) : 0
        };
    }

    /**
     * Reset memory manager
     */
    reset() {
        this.frames = new Array(this.frameCount).fill(null);
        this.accessOrder = [];
        this.pageFaults = 0;
        this.pageHits = 0;
        this.replacements = [];
    }

    /**
     * Get current frame state
     */
    getFrameState() {
        return {
            frames: [...this.frames],
            algorithm: this.algorithm,
            accessOrder: [...this.accessOrder]
        };
    }
} 