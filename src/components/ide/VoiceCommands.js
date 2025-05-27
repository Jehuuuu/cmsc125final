// import used libraries and components
import React, {useState, useEffect } from 'react';  
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import MicOn from '@mui/icons-material/MicNoneOutlined';
import MicOff from '@mui/icons-material/MicOffOutlined';
import VolumeUp from '@mui/icons-material/VolumeUp';
import VolumeOff from '@mui/icons-material/VolumeOff';
import { commands } from './commands';
import toast from 'react-hot-toast';
import './VoiceCommands.css';

/**
 * Enhanced VoiceCommands component with improved visual feedback and functionality
 * @description VoiceCommands component that handles all voice commands and 
 * listens for the user's voice input with enhanced UI and better speech recognition
 */
const VoiceCommands = () => {
  const [isListening, setIsListening] = useState(false);
  const [willCall, setWillCall] = useState(false);
  const [script, setScript] = useState('');
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [commandHistory, setCommandHistory] = useState([]);
  const [lastExecutedCommand, setLastExecutedCommand] = useState(null);
  const [lastExecutionTime, setLastExecutionTime] = useState(0);

  // Function to reset command state
  const resetCommandState = () => {
    setScript('');
    setWillCall(false);
    setIsListening(false);
    setShowTranscript(false);
    setCurrentTranscript('');
  };

  // use speech recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // function to speak the text with enhanced voice options
  const speak = (text, options = {}) => {
    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Enhanced voice configuration
    const voices = synth.getVoices();
    const selectedVoice = voices.find(voice => 
      voice.name === 'Microsoft Zira - English (United States)' ||
      voice.name.includes('Google') ||
      voice.lang.includes('en')
    );
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Voice customization
    utterance.rate = options.rate || 0.9;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 0.8;
    
    synth.speak(utterance);
  };

  // Update current transcript and show/hide indicator
  useEffect(() => {
    setCurrentTranscript(transcript);
    if (transcript.trim()) {
      setShowTranscript(true);
      // Hide transcript after 3 seconds of no new speech
      const timer = setTimeout(() => {
        if (transcript === currentTranscript) {
          setShowTranscript(false);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [transcript, currentTranscript]);

  /**
   * Enhanced effect hook to handle transcript changes
   * Supports multiple wake words and better command parsing
   */
  useEffect(() => {
    const lowerTranscript = transcript.toLowerCase();

    // Multiple wake word support
    const wakeWords = ['honey', 'darling', 'ide'];
    const endWords = ['please', 'thanks', 'thank you'];

    // Check for wake words (only if not already listening)
    if (!isListening && wakeWords.some(word => lowerTranscript.includes(word))) {
      setIsListening(true);
      setWillCall(true);
      console.log("Command mode activated");
      resetTranscript();
      speak("Yes, I'm listening!", { pitch: 1.1 });
      toast.success("Voice command mode activated");
    }

    // Check for end words
    if (endWords.some(word => lowerTranscript.includes(word)) && isListening) {
      setIsListening(false);
      console.log("Command mode deactivated");
      
      // Extract command (remove wake words and end words)
      let cleanScript = lowerTranscript;
      wakeWords.forEach(word => {
        cleanScript = cleanScript.replace(new RegExp(word, 'gi'), '');
      });
      endWords.forEach(word => {
        cleanScript = cleanScript.replace(new RegExp(word, 'gi'), '');
      });
      
      const finalScript = cleanScript.trim();
      if (finalScript) {
        setScript(finalScript);
        speak("Command received!", { pitch: 0.9 });
      }
      resetTranscript();
    }
  }, [transcript, resetTranscript]);

  // Enhanced greeting and help commands
  useEffect(() => {
    const lowerTranscript = transcript.toLowerCase();

    if (lowerTranscript.includes('hello') || lowerTranscript.includes('hi')) {
      speak("Hello! I'm your IDE voice assistant. Say 'honey help please' for available commands.");
      toast("👋 Hello! Voice assistant ready");
      resetTranscript();
    }

    if (lowerTranscript.includes('help') && lowerTranscript.includes('please')) {
      speak("I can help you with file operations, editing, formatting, and navigation. Try saying 'honey new file please' or 'honey save file please'.");
      toast.success("📋 Voice commands available - check the guide!");
      resetTranscript();
    }

    // Voice command for showing available commands
    if (lowerTranscript.includes('show commands') || lowerTranscript.includes('list commands')) {
      showAvailableCommands();
      resetTranscript();
    }
  }, [transcript]);

  // Function to show available commands
  const showAvailableCommands = () => {
    const commandCategories = [
      "File operations: new file, open file, save file",
      "Editing: undo, redo, cut, copy, paste, select all",
      "Formatting: bold, italic, code, bullets, numbers",
      "Navigation: new tab, close tab, zoom in, zoom out"
    ];
    
    speak("Available command categories: " + commandCategories.join(". "));
    toast.success("🎤 Voice commands listed");
  };

  /**
   * Enhanced command execution with better error handling and feedback
   */
  useEffect(() => {
    if (!script || !willCall) return;

    let commandExecuted = false;
    let executedCommand = '';

    // Find the best matching command (longest match first to avoid partial matches)
    const sortedCommands = [...commands].sort((a, b) => b.command.length - a.command.length);
    
    for (const { command, callback } of sortedCommands) {
      if (script.includes(command) && !commandExecuted) {
        // Prevent duplicate commands within 2 seconds
        const now = Date.now();
        if (lastExecutedCommand === command && (now - lastExecutionTime) < 2000) {
          console.log("Ignoring duplicate command:", command);
          commandExecuted = true;
          break;
        }

        console.log("Executing command:", command);
        try {
          callback();
          commandExecuted = true;
          executedCommand = command;
          
          // Update last executed command tracking
          setLastExecutedCommand(command);
          setLastExecutionTime(now);
          
          // Add to command history
          setCommandHistory(prev => [
            ...prev.slice(-9), // Keep last 9 commands
            { command, timestamp: new Date().toLocaleTimeString() }
          ]);
          
          // Enhanced success feedback
          toast.success(`✅ ${command.charAt(0).toUpperCase() + command.slice(1)} executed`);
          speak(`${command} completed successfully!`, { pitch: 1.1 });
          
          break; // Exit loop after first successful command
        } catch (error) {
          console.error("Command execution error:", error);
          toast.error(`❌ Failed to execute ${command}`);
          speak(`Sorry, I couldn't execute ${command}. Please try again.`);
          break;
        }
      }
    }

    // Handle typing command with enhanced text processing
    if (!commandExecuted && (script.includes('type this') || script.includes('write this') || script.includes('insert'))) {
      handleTextInsertion(script);
      commandExecuted = true;
    }

    // Handle unrecognized commands
    if (!commandExecuted && script.trim()) {
      console.log("Unrecognized command:", script);
      toast.error("❓ Command not recognized");
      speak("Sorry, I didn't recognize that command. Try saying 'honey help please' for available commands.");
    }

    // Clear the script and willCall state to prevent repetition
    const clearTimer = setTimeout(() => {
      resetCommandState();
    }, 100);

    return () => clearTimeout(clearTimer);
  }, [script, willCall]);

  // Enhanced text insertion with better parsing
  const handleTextInsertion = (script) => {
    const triggers = ['type this', 'write this', 'insert'];
    let text = script;
    
    // Remove trigger words
    triggers.forEach(trigger => {
      text = text.replace(trigger, '');
    });
    
    text = text.trim();
    
    if (text) {
      const btn = document.getElementById('MENU-TYPE');
      if (btn) {
        btn.dataset.text = text;
        btn.click();
        toast.success(`📝 Inserted: "${text}"`);
        speak("Text inserted successfully!");
      } else {
        toast.error("❌ Cannot insert text - editor not ready");
        speak("Sorry, I can't insert text right now.");
      }
    }
  };

  /**
   * Enhanced effect hook to monitor listening state with auto-restart
   */
  useEffect(() => {
    if (!listening && browserSupportsSpeechRecognition) {
      try {
        SpeechRecognition.startListening({ 
          autoStart: true, 
          continuous: true,
          language: 'en-US'
        });
      } catch (error) {
        console.error("Speech recognition error:", error);
        toast.error("🎤 Microphone access required");
      }
    }
  }, [listening, browserSupportsSpeechRecognition]);

  // Toggle listening state with feedback
  const toggleListening = () => {
    setIsListening(prevState => {
      const newState = !prevState;
      if (newState) {
        speak("Voice commands activated!", { pitch: 1.1 });
        toast.success("🎤 Voice commands ON");
      } else {
        speak("Voice commands paused.", { pitch: 0.9 });
        toast("🔇 Voice commands paused");
      }
      return newState;
    });
  };

  // if browser does not support speech recognition 
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="voice-commands-container">
        <div className="voice-error">
          <span>🚫 Browser doesn't support speech recognition.</span>
          <small>Please use Chrome, Firefox, or Edge for voice commands.</small>
        </div>
      </div>
    );
  }

  //render the enhanced voice commands component 
  return (
    <div className="voice-commands-container">
      {/* Enhanced Floating Speech Transcript Indicator */}
      {showTranscript && currentTranscript.trim() && (
        <div className={`speech-indicator ${listening ? 'listening' : ''} ${isListening ? 'command-mode' : ''}`}>
          <div className="speech-header">
            <VolumeUp className="speech-icon" />
            <span className="speech-label">
              {isListening ? 'Command Mode Active' : 'Speech Detected'}
            </span>
          </div>
          <div className="speech-content">
            {currentTranscript || 'Listening...'}
          </div>
          {isListening && (
            <div className="speech-status">
              <span className="status-dot active"></span>
              <span>Ready for commands</span>
            </div>
          )}
          <div className="speech-confidence">
            <small>💡 Try: "honey save file please"</small>
          </div>
        </div>
      )}

      {/* Enhanced Microphone Status Indicator */}
      <div className={`mic-status-indicator ${listening ? 'active' : 'inactive'}`}>
        <div className="mic-status-content">
          {listening ? (
            <>
              <VolumeUp className="status-icon listening" />
              <span className="status-text">Microphone Active</span>
            </>
          ) : (
            <>
              <VolumeOff className="status-icon muted" />
              <span className="status-text">Microphone Off</span>
            </>
          )}
        </div>
        {listening && (
          <div className="listening-animation">
            <div className="wave wave1"></div>
            <div className="wave wave2"></div>
            <div className="wave wave3"></div>
          </div>
        )}
      </div>

      {/* Enhanced Main Microphone Button */}
      <div className="mic-button-container">
        <button 
          onClick={toggleListening} 
          className={`mic ${isListening ? 'listening' : ''} ${listening ? 'active' : ''}`}
          title={listening ? 'Voice commands active - Click to pause' : 'Voice commands off - Click to activate'}
        >
          {listening ? <MicOn /> : <MicOff />}
        </button>
        
        {/* Enhanced Command Mode Indicator */}
        {isListening && (
          <div className="command-mode-badge">
            <span className="pulse-dot"></span>
            Command Mode
          </div>
        )}

        {/* Command History Indicator */}
        {commandHistory.length > 0 && (
          <div className="command-history-badge">
            <span className="history-count">{commandHistory.length}</span>
          </div>
        )}
      </div>

      {/* Quick Help Tooltip */}
      {listening && !isListening && (
        <div className="quick-help">
          <small>💡 Say "honey [command] please"</small>
        </div>
      )}
    </div>
  );
};

export default VoiceCommands; 