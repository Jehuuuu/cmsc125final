import { cleanInputForId } from "../../utils/ideUtils";
import toast from 'react-hot-toast';

/**
 * Enhanced template for command functionalities with better error handling
 * @param {*} name - the command to recognize
 * @param {*} id - the id of the button to press
 * @param {*} description - optional description for the command
 * @returns click event for a command with enhanced feedback
 */
const command = (name, id, description = '') => {
    return {
        command: name,
        callback: () => {
            try {
                const element = document.getElementById(id);
                if (element) {
                    // Check if element is disabled
                    if (element.disabled) {
                        toast.error(`❌ ${name} is currently disabled`);
                        return;
                    }
                    
                    element.click();
                    
                    // Enhanced success feedback with emojis
                    const successMessages = {
                        'new file': '📄 New file created',
                        'open file': '📂 Opening file dialog',
                        'save file': '💾 File saved',
                        'save as file': '💾 Save as dialog opened',
                        'download': '⬇️ Download started',
                        'undo': '↶ Action undone',
                        'redo': '↷ Action redone',
                        'cut': '✂️ Text cut',
                        'copy': '📋 Text copied',
                        'paste': '📋 Text pasted',
                        'zoom in': '🔍 Zoomed in',
                        'zoom out': '🔍 Zoomed out',
                        'select all': '📝 All text selected',
                        'deselect': '📝 Text deselected',
                        'delete': '🗑️ Text deleted',
                        'delete all': '🗑️ All text deleted',
                        'bold': '**Bold** formatting applied',
                        'italic': '*Italic* formatting applied',
                        'strike': '~~Strikethrough~~ applied',
                        'code': '`Code` formatting applied',
                        'bullets': '• Bullet list created',
                        'numbers': '1. Numbered list created',
                        'block': '📦 Code block created',
                        'align left': '⬅️ Text aligned left',
                        'align center': '↔️ Text centered',
                        'align right': '➡️ Text aligned right',
                        'justify': '📐 Text justified',
                        'new tab': '📑 New tab opened',
                        'close tab': '❌ Tab closed'
                    };
                    
                    const message = successMessages[name] || `✅ ${name} executed`;
                    toast.success(message);
                } else {
                    toast.error(`❌ Cannot find ${name} button`);
                    console.error(`Element with ID '${id}' not found for command '${name}'`);
                }
            } catch (error) {
                toast.error(`❌ Error executing ${name}`);
                console.error(`Error executing command '${name}':`, error);
            }
        }
    }
}

/**
 * Enhanced command for text insertion with better text processing
 */
const textCommand = (name, text) => {
    return {
        command: name,
        callback: () => {
            try {
                const btn = document.getElementById('MENU-TYPE');
                if (btn) {
                    btn.dataset.text = text;
                    btn.click();
                    toast.success(`📝 Inserted: "${text}"`);
                } else {
                    toast.error('❌ Cannot insert text - editor not ready');
                }
            } catch (error) {
                toast.error('❌ Error inserting text');
                console.error('Text insertion error:', error);
            }
        }
    }
}

/**
 * Enhanced command for editor actions that require special handling
 */
const editorCommand = (name, action) => {
    return {
        command: name,
        callback: () => {
            try {
                switch(action) {
                    case 'focus':
                        const editor = document.querySelector('.ProseMirror');
                        if (editor) {
                            editor.focus();
                            toast.success('🎯 Editor focused');
                        } else {
                            toast.error('❌ Editor not found');
                        }
                        break;
                        
                    case 'clear':
                        const clearBtn = document.getElementById('MENU-DELETE-ALL');
                        if (clearBtn) {
                            clearBtn.click();
                            toast.success('🗑️ Editor cleared');
                        }
                        break;
                        
                    case 'word-count':
                        const editorContent = document.querySelector('.ProseMirror');
                        if (editorContent) {
                            const text = editorContent.textContent || '';
                            const words = text.trim().split(/\s+/).filter(word => word.length > 0).length;
                            const chars = text.length;
                            toast.success(`📊 Words: ${words}, Characters: ${chars}`);
                        }
                        break;
                        
                    default:
                        toast.error(`❌ Unknown editor action: ${action}`);
                }
            } catch (error) {
                toast.error(`❌ Error with ${name}`);
                console.error(`Editor command error for '${name}':`, error);
            }
        }
    }
}

