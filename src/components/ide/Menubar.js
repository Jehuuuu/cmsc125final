import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import FileOpenIcon from '@mui/icons-material/FileOpen';
import RedoIcon from '@mui/icons-material/Redo';
import SaveIcon from '@mui/icons-material/Save';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import UndoIcon from '@mui/icons-material/Undo';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import DownloadIcon from '@mui/icons-material/Download';
import React, { useState, useEffect, useRef, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { LOCAL_STORAGE_KEYS, getLocalStorageItem, setLocalStorageItem, generateUniqueTabName } from '../../utils/ideUtils';
import { TabContext } from '../../utils/TabContext';
import { EditorContext } from '../../utils/EditorContext';
import Modal from './Modal/Modal';
import './Modal/Modal.css';

/**
 * This function is used for menubar component of the text editor.
 */
export default function Menubar() {
  /**
   * useState is a hook that allows to have state variables in functional components.
   */
  const navigate = useNavigate();
  const [zoomLevel, setZoomLevel] = useState(100); // Initial zoom level
  const [isSaveAsModelOpen, setIsSaveAsModelOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloadConfirm, setIsDownloadConfirm] = useState(false);
  const [fileNameInput, setFileNameInput] = useState('');
  const fileInputRef = useRef(null);
  
  // Use tab context
  const { onTabAdd, onTabSave, enableSaveAs, unsavedChanges } = useContext(TabContext);
  // Get editor from context
  const { editor } = useContext(EditorContext);

  /** New/Open File Functionalities **/
  /* This is a function that calls the onTabAdd functions passed as a prop. */
  const handleNewFile = (event) => {
    onTabAdd()
  }

  /* This is a function that triggers a click event on the file input element. */
  const handleOpenFile = () => {
    fileInputRef.current.click()
  }

  /* This is a function that reads the selected file and adds a new tab with its content. */
  const openFileExplorer = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    else {
      setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_NAME, file["name"])
    }

    const reader = new FileReader();

    reader.onload = () => {
      const fileContent = reader.result;
      onTabAdd(file["name"], fileContent)
    };

    reader.readAsText(file);
  };

  /** Save/As Functionalities **/
  /* This is a function that calls the onTabSave function passed as a prop. */
  const handleSave = () => {
    onTabSave()
  }

  /* This is a function that opens a modal if there are unsaved changes, otherwise it confirms the download. */
  const handleDownload = () => {
    /* Modal to check if there are no unsaved changes */
    if(unsavedChanges){
      setIsDownloadModalOpen(true);
    } else {
      setIsDownloadConfirm(true);
    }
  }

  /* This is a function that saves the file and closes the modals. */
  const handleConfirmDownload = () => {
    onTabSave()
    saveFile();
    setIsDownloadModalOpen(false);
    setIsDownloadConfirm(false);
  }

  /* This is a function that opens a modal to ask for the file name. */
  const handleSaveAs = () => {
    /* Modal to ask for file name using input field */
    setFileNameInput('');
    setIsSaveAsModelOpen(true);
  }

  /* This is a function that adds a new tab with the given file name and content, then closes the modal. */
  const handleConfirmSaveAs = () => {
    let newFileName = fileNameInput;
    let fileContent = getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT);

    if (!newFileName) {
      newFileName = generateUniqueTabName(getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST));
    }

    /* Add the new tab with the file name */
    onTabAdd(newFileName, fileContent);

    /* Close the modal */
    setIsSaveAsModelOpen(false);
  }

  /* This is a function that saves the current content of the editor as a file. */
  const saveFile = () => {
    const content = editor.getHTML();
    const blob = new Blob([content], { type: 'text' });
    const anchor = document.createElement('a');
    anchor.href = URL.createObjectURL(blob);
    anchor.download = getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_NAME);
    
    /* Programmatically click the anchor element to start the download */
    anchor.click();
  };

  /** Undo Redo Functionalities **/
  const handleUndo = () => {
    if (editor && editor.can().undo()) {
      editor.chain().focus().undo().run();
      console.log('Undo executed');
    } else {
      console.log('Cannot undo - no undo history available');
    }
  };

  const handleRedo = () => {
    if (editor && editor.can().redo()) {
      try {
        // Try direct history access first
        if (editor.storage.history && typeof editor.storage.history.redo === 'function') {
          editor.storage.history.redo();
        } else {
          // Fall back to standard API
          editor.chain().focus().redo().run();
        }
        console.log('Redo executed successfully');
      } catch (error) {
        console.error('Redo error:', error);
      }
    } else {
      console.log('Cannot redo - no redo history available');
    }
  };

  /** Cut Copy Paste Functionalities **/
  const handleCopy = async () => {
    try {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);
      await navigator.clipboard.writeText(text)
    } catch (error) {
      console.error('Failed to perform copy operation:', error);
    }
  };

  const handlePaste = async (event) => {
    event.preventDefault();
    try {
      const text = await navigator.clipboard.readText();
      editor.chain().focus().insertContent(text).run()
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  const handleCut = async () => {
    try {
      const { from, to } = editor.state.selection;
      const text = editor.state.doc.textBetween(from, to);
      
      /* Remove the selected text */
      editor.chain().focus().deleteSelection().run();
      
      /* Copy the selected text to the clipboard */
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Failed to perform cut operation:', error);
    }
  };

  /** Zoom Functionalities **/ 
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200)); // Increase by 10%, max 200%
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50)); // Decrease by 10%, min 50%
  };

  /** Extra Commands **/
  /* This function selects all content in the editor when called. */
  const handleSelectAll = () => {
    editor.chain().focus().selectAll().run();
  };

  /* This functions deletes the current selection in the editor. */
  const handleDelete = () => {
    const { from, to } = editor.state.selection;

    if(from === to) {
      editor.chain().focus().setTextSelection({from: from - 1, to: to}).run();
    }

    editor.chain().focus().deleteSelection().run();
  };

  /* This function deletes all content in the editor. */
  const handleDeleteAll = () => {
    editor.chain().focus().clearContent().run();
  }

  /* This function creates a new line. */
  const handleEnter = () => {
    editor.chain().focus().enter().run();
  }

  /* This function deselects any current selection. */
  const handleDeselect = () => {
    editor.chain().focus().selectTextblockEnd().run();
  }

  /* This function inserts a specific text into the editor. */
  const handleTyping = () => {
    const element = document.getElementById('MENU-TYPE');
    const text = element.dataset.text;
    editor.chain().focus().insertContent(text).run();
  }

  /**
   * This useEffect updates the zoom level when it changes
   */
  useEffect(() => {
    // Apply zoom to the body element which contains our IDE
    const ide = document.querySelector('.ide-container');
    if (ide) {
      // Set a CSS variable for the zoom scale
      document.documentElement.style.setProperty('--zoom-scale', zoomLevel/100);
      
      // Apply the transform
      ide.style.transform = `scale(${zoomLevel/100})`;
      ide.style.transformOrigin = 'top left';
      
      // Add or remove zoomed class for additional styling
      if (zoomLevel !== 100) {
        ide.classList.add('zoomed');
        
        // Add zoomed-in or zoomed-out specific classes
        if (zoomLevel > 100) {
          ide.classList.add('zoomed-in');
          ide.classList.remove('zoomed-out');
        } else {
          ide.classList.add('zoomed-out');
          ide.classList.remove('zoomed-in');
        }
        
        // Force a reflow to adjust the content properly
        document.body.style.overflow = 'hidden';
        
        // Apply padding to body to account for the scaled container size
        const heightDiff = (document.documentElement.clientHeight * (1 - zoomLevel/100));
        const widthDiff = (document.documentElement.clientWidth * (1 - zoomLevel/100));
        
        // Set min-height on container to ensure content fills the screen
        document.body.style.paddingBottom = `${heightDiff}px`;
        document.body.style.paddingRight = `${widthDiff}px`;
      } else {
        ide.classList.remove('zoomed');
        ide.classList.remove('zoomed-in');
        ide.classList.remove('zoomed-out');
        document.body.style.overflow = '';
        document.body.style.paddingBottom = '';
        document.body.style.paddingRight = '';
      }
      
      // Show current zoom level in a small indicator that fades out
      const existingIndicator = document.getElementById('zoom-indicator');
      if (existingIndicator) {
        document.body.removeChild(existingIndicator);
      }
      
      const indicator = document.createElement('div');
      indicator.id = 'zoom-indicator';
      indicator.style.position = 'fixed';
      indicator.style.bottom = '20px';
      indicator.style.right = '20px';
      indicator.style.background = 'var(--beige-1)';
      indicator.style.color = 'var(--brown-3)';
      indicator.style.padding = '8px 12px';
      indicator.style.borderRadius = '4px';
      indicator.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
      indicator.style.fontSize = '14px';
      indicator.style.fontFamily = '"Poppins", sans-serif';
      indicator.style.zIndex = '9999';
      indicator.style.opacity = '1';
      indicator.style.transition = 'opacity 0.3s ease';
      indicator.textContent = `Zoom: ${zoomLevel}%`;
      
      document.body.appendChild(indicator);
      
      // Fade out the indicator after 2 seconds
      setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
          if (document.body.contains(indicator)) {
            document.body.removeChild(indicator);
          }
        }, 300);
      }, 2000);
    }
  }, [zoomLevel]);

  /* The component returns null if there's no editor instance. */
  if (!editor) {
    return null;
  }
  
  return (
    <>
      <div className="menubar-container">
        <div className="menubar-group menubar-group-primary">
          <button id="MENU-NEW" className="menubar-button" onClick={handleNewFile}>
            <NoteAddIcon className="menubar-button-icon" />
            <span className="menubar-button-label">New File</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept='.txt'
            style={{ display: 'none' }}
            onChange={openFileExplorer}
          />
          <button id="MENU-OPEN" className="menubar-button" onClick={handleOpenFile}>
            <FileOpenIcon className="menubar-button-icon"/>
            <span className="menubar-button-label">Open File</span>
          </button>
          <button id="MENU-SAVE" className="menubar-button" onClick={handleSave} disabled={!unsavedChanges}>
            <SaveIcon className="menubar-button-icon"/>
            <span className="menubar-button-label">Save File</span>
          </button>
          <button id="MENU-SAVE-AS" className="menubar-button" onClick={handleSaveAs} disabled={!enableSaveAs}>
            <SaveAsIcon className="menubar-button-icon"/>
            <span className="menubar-button-label">Save As</span>
          </button>
          <button id="MENU-DOWNLOAD" className="menubar-button" onClick={handleDownload} disabled={!enableSaveAs}>
            <DownloadIcon className="menubar-button-icon"/>
            <span className="menubar-button-label">Download</span>
          </button>
        </div>

        <div className="vertical-division"/>
        
        <div className="menubar-group menubar-group-secondary">
          <button id="MENU-UNDO" className="menubar-button" onClick={handleUndo} disabled={!editor.can().undo()}>
            <UndoIcon className="menubar-button-icon"/>
            <span className="menubar-button-label" >Undo</span>
          </button>
          <button id="MENU-REDO" className="menubar-button" onClick={handleRedo} disabled={!editor.can().redo()}>
            <RedoIcon className="menubar-button-icon" />
            <span className="menubar-button-label">Redo</span>
          </button>
          <button id="MENU-CUT" className="menubar-button" onClick={handleCut} disabled={!editor.getText()}>
            <ContentCutIcon className="menubar-button-icon"/>
            <span className="menubar-button-label">Cut</span>
          </button>
          <button id="MENU-COPY" className="menubar-button" onClick={handleCopy} disabled={!editor.getText()}>
            <ContentCopyIcon className="menubar-button-icon"/>
            <span className="menubar-button-label">Copy</span>
          </button>
          <button id="MENU-PASTE" className="menubar-button" onClick={handlePaste} disabled={!editor.isEditable}>
            <ContentPasteIcon className="menubar-button-icon"/>
            <span className="menubar-button-label">Paste</span>
          </button>
        </div>
        
        <div className="vertical-division"/>
        
        <div className="menubar-group menubar-group-zoom">
          <button id="MENU-ZOOM-IN" className="menubar-button" onClick={handleZoomIn}>
            <ZoomInIcon className="menubar-button-icon"/>
            <span className="menubar-button-label">Zoom In</span>
          </button>
          <button id="MENU-ZOOM-OUT" className="menubar-button" onClick={handleZoomOut}>
            <ZoomOutIcon className="menubar-button-icon"/>
            <span className="menubar-button-label">Zoom Out</span>
          </button>
        </div>
        
        <button id="MENU-SELECT-ALL" onClick={handleSelectAll} hidden />
        <button id="MENU-DESELECT" onClick={handleDeselect} hidden />
        <button id="MENU-DELETE" onClick={handleDelete} hidden />
        <button id="MENU-DELETE-ALL" onClick={handleDeleteAll} hidden />
        <button id="MENU-ENTER" onClick={handleEnter} hidden />
        <button id="MENU-TYPE" onClick={handleTyping} hidden />
      </div>

      {/* Modal for Save As File */}
      <Modal 
        isOpen={isSaveAsModelOpen}
        onClose={() => setIsSaveAsModelOpen(false)}
        headerText="Save File As"
        content="Please enter the name of the file."
        inputField={
          <input
            type='text'
            value={fileNameInput}
            placeholder='Please enter the file name...'
            onChange={(e) => setFileNameInput(e.target.value)}
          />
        }
        buttonText1="Cancel"
        buttonText2="Save"
        onCancel={() => setIsSaveAsModelOpen(false)}
        onConfirm={handleConfirmSaveAs}
      />

      {/* Modal for Download File with Unsaved Changes */}
      <Modal 
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
        headerText="Unsaved Changes"
        content="There are unsaved changes. Are you sure you want to download the file? The contents will be automatically saved."
        buttonText1="No"
        buttonText2="Yes"
        onCancel={() => setIsDownloadModalOpen(false)}
        onConfirm={handleConfirmDownload}
      />

      {/* Modal for Download File with NO Unsaved Changes*/}
      <Modal 
        isOpen={isDownloadConfirm}
        onClose={() => setIsDownloadConfirm(false)}
        headerText="Download File"
        content="Are you sure you want to download the file?"
        buttonText1="No"
        buttonText2="Yes"
        onCancel={() => setIsDownloadConfirm(false)}
        onConfirm={handleConfirmDownload}
      />
    </>
  )
} 