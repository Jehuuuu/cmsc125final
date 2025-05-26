// ****************************************************************
// DEPRECATED - This file is no longer used. The newer VoiceCommands component 
// from src/voice/VoiceCommands.js uses a different UI approach.
// ****************************************************************

// import necessary hooks from React
import React, { useState, useEffect } from 'react';

/* intialize a dictionary of commands and their corresponding 
outputs that are shown to the user */ 
const commandOutput = {
    'new file': 'created new file',
    'open file': 'opening file...',
    'save': 'saving file...',
    'save as': 'saving file as...',
    'undo': 'last action undone',
    'redo': 'last action redone',
    'cut': 'cut text',
    'copy': 'copied text',
    'paste': 'pasted text',
    'zoom in': 'zoomed in',
    'zoom out': 'zoomed out',
    'select all': 'selected all text',
    'deselect': 'deselected text',
    'enter': 'entered',
    'delete': 'deleted',
    'delete all': 'deleted all text',
    'bold': 'bolded text',
    'italic': 'italicized text',
    'strike': 'strikethrough text',
    'code': 'coded text',
    'bullets': 'added bullets',
    'numbers': 'added numbers',
    'block': 'added code block',
    'type this': 'typed text in editor',
    'close tab': 'closed tab',
    'new tab': 'opened new tab',
    // Text alignment commands
    'align left': 'text aligned left',
    'align center': 'text aligned center',
    'align right': 'text aligned right',
    'justify': 'text justified'
}

/* 
transcript component that takes a transcript prop.
component will check if the transcript contains a command. 
if true, it will display the corresponding output to the user.
else, it will display the detected transcript.
*/
export default function Transcript({ transcript }) { 
    const [output, setOutput] = useState(transcript);
    const [isCommand, setIsCommand] = useState(false);
    const [key, setKey] = useState(0);
  
    useEffect(() => {
      let foundCommand = false;
      Object.keys(commandOutput).forEach(command => { // check if the transcript includes any of the commands
        if (transcript && transcript.includes(command)) { 
          setOutput(commandOutput[command]);// if true, set output to corresponding message
          foundCommand = true;
        }
      });
      if (!foundCommand) { // if not a command, set output to transcript
        setIsCommand(false)
        setOutput(transcript);
      } else {
        setIsCommand(foundCommand); // if command, increment the key to force re-render when new command is detected
        setKey(prevKey => prevKey + 1);
      }
    }, [transcript]);
  

    // render the transcript container with the output
    return ( 
      <div key={key} className={`transcript-cont ${isCommand ? 'bounce' : ''}`}> { /* adds bounce animation if the output is a command */}
        <p className={!isCommand ? 'italic' : ''}> {output} </p> {/* italicize the output if it is not a command */}
      </div>
    );
} 