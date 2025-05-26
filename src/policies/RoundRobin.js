// RoundRobin.js - Updated process completion handling
import { deleteRow, editRow, filterRows, getRows, deallocatePages } from "../components/data-funcs";
import { FCFS } from "./FCFS";
import { toast } from "react-hot-toast";

// Defining the time quantum for the Round Robin scheduling
let quantum = 3;

// Defining an async function to get the current running process
const getCurrent = async () => {
  // Fetching all processes from the "pcb" table
  const processes = await getRows("pcb");
  // Returning the process that is currently running
  return processes.find(row => row.status === "Running")
}

// Defining an async function to push changes to a row
const pushChanges = async (data) => {
    // Editing the row with the given data in the "pcb" table
    await editRow(data, "pcb");
}

const deleteDoneProcess = async (data) => {
  console.log(`Round Robin: Process ${data.process_id} completed`);
  
  // Free memory pages first
  const deallocationResult = await deallocatePages(data.process_id.toString());
  if (deallocationResult.success) {
      console.log(`Memory freed for process ${data.process_id}: ${deallocationResult.message}`);
  }
  
  // Then delete from PCB
  await deleteRow(data.id, "pcb");
}

// Defining an async function to change the current process
const changeProcess = async (current) => {
  // Fetching all ready processes
  const rows = await filterRows("status", "Ready", "pcb");

  // Checking if there are any ready processes
  if(rows.length > 0) {
    // Changing the status of the first ready process to running
    rows[0].status = "Running";
    // Decrementing the burst time of the process
    rows[0].burst_time -= 1;
    // Incrementing the steps of the process
    rows[0].steps += 1;

    // Pushing the changes to the process
    pushChanges(rows[0]);
  }

  // Checking if there is a current process
  if(current) {
    // Checking if the burst time of the process is 0
    if(current.burst_time === 0) {
      // Deleting the process
      await deleteDoneProcess(current);
      return;
    }

    // Changing the status of the process to ready
    current.status = "Ready";
    
    // Resetting the steps of the process if it is not the same as the first ready process
    if(rows.length > 0 && (rows[0].id !== current.id))
      current.steps = 0;
    
    // Pushing the changes to the process
    pushChanges(current);
  }
}

// Defining a variable to check if a toast has been shown
let hasShownToast = false;

// Exporting an async function named RoundRobin
export const RoundRobin = async () => {
  
  // Checking if a toast has not been shown
  if (!hasShownToast) {
    // Showing a success toast with the message "Simulating Round Robin..."
    toast.success("Simulating Round Robin...");
    // Setting the variable to true to indicate that a toast has been shown
    hasShownToast = true;
  }
  
  // Fetching the current running process
  var current = await getCurrent()

  // Checking if there is a current process
  if(current) {
    // Checking if the steps of the process is less than the quantum and the burst time is greater than 0
    if(current.steps < quantum && current.burst_time > 0) {
      // Decrementing the burst time of the process
      current.burst_time -= 1;
      // Incrementing the steps of the process
      current.steps += 1;
      // Pushing the changes to the process
      pushChanges(current);
    
    // Changing the process if the steps of the process is equal to the quantum or the burst time is 0
    } else {
      await changeProcess(current);
    }
  } else {
    // Changing the process if there is no current process
    await changeProcess(null);
  }
}