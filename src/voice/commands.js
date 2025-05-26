// Import the toast component
import toast from 'react-hot-toast';

/** 
 * This function creates a command object with a name and a callback function.
 * The callback function simulates a click event on the element with the provided id.
 * It also displays a toast notification based on the command name.
 * @param {string} name - The name of the command.
 * @param {string} id - The id of the element to click.
 * @return {Object} The command object.
 */
const command = (name, id) => {
    return {
        command: name,
        callback: () => {
            // get element with the provided id
            const element = document.getElementById(id);
            if (element) {
                // simulate a click event on the element
                element.click();
                // display a toast notification based on the command name
                switch(name){
                    case 'simulate first come first serve':
                        toast.success('Changing scheduling policy...');
                        break;
                    case 'simulate shortest job first':
                        toast.success('Changing scheduling policy...');
                        break;
                    case 'simulate priority':
                        toast.success('Changing scheduling policy...');
                        break;
                    case 'simulate round robin':
                        toast.success('Changing scheduling policy...');
                        break;
                    case 'add new process':
                        toast.success('Adding new process...');
                        break;
                    case 'add custom process':
                        toast.loading('Showing custom process form...');
                        break;
                    case 'generate random process':
                        toast.success('Generating random process...');
                        break;
                    case 'delete process':
                        toast.success('Deleting process...');
                        break;
                    case 'play simulation':
                        toast.success('Starting simulation...');
                        break;
                    case 'pause simulation':
                        toast('Pausing simulation...');
                        break;
                    case 'stop simulation':
                        toast.error('Stopping simulation...');
                        break;
                    case 'resume simulation':
                        toast.success('Resuming simulation...');
                        break;
                    case 'yes':
                        toast.loading("Loading...");
                        break;
                    case 'no':
                        toast.loading('Cancelling...');
                        break;
                    case 'add row':
                        toast.dismiss();
                        toast.success('Adding custom row in the PCB...');
                        break;
                    case 'close':
                        toast.dismiss();
                        toast.error('Cancelling add custom row...');
                        break;
                }
            } else {
                // display an error toast notification if element is not found
                toast.error('Element not found');
            }
        }
    }
}

/**
 * Custom command for simulation controls that need to find buttons by class
 */
const simulationCommand = (name, action) => {
    return {
        command: name,
        callback: () => {
            let element;
            switch(action) {
                case 'play':
                    element = document.querySelector('.play-btn:not(:disabled)');
                    break;
                case 'pause':
                    element = document.querySelector('.pause-btn:not(:disabled)');
                    break;
                case 'stop':
                    element = document.querySelector('.stop-btn:not(:disabled)');
                    break;
            }
            
            if (element) {
                element.click();
                switch(name){
                    case 'play simulation':
                    case 'start simulation':
                        toast.success('Starting simulation...');
                        break;
                    case 'pause simulation':
                        toast('Pausing simulation...');
                        break;
                    case 'stop simulation':
                        toast.error('Stopping simulation...');
                        break;
                    case 'resume simulation':
                        toast.success('Resuming simulation...');
                        break;
                }
            } else {
                toast.error(`Cannot ${action} simulation right now`);
            }
        }
    }
}

// Export an array of command objects
export const commands = [
    // scheduling policies
    command('simulate first come first serve', 'First Come, First Serve'),
    command('simulate shortest job first', 'Shortest Job First'),
    command('simulate priority', 'Priority'),
    command('simulate round robin', 'Round Robin'),

    // simulation controls
    simulationCommand('play simulation', 'play'),
    simulationCommand('start simulation', 'play'),
    simulationCommand('pause simulation', 'pause'),
    simulationCommand('stop simulation', 'stop'),
    simulationCommand('resume simulation', 'play'),

    // process control
    command('add new process', 'New'),
    command('add custom process', 'Custom'),
    command('generate random process', 'Random'),
    command('delete process', 'Delete'),

    // modal response
    command('yes', 'Yes'),
    command('no', 'No'),
    command('add row', 'Add New Row'),
    command('close', 'Close'),
]