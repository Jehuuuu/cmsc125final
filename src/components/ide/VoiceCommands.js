// import used libraries and components
import React, {useState, useEffect } from 'react';  
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import OnIcon from '@mui/icons-material/Mic';
import OffIcon from '@mui/icons-material/MicOff';
import { commands } from './commands';
import Transcript from './Transcript';

// VoiceCommands component that handles all voice commands and listens for the user's voice input
const VoiceCommands = () => {
  const [isListening, setIsListening] = useState(false); //initialize state variables
  const [script, setScript] = useState('');

  // use speech recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // effect hook to handle transcript changes
  // only takes the transcript between 'honey' and 'please' 
  // and saves it as script
  useEffect(() => {
    if (transcript.includes('please')) {
      setIsListening(false);
      setScript(transcript.replace('please', '').toLowerCase());
      resetTranscript();
    }


    if(transcript.includes('honey')) {
      setIsListening(true);
      resetTranscript();
    }

  }, [transcript, resetTranscript]);

  // takes the script taken between 'honey' and 'please' 
  // and executes the command.
    useEffect(() => {
      let matched = false;
      commands.forEach(({ command, callback }) => {
        if (script.toLowerCase().includes(command)) {
          callback();
          speak(`Okay, I have executed the command: ${command}`);
          matched = true;
        }
      });
    
      if (!matched && script) {
        speak("Sorry, I didn't recognize that command.");
      }
    }, [script]);
  

  // effect hook to handle typing in text editor
  useEffect(() => {
    if(script.includes('type this')) { // check for 'type this' in script
      const text = script.replace('type this', ''); // if true, remove 'type this' and store the text that follows

      const btn = document.getElementById('MENU-TYPE');

      // add text to text editor though hidden button
      btn.dataset.text = text;
      btn.click();
    }
  }, [script]);

/* effect hook to monitor listening state
   if not listening, start SpeechRecognition.
   autostart set to true to automatically start speech recognition on page load
   continuous set to true for continuous listening */
  useEffect(() => {
    if(!listening) 
      SpeechRecognition.startListening({ autoStart: true, continuous: true });
  }, [listening]);

  // if browser does not support speech recognition, return a message
  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  // Speak back using Web Speech API
  const speak = (message) => {
    const utterance = new SpeechSynthesisUtterance(message);
    speechSynthesis.speak(utterance);
  };

  const toggleListening = () => {
    setIsListening(prevState => {
      const newState = !prevState;
      speak(newState ? "Listening activated." : "Listening paused.");
      return newState;
    });
  };
  
  // render the voice commands container
  return (
    <div className='voice-cont'>
        {/* displays command output if command is detected
          if not, display 'Say something...' */}
        <Transcript transcript={script || 'Say something...'}/>
      
      {/* button to toggle listening state */}
      <button onClick={toggleListening} className='mic-icon'>
        {isListening ?
          <OnIcon fontSize='large' /> : 
          <OffIcon fontSize='large' />}
      </button>
    </div>
  );
};

// export component
export default VoiceCommands; 