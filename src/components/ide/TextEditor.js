// import necessary libraries and components for the text editor
import { useEditor, EditorContent } from "@tiptap/react";
import { useState, useEffect, useContext } from "react";
import BlobImg from '../../images/ide/welcome.png';
import StarterKit from "@tiptap/starter-kit";
import TextAlign from '@tiptap/extension-text-align';
import ListItem from "@tiptap/extension-list-item";
import TextStyle from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Placeholder from '@tiptap/extension-placeholder';
import History from '@tiptap/extension-history';

// import local files and components
import { LOCAL_STORAGE_KEYS, getLocalStorageItem, setLocalStorageItem } from "../../utils/ideUtils";
import { TabContext } from "../../utils/TabContext";
import { EditorContext } from "../../utils/EditorContext";

/**
 * 
 * @description React Functional Component for the Text Editor
 * It uses the EditorProvider component from the 'tiptap' library to create a rich text editor
 * @param {Object} transcript - the transcript object containing the text content
 * @returns JSX element
 */
export default function TextEditor({ transcript }) {
  // Get tab context
  const { tabs, updateTabContent } = useContext(TabContext);
  // Get editor context
  const { setEditor: setEditorContext } = useContext(EditorContext);
  
  // react hook to set the initial state of the editor
  const [isEmpty, setIsEmpty] = useState(true);

  // Initialize editor with extensions
  const editor = useEditor({
    extensions: [
    Color.configure({ types: [TextStyle.name, ListItem.name] }),
    TextStyle.configure({ types: [ListItem.name] }),
    StarterKit.configure({
      history: false, // Disable the default history that comes with StarterKit
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
    TextAlign.configure({
      types: ['heading', 'paragraph'],
      alignments: ['left', 'center', 'right', 'justify'],
      defaultAlignment: 'left',
    }),
    History.configure({
      depth: 100,
      newGroupDelay: 500,
    }),
    ],
    content: getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT),
    onUpdate: ({ editor, transaction }) => {
      // Skip if we're updating from a tab change
      if (window.__updatingTabContent) return;
      
      const content = editor.getHTML();
      
      // Save content to localStorage 
      setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT, content);
      
      // Update tab content through context
      updateTabContent(content);
      
      // Log history state
      console.log('Update: Can redo after update:', editor.can().redo());
    }
  });
  
  // Set editor in the context when it's available
  useEffect(() => {
    if (editor) {
      setEditorContext(editor);
      
      // Add debug logging for undo/redo state
      editor.on('update', () => {
        console.log('Can undo:', editor.can().undo());
        console.log('Can redo:', editor.can().redo());
      });
    }
  }, [editor, setEditorContext]);
  
  // fetch fileList and update isEmpty to show welcome, honey in the editor
  useEffect(() => {
    const fetchFileList = () => {
      // check if there are tabs that are active in the editor
      if (tabs && tabs.length > 0) {
        setIsEmpty(false);
      } else {
        setIsEmpty(true);
      }
    };
  
    fetchFileList(); // call fetchFileList immediately
  }, [tabs]); 

  // Store file_list string in a variable to fix the ESLint warning
  const [showBlob, setShowBlob] = useState(false);
  useEffect(() => {
    if(tabs.length === 0) {
      setShowBlob(true);
    } else {
      setShowBlob(false);
    }
  }, [tabs]);
  
  // Update editor content when tabs change
  useEffect(() => {
    if (!editor) return;
    
    const activeTab = tabs.find(tab => tab.isSelected);
    
    // Only update content if the current content differs from tab content
    // This preserves the history stack
    const currentContent = editor.getHTML();
    const tabContent = activeTab ? activeTab.content : '';
    
    // Skip setting content if we're just returning to the same tab
    // or if content is identical to preserve history stack
    if (currentContent !== tabContent) {
      console.log("Setting content from tab, preserving history");
      
      // Use a special flag to track whether we're setting content from a tab change
      // so we don't mess up the redo stack
      window.__updatingTabContent = true;
      
      // Use chain API with preserveHistory option
      editor.commands.setContent(tabContent || '', {
        preserveHistory: true
      });
      
      window.__updatingTabContent = false;
    }
  }, [editor, tabs]);

  return (
  // use css first-open if no active tab
  <div className={`editor-cont ${isEmpty ? 'first-open' : ''}`}>
      {/* The editor container where TipTap will mount */}
      <div className="editor-container">
        {/* EditorContent will mount TipTap directly here */}
        <EditorContent editor={editor} />
      </div>
      
      {showBlob && 
        <div className="welcome-image-container">
          <img src={BlobImg} alt="Darling IDE" className="text-editor-blob" /> 
        </div>
      }
    </div>
  );
} 