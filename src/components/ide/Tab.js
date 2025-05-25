import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';
import { cleanInputForId, getLocalStorageItem, LOCAL_STORAGE_KEYS } from "../../utils/ideUtils"

export default function Tab({ name, isSelected, onTabDelete, onTabChangeName, onTabClick, hasUnsavedChanges, id, unsavedChanges}) {
  const [tabName, setTabName] = useState(name);
  const [error, setError] = useState(false);

  /* This function handles renaming of the tab. */
  const handleChange = (e) => {
    setTabName(e.target.value);
  };

  /**
   * This function handles the onBlur event for the tab name input field.
   * It first retrieves the list of tabs from local storage.
   * Then, it checks if there is another tab with the same name and a different id.
   * If such a tab exists, it sets an error state, resets the tab name after a delay, and clears the error state.
   * If no such tab exists, it calls the onTabChangeName callback with the new tab name and clears the error state.
   */
  const handleBlur = () => {
    var tabs = getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST)
    if (tabs.some(tab => tab.name === tabName && tab.key !== id)) {
      setError(true)
      setTimeout(() => {
        setTabName(name)
        setError(false)
      }, 1500)
    } else {
      onTabChangeName(tabName);
      setError(false)
    }
  };

  return (
     /**
     * The div's class depends whether the tab is selected or not.
     * The tab name input field is rendered as read-only if the tab is not selected.
     * Error message is displayed if the tab name is already used.
     * The tab close container is rendered with a close icon.
     * When the close icon is clicked, the onTabDelete prop is called.
     */
    <div className={isSelected ? "tab-container-active" : "tab-container-inactive"}>
      <div className="tab-name-cont " onClick={onTabClick} id={"TAB-CONTAINER-" + cleanInputForId(tabName)}>
      {error && <span className='tab-name-error'>Name already used.</span>}
        <input
          id={"TAB-INPUT-"+cleanInputForId(tabName)}
          value = {tabName}
          type = "text"
          readOnly={!isSelected}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`${isSelected ? "tab-name-input-editable" : "tab-name-input-readonly"} ${(hasUnsavedChanges||(unsavedChanges && tabName==getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_NAME))) ? "italicize" : ""}`}
        />
      </div>
      <div className="tab-close-cont" onClick={onTabDelete} id={"TAB-CLOSE-"+cleanInputForId(tabName)}>
        <CloseIcon className="tab-close" fontSize='small' />
        <span className="tab-close-label">Close</span>
      </div>
    </div>
  )
} 