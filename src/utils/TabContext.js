import React, { createContext, useState, useEffect } from 'react';
import { LOCAL_STORAGE_KEYS, getLocalStorageItem, setLocalStorageItem, generateUniqueTabName } from "./ideUtils";

// Create a new context for tab management
export const TabContext = createContext();

/**
 * Provider component for tab management across the IDE
 */
export function TabProvider({ children }) {
  // Set the default tabs to the content of the localstorage
  const [tabs, setTabs] = useState(getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST) || []);

  // Stores whether to enable save as button, defaulted to false
  const [enableSaveAs, setEnableSaveAs] = useState(false);

  // Stores whether there are unsaved changes in the active tab, defaulted to false
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  
  // State for handling tab close confirmation
  const [tabToDelete, setTabToDelete] = useState(null);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);
  
  // Everytime the tab is changed, it saves it to the localStorage to allow data persistence
  useEffect(() => {
    // Iterates through each tab to check if it is the currently selected tab
    tabs && tabs.forEach(tab => {
      if (tab.isSelected) {
        setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_INITIAL_CONTENT, tab.initialContent)
        setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT, tab.content)
        setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_NAME, tab.name)
        setUnsavedChanges(tab.initialContent !== tab.content)
      }
    });

    // Saves the entire list of tabs to localStorage
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST, tabs);

    // Enable save as if there is an opened tab
    if (tabs && tabs.length > 0) {
      setEnableSaveAs(true);
    } else {
      setEnableSaveAs(false);
    }
  }, [tabs]);

  /**
   * Sets the active tab and its content
   */
  function setActiveTab(name, content, initialContent) {
    // Saves the name of the active tab to localStorage
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_NAME, name);
    // Saves the file content of the active tab to localStorage
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT, content);
    // Saves the file initial content of the active tab to localStorage
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_INITIAL_CONTENT, initialContent);
  }

  /**
   * Adds a new tab with optional name and content
   */
  function onTabAdd(name, content) {
    // Get the current content of the tabs first from the localStorage
    setTabs(getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST) || []);

    // Sets isSelected of all tabs to be false
    setTabs(tabs =>
      tabs.map(tab =>
        ({ ...tab, isSelected: false })
      )
    );
    
    // Object for the new tab created
    var newTab = {};

    // If there was name and content passed, used it for the newTab
    if (name && content) {
      newTab = {
        name: name,
        content: content,
        initialContent: content,
        isSelected: true, // set it to true, to make it the active tab
        key: Date.now() // generate unique key for each tab
      };
    }
    // If no name, add default name and content
    else {
      newTab = {
        name: generateUniqueTabName(tabs),
        content: "<p></p>",
        initialContent: "<p></p>",
        isSelected: true,
        key: Date.now()
      };
    }

    // Set the active tab to be the newTab
    setActiveTab(newTab.name, newTab.content, newTab.initialContent);
    // Make the content of the tabs to be the previous content, plus the newTab
    setTabs(tabs => [...tabs, newTab]);
    // Enable SaveAs Button
    setEnableSaveAs(true);
  }

  /**
   * Saves the current tab's content
   */
  function onTabSave() {
    setTabs(getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST) || []);
    setTabs(tabs => 
      tabs.map(tab => {
        if (tab.isSelected) {
          setActiveTab(tab.name, tab.content, tab.content);
          // Copies the content of the tab to the initialContent
          return ({ ...tab, initialContent: tab.content });
        }
        return tab;
      })
    );

    setUnsavedChanges(false);
  }

  /**
   * Handles clicking on a tab
   */
  function onTabClick(name) {
    // Get the current content of the tabs first from the localStorage
    setTabs(getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST) || []);
    // Go through each tab and set the isSelected to be true when it matches the name
    setTabs(tabs => 
      tabs.map(tab => {
        var isSelected = tab.name === name;
        if (isSelected) {
          setActiveTab(tab.name, tab.content, tab.initialContent);
        }
        return ({ ...tab, isSelected: isSelected });
      })
    );
  }

  /**
   * Changes the name of a tab
   */
  function onTabChangeName(newName, oldName) {
    // Finds the index of the tab 
    var indexToUpdate = tabs.findIndex(tab => tab.name === oldName);

    // Copies the tabs to updated tabs
    var updatedTabs = [...tabs];

    // Sets the name of the tab to newName
    updatedTabs[indexToUpdate] = { ...updatedTabs[indexToUpdate], name: newName };

    // Save the updatedTabs to tabs
    setTabs(updatedTabs);
  }

  /**
   * Initiates tab close process, checking for unsaved changes
   */
  function onTabDelete(name) {
    const tab = tabs.find(t => t.name === name);
    
    // If tab has unsaved changes, show confirmation
    if (tab && tab.content !== tab.initialContent) {
      setTabToDelete(name);
      setShowCloseConfirmation(true);
    } else {
      // If no unsaved changes, close immediately
      closeTabWithoutSaving(name);
    }
  }
  
  /**
   * Handle confirmation dialog responses
   */
  function handleCloseConfirm() {
    if (tabToDelete) {
      closeTabWithoutSaving(tabToDelete);
      setShowCloseConfirmation(false);
      setTabToDelete(null);
    }
  }
  
  function handleCloseCancel() {
    setShowCloseConfirmation(false);
    setTabToDelete(null);
  }

  /**
   * Actually closes the tab without saving changes
   * This is the original onTabDelete logic
   */
  function closeTabWithoutSaving(tabToDelete) {
    // Finds the index of the tab to be deleted
    var indexToDelete = tabs.findIndex(tab => tab.name === tabToDelete);

    // Holds the boolean if the tab to be deleted is an active tab
    var checkSelected = tabs[indexToDelete].isSelected;

    // Remove the tab
    var newtabs = tabs.filter(tab => tab.name !== tabToDelete);
      
    // Set the next available tab as the active tab
    if(checkSelected) {
      // Set isSelected to next one
      if(newtabs.length === 0) {
        // If there are no tabs left, clear the editor's content
        setActiveTab("", "", "");
      } else if(newtabs.length - 1 >= indexToDelete) {
        // Set isselected of the tab as true
        newtabs[indexToDelete].isSelected = true;
        
        // Set active tab as the next one available
        var nextActiveTab = newtabs[indexToDelete];
        setActiveTab(nextActiveTab.name, nextActiveTab.content, nextActiveTab.initialContent);
      } else {
        // Set isselected of the tab as true
        newtabs[newtabs.length - 1].isSelected = true;
        
        // Set active tab as the last one available
        var lastActiveTab = newtabs[newtabs.length - 1];
        setActiveTab(lastActiveTab.name, lastActiveTab.content, lastActiveTab.initialContent);
      }
    } 

    // Update the tabs
    setTabs(newtabs);
  }
  
  // Update localStorage when tab content changes from editor
  function updateTabContent(content) {
    setTabs(tabs => 
      tabs.map(tab => {
        if (tab.isSelected) {
          return { ...tab, content };
        }
        return tab;
      })
    );
    
    // Check if there are unsaved changes
    const activeTab = tabs.find(tab => tab.isSelected);
    if (activeTab) {
      setUnsavedChanges(activeTab.initialContent !== content);
    }
  }
  
  // Provide tab state and functions to children
  return (
    <TabContext.Provider value={{
      tabs,
      setTabs,
      enableSaveAs,
      unsavedChanges,
      showCloseConfirmation,
      setShowCloseConfirmation,
      tabToDelete,
      handleCloseConfirm,
      handleCloseCancel,
      setActiveTab,
      onTabAdd,
      onTabSave,
      onTabClick,
      onTabChangeName, 
      onTabDelete,
      updateTabContent
    }}>
      {children}
    </TabContext.Provider>
  );
} 