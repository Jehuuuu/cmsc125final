// Priority.js - Updated process completion handling
import { deleteRow, editRow, filterRows, getRows, deallocatePages } from "../components/data-funcs";
import { toast } from "react-hot-toast";
// Defining an async function to delete a completed process
const deleteDoneProcess = async (data) => {
    console.log(`Priority: Process ${data.process_id} completed`);
    
    // Free memory pages first
    const deallocationResult = await deallocatePages(data.process_id.toString());
    if (deallocationResult.success) {
        console.log(`Memory freed for process ${data.process_id}: ${deallocationResult.message}`);
    }
    
    // Then delete from PCB
    await deleteRow(data.id, "pcb");
}

// Defining an async function to push changes to a row
const pushChanges = async (data) => {
    // Editing the row with the given data in the "pcb" table
    await editRow(data, "pcb")
}

// Defining an async function to change the status of a process
const changeStatus = async () => {
    // Fetching all ready processes
    const all = await getRows("pcb");
    // Filtering out the processes that are not waiting
    const rows = all.filter(item => item.status !== "Waiting");
    // Fetching the currently running process
    const currentRunning = await filterRows("status", "Running", "pcb");

    // Checking if there are any processes that are either ready or running
    if(rows.length !== 0){
        // Sorting the processes by priority (lowest priority value has the highest priority)
        rows.sort((a, b) => a.priority - b.priority);

        // Checking if no process is running or if the process is ready
        if(currentRunning.length === 0 || rows[0].id !== currentRunning[0].id){
            // Changing the status of the process with the highest priority to running
            rows[0].status = "Running";
    
            // Decrementing the burst time of the process
            rows[0].burst_time -= 1;
            rows[0].steps += 1;
    
            // Pushing the changes to the process
            await pushChanges(rows[0]);

            // Checking if there are any processes that are currently running but have a lower priority
            if(currentRunning.length !== 0) {
                // Changing the status of the process to ready
                currentRunning[0].status = "Ready";
                
                currentRunning[0].steps = 0;

                // Pushing the changes to the process
                await pushChanges(currentRunning[0]);
            }
        }
    }
}

// Defining a variable to check if a toast has been shown
let hasShownToast = false;

// Exporting an async function named Priority
export const Priority = async () => {

    // Checking if a toast has not been shown
    if (!hasShownToast) {
        // Showing a success toast with the message "Simulating Priority..."
        toast.success("Simulating Priority...");
        // Setting the variable to true to indicate that a toast has been shown
        hasShownToast = true;
    }
    
    // Fetching the current running process
    const running = await filterRows("status", "Running", "pcb");

    // Checking if there is a running process
    if(running.length !== 0){

        // Checking the burst time of the process
        if(running[0].burst_time > 0){

            // Decrementing the burst time of the process
            running[0].burst_time -= 1;
            running[0].steps += 1;

            // Pushing the changes to the process
            pushChanges(running[0]);

        } else {
            // Deleting the process if the burst time is 0
            deleteDoneProcess(running[0]);
        }

        // Changing the status of the process
        changeStatus();

        // Finishing the cycle
        return;
    }

    // Fetching a new running process if there is no current running process
    changeStatus();
}