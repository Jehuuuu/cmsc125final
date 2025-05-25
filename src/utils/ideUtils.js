/**
 * 
 * @param {*} key LOCAL_STORAGE_KEY
 * @param {*} value Value to be saved in localStorage
 * @description Saves a value to a key in localStorage
 */
export const setLocalStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

/**
 * 
 * @param {*} key LOCAL_STORAGE_KEY
 * @returns Value of the corresponding key in the localStorage
 * @description Retrieves the value of a key in the localStorage
 */
export const getLocalStorageItem = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error('Error fetching from localStorage:', error);
    return null;
  }
};

/**
 * 
 * @param {*} key LOCAL_STORAGE_KEY 
 * @description Removes a key from the localStorage
 */
export const removeLocalStorageItem = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * @description Removes all keys and value in the localStorage
 */
export const clearLocalStorage = () => {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error removing from localStorage:', error);
  }
};

/**
 * @description Keys in the localStorage
 */
export const LOCAL_STORAGE_KEYS = {
  FILE_NAME: 'ide_file_name', // Name of the active tab
  FILE_CONTENT: 'ide_file_content', // Content of the active tab
  FILE_INITIAL_CONTENT: 'ide_file_initial_content', // Initial content of the active tab
  FILE_LIST: 'ide_file_list' // List of the tabs
};

/**
 * 
 * @param {Array} tabs 
 * @returns Tab name like Untitled, Untitled (1), depending on the exising tab names
 */
export const generateUniqueTabName = (tabs) => {
  let counter = 0;
  let uniqueName = "Untitled";
  
  // Checks if there are tabs that has Untitled, Untitled (1), and so on, for each found, iterate the counter 
  // Define the name generator function outside the loop to fix the ESLint warning
  const generateName = (c) => uniqueName + (c > 0 ? ` (${c})` : '');
  
  while (tabs.some(tab => tab.name === generateName(counter))) {
    counter++;
  }

  // Concatenates Untitled with the counter and the parenthesis
  return generateName(counter);
}

/**
 * 
 * @param {String} input 
 * @returns String that can be used as ID of an HTML tag
 */
export const cleanInputForId = (input) => {
  // Remove any characters that are not alphanumeric, hyphens, or underscores
 try { const cleanedInput = input.replace(/[^\w-]/g, '');

  // Make sure the ID starts with a letter (IDs cannot start with a number)
  const startsWithLetter = /^[a-zA-Z]/.test(cleanedInput);
  if (!startsWithLetter) {
    // Prepend 'id_' if it doesn't start with a letter
    return 'id_' + cleanedInput;
  }

    return cleanedInput;
 } catch (err) {
   console.log(err)
  }
} 