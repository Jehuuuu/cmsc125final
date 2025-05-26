/** Importing the libraries and functions **/

// useCurrentEditor will be used to have access on the text editor functions from the tiptap library
import { useCurrentEditor } from "@tiptap/react"; 

// useState is used for handling reactive states in ReactJS and useEffect is used for handling side effects. Both are built-in functionalities provided by React.
import { useState, useEffect } from "react"

// These are the functions from the Utils files. Each of these are explained in the Utils file.
import { LOCAL_STORAGE_KEYS, getLocalStorageItem, setLocalStorageItem, generateUniqueTabName } from "../../utils/ideUtils";

// Import the created Menubar, Tabbar, Toolbar, Modal
import Menubar from "./Menubar";
import Tabbar from "./Tabbar";
import Toolbar from "./Toolbar";
import Modal from "./Modal/Modal";

/**
 * 
 * @description React Functional Component for the Header (Tools above the text editor)
 */
export default function Header() {
  // Get the instance of the text editor
  const { editor } = useCurrentEditor();

  // Set the default tabs to the content of the localstorage
  const [tabs, setTabs] = useState(getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST))

  // Stores whether to enable save as button, defaulted to false
  const [enableSaveAs, setEnableSaveAs] = useState(false);

  // Stores whether there are unsaved changes in the active tab, defaulted to false
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalProps, setModalProps] = useState({});

  function openModal(props){
    setModalProps(props);
    setIsModalOpen(true);
  }

  function closeModal(props){
    setIsModalOpen(false);
  }

  // Everytime the tab is changed, it saves it to the localStorage to allow data persistence
  useEffect(() => {
    // Iterates through each tab to check if it is the currently selected tab because its content has to be saved to another localStorage key.
    tabs && tabs.forEach(tab => {
      if (tab.isSelected) {
        setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_INITIAL_CONTENT, tab.initialContent)
        setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT, tab.content)
        setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_NAME, tab.name)
        setUnsavedChanges(tab.initialContent !== tab.content)
      }
    })

    // Saves the entire list of tabs to localStorage
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST, (tabs))

    // Enable save as if there is an opened tab
     if (tabs && tabs.length > 0) {
      setEnableSaveAs(true)
      setUnsavedChanges(false)
      editor && editor.setEditable(true)
    } else if (tabs && tabs.length === 0) {
      setEnableSaveAs(false)
      setUnsavedChanges(false)
      editor && editor.setEditable(false)
      
    }
    if (editor) {
      editor.state.history$.prevRanges = null;
      editor.state.history$.done.eventCount = 0
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs])


  /**
   * 
   * @param {String} tabToDelete Name of the tab to be deleted
   * @description Deletes an object from the tabs that matches with the parameter, it will be called when the close button on the tab is clicked.
   */

  function onTabDelete(tabToDelete) {
    // Finds the index of the tab to be deleted
    var indexToDelete = tabs.findIndex(tab => tab.name === tabToDelete);

    // Holds the boolean if the tab to be deleted is an active tab
    var checkSelected = tabs[indexToDelete].isSelected;

    // check if the tab being deleted has unsaved changes
    const unsavedChangesExist = tabs[indexToDelete].content !== tabs[indexToDelete].initialContent;
    
    // if there are unsaved changes, open modal for delete confirmation
    if (unsavedChangesExist) {
      openModal({
      // when there are unsaved changes, the modal will trigger and open
      isOpen: true,

      // these are the content inside the modal 
      headerText: "Unsaved Changes",
      content: "There are unsaved changes. Are you sure you want to delete this tab?",
      buttonText1: "No",
      buttonText2: "Yes",

      // when no button is clicked, the modal will close
      onCancel: () => closeModal(),

      // when yes button is clicked, the tab and its content will be closed and the modal will close as well
      onConfirm: () => {
        // proceed with the deletion and closing of modal
        handleTabDeletion(indexToDelete);
        closeModal();
          
        // If the tab to be deleted is an active tab, find the next tab to be deleted.
        if (checkSelected) {
          // Holds the boolean if the tab to be deleted is an active tab
          var updatedTabs = tabs.filter(tab => tab.name !== tabToDelete);
          // Set isSelected to all files to be false first.
          updatedTabs = updatedTabs.map(tab => ({ ...tab, isSelected: false }));

        // If the index to be deleted is the last remaining tab, disable save as and set unsavedChanges to false
        if (indexToDelete === 0 && updatedTabs.length === 0) {
          setEnableSaveAs(false);
          setUnsavedChanges(false);
        }

        // If there are tabs to the left of the deleted tab, make it the new active tab
        else if (indexToDelete <= updatedTabs.length - 1 && updatedTabs.length > 0) {
          updatedTabs[indexToDelete].isSelected = true;
          var newActiveTab = updatedTabs[indexToDelete];
          setActiveTab(newActiveTab.name, newActiveTab.content, newActiveTab.initialContent);
        }

        // If there are only tabs to the right, make it the new active tab.
        else if (indexToDelete > updatedTabs.length - 1 && updatedTabs.length > 0) {
          updatedTabs[--indexToDelete].isSelected = true;
          var rightActiveTab = updatedTabs[indexToDelete];
          setActiveTab(rightActiveTab.name, rightActiveTab.content, rightActiveTab.initialContent);
        }
          // Update the list of tabs to the updatedTabs
          setTabs(updatedTabs);
        } 
      }
    });
  } else {
      // if there are no unsaved changes, proceed with deleting directly
      handleTabDeletion(indexToDelete);

      // remove the tab to be deleted
      var newtabs = tabs.filter(tab => tab.name !== tabToDelete);
      
      // set the next available tab as the active tab
      if(checkSelected) {
        // set isSelected to next one on the right
        if(newtabs.length === 0) {
          // if there are no tabs left, clear the editor's content
          setActiveTab("", "", "");
        } else if(newtabs.length - 1 >= indexToDelete) {
          // set isselected of the tab as true
          newtabs[indexToDelete].isSelected = true;
  
          // set active tab as the next one in the right available
          var nextActiveTab = newtabs[indexToDelete];
          setActiveTab(nextActiveTab.name, nextActiveTab.content, nextActiveTab.initialContent);
        } else {
          // set isselected of the tab as true
          newtabs[newtabs.length - 1].isSelected = true;
          
          // set active tab as the next one in the right available
          var lastActiveTab = newtabs[newtabs.length - 1];
          setActiveTab(lastActiveTab.name, lastActiveTab.content, lastActiveTab.initialContent);
        }
      } 

      // update the tabs
      setTabs(newtabs);
    }
  }

  /**
 * Handles the deletion of a tab from the tabs array based on its index.
 * @param {number} indexToDelete The index of the tab to be deleted from the tabs array.
 * @description This function removes the specified tab from the tabs array, clears its content from local storage, and sets the content of the next tab if there are any
 */
