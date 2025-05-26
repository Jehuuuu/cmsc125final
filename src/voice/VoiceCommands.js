//import used libraries and components
import React, {useState, useEffect} from 'react';
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import MicOn from '@mui/icons-material/MicNoneOutlined';
import MicOff from '@mui/icons-material/MicOffOutlined';
import VolumeUp from '@mui/icons-material/VolumeUp';
import VolumeOff from '@mui/icons-material/VolumeOff';
import {commands} from './commands';
import './VoiceCommands.css';

/**
 * 
 * @description VoiceCommands component that handles all voice commands and 
 * listens for the user's voice input
 */
const VoiceCommands = () => {

    const [isListening, setIsListening] = useState(false);
    const [willCall, setwillCall] = useState(false);
    const [script, setScript] = useState('');
    const [currentTranscript, setCurrentTranscript] = useState('');
    const [showTranscript, setShowTranscript] = useState(false);

    // use speech recognition hook
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // function to speak the text
    const speak = (text) => {
        const synth = window.speechSynthesis;
        const utterance = new SpeechSynthesisUtterance(text);
        // Get an array of available voices
        const voices = synth.getVoices();
        
        // Find the voice by name (for example, 'Google UK English Female')
        const selectedVoice = voices.find(voice => voice.name === 'Microsoft Zira - English (United States)');
        
        // If the selected voice is found, set it
        if (selectedVoice) {
            utterance.voice = selectedVoice;
        } else {
            console.error('Voice not found');
        }
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
     * effect hook to handle transcript changes
     * only takes the transcript between 'honey' and 'please' 
     * and saves it as script for the toaster to display
     */
    useEffect(() => {

        if(transcript.includes('honey')) {
            setIsListening(true);
            setwillCall(true);
            console.log("willCall honey", willCall)
            resetTranscript();
            speak("Yes, my love?");
        }

        if (transcript.includes('please')) {
            setIsListening(false);
            console.log("isListening please", isListening)
            setScript(transcript.replace('please', '').toLowerCase());
            speak("Okay, my love.");
            resetTranscript();
        }
        
        console.log("transcript: " , transcript);

    }, [transcript, resetTranscript, isListening, willCall]);

    useEffect(() => {
        if (transcript.includes('hi')) {
            speak("hello, my love.");
            resetTranscript();
        }

        if (transcript.includes('simulate') && transcript.endsWith('please')){
            speak("Are you sure you want to switch the current scheduling policy, my love?");
        }

    }, [transcript])

    /**
     * takes the script in between 'honey' and 'please' 
     * and executes the command present in command.js.
     */
    useEffect(() => {
        commands.forEach(({ command, callback }) => {
          if (script.toLowerCase().includes(command)) {
            console.log("callback() ", willCall)
            if (willCall){       
                callback();
                setwillCall(false);
                console.log("false dapat() ", willCall)
            }
        }
        });
    }, [script]);

    /**
     * effect hook to start listening for the user's voice input (if not listening only)
     * autostart set to tru to start listening automatically on page load
     * continuous set to true to keep listening
     */
    useEffect(() => {
        if(!listening) 
          SpeechRecognition.startListening({ autoStart: true, continuous: true });
      }, [listening]);

    // Toggle listening state
    const toggleListening = () => {
        setIsListening(prevState => !prevState);
    };

    // if browser does not support speech recognition 
    if (!browserSupportsSpeechRecognition) {
        return (
            <div className="voice-commands-container">
                <div className="voice-error">
                    <span>Browser doesn't support speech recognition.</span>
                </div>
            </div>
        );
    }

    //render the voice commands component 
    return (
        <div className="voice-commands-container">
            {/* Floating Speech Transcript Indicator */}
            {showTranscript && currentTranscript.trim() && (
                <div className={`speech-indicator ${listening ? 'listening' : ''}`}>
                    <div className="speech-header">
                        <VolumeUp className="speech-icon" />
                        <span className="speech-label">Speech Detected</span>
                    </div>
                    <div className="speech-content">
                        {currentTranscript || 'Listening...'}
                    </div>
                    {isListening && (
                        <div className="speech-status">
                            <span className="status-dot active"></span>
                            <span>Command Mode Active</span>
                        </div>
                    )}
                </div>
            )}

            {/* Microphone Status Indicator */}
            <div className={`mic-status-indicator ${listening ? 'active' : 'inactive'}`}>
                <div className="mic-status-content">
                    {listening ? (
                        <>
                            <VolumeUp className="status-icon listening" />
                            <span className="status-text">Microphone On</span>
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

            {/* Main Microphone Button */}
            <div className="mic-button-container">
                <button 
                    onClick={toggleListening} 
                    className={`mic ${isListening ? 'listening' : ''} ${listening ? 'active' : ''}`}
                    title={listening ? 'Microphone is active' : 'Microphone is off'}
                >
                    {listening ? <MicOn /> : <MicOff />}
                </button>
                
                {/* Command Mode Indicator */}
                {isListening && (
                    <div className="command-mode-badge">
                        <span className="pulse-dot"></span>
                        Command Mode
                    </div>
                )}
            </div>
        </div>
    )
}

export default VoiceCommands;