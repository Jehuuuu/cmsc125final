// Importing necessary functions from data-funcs.js
import { deleteRow, editRow, filterRows, getRows, deallocatePages } from "../components/data-funcs";
import { toast } from "react-hot-toast";


// Defining an async function to get the process with the shortest burst time
const getShortestBurstProcess = async () => {
    // Fetching all processes from the "pcb" table
    const all = await getRows("pcb");
    // Filtering out the processes that are waiting
    const readyRunningRows = all.filter(row => row.status !== "Waiting");

    // Checking if there are any processes that are either ready or running
    if (readyRunningRows.length !== 0){
        // Sorting the processes by burst time (shortest burst time first)
        readyRunningRows.sort((a,b) => a.burst_time - b.burst_time);
        // Returning the process with the shortest burst time
        return readyRunningRows[0];
    }
    // Returning null if there are no processes that are either ready or running
    return null;
}   

// Defining an async function to update a process
const updateProcess = async (process, newStatus, newBurstTime) => {
    // Checking if the process exists
    if(process){
        // Updating the status of the process
        process.status = newStatus;
        // Updating the burst time of the process
        process.burst_time = newBurstTime;
        // Incrementing the steps of the process
        process.steps += 1;

        // Pushing the changes to the process
        await editRow(process, "pcb");
    }
}

// Defining an async function to change the status of a process
const changeStatus = async () => {
    // Fetching the currently running process
    let runningProcess = await filterRows("status", "Running", "pcb");
    // Fetching the process with the shortest burst time
    const shortestBurstProcess = await getShortestBurstProcess();

    // Checking if there is a process with the shortest burst time and if no process is running or if the process with the shortest burst time is not the currently running process
    if(shortestBurstProcess && (runningProcess.length === 0 || shortestBurstProcess.id !== runningProcess[0].id)){
        
        // Checking if there is a currently running process
        if(runningProcess.length !== 0){

            // Checking if the burst time of the currently running process is 0
            if (runningProcess[0].burst_time === 0) {
                // Deleting the process if the burst time is 0
                await deleteRow(runningProcess[0].id, "pcb");
            } else {
                // Changing the status of the process to ready if the burst time is not 0
                await updateProcess(runningProcess[0], "Ready", runningProcess[0].burst_time);
                await editRow(runningProcess[0], "pcb")
            }
        }

        // Changing the status of the process with the shortest burst time to running and decrementing its burst time
        await updateProcess(shortestBurstProcess, "Running", shortestBurstProcess.burst_time - 1);
        await editRow(shortestBurstProcess, "pcb")
    }
}

const deleteDoneProcess = async (data) => {
    console.log(`SJF: Process ${data.process_id} completed`);
    
    // Free memory pages first
    const deallocationResult = await deallocatePages(data.process_id.toString());
    if (deallocationResult.success) {
        console.log(`Memory freed for process ${data.process_id}: ${deallocationResult.message}`);
    }
    
    // Then delete from PCB
    await deleteRow(data.id, "pcb");
}

// Defining a variable to check if a toast has been shown
let hasShownToast = false;

// Exporting an async function named SJF
export const SJF = async () => {
    if (!hasShownToast) {
        toast.success("Simulating Shortest Job First...");
        hasShownToast = true;
    }

    const running = await filterRows("status", "Running", "pcb");

    if(running && running.length !== 0) {
        const process = running[0];
        
        if(process.burst_time > 0) {
            // Continue executing
            await updateProcess(process, "Running", process.burst_time - 1);
            await editRow(process, "pcb");
        } else {
            // Process completed - use enhanced deletion
            await deleteDoneProcess(process);
        }
    } 
        
    changeStatus();
}