// imports
import React, { useEffect, useState } from 'react';
import '../styles/ide.css';
import Guide from '../components/ide/Guide';
import Menubar from '../components/ide/Menubar';
import Toolbar from '../components/ide/Toolbar';
import Tabbar from '../components/ide/Tabbar';
import VoiceCommands from '../components/ide/VoiceCommands';
import IDEVoiceGuide from '../components/ide/VoiceGuide';
import WelcomeScreen from '../components/ide/WelcomeScreen';
import HeaderImg from '../images/ide/header.png';
import { LOCAL_STORAGE_KEYS, getLocalStorageItem, setLocalStorageItem } from '../utils/ideUtils';
import { TabProvider } from '../utils/TabContext';
import { EditorProvider } from '../utils/EditorContext';
import { useNavigate } from 'react-router-dom';
import Tooltip from '@mui/material/Tooltip';
import { Toaster } from 'react-hot-toast';

/**
 * 
 * @returns Main IDE component of the application
 */
function IDE() {
  const navigate = useNavigate();
  
  // Function to navigate back to scheduling
  const handleBackToScheduling = () => {
    navigate('/');
  };

  // a react hook component to set the initial file content and file list
  useEffect(() => {
    // fetch the stored file content
    const storedFileContent = getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_CONTENT);

    // if there is a stored file content, set it to the initial content
    if (storedFileContent) {
      setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_INITIAL_CONTENT, storedFileContent)
    }

    // fetch the stored file list
    const fileList = getLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST)
    
    // if there is no file list, create an empty file list 
    if (!fileList) {
      setLocalStorageItem(LOCAL_STORAGE_KEYS.FILE_LIST, [])
    }
  }, []);
  
  // initialize welcome screen component
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

  // make the welcome screen component appear for 15 seconds
  useEffect(() => {
    // after 15 seconds, record locally that welcome screen has been shown 
    // to avoid showing it again when the user refreshes
    const timer = setTimeout(() => {
      setShowWelcomeScreen(false); 
      localStorage.setItem('ide_show_welcome_screen', 'true'); 
    }, 15000);
    return () => clearTimeout(timer); 
  }, [showWelcomeScreen]);

  if (localStorage.getItem('ide_show_welcome_screen') === null){
    return <WelcomeScreen />;
  }

  return (
    <EditorProvider>
      <TabProvider>
    <div className="ide-container">
      {/* holds the left components of the screen */}
      <div className='ide-left-component'>
        {/* logo - made clickable to return to scheduling */}
        <div 
          className="logo-container" 
          onClick={handleBackToScheduling}
          role="button"
          aria-label="Back to Scheduling"
          tabIndex={0}
        >
          <Tooltip title="Back to Scheduling" arrow placement="right">
            <img src={HeaderImg} alt="darling" className='ide-logo' />
          </Tooltip>
        </div>

        {/* guide */}
        <Guide />
        
        {/* Voice Commands Guide */}
        <IDEVoiceGuide />
      </div>

        {/* holds the right components of the screen */}
        <div className='ide-right-component'>
            {/* Controls container with menubar and toolbar */}
            <div className="controls-container">
              <Menubar />
              <Toolbar />
            </div>

            {/* Content container with Tabbar (which now includes TextEditor) */}
            <div className="content-container">
              <Tabbar />
            </div>

            {/* voice commands remain outside the containers */}
          <VoiceCommands />
        </div>
    </div>
    
    {/* Toast notifications for voice command feedback */}
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#FEFAE0',
          color: '#552C08',
          border: '2px solid #DDA15E',
          borderRadius: '12px',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: '500'
        },
        success: {
          style: {
            background: 'linear-gradient(135deg, #ECD9B9 0%, #DDBB99 100%)',
            border: '2px solid #C19A6B'
          }
        },
        error: {
          style: {
            background: 'linear-gradient(135deg, #FEFAE0 0%, #ECD9B9 100%)',
            border: '2px solid #AC9B85'
          }
        }
      }}
    />
      </TabProvider>
    </EditorProvider>
  );
}

export default IDE; 