/**
 * Enhanced command for tab operations with better tab handling
 */
const tabCommand = (name, action) => {
    return {
        command: name,
        callback: () => {
            try {
                switch(action) {
                    case 'new':
                        const newTabBtn = document.getElementById('TAB-ADD');
                        if (newTabBtn) {
                            newTabBtn.click();
                            toast.success('📑 New tab created');
                        }
                        break;
                        
                    case 'close':
                        const fileName = localStorage.getItem("ide_file_name");
                        const closeId = fileName ? 
                            'TAB-CLOSE-' + cleanInputForId(fileName) : 
                            'TAB-CLOSE';
                        const closeBtn = document.getElementById(closeId);
                        if (closeBtn) {
                            closeBtn.click();
                            toast.success('❌ Tab closed');
                        } else {
                            toast.error('❌ No tab to close');
                        }
                        break;
                        
                    case 'next':
                        // Find all tabs and switch to next one
                        const tabs = document.querySelectorAll('.dynamic-tab');
                        const activeTab = document.querySelector('.dynamic-tab-active');
                        if (tabs.length > 1 && activeTab) {
                            const currentIndex = Array.from(tabs).indexOf(activeTab);
                            const nextIndex = (currentIndex + 1) % tabs.length;
                            tabs[nextIndex].click();
                            toast.success('➡️ Switched to next tab');
                        } else {
                            toast.error('❌ No other tabs available');
                        }
                        break;
                        
                    case 'previous':
                        // Find all tabs and switch to previous one
                        const allTabs = document.querySelectorAll('.dynamic-tab');
                        const currentActiveTab = document.querySelector('.dynamic-tab-active');
                        if (allTabs.length > 1 && currentActiveTab) {
                            const currentIdx = Array.from(allTabs).indexOf(currentActiveTab);
                            const prevIdx = currentIdx === 0 ? allTabs.length - 1 : currentIdx - 1;
                            allTabs[prevIdx].click();
                            toast.success('⬅️ Switched to previous tab');
                        } else {
                            toast.error('❌ No other tabs available');
                        }
                        break;
                        
                    default:
                        toast.error(`❌ Unknown tab action: ${action}`);
                }
            } catch (error) {
                toast.error(`❌ Error with ${name}`);
                console.error(`Tab command error for '${name}':`, error);
            }
        }
    }
}

