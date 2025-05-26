import { deleteRow, editRow, filterRows, deallocatePages } from "../components/data-funcs";
import { toast } from "react-hot-toast";
/**
 * Deletes a done process from the PCB (Process Control Block).
 *
 * @param {Object} data - The data object containing the process ID.
 * @returns {Promise<void>} - A promise that resolves when the process is successfully deleted.
 * @throws {Error} - If there is an error while deleting the process.
 */
const deleteDoneProcess = async (data) => {
    console.log(`FCFS: Process ${data.process_id} completed`);
    
    // Free memory pages first
    const deallocationResult = await deallocatePages(data.process_id.toString());
    if (deallocationResult.success) {
        console.log(`Memory freed for process ${data.process_id}: ${deallocationResult.message}`);
    }
    
    // Then delete from PCB
    await deleteRow(data.id, "pcb");
}
/**
 * Updates a process row in the Process Control Block (PCB).
 * @param {Object} data - The process row data to be updated.
 */
// updating changes in the  Process Row
const pushChanges = async (data) => {
    await editRow(data, "pcb");
}

// changing Status of the process from Ready to Running
const changeStatus = async () => {
    // get all ready processes
    const rows = await filterRows("status", "Ready", "pcb");
    if(rows.length !== 0) {
        // sort by arrival time
        rows.sort((a, b) => a.arrival_time - b.arrival_time);
        
        // change first row to running
        rows[0].status = "Running";

        // start decrementing burst time
        rows[0].burst_time -= 1;
         
        // increase steps
        rows[0].steps += 1;
    
        // push edit
        pushChanges(rows[0]);
    }
}

// boolean to check if toast has been shown
let hasShownToast = false;

/**
 * Simulates the First Come, First Serve (FCFS) scheduling policy.
 * @param {boolean} roundRobin - Indicates whether the Round Robin algorithm is being used.
 * @returns {Promise<boolean>} - Returns a promise that resolves to a boolean indicating whether the cycle has ended.
 */
export const FCFS = async (roundRobin = false) => {
    if (!hasShownToast && roundRobin === false) {
        toast.success("Simulating First Come, First Serve...");
        hasShownToast = true;
    }

    const running = await filterRows("status", "Running", "pcb");

    if(running.length !== 0) {
        const process = running[0];
        
        if (process.burst_time > 0) {
            // Continue executing
            process.burst_time -= 1;
            process.steps += 1;
            pushChanges(process);
        } else {
            // Process completed - use enhanced deletion
            await deleteDoneProcess(process);
            
            if(!roundRobin){
                changeStatus();
            } else {
                return true;
            }
        }
        return false;
    } 
    
    changeStatus();
    return false;
}