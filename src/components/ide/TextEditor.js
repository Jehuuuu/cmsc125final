// import necessary libraries and components for the text editor
import ListItem from "@tiptap/extension-list-item"
import Placeholder from '@tiptap/extension-placeholder';
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { EditorProvider } from "@tiptap/react";
import { useState, useEffect } from "react";
import BlobImg from '../../images/ide/welcome.png';
import TextAlign from '@tiptap/extension-text-align'; // Import text alignment extension

// import local files and components
import Header from "./Header";
import { LOCAL_STORAGE_KEYS, getLocalStorageItem, setLocalStorageItem } from "../../utils/ideUtils";

/**
 * 
 * @description React Functional Component for the Text Editor
 * It uses the EditorProvider component from the 'tiptap' library to create a rich text editor
 * @param {Object} transcript - the transcript object containing the text content
 * @returns JSX element
 */
export default function TextEditor({ transcript }) {
// 'extensions' constant is an array of configurations for the EditorProvider component from the 'tiptap' library
// each configuration in the array is an extension that adds or modifies functionality in the editor
// 'Color' extension is configured to apply to 'TextStyle' and 'ListItem' types
// 'TextStyle' extension is configured to apply to 'ListItem' type
// 'StarterKit' extension is configured to modify the behavior of bullet lists and ordered lists
// for both bullet lists and ordered lists, 'keepMarks' is set to true, meaning text formatting (like bold or italic) 
// will be kept when creating a new list item
// 'keepAttributes' is set to false, meaning other attributes (like link URLs) 
// will not be kept when creating a new list item.
  const extensions = [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ types: [ListItem.name] }),
    StarterKit.configure({
      bulletList: {
        keepMarks: true,
        keepAttributes: false,
      },
      orderedList: {
        keepMarks: true,
        keepAttributes: false,
      },
    }),
    Placeholder.configure({
      placeholder: 'Write content here'
    }),
    TextAlign.configure({ // Add this configuration for text alignment
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    }),
  ];

  // react hook to set the initial state of the editor
  const [isEmpty, setIsEmpty] = useState(true);

  // function to call when EditorProvider => {editor} param is updated/changed
  const onUpdate = ({ editor }) => {
    
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT, editor.getHTML()); // saving the editor's content to local storage
    
    var fileList = getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST); // get the list of files from local storage

    var fileName = getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_NAME); // get the current file name from local storage
    
    // map function to create new array by iterating through each item in fileList array
    var updatedFileList = fileList.map(tab => {
      // if the name of the current item (tab) matches the fileName
      if (tab.name === fileName) {
        var newContent = { // create a new object with the updated content of the editor
          ...tab,
          content: editor.getHTML()
        }
        return newContent; // return the new object
      } else {
        return tab; // otherwise, return the current item (tab)
        };
    });
    setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST, updatedFileList); // save the updated file list to local storage
  }
  
  // fetch fileList and update isEmpty to show welcome, honey in the editor
  useEffect(() => {
    const fetchFileList = () => {
      // check if there are tabs that are active in the editor
      var fileList = getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST);
      if (fileList && fileList.length > 0) {
        setIsEmpty(false);
      } else {
        setIsEmpty(true);
      }
    };
  
    fetchFileList(); // call fetchFileList immediately
    const intervalId = setInterval(fetchFileList, 50); // set an interval to call fetchFileList every 50 milliseconds
    return () => clearInterval(intervalId); // clear the interval when the component unmounts
  }, []); 

  // Store file_list string in a variable to fix the ESLint warning
  const [showBlob, setShowBlob] = useState(false);
  useEffect(() => {
    const fileListString = localStorage.getItem("ide_file_list");
    if(fileListString === "[]") {
      setShowBlob(true);
    } else {
      setShowBlob(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  // Check file list changes
  useEffect(() => {
    const checkFileList = () => {
      const fileListString = localStorage.getItem("ide_file_list");
      if(fileListString === "[]") {
        setShowBlob(true);
      } else {
        setShowBlob(false);
      }
    };
    
    const intervalId = setInterval(checkFileList, 500);
    return () => clearInterval(intervalId);
  }, [])

  return (
  // use css first-open if no active tab
  <div className={`editor-cont ${isEmpty ? 'first-open' : ''}`}>
      {/* EditorProvider component with the following props */}
      <EditorProvider
        slotBefore={<Header />} // render Header component before the editor
        extensions={extensions} // add functionality to the editor
        content={getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT)} // get the content from local storage
        onUpdate={editor => onUpdate(editor)} // call the onUpdate function when the editor is updated
      ></EditorProvider>
      {showBlob ?
      <img src={BlobImg} alt="Darling IDE" className="text-editor-blob" /> 
      : null} 
    </div>
  );
} 