// Enhanced list of commands with more functionality
export const commands = [
    // File handling commands
    command('new file', 'MENU-NEW', 'Create a new file'),
    command('open file', 'MENU-OPEN', 'Open an existing file'),
    command('save file', 'MENU-SAVE', 'Save current file'),
    command('save as file', 'MENU-SAVE-AS', 'Save file with new name'),
    command('download', 'MENU-DOWNLOAD', 'Download current file'),
    command('download file', 'MENU-DOWNLOAD', 'Download current file'),
    
    // File manipulation commands
    command('undo', 'MENU-UNDO', 'Undo last action'),
    command('redo', 'MENU-REDO', 'Redo last undone action'),
    command('cut', 'MENU-CUT', 'Cut selected text'),
    command('copy', 'MENU-COPY', 'Copy selected text'),
    command('paste', 'MENU-PASTE', 'Paste from clipboard'),
    
    // Selection commands
    command('select all', 'MENU-SELECT-ALL', 'Select all text'),
    command('deselect', 'MENU-DESELECT', 'Deselect text'),
    command('delete', 'MENU-DELETE', 'Delete selected text'),
    command('delete all', 'MENU-DELETE-ALL', 'Delete all text'),
    command('clear', 'MENU-DELETE-ALL', 'Clear all text'),
    command('clear all', 'MENU-DELETE-ALL', 'Clear all text'),
    
    // Screen manipulation commands
    command('zoom in', 'MENU-ZOOM-IN', 'Increase zoom level'),
    command('zoom out', 'MENU-ZOOM-OUT', 'Decrease zoom level'),
    
    // Formatting commands - toolbar
    command('bold', 'TB-BOLD', 'Apply bold formatting'),
    command('make bold', 'TB-BOLD', 'Apply bold formatting'),
    command('italic', 'TB-ITALIC', 'Apply italic formatting'),
    command('make italic', 'TB-ITALIC', 'Apply italic formatting'),
    command('strike', 'TB-STRIKE', 'Apply strikethrough'),
    command('strikethrough', 'TB-STRIKE', 'Apply strikethrough'),
    command('code', 'TB-CODE', 'Apply code formatting'),
    command('code format', 'TB-CODE', 'Apply code formatting'),
    command('bullets', 'TB-BULLETS', 'Create bullet list'),
    command('bullet list', 'TB-BULLETS', 'Create bullet list'),
    command('numbers', 'TB-NUMBERS', 'Create numbered list'),
    command('numbered list', 'TB-NUMBERS', 'Create numbered list'),
    command('block', 'TB-BLOCK', 'Create code block'),
    command('code block', 'TB-BLOCK', 'Create code block'),
    
    // Text alignment commands
    command('align left', 'TB-ALIGN-LEFT', 'Align text to left'),
    command('left align', 'TB-ALIGN-LEFT', 'Align text to left'),
    command('align center', 'TB-ALIGN-CENTER', 'Center align text'),
    command('center align', 'TB-ALIGN-CENTER', 'Center align text'),
    command('align right', 'TB-ALIGN-RIGHT', 'Align text to right'),
    command('right align', 'TB-ALIGN-RIGHT', 'Align text to right'),
    command('justify', 'TB-ALIGN-JUSTIFY', 'Justify text'),
    command('justify text', 'TB-ALIGN-JUSTIFY', 'Justify text'),

    // Enhanced tab commands
    tabCommand('new tab', 'new'),
    tabCommand('open tab', 'new'),
    tabCommand('close tab', 'close'),
    tabCommand('next tab', 'next'),
    tabCommand('previous tab', 'previous'),
    tabCommand('switch tab', 'next'),
    
    // Enhanced editor commands
    editorCommand('focus editor', 'focus'),
    editorCommand('clear editor', 'clear'),
    editorCommand('word count', 'word-count'),
    editorCommand('count words', 'word-count'),
    
    // Quick text insertion commands
    textCommand('insert hello', 'Hello, World!'),
    textCommand('insert date', new Date().toLocaleDateString()),
    textCommand('insert time', new Date().toLocaleTimeString()),
    textCommand('insert timestamp', new Date().toLocaleString()),
    
    // Programming shortcuts
    textCommand('insert function', 'function functionName() {\n    // Your code here\n}'),
    textCommand('insert comment', '// TODO: Add your comment here'),
    textCommand('insert console log', 'console.log();'),
    textCommand('insert if statement', 'if (condition) {\n    // Your code here\n}'),
    textCommand('insert for loop', 'for (let i = 0; i < length; i++) {\n    // Your code here\n}'),
    
    // Common phrases
    textCommand('insert lorem', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.'),
    textCommand('insert email', 'example@email.com'),
    textCommand('insert phone', '+1 (555) 123-4567'),
    
    // Navigation shortcuts (additional)
    command('enter', 'MENU-ENTER', 'Insert line break'),
    command('line break', 'MENU-ENTER', 'Insert line break'),
    command('new line', 'MENU-ENTER', 'Insert line break'),
] 