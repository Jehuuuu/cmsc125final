// imports
import React, { useEffect, useState } from 'react';
import '../styles/ide.css';
import Guide from '../components/ide/Guide';
import Header from '../components/ide/Header';
import TextEditor from '../components/ide/TextEditor';
import VoiceCommands from '../components/ide/VoiceCommands';
import WelcomeScreen from '../components/ide/WelcomeScreen';
import HeaderImg from '../images/ide/header.png';
import { LOCAL_STORAGE_KEYS, getLocalStorageItem, setLocalStorageItem } from '../utils/ideUtils';
import { useNavigate } from 'react-router-dom';

/**
 * 
 * @returns Main IDE component of the application
 */
function IDE() {
  const navigate = useNavigate();
  
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

  const handleBackToScheduling = () => {
    navigate('/schedule');
  };

  return (
    <div className="ide-container">
      {/* Back button */}
      <button 
        onClick={handleBackToScheduling}
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          backgroundColor: '#552C08',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif'
        }}
      >
        ← Back to Scheduling
      </button>

      {/* holds the left components of the screen */}
      <div className='ide-left-component'>
        {/* logo */}
        <img src={HeaderImg} alt="darling" className='ide-logo' />

        {/* guide */}
        <Guide />
      </div>
        

        {/* holds the right components of the screen */}
        <div className='ide-right-component'>
          {/* contains toolbar and menubar */}
          <Header />

          {/* text editor */}
          <TextEditor />

          {/* voice commands */}
          <VoiceCommands />
        </div>
    </div>
  );
}

export default IDE; 