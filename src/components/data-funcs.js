// Importing axios for making HTTP requests
import axios from 'axios';

// Setting the base URL for the API
const baseURL = process.env.REACT_APP_JSON_SERVER;

// Function to get all rows from a specific table
export const getRows = async (table) => {
    // Making a GET request to the API
    const response = await axios.get(baseURL + table);
    // Returning the data from the response
    return response.data;
}

// Function to get a specific row from a table
export const getRow = async (id, table) => {
    // Making a GET request to the API
    const response = await axios.get(baseURL + table+ '/' + id);
    // Returning the data from the response
    return response.data;
}

// Function to filter rows based on a specific condition
export const filterRows = async (type, state, table) => {
    // Getting all rows from the table
    const rows = await getRows(table);
    // Filtering the rows based on the condition and returning the result
    return rows.filter(row => row[type] === state);
}

// Function to get the ID of the last row in a table
export const getLastRowID = async (table) => {
    // Getting all rows from the table
    const response = await getRows(table);

    // If there are no rows, return null
    if(response.length === 0) return null;
    // Otherwise, return the ID of the last row
    else return response[response.length - 1].process_id;
}

// Function to get the process ID
export const getProcessID = async () => {
  // Getting the last row ID from the queue table
  const response = await getLastRowID("queue")
  // If there is no response, get the last row ID from the pcb table
  if (response === null) {
    const pcb = await getLastRowID("pcb")
    return pcb
  } 
  // Otherwise, return the response
  return response
}

// Function to add a new row to a table
export const addRow = async (data, table) => {
    try {
        // Making a POST request to the API
        const response = await axios.post(baseURL + table, data);
        // Returning the status of the response
        return response.status;
    } catch (error) {
        // Logging any errors
        console.error(error);
    }
}

// Function to edit a row in a table
export const editRow = async (data, table) => {
    try {
        // Making a PUT request to the API
        const response = await axios.put(baseURL + table + '/' + data.id, data);

        // Returning the data from the response
        return response.data;
    } catch (error) {
        // Logging any errors
        console.error(error);
    }
}

// Function to get the sum of the block sizes in memory
export function getSum(memory) {
      var sum = 0
      // Adding up the block sizes
      memory.forEach(item => sum += item.block_size)
      // Returning the sum
      return sum
}
export const deleteRow = async (process_id, table) => {
    try {
        console.log(`Attempting to delete ${process_id} from ${table}`);
        
        // First check if the record exists
        try {
            await axios.get(baseURL + table + '/' + process_id);
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log(`Record ${process_id} not found in ${table}, skipping deletion`);
                return 200; // Return success since the record doesn't exist anyway
            }
            throw error; // Re-throw if it's a different error
        }
        
        // Handle memory deallocation for PCB processes BEFORE deletion
        if (table === "pcb") {
            const deallocationResult = await deallocatePages(process_id.toString());
            if (deallocationResult.success) {
                console.log(`Memory freed for process ${process_id}: ${deallocationResult.message}`);
            } else {
                console.warn(`Failed to free memory for process ${process_id}:`, deallocationResult.error);
            }
        }
        
        // Now delete the record
        const response = await axios.delete(baseURL + table + "/" + process_id);
        console.log(`Successfully deleted ${process_id} from ${table}`);
        return response.status;
        
    } catch (error) {
        console.error(`Error deleting process ${process_id} from ${table}:`, error.message);
        // Don't throw the error to prevent cascading failures
        return error.response?.status || 500;
    }
};

// Enhanced deleteAllRows function with better error handling
export const deleteAllRows = async (table) => {
    try {
        console.log(`Deleting all rows from ${table}`);
        
        // Get all rows first
        const rows = await getRows(table);
        console.log(`Found ${rows.length} rows to delete from ${table}`);
        
        if (rows.length === 0) {
            console.log(`No rows found in ${table}, nothing to delete`);
            return;
        }

        // Delete each row with proper error handling
        const deletePromises = rows.map(async (row) => {
            try {
                await deleteRow(row.id, table);
            } catch (error) {
                console.error(`Failed to delete row ${row.id} from ${table}:`, error.message);
                // Continue with other deletions even if one fails
            }
        });

        // Wait for all deletions to complete
        await Promise.allSettled(deletePromises);
        console.log(`Finished deleting all rows from ${table}`);

    } catch (error) {
        console.error(`Error in deleteAllRows for ${table}:`, error.message);
    }
};

