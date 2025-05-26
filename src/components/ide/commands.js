// ****************************************************************
// DEPRECATED - This file is no longer used. Please use the commands 
// from src/voice/ide-commands.js instead.
// ****************************************************************

import { cleanInputForId } from "../../utils/ideUtils";

/**
 * Template for command functionalities
 * @param {*} name - the command to recognize
 * @param {*} id - the id of the button to press
 *              - refer to the menubar.js and toolbar.js to check button id per command
 * @returns click event for a command
 */
const command = (name, id) => {
    return {
        command: name,
        callback: () => {
            document.getElementById(id).click();
        }
    }
}

// list of commands to be recognized
export const commands = [
    // file handling
    command('new file', 'MENU-NEW'),  
    command('open file', 'MENU-OPEN'),  
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
    command('new tab', 'TAB-ADD'),
    command('close tab', localStorage.getItem("ide_file_name") ? 'TAB-CLOSE-' + cleanInputForId(localStorage.getItem("ide_file_name")) : 'TAB-CLOSE'),
] 