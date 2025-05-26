// Import the toast component
import toast from 'react-hot-toast';
// Import IDE commands
import { ideCommands } from './ide-commands';

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
                    // OS Simulator commands
                    case 'start simulation':
                        toast.success('Starting OS simulation...');
                        break;
                    case 'step simulation':
                        toast.success('Stepping through simulation...');
                        break;
                    case 'auto run':
                        toast.success('Starting auto run...');
                        break;
                    case 'stop auto run':
                        toast.error('Stopping auto run...');
                        break;
                    case 'reset simulation':
                        toast.success('Resetting simulation...');
                        break;
                    case 'add process':
                        toast.success('Opening add process form...');
                        break;
                    case 'set fifo cpu':
                        toast.success('Setting CPU algorithm to FIFO...');
                        break;
                    case 'set shortest job first':
                        toast.success('Setting CPU algorithm to SJF...');
                        break;
                    case 'set priority scheduling':
                        toast.success('Setting CPU algorithm to Priority...');
                        break;
                    case 'set round robin':
                        toast.success('Setting CPU algorithm to Round Robin...');
                        break;
                    case 'set fifo memory':
                        toast.success('Setting memory algorithm to FIFO...');
                        break;
                    case 'set lru memory':
                        toast.success('Setting memory algorithm to LRU...');
                        break;
                    case 'set optimal memory':
                        toast.success('Setting memory algorithm to Optimal...');
                        break;
                    case 'load basic scenario':
                        toast.success('Loading basic test scenario...');
                        break;
                    case 'load page fault scenario':
                        toast.success('Loading page fault heavy scenario...');
                        break;
                    case 'load priority scenario':
                        toast.success('Loading priority test scenario...');
                        break;
                    case 'load round robin scenario':
                        toast.success('Loading round robin test scenario...');
                        break;
                    case 'load custom scenario':
                        toast.success('Loading custom scenario...');
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

/**
 * Custom command for algorithm selection using dropdown changes
 */
const algorithmCommand = (name, type, value) => {
    return {
        command: name,
        callback: () => {
            let element;
            if (type === 'cpu') {
                element = document.querySelector('select[data-algorithm-type="cpu"]');
            } else if (type === 'memory') {
                element = document.querySelector('select[data-algorithm-type="memory"]');
            } else if (type === 'scenario') {
                element = document.querySelector('select[data-algorithm-type="scenario"]');
            }
            
            if (element) {
                element.value = value;
                element.dispatchEvent(new Event('change', { bubbles: true }));
                switch(name){
                    case 'set fifo cpu':
                        toast.success('Setting CPU algorithm to FIFO...');
                        break;
                    case 'set shortest job first':
                        toast.success('Setting CPU algorithm to SJF...');
                        break;
                    case 'set priority scheduling':
                        toast.success('Setting CPU algorithm to Priority...');
                        break;
                    case 'set round robin':
                        toast.success('Setting CPU algorithm to Round Robin...');
                        break;
                    case 'set fifo memory':
                        toast.success('Setting memory algorithm to FIFO...');
                        break;
                    case 'set lru memory':
                        toast.success('Setting memory algorithm to LRU...');
                        break;
                    case 'set optimal memory':
                        toast.success('Setting memory algorithm to Optimal...');
                        break;
                    case 'load basic scenario':
                        toast.success('Loading basic test scenario...');
                        break;
                    case 'load page fault scenario':
                        toast.success('Loading page fault heavy scenario...');
                        break;
                    case 'load priority scenario':
                        toast.success('Loading priority test scenario...');
                        break;
                    case 'load round robin scenario':
                        toast.success('Loading round robin test scenario...');
                        break;
                    case 'load custom scenario':
                        toast.success('Loading custom scenario...');
                        break;
                }
            } else {
                toast.error('Algorithm selector not found');
            }
        }
    }
}

// Export an array of command objects
export const commands = [
    // scheduling policies (CPU scheduler)
    command('simulate first come first serve', 'First Come, First Serve'),
    command('simulate shortest job first', 'Shortest Job First'),
    command('simulate priority', 'Priority'),
    command('simulate round robin', 'Round Robin'),

    // simulation controls (CPU scheduler)
    simulationCommand('play simulation', 'play'),
    simulationCommand('start simulation', 'play'),
    simulationCommand('pause simulation', 'pause'),
    simulationCommand('stop simulation', 'stop'),
    simulationCommand('resume simulation', 'play'),

    // process control (CPU scheduler)
    command('add new process', 'New'),
    command('add custom process', 'Custom'),
    command('generate random process', 'Random'),
    command('delete process', 'Delete'),

    // modal response (CPU scheduler)
    command('yes', 'Yes'),
    command('no', 'No'),
    command('add row', 'Add New Row'),
    command('close', 'Close'),

    // OS Simulator simulation controls
    command('start simulation', 'os-start-btn'),
    command('pause simulation', 'os-pause-btn'),
    command('stop simulation', 'os-stop-btn'),
    command('step simulation', 'os-step-btn'),
    command('auto run', 'os-auto-btn'),
    command('stop auto run', 'os-auto-btn'),
    command('reset simulation', 'os-reset-btn'),
    command('add process', 'os-add-process-btn'),

    // OS Simulator CPU algorithm selection
    algorithmCommand('set fifo cpu', 'cpu', 'FIFO'),
    algorithmCommand('set shortest job first', 'cpu', 'SJF'),
    algorithmCommand('set priority scheduling', 'cpu', 'Priority'),
    algorithmCommand('set round robin', 'cpu', 'RoundRobin'),

    // OS Simulator memory algorithm selection
    algorithmCommand('set fifo memory', 'memory', 'FIFO'),
    algorithmCommand('set lru memory', 'memory', 'LRU'),
    algorithmCommand('set optimal memory', 'memory', 'OPT'),

    // OS Simulator scenario selection
    algorithmCommand('load basic scenario', 'scenario', 'basic'),
    algorithmCommand('load page fault scenario', 'scenario', 'page_fault_heavy'),
    algorithmCommand('load priority scenario', 'scenario', 'priority_test'),
    algorithmCommand('load round robin scenario', 'scenario', 'round_robin_test'),
    algorithmCommand('load custom scenario', 'scenario', 'custom'),

    // Include all IDE commands
    ...ideCommands
]