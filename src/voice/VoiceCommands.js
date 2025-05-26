//import used libraries and components
import React, {useState, useEffect, useRef} from 'react';
import SpeechRecognition, {useSpeechRecognition} from 'react-speech-recognition';
import MicOn from '@mui/icons-material/MicNoneOutlined';
import MicOff from '@mui/icons-material/MicOffOutlined';
import VolumeUp from '@mui/icons-material/VolumeUp';
import VolumeOff from '@mui/icons-material/VolumeOff';
import {commands} from './commands';
import './VoiceCommands.css';
import toast from 'react-hot-toast';

// Helper function to check if a command is contained in a transcript
// This is more lenient than just using includes()
const commandMatches = (transcript, commandText) => {
    // Exact match
    if (transcript.includes(commandText)) {
        return true;
    }
    
    // Remove spaces and check
    const noSpaceTranscript = transcript.replace(/\s+/g, '');
    const noSpaceCommand = commandText.replace(/\s+/g, '');
    if (noSpaceTranscript.includes(noSpaceCommand)) {
        return true;
    }
    
    // Check for variations with word boundaries
    const words = commandText.split(' ');
    if (words.length > 1) {
        // Check if all words appear in the transcript in the correct order
        let lastIndex = -1;
        const allWordsFound = words.every(word => {
            const index = transcript.indexOf(word, lastIndex + 1);
            if (index > lastIndex) {
                lastIndex = index;
                return true;
            }
            return false;
        });
        
        if (allWordsFound) {
            return true;
        }
    }
    
    return false;
};

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
    const [isSpeaking, setIsSpeaking] = useState(false);
    const commandTimeoutRef = useRef(null);
    const pendingResponseRef = useRef(null);

    // use speech recognition hook
    const {
        transcript,
        listening,
        resetTranscript,
        browserSupportsSpeechRecognition
    } = useSpeechRecognition();

    // function to speak the text with speech recognition pause
    const speak = (text) => {
        try {
            // Set speaking state to true to prevent processing own speech
            setIsSpeaking(true);
            
            // Temporarily stop speech recognition while speaking
            SpeechRecognition.stopListening();
            
            const synth = window.speechSynthesis;
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Cancel any ongoing speech
            synth.cancel();
            
            // For debugging
            console.log("Speaking:", text);
            
            // Force a more reliable way to get voices
            let voices = synth.getVoices();
            
            // If voices aren't loaded yet, wait a bit and try again
            if (!voices || voices.length === 0) {
                setTimeout(() => {
                    voices = synth.getVoices();
                    if (voices && voices.length > 0) {
                        const selectedVoice = voices.find(voice => 
                            voice.name === 'Microsoft Zira - English (United States)' || 
                            voice.name.includes('Female') || 
                            voice.name.includes('Google')
                        ) || voices[0];
                        
                        utterance.voice = selectedVoice;
                        console.log("Using voice:", selectedVoice?.name || "default");
                    } else {
                        console.warn("No voices available, using default");
                    }
                    
                    finishAndSpeak();
                }, 100);
            } else {
                // Try to find the preferred voice or fallback to any available voice
                const selectedVoice = voices.find(voice => 
                    voice.name === 'Microsoft Zira - English (United States)' || 
                    voice.name.includes('Female') || 
                    voice.name.includes('Google')
                ) || voices[0];
                
                if (selectedVoice) {
                    utterance.voice = selectedVoice;
                    console.log("Using voice:", selectedVoice.name);
                }
                
                finishAndSpeak();
            }
            
            function finishAndSpeak() {
                // Set other properties
                utterance.volume = 1;
                utterance.rate = 1;
                utterance.pitch = 1;
                
                // Handle when speech ends - resume listening
                utterance.onend = () => {
                    // Add a small delay before resuming to ensure system doesn't hear echo
                    setTimeout(() => {
                        setIsSpeaking(false);
                        
                        // Clear the transcript to avoid capturing system speech
                        resetTranscript();
                        
                        // Resume listening
                        SpeechRecognition.startListening({ autoStart: true, continuous: true });
                        
                        // Execute any pending response
                        if (pendingResponseRef.current) {
                            pendingResponseRef.current();
                            pendingResponseRef.current = null;
                        }
                    }, 300);
                };
                
                // Handle speech errors
                utterance.onerror = (event) => {
                    console.error("Speech synthesis error:", event);
                    setIsSpeaking(false);
                    resetTranscript();
                    SpeechRecognition.startListening({ autoStart: true, continuous: true });
                };
                
                // Actually speak
                synth.speak(utterance);
                
                // Fallback in case onend doesn't fire
                setTimeout(() => {
                    if (isSpeaking) {
                        setIsSpeaking(false);
                        resetTranscript();
                        SpeechRecognition.startListening({ autoStart: true, continuous: true });
                    }
                }, 5000); // 5 second safety timeout
            }
        } catch (error) {
            console.error("Speech error:", error);
            setIsSpeaking(false);
            resetTranscript();
            SpeechRecognition.startListening({ autoStart: true, continuous: true });
            toast.error("Speech synthesis failed");
        }
    };

    // Initialize speech synthesis voices
    useEffect(() => {
        const synth = window.speechSynthesis;
        
        // Some browsers need this event to load voices
        if (synth.onvoiceschanged !== undefined) {
            synth.onvoiceschanged = () => {
                console.log("Voices loaded:", synth.getVoices().length);
            };
        }
        
        // Try to get voices initially
        const voices = synth.getVoices();
        console.log("Initial voices:", voices.length);
    }, []);

    // Update current transcript and show/hide indicator
    useEffect(() => {
        // Only update transcript if not currently speaking
        if (!isSpeaking) {
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
        }
    }, [transcript, currentTranscript, isSpeaking]);

    /**
     * effect hook to handle transcript changes
     * only takes the transcript between 'honey' and 'please' 
     * and saves it as script for the toaster to display
     */
    useEffect(() => {
        // Don't process commands while the system is speaking
        if (isSpeaking) return;
        
        // Store the transcript in localStorage for the "type this" command
        localStorage.setItem('voice_transcript', transcript);

        if(transcript.toLowerCase().includes('honey')) {
            // Clear any existing command timeout
            if (commandTimeoutRef.current) {
                clearTimeout(commandTimeoutRef.current);
            }
            
            setIsListening(true);
            setwillCall(true);
            resetTranscript();
            
            // Speak the response but pause speech recognition
            speak("Yes, my love?");
            
            // Set timeout to exit command mode if no command is given within 10 seconds
            commandTimeoutRef.current = setTimeout(() => {
                if (isListening) {
                    setIsListening(false);
                    setwillCall(false);
                    speak("Command mode deactivated due to inactivity.");
                }
            }, 10000);
        }

        if (transcript.toLowerCase().includes('please')) {
            // Clear the command timeout
            if (commandTimeoutRef.current) {
                clearTimeout(commandTimeoutRef.current);
                commandTimeoutRef.current = null;
            }
            
            // Better command extraction - get everything between "honey" and "please"
            const lowerTranscript = transcript.toLowerCase();
            let command = lowerTranscript;
            
            // Try to extract the part between honey and please
            const honeyIndex = lowerTranscript.indexOf('honey');
            const pleaseIndex = lowerTranscript.indexOf('please');
            
            if (honeyIndex !== -1 && pleaseIndex !== -1 && honeyIndex < pleaseIndex) {
                // Extract between honey and please
                command = lowerTranscript.substring(honeyIndex + 5, pleaseIndex).trim();
                console.log("Extracted command:", command);
            } else {
                // Just remove please
                command = lowerTranscript.replace('please', '').trim();
                console.log("Simple command (no honey found):", command);
            }
            
            // Set a pending action to execute after speech response finishes
            pendingResponseRef.current = () => {
                setIsListening(false);
                setScript(command);
            };
            
            // Speak confirmation before processing command
            speak("Okay, my love.");
        }
        
    }, [transcript, resetTranscript, isListening, willCall, isSpeaking]);

    // Clean up the timeout when component unmounts
    useEffect(() => {
        return () => {
            if (commandTimeoutRef.current) {
                clearTimeout(commandTimeoutRef.current);
            }
        };
    }, []);

    /**
     * takes the script in between 'honey' and 'please' 
     * and executes the command present in command.js.
     */
    useEffect(() => {
        if (!script) return;
        
        console.log("Processing script:", script);
        console.log("Available commands:", commands.map(c => c.command).join(", "));
        
        let commandExecuted = false;
        commands.forEach(({ command, callback }) => {
            if (commandMatches(script.toLowerCase(), command)) {
                console.log("Command matched:", command);
                if (willCall) {       
                    callback();
                    setwillCall(false);
                    commandExecuted = true;
                    console.log("Command executed:", command);
                } else {
                    console.log("Command not executed because willCall is false");
                }
            }
        });
        
        if (!commandExecuted && script) {
            // If no command matched but we have a script, provide feedback
            if (!isSpeaking) {
                console.log("Command not recognized:", script);
                speak("I'm sorry, I didn't recognize that command.");
                
                // Reset all voice command states
                setwillCall(false);
                setIsListening(false);
                
                // Clear any active timeouts
                if (commandTimeoutRef.current) {
                    clearTimeout(commandTimeoutRef.current);
                    commandTimeoutRef.current = null;
                }
            }
        }
        
        // Clear the script after processing to prevent loops
        setScript('');
        
    }, [script, willCall, isSpeaking]);

    /**
     * effect hook to start listening for the user's voice input (if not listening only)
     * autostart set to true to start listening automatically on page load
     * continuous set to true to keep listening
     */
    useEffect(() => {
        // Only start listening if not currently speaking
        if(!listening && !isSpeaking) 
          SpeechRecognition.startListening({ autoStart: true, continuous: true });
      }, [listening, isSpeaking]);

    // Toggle listening state
    const toggleListening = () => {
        setIsListening(prevState => !prevState);
        
        if (!isListening) {
            speak("Voice commands activated.");
        } else {
            speak("Voice commands deactivated.");
        }
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
            <div className={`mic-status-indicator ${listening ? 'active' : 'inactive'} ${isSpeaking ? 'speaking' : ''}`}>
                <div className="mic-status-content">
                    {listening ? (
                        <>
                            {isSpeaking ? (
                                <>
                                    <VolumeUp className="status-icon speaking" />
                                    <span className="status-text">Speaking...</span>
                                </>
                            ) : (
                                <>
                                    <VolumeUp className="status-icon listening" />
                                    <span className="status-text">Microphone On</span>
                                </>
                            )}
                        </>
                    ) : (
                        <>
                            <VolumeOff className="status-icon muted" />
                            <span className="status-text">Microphone Off</span>
                        </>
                    )}
                </div>
                {listening && !isSpeaking && (
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
                    className={`mic ${isListening ? 'listening' : ''} ${listening ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}
                    title={listening ? 'Microphone is active' : 'Microphone is off'}
                    disabled={isSpeaking}
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