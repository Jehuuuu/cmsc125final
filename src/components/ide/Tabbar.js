import React, { useState, useRef, useEffect, useContext } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DescriptionIcon from '@mui/icons-material/Description';
import JavascriptIcon from '@mui/icons-material/Javascript';
import HtmlIcon from '@mui/icons-material/Html';
import CssIcon from '@mui/icons-material/Css';
import CodeIcon from '@mui/icons-material/Code';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import Tooltip from '@mui/material/Tooltip';
import { TabContext } from '../../utils/TabContext';
import TextEditor from './TextEditor';
import Modal from './Modal/Modal';

/**
 * 
 * @description React Functional Component for the Tabbar
 * It displays tabs that represent opened files
 * Each tab has an icon and a name that can be edited and a close button to close it
 */
export default function Tabbar() {
  
  const { 
    tabs,
    onTabDelete,
    onTabAdd,
    onTabChangeName,
    onTabClick,
    unsavedChanges,
    showCloseConfirmation,
    tabToDelete,
    handleCloseConfirm,
    handleCloseCancel
  } = useContext(TabContext);

  // For storing active edits
  const [editingTabName, setEditingTabName] = useState(null);
  const [newTabName, setNewTabName] = useState("");

  // Track if a tab name already exists
  const [tabNameError, setTabNameError] = useState(false);
  
  // For tab width handling
  const tabsContainerRef = useRef(null);
  const tabRefs = useRef({});
  const [tabWidths, setTabWidths] = useState({});
  const [isIconOnly, setIsIconOnly] = useState({});

  /**
   * Get the appropriate icon for a file based on its name/extension
   * @param {string} fileName - The name of the file
   * @returns {JSX.Element} - The icon component to display
   */
  const getFileIcon = (fileName) => {
    if (!fileName) return <DescriptionIcon />;
    
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.endsWith('.js') || lowerName.endsWith('.jsx')) {
      return <JavascriptIcon />;
    } else if (lowerName.endsWith('.html')) {
      return <HtmlIcon />;
    } else if (lowerName.endsWith('.css')) {
      return <CssIcon />;
    } else if (lowerName.endsWith('.json') || lowerName.endsWith('.ts') || 
               lowerName.endsWith('.tsx') || lowerName.endsWith('.py')) {
      return <CodeIcon />;
    } else if (lowerName.endsWith('.txt') || lowerName.endsWith('.md')) {
      return <TextSnippetIcon />;
    }
    
    return <DescriptionIcon />;
  };

  /**
   * Handle tab resize and calculate widths
   */
  useEffect(() => {
    if (!tabs || tabs.length === 0) return;
    
    const handleTabsResize = () => {
      if (!tabsContainerRef.current) return;
      
      const containerWidth = tabsContainerRef.current.clientWidth;
      const addBtnWidth = 50; // Estimated width of add button
      
      // Space available for tabs
      let availableSpace = containerWidth - addBtnWidth;
      
      // Tab width thresholds
      const maxTabWidth = 180; // Maximum tab width
      const minTabWidth = 120; // Minimum width before compressing to text+icon
      const iconOnlyWidth = 42; // Width when showing only icon
      
      // Calculate ideal tab width based on available space
      let tabWidth = Math.min(maxTabWidth, availableSpace / tabs.length);
      
      // Determine if we need to compress to icon-only mode
      const newTabWidths = {};
      const newIsIconOnly = {};
      
      if (tabWidth < iconOnlyWidth) {
        // Not enough space, all tabs need to be icon-only
        const calcWidth = Math.max(iconOnlyWidth, availableSpace / tabs.length);
        tabs.forEach(tab => {
          newTabWidths[tab.key] = calcWidth;
          newIsIconOnly[tab.key] = true;
        });
      } else if (tabWidth < minTabWidth) {
        // Medium space, some tabs need to be icon-only
        // Prioritize showing active tab as full width
        const fullTabsCount = Math.floor(availableSpace / minTabWidth);
        
        if (fullTabsCount > 0) {
          const activeTabIndex = tabs.findIndex(tab => tab.isSelected);
          
          tabs.forEach((tab, index) => {
            if (tab.isSelected || (fullTabsCount > 1 && index < fullTabsCount - 1)) {
              newTabWidths[tab.key] = minTabWidth;
              newIsIconOnly[tab.key] = false;
            } else {
              newTabWidths[tab.key] = iconOnlyWidth;
              newIsIconOnly[tab.key] = true;
            }
          });
        } else {
          // All tabs need to be icon-only
          tabs.forEach(tab => {
            newTabWidths[tab.key] = iconOnlyWidth;
            newIsIconOnly[tab.key] = true;
          });
        }
      } else {
        // All tabs can be shown with text
        tabs.forEach(tab => {
          newTabWidths[tab.key] = tabWidth;
          newIsIconOnly[tab.key] = false;
        });
      }
      
      setTabWidths(newTabWidths);
      setIsIconOnly(newIsIconOnly);
    };

    handleTabsResize();
    window.addEventListener('resize', handleTabsResize);
    
    return () => {
      window.removeEventListener('resize', handleTabsResize);
    };
  }, [tabs]);

  /**
   * 
   * @param {String} name Name of the tab to be edited
   * @description Sets the initial value of the tab name when editing
   */
  function handleEditTabName(name) {
    setEditingTabName(name)
    setNewTabName(name)
  }

  /**
   * @description Applies the new name to the tab
   */
  function handleSaveTabName() {
    // Check if the tab name is already in use
    const isTabNameInUse = tabs && tabs.find(tab => tab.name === newTabName && tab.name !== editingTabName);

    if (isTabNameInUse) {
      // If the tab name is already in use, set an error flag
      setTabNameError(true);
    }
    else {
      // If the tab name is not in use, or is the same as before, update it
      if(newTabName !== editingTabName)
        onTabChangeName(newTabName, editingTabName)
      setEditingTabName(null)
      setTabNameError(false);
    }
  }

  // Use useRef to track input element
  const inputRef = useRef(null);

  // when editingTabName changes, focus input if editingTabName is not null
  useEffect(() => {
    if (editingTabName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.selectionStart = 0;
      inputRef.current.selectionEnd = newTabName.length;
    }
  }, [editingTabName, newTabName]);

  // when clicking outside the tab name input, save the tab name
  useEffect(() => {
    function handleClickOutside(event) {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
        handleSaveTabName();
      }
    }

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [inputRef, handleSaveTabName]);
  
  return (
    <div className="tabcont-container">
      <div className="tabs-container" ref={tabsContainerRef}>
        <div className="chrome-tabs-area">
          {/* Render tabs */}
          {tabs && tabs.map(tab => (
            <Tooltip 
          key={tab.key}
              title={tab.name}
              placement="bottom"
              arrow
            >
              <div 
                className={`dynamic-tab ${tab.isSelected ? 'dynamic-tab-active' : 'dynamic-tab-inactive'} ${isIconOnly[tab.key] ? 'icon-only-tab' : 'text-tab'}`} 
                onClick={() => tab.isSelected ? null : onTabClick(tab.name)}
                ref={el => tabRefs.current[tab.key] = el}
                onDoubleClick={() => tab.isSelected && handleEditTabName(tab.name)}
                style={{ width: tabWidths[tab.key] ? `${tabWidths[tab.key]}px` : 'auto' }}
              >
                <div className="tab-icon-cont">
                  {getFileIcon(tab.name)}
                  {tab.content !== tab.initialContent && <span className="tab-unsaved-dot"></span>}
                </div>
                
                {!isIconOnly[tab.key] && (
                  <div className="tab-name-cont">
                    {editingTabName === tab.name ? 
                      <input
                        ref={inputRef}
                        value={newTabName}
                        onChange={(e) => setNewTabName(e.target.value)}
                        onBlur={handleSaveTabName}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTabName()}
                        className="tab-input-edit"
                      />
                    :
                      <div className="tab-name">
                        {tab.name}
                        {tabNameError && editingTabName === tab.name && <p className="tab-name-error">Name exists</p>}
                      </div>
                    }
                  </div>
                )}
                
                {/* Edit overlay only shown when editing */}
                {editingTabName === tab.name && isIconOnly[tab.key] && (
                  <div className="tab-edit-overlay">
                    <input
                      ref={inputRef}
                      value={newTabName}
                      onChange={(e) => setNewTabName(e.target.value)}
                      onBlur={handleSaveTabName}
                      onKeyDown={(e) => e.key === 'Enter' && handleSaveTabName()}
                      className="tab-input-edit"
                    />
                    {tabNameError && <p className="tab-name-error">Tab name already exists</p>}
                  </div>
                )}
                
                <div className="tab-close-cont">
                  <CloseIcon className='tab-close' onClick={(e) => {e.stopPropagation(); onTabDelete(tab.name)}} />
                </div>
              </div>
            </Tooltip>
          ))}
          
          {/* Add button */}
          <div className="tab-add-cont">
            <AddIcon className='add-icon' onClick={() => onTabAdd()} />
          </div>
        </div>
      </div>
      
      {/* Include TextEditor component inside the tabcont-container */}
      <div className="editor-wrapper">
        <TextEditor />
      </div>

      {/* Unsaved Changes Confirmation Modal */}
      <Modal
        isOpen={showCloseConfirmation}
        onClose={handleCloseCancel}
        headerText="Unsaved Changes"
        content={
          <p style={{ 
            fontSize: '16px', 
            marginBottom: '25px',
            marginTop: '15px',
            lineHeight: '1.5',
            padding: '0 10px'
          }}>
            The file <strong>"{tabToDelete}"</strong> has unsaved changes. Do you want to close it without saving?
          </p>
        }
        buttonText1="Cancel"
        buttonText2="Close without saving"
        onCancel={handleCloseCancel}
        onConfirm={handleCloseConfirm}
      />
    </div>
  );
} 