function handleTabDeletion(indexToDelete) {
  // Retrieve the tab object to be deleted from the tabs array based on its index
  const tabToDelete = tabs[indexToDelete];

  // Remove the content associated with the tab being deleted from local storage
  if (tabToDelete.content === getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT)) {
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT, "");
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_INITIAL_CONTENT, "");
  }

  // Proceed with deleting the tab from the list
  const updatedTabs = tabs.filter((tab, index) => index !== indexToDelete);
  setTabs(updatedTabs);

  // Check if there are remaining tabs
  if (updatedTabs.length > 0) {
    let nextTab;
    // Find the index of the next tab
    const nextTabIndex = indexToDelete === updatedTabs.length ? indexToDelete - 1 : indexToDelete;
    // Get the next tab
    nextTab = updatedTabs[nextTabIndex];

    // Check if the next tab has unsaved changes
    const nextTabHasUnsavedChanges = nextTab.content !== nextTab.initialContent;

    // If the next tab has unsaved changes, set it as the active tab
    if (nextTabHasUnsavedChanges) {
      setActiveTab(nextTab.name, nextTab.content, nextTab.initialContent);
    } else {
      // Find the next tab with unsaved changes
      const unsavedTab = updatedTabs.slice(0, nextTabIndex).reverse().find(tab => tab.content !== tab.initialContent);
      if (unsavedTab) {
        setActiveTab(unsavedTab.name, unsavedTab.content, unsavedTab.initialContent);
      } else {
        // If no tab has unsaved changes, set the next tab as active
        setActiveTab(nextTab.name, nextTab.content, nextTab.initialContent);
      }
    }
    
  } else {
      // if there are no remaining tabs, clear the editor's content
      setActiveTab("", "", "");
  }
}

  /**
   * 
   * @param {String} newName New name of the tab
   * @param {String} oldName Current name of the tab
   * @description Changes the name of the tab
   */
  function onTabChangeName(newName, oldName) {
    // Finds the index of the tab 
    var indexToUpdate = tabs.findIndex(tab => tab.name === oldName);

    // Copies the tabs to updated tabs
    var updatedTabs = [...tabs];

    // Sets the name of the tab to newName
    updatedTabs[indexToUpdate] = { ...updatedTabs[indexToUpdate], name: newName };

    // Save the updatedTabs to tabs
    setTabs(updatedTabs)
  }

  /**
   * 
   * @param {String} name Name of the tab [Optional]
   * @param {String} content Content of the tab [Optional]
   * @description Adds tab to the list, called when plus icon on Tabbar is selected (name and content is empty), and when Open File in Menubar is clicked, where the name and content comes from the file opened.
   */
  function onTabAdd(name, content) {

    // Get the current content of the tabs first from the localStorage, since this is also altered by the text editor.
    setTabs(getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST))

    // Sets isSelected of all tabs to be false, suince the new tab added shall be the active tab.
    setTabs(tabs =>
      tabs.map(tab =>
        ({ ...tab, isSelected: false })
      )
    );
    // Object for the new tab created
    var newTab = {}

    // If there was name and content passed, used it for the newTab
    if (name && content) {
      newTab = {
        name: name,
        content: content,
        initialContent: content,
        isSelected: true, // set it to true, to make it the active tab
        key:Date.now() // generate unique key for each tab
      }
    }
    // If no name, add default name and content
    else {
      newTab = {
        name: generateUniqueTabName(tabs),
        content: "<p></p>",
        initialContent: "<p></p>",
        isSelected: true,
        key:Date.now()
      }
    }

    // Set the active tab to be the newTab
    setActiveTab(newTab.name, newTab.content, newTab.initialContent)
    // Make the content of the tabs to be the previous content, plus the newTab
    setTabs(tabs => [...tabs, newTab])
    // Enable SaveAs Button, this is specifically called since initially, when there are no tabs, the save as button is disabled.
    setEnableSaveAs(true)
    editor.setEditable(true)
  }

  /**
   * 
   * @param {String} name Name of the tab clicked
   * @description When the tab is clicked, it sets the isSelected of the clicked tab to be true, and activates it. 
   */
  function onTabClick(name) {
    // Get the current content of the tabs first from the localStorage, since this is also altered by the text editor.
    setTabs(getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST))
    // Go through each tab and set the isSelected to be true when it matches the name of the input parameter. If it is selected, activate the tab.
    setTabs(tabs => 
      tabs.map(tab =>{
          var isSelected = tab.name === name
          if (isSelected) {
            setActiveTab(tab.name, tab.content, tab.initialContent)
          }
          return ({ ...tab, isSelected: isSelected })
      }
      )
    )
  }

  /**
   * 
   * @description When the tab button is saved, it saves the content to the initial content. 
   */
  function onTabSave() {
    setTabs(getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST))
    setTabs(tabs => 
      tabs.map(tab =>{
        if (tab.isSelected) {
          setActiveTab(tab.name, tab.content, tab.content)
          // Copies the content of the tab to the initialContent
          return ({ ...tab, initialContent: tab.content })
          }
          return tab
      }
      )
    )

    setUnsavedChanges(false);
  }

  /**
   * 
   * @param {String} name 
   * @param {String} content 
   * @param {String} initialContent 
   */
  function setActiveTab(name, content, initialContent) {
    // Saves the name of the active tab to localStorage
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_NAME, name)
    // Saves the file content of the active tab to localStorage
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT, content)
    // Saves the file initial content of the active tab to localStorage
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_INITIAL_CONTENT, initialContent)
    // set the content of the text editor to the content of the tab that is active
    editor.commands.setContent(content)
  }

  // Reacts whenever there is transaction in the text editor so it can check if there is unsaved changes
  useEffect(() => {
    editor && editor.on('transaction', () => {
      // Fetch the initialContent from the localStorage
      var initialContent = getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_INITIAL_CONTENT)
      // Fetch the content from the localStorage
      var content = editor.getHTML()
      // If the initial content does not match with the current content, make unsavedChanges to true
      setUnsavedChanges(initialContent !== content)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // If the editor was not instantiated, do not render anything
  if (!editor) {
    return null;
  }

  return (
    <div className="controls-container">
      {/* Pass to the Menubar the onTabAdd, onTabSave, enableSaveAs, and unsavedChanges, since it will be used by some of the buttons on the Menubar */}
      <Menubar onTabAdd={onTabAdd} onTabSave={onTabSave}
        enableSaveAs={enableSaveAs}
        unsavedChanges={unsavedChanges}
      />
      {/* No props for the Toolbar */}
      <Toolbar />
      
      {/* Pass to the Modal the content of the modal and the functionalities of its button*/}
      <Modal {...modalProps} isOpen={isModalOpen} onClose={closeModal} />
  </div>
  );
} 