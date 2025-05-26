// Import toast for notifications
import toast from 'react-hot-toast';
import { cleanInputForId } from "../utils/ideUtils";

/**
 * Template for command functionalities
 * @param {string} name - The command to recognize
 * @param {string} id - The id of the button to press
 * @returns Command object with name and callback function
 */
const command = (name, id) => {
    return {
        command: name,
        callback: () => {
            const element = document.getElementById(id);
            if (element) {
                element.click();
                
                // Display toast notification based on command
                switch(name) {
                    // File handling
                    case 'new file':
                        toast.success('Creating new file...');
                        break;
                    case 'open file':
                        toast.success('Opening file browser...');
                        break;
                    case 'save file':
                        toast.success('Saving file...');
                        break;
                    case 'save as file':
                        toast.success('Opening save as dialog...');
                        break;
                    case 'download':
                        toast.success('Downloading file...');
                        break;
                    
                    // File manipulation
                    case 'undo':
                        toast('Undoing last action');
                        break;
                    case 'redo':
                        toast('Redoing last action');
                        break;
                    case 'cut':
                        toast('Cut selection');
                        break;
                    case 'copy':
                        toast('Copied selection');
                        break;
                    case 'paste':
                        toast('Pasting content');
                        break;
                    
                    // Screen manipulation
                    case 'zoom in':
                        toast('Zooming in');
                        break;
                    case 'zoom out':
                        toast('Zooming out');
                        break;
                    
                    // Text styling
                    case 'bold':
                        toast('Applying bold formatting');
                        break;
                    case 'italic':
                        toast('Applying italic formatting');
                        break;
                    case 'strike':
                        toast('Applying strikethrough formatting');
                        break;
                    case 'code':
                        toast('Applying code formatting');
                        break;
                    
                    // Lists
                    case 'bullets':
                        toast('Creating bullet list');
                        break;
                    case 'numbers':
                        toast('Creating numbered list');
                        break;
                    
                    // Alignment
                    case 'align left':
                        toast('Aligning text left');
                        break;
                    case 'align center':
                        toast('Aligning text center');
                        break;
                    case 'align right':
                        toast('Aligning text right');
                        break;
                    case 'justify':
                        toast('Justifying text');
                        break;
                    
                    // Tabs
                    case 'new tab':
                        toast.success('Creating new tab');
                        break;
                    case 'close tab':
                        toast.error('Closing current tab');
                        break;
                    
                    default:
                        toast(`Executing command: ${name}`);
                }
            }
        }
    }
}

// list of commands to be recognized
export const ideCommands = [
    // file handling
    command('new file', 'MENU-NEW'),  
    command('open file', 'MENU-OPEN'),
    // Adding a new command specifically for opening file explorer
    {
        command: 'explore files',
        callback: () => {
            try {
                toast.success('Opening system file explorer...');
                
                // Try different approaches to open file explorer
                if ('showDirectoryPicker' in window) {
                    window.showDirectoryPicker()
                        .then(dirHandle => {
                            toast.success('File explorer opened!');
                            console.log('Directory accessed:', dirHandle);
                        })
                        .catch(err => {
                            console.error('Directory picker error:', err);
                            // Try fallback method
                            window.open('file:///', '_blank');
                        });
                } else {
                    // Fallback for browsers without File System Access API
                    // This may be blocked by browsers for security reasons
                    window.open('file:///', '_blank');
                }
            } catch (error) {
                toast.error('Could not open file explorer: ' + error.message);
            }
        }
    },
    command('save file', 'MENU-SAVE'),  
    command('save as file', 'MENU-SAVE-AS'),
    command('download', 'MENU-DOWNLOAD'),
    
    // file manipulation
    command('undo', 'MENU-UNDO'),  
    command('redo', 'MENU-REDO'),  
    command('cut', 'MENU-CUT'),
    command('copy', 'MENU-COPY'),
    command('paste', 'MENU-PASTE'),
    
    // screen manipulation
    command('zoom in', 'MENU-ZOOM-IN'),  
    command('zoom out', 'MENU-ZOOM-OUT'), 
    
    // extra commands (commands not seen on neither menubar nor toolbar)
    command('select all', 'MENU-SELECT-ALL'),
    command('deselect', 'MENU-DESELECT'),
    command('enter', 'MENU-ENTER'),
    command('delete', 'MENU-DELETE'),
    command('delete all', 'MENU-DELETE-ALL'),

    // toolbar
    command('bold', 'TB-BOLD'),
    command('italic', 'TB-ITALIC'),
    command('strike', 'TB-STRIKE'),
    command('code', 'TB-CODE'),
    command('bullets', 'TB-BULLETS'),
    command('numbers', 'TB-NUMBERS'),
    command('block', 'TB-BLOCK'),
    
    // text alignment commands
    command('align left', 'TB-ALIGN-LEFT'),
    command('align center', 'TB-ALIGN-CENTER'),
    command('align right', 'TB-ALIGN-RIGHT'),
    command('justify', 'TB-ALIGN-JUSTIFY'),

    // tabs
    {
        command: 'new tab',
        callback: () => {
            console.log("Executing new tab command");
            // Find the tab add button using its class name
            const tabAddButton = document.querySelector('.tab-add-cont .add-icon');
            if (tabAddButton) {
                tabAddButton.click();
                toast.success('New tab created');
            } else {
                toast.error('Tab add button not found');
            }
        }
    },
    {
        command: 'close tab',
        callback: () => {
            console.log("Executing close tab command");
            try {
                // Find the active tab
                const activeTab = document.querySelector('.dynamic-tab-active');
                if (activeTab) {
                    // Find the close container which should be more reliable than the icon
                    const closeContainer = activeTab.querySelector('.tab-close-cont');
                    if (closeContainer) {
                        // Create and dispatch a click event manually
                        const clickEvent = new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        });
                        closeContainer.dispatchEvent(clickEvent);
                        toast.success('Tab closed');
                    } else {
                        // Try alternative approach - look for the tab name and find the onTabDelete function
                        console.log("Close container not found, trying alternative approach");
                        
                        // Find the tab name
                        const tabNameElement = activeTab.querySelector('.tab-name');
                        if (tabNameElement && tabNameElement.textContent) {
                            // Get the tab context from the window
                            if (window.TabContext && window.TabContext.onTabDelete) {
                                window.TabContext.onTabDelete(tabNameElement.textContent);
                                toast.success('Tab closed via context');
                            } else {
                                // Last resort - try to find any element with a close or delete tab function
                                const deleteButtons = document.querySelectorAll('[id*="close"], [id*="delete"], [class*="close"], [class*="delete"]');
                                if (deleteButtons.length > 0) {
                                    deleteButtons[0].click();
                                    toast.success('Tab closed using alternative method');
                                } else {
                                    toast.error('Could not find a way to close the tab');
                                }
                            }
                        } else {
                            toast.error('Tab name not found');
                        }
                    }
                } else {
                    toast.error('No active tab found');
                }
            } catch (error) {
                console.error("Error closing tab:", error);
                toast.error('Error closing tab: ' + error.message);
            }
        }
    },

    // Type text command
    {
        command: 'type this',
        callback: () => {
            const transcript = localStorage.getItem('voice_transcript') || '';
            const text = transcript.replace('honey type this', '').replace('please', '').trim();
            
            if (text) {
                const btn = document.getElementById('MENU-TYPE');
                if (btn) {
                    btn.dataset.text = text;
                    btn.click();
                    toast.success('Text inserted');
                } else {
                    toast.error('Type function not available');
                }
            } else {
                toast.error('No text to type');
            }
        }
    }
]; 