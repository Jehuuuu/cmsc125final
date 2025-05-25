// useState is used for handling reactive states in ReactJS and useEffect is used for handling side effects. Both are built-in functionalities provided by React.
import { useEffect, useState } from "react";

// Icon for adding tabs
import AddIcon from '@mui/icons-material/Add';

// Component for each Tab
import Tab from "./Tab";

/**
 * 
 * @description React Functional Component for the Tab Bar 
 * @prop {Array} Tabs List of Tabs
 * @prop {Function} onTabDelete Function for deleting a tab
 * @prop {Function} onTabAdd Function for adding a tab
 * @prop {Function} onTabChangeName Function for changing a tab's name
 * @prop {Function} onTabClick Function for clicking a tab
 */
export default function Tabbar({ tabs, onTabDelete, onTabAdd, onTabChangeName, onTabClick, unsavedChanges }) {
  return (
    <div className="tabcont-container">
      {/* Iterates through each tab to render the tab component */}
      {tabs && tabs.map((tab) => {
        return <Tab
          key={tab.key}
          id={tab.key}
          name={tab.name}
          hasUnsavedChanges={tab.content !== tab.initialContent}
          unsavedChanges={unsavedChanges}
          isSelected={tab.isSelected}
          onTabDelete={() => onTabDelete(tab.name)}
          onTabChangeName={(newName) => onTabChangeName(newName, tab.name)}
          onTabClick={() => onTabClick(tab.name)}
        />;
      })}
      {/* Add Icon for adding new tab */}
      <div className="tab-add-cont" id="TAB-ADD" onClick={onTabAdd}>
        <AddIcon fontSize="small" className="add-icon" />
        <span className="tab-add-label">Add</span>
      </div>
    </div>
  );
} 