// Enhanced initializePagedMemory function
export const initializePagedMemory = async () => {
    try {
        console.log('Initializing paged memory system...');
        
        // Clear existing memory records safely
        await deleteAllRows("memory");
        
        // Create fixed-size pages (4 pages of 6 units each for 24 total)
        const PAGE_SIZE = 6;
        const TOTAL_PAGES = 4;
        
        console.log(`Creating ${TOTAL_PAGES} pages of ${PAGE_SIZE} units each`);
        
        const pageCreationPromises = [];
        
        for (let i = 0; i < TOTAL_PAGES; i++) {
            const page = {
                page_number: i,
                page_size: PAGE_SIZE,
                location: i * PAGE_SIZE,
                process_id: "",
                allocated_size: 0,
                status: "Free",
                fragmentation: "None"
            };
            
            pageCreationPromises.push(addRow(page, "memory"));
        }
        
        // Wait for all pages to be created
        await Promise.all(pageCreationPromises);
        
        console.log('Paged memory system initialized successfully');
        return { success: true, message: "Paged memory initialized" };
        
    } catch (error) {
        console.error('Error initializing paged memory:', error);
        return { success: false, error: error.message };
    }
};

// Enhanced deallocatePages function with better error handling
export const deallocatePages = async (processId) => {
    try {
        console.log(`Deallocating pages for process ${processId}`);
        
        const allPages = await getRows("memory");
        const allocatedPages = allPages.filter(page => 
            page.process_id && page.process_id.toString() === processId.toString()
        );
        
        console.log(`Found ${allocatedPages.length} pages to deallocate for process ${processId}`);
        
        if (allocatedPages.length === 0) {
            return { 
                success: true, 
                freedPages: 0,
                message: `No pages found for process ${processId}` 
            };
        }
        
        // Free each allocated page
        const deallocationPromises = allocatedPages.map(async (page) => {
            const freedPage = {
                ...page,
                process_id: "",
                allocated_size: 0,
                status: "Free",
                fragmentation: "None"
            };
            return editRow(freedPage, "memory");
        });
        
        await Promise.all(deallocationPromises);
        
        console.log(`Successfully deallocated ${allocatedPages.length} pages for process ${processId}`);
        
        return { 
            success: true, 
            freedPages: allocatedPages.length,
            message: `Deallocated ${allocatedPages.length} page(s) from process ${processId}` 
        };
    } catch (error) {
        console.error('Error deallocating pages:', error);
        return { success: false, error: error.message };
    }
};

// Enhanced allocatePages function (unchanged but added for completeness)
export const allocatePages = async (processId, requiredSize) => {
    try {
        console.log(`Attempting to allocate ${requiredSize} units for process ${processId}`);
        
        const PAGE_SIZE = 6;
        const pagesNeeded = Math.ceil(requiredSize / PAGE_SIZE);
        
        // Get free pages
        const allPages = await getRows("memory");
        const freePages = allPages.filter(page => page.status === "Free");
        
        console.log(`Need ${pagesNeeded} pages, have ${freePages.length} free pages`);
        
        if (freePages.length < pagesNeeded) {
            return { 
                success: false, 
                message: `Not enough free pages. Need ${pagesNeeded}, have ${freePages.length}` 
            };
        }
        
        // Allocate the required pages
        const allocatedPageNumbers = [];
        let remainingSize = requiredSize;
        
        const allocationPromises = [];
        
        for (let i = 0; i < pagesNeeded && i < freePages.length; i++) {
            const page = freePages[i];
            const allocationSize = Math.min(remainingSize, PAGE_SIZE);
            
            const updatedPage = {
                ...page,
                process_id: processId.toString(),
                allocated_size: allocationSize,
                status: "Busy",
                fragmentation: PAGE_SIZE - allocationSize > 0 ? "Internal" : "None"
            };
            
            allocationPromises.push(editRow(updatedPage, "memory"));
            allocatedPageNumbers.push(page.page_number);
            remainingSize -= allocationSize;
            
            console.log(`Allocating page ${page.page_number} (${allocationSize}/${PAGE_SIZE} units) to process ${processId}`);
        }
        
        await Promise.all(allocationPromises);
        
        return { 
            success: true, 
            allocatedPages: allocatedPageNumbers,
            totalPages: pagesNeeded,
            message: `Allocated ${pagesNeeded} page(s) for process ${processId}` 
        };
    } catch (error) {
        console.error('Error allocating pages:', error);
        return { success: false, error: error.message };
    }
};

// Get memory utilization statistics
export const getMemoryStats = async () => {
    try {
        const allPages = await getRows("memory");
        const busyPages = allPages.filter(page => page.status === "Busy");
        const freePages = allPages.filter(page => page.status === "Free");
        
        // Calculate internal fragmentation
        const totalInternalFrag = busyPages.reduce((total, page) => {
            return total + (page.page_size - (page.allocated_size || 0));
        }, 0);
        
        return {
            totalPages: allPages.length,
            busyPages: busyPages.length,
            freePages: freePages.length,
            totalInternalFragmentation: totalInternalFrag,
            utilizationPercentage: ((busyPages.length / allPages.length) * 100).toFixed(2)
        };
    } catch (error) {
        console.error('Error getting memory stats:', error);
        return null;
    }
};