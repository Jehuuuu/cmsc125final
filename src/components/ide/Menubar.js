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
import { useCurrentEditor } from "@tiptap/react";
import React, { useState, useEffect, useRef } from 'react';
import { LOCAL_STORAGE_KEYS, getLocalStorageItem, setLocalStorageItem, generateUniqueTabName } from '../../utils/ideUtils';
import Modal from './Modal/Modal';
import './Modal/Modal.css';

/**
 * This function is used for menubar component of the text editor.
 * It has parameters onTabAdd, onTabSave, enableSaveAs, and unsavedChanges.
 * onTabAdd is called when a new tab is to be added.
 * onTabSave is called when the current tab is to be saved.
 * enableSaveAs indicates whether the "Save As" option should be enabled.
 * unsavedChanges indicates whether there are unsaved changes in the current tab.
 */
export default function Menubar({ onTabAdd, onTabSave,
  enableSaveAs, unsavedChanges
}) {
  /**
   * useCurrentEditor is a hook that provides access to the current editor instance.
   * useState is a hook that allows to have state variables in functional components.
   * It is used to manage the zoom level, state of various modals, and the file name input
   * useRef is a hook that is used to create a ref called fileInputRef that is initially set to null.
   */
  const { editor } = useCurrentEditor();
  const [zoomLevel, setZoomLevel] = useState(100); // Initial zoom level
  const [isSaveAsModelOpen, setIsSaveAsModelOpen] = useState(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [isDownloadConfirm, setIsDownloadConfirm] = useState(false);
  const [fileNameInput, setFileNameInput] = useState('');
  const fileInputRef = useRef(null);

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
    editor.commands.undo();
  };

  const handleRedo = () => {
    editor.commands.redo();
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
    setZoomLevel(prev => prev+=5)
  };
  
  const handleZoomOut = () => {
    setZoomLevel(prev => prev-=5)
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
   * This is a useEffect hook that sets the zoom level of the body element 
   * to the zoomLevel state variable. It is used to update the zoom level of 
   * the body element whenever the zoomLevel state changes.
   */
  useEffect(() => {
    document.body.style.zoom = zoomLevel+'%';
  }, [zoomLevel])
  
  /* The component returns null if there's no editor instance. */
  if (!editor) {
    return null;
  }
  return (
    /**
     * Each button has an `onClick` event handler that triggers the corresponding functions 
     * for file operations, text editing, and zooming when clicked.
     * It also has an ID for easier implementation of the voice commands.
     * Some buttons also have a `disabled` prop which is set based certain conditions.
     * Modals are also added which are only displayed based on the component's state.
     * It also includes hidden buttons for "Select All", "Deselect", "Delete", "Delete All", 
     * "Enter", and "Type", which are used for implementing voice commands.
     */
    <div className="container menubar-container" >
      <button id="MENU-NEW" className="menubar-button" onClick = {handleNewFile}>
        <NoteAddIcon />
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
        <span className="menubar-button-label">Save As File</span>
      </button>
      <button id="MENU-DOWNLOAD" className="menubar-button" onClick={handleDownload} disabled={!enableSaveAs}>
        <DownloadIcon className="menubar-button-icon"/>
        <span className="menubar-button-label">Download</span>
      </button>

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

      <div className="vertical-division"/>
      <button id="MENU-UNDO" className="menubar-button" onClick={handleUndo} disabled={!editor.can().undo()}>
        <UndoIcon className="menubar-button-icon"/>
        <span className="menubar-button-label" >Undo</span>
      </button>
      <button id="MENU-REDO" className="menubar-button" disabled={!editor.can().redo()} onClick={handleRedo}>
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
      <div className="vertical-division"/>
      <button id="MENU-ZOOM-IN" className="menubar-button" onClick={handleZoomIn}>
        <ZoomInIcon className="menubar-button-icon"/>
        <span className="menubar-button-label">Zoom In</span>
      </button>
      <button id="MENU-ZOOM-OUT" className="menubar-button" onClick={handleZoomOut}>
        <ZoomOutIcon className="menubar-button-icon"/>
        <span className="menubar-button-label">Zoom Out</span>
      </button>
      <button id="MENU-SELECT-ALL" onClick={handleSelectAll} hidden />
      <button id="MENU-DESELECT" onClick={handleDeselect} hidden />
      <button id="MENU-DELETE" onClick={handleDelete} hidden />
      <button id="MENU-DELETE-ALL" onClick={handleDeleteAll} hidden />
      <button id="MENU-ENTER" onClick={handleEnter} hidden />
      <button id="MENU-TYPE" onClick={handleTyping} hidden />
     </div>
  )
} 