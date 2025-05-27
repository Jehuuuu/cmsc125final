# CPU Scheduling Voice Commands Guide

## Overview
The CPU Scheduling Simulator now includes comprehensive voice command support, allowing you to control scheduling algorithms, manage processes, and control simulations hands-free using natural speech.

## How to Use Voice Commands

### Basic Format
All voice commands follow this pattern:
```
"Honey" + [command] + "please"
```

### Alternative Wake Words
- **"Honey"** (primary)
- **"Darling"** 
- **"IDE"**

### Alternative End Words
- **"Please"** (primary)
- **"Thanks"**
- **"Thank you"**

### Example Commands
```
"Honey, simulate round robin, please"
"Darling, add new process, thanks"
"Honey, start simulation, please"
```

## Available Voice Commands

### 🔧 Scheduling Policies
Switch between different CPU scheduling algorithms:

- **"simulate first come first serve"** - Switch to FCFS scheduling algorithm
- **"simulate shortest job first"** - Switch to SJF scheduling algorithm  
- **"simulate priority"** - Switch to Priority scheduling algorithm
- **"simulate round robin"** - Switch to Round Robin scheduling algorithm

### 🎮 Simulation Controls
Control the execution of your scheduling simulation:

- **"play simulation"** - Start or resume the simulation
- **"start simulation"** - Begin the scheduling simulation
- **"pause simulation"** - Pause the running simulation
- **"stop simulation"** - Stop the simulation completely
- **"resume simulation"** - Continue paused simulation

### 📋 Process Management
Manage processes in your scheduling queue:

- **"add new process"** - Add a new process to the queue
- **"add custom process"** - Open custom process creation form
- **"generate random process"** - Create a random process automatically
- **"delete process"** - Remove selected process from queue

### 🗂️ Process Control Block (PCB) Operations
Interact with the Process Control Block interface:

- **"add row"** - Add new row to Process Control Block
- **"close"** - Close current dialog or form
- **"yes"** - Confirm current action
- **"no"** - Cancel current action

### 💻 OS Simulator Controls
For the advanced OS simulation environment:

- **"start simulation"** - Start OS simulation
- **"step simulation"** - Execute one simulation step
- **"auto run"** - Start automatic execution
- **"stop auto run"** - Stop automatic execution
- **"reset simulation"** - Reset simulation to initial state
- **"add process"** - Open add process form

### 🧠 CPU Algorithm Selection
Set CPU scheduling algorithms in OS simulator:

- **"set fifo cpu"** - Set CPU algorithm to FIFO
- **"set shortest job first"** - Set CPU algorithm to SJF
- **"set priority scheduling"** - Set CPU algorithm to Priority
- **"set round robin"** - Set CPU algorithm to Round Robin

### 💾 Memory Algorithm Selection
Configure memory management algorithms:

- **"set fifo memory"** - Set memory algorithm to FIFO
- **"set lru memory"** - Set memory algorithm to LRU
- **"set optimal memory"** - Set memory algorithm to Optimal

### 🧪 Test Scenarios
Load predefined test scenarios:

- **"load basic scenario"** - Load basic test scenario
- **"load page fault scenario"** - Load page fault heavy scenario
- **"load priority scenario"** - Load priority test scenario
- **"load round robin scenario"** - Load round robin test scenario
- **"load custom scenario"** - Load custom empty scenario

## Features

### Visual Feedback System
The voice command system provides rich visual feedback:

#### Floating Speech Indicator
- **Location**: Appears above microphone button
- **Shows**: Real-time transcript of detected speech
- **States**: 
  - Blue border (normal listening)
  - Green border (command mode active)
- **Auto-hide**: Disappears 3 seconds after speech stops

#### Microphone Status Panel
- **Location**: Floating panel near microphone button
- **Shows**: Current microphone state with animated sound waves
- **States**:
  - Green with waves (microphone active)
  - Red (microphone off)

#### Command Mode Badge
- **Location**: Above microphone button
- **Shows**: "Command Mode" with pulsing dot
- **Appears**: When wake word is detected and system is ready
- **Color**: Orange background with white text

#### Command History Tracking
- **Shows**: Number of recent commands executed
- **Location**: Small badge on microphone button
- **Limit**: Tracks last 10 commands with timestamps

### Audio Feedback
- **Voice Synthesis**: Confirms command reception and execution
- **Customizable**: Adjustable rate, pitch, and volume
- **Multiple Voices**: Supports various system voices
- **Smart Responses**: Context-aware confirmations

### Toast Notifications
- **Success**: Green notifications for successful commands
- **Error**: Red notifications for failed commands
- **Info**: Blue notifications for informational messages
- **Emoji Support**: Rich emoji feedback for better UX

## Usage Tips

### Getting Started
1. **Enable Microphone**: Ensure browser has microphone permissions
2. **Check Compatibility**: Use Chrome, Firefox, or Edge for best results
3. **Test Commands**: Start with simple commands like "Honey, hello, please"
4. **Wait for Confirmation**: Listen for "Yes, I'm listening!" response

### Best Practices
1. **Clear Speech**: Speak clearly at normal pace
2. **Exact Phrases**: Use exact command phrases for best recognition
3. **Wait for Response**: Allow system to process before next command
4. **Quiet Environment**: Minimize background noise for better accuracy

### Scheduling Workflow
1. **Select Algorithm**: "Honey, simulate round robin, please"
2. **Add Processes**: "Honey, add new process, please"
3. **Start Simulation**: "Honey, start simulation, please"
4. **Monitor Progress**: Use pause/resume as needed
5. **Switch Algorithms**: Change anytime during simulation

### Process Management Tips
- Add processes before starting simulation for better visualization
- Use custom processes for specific test cases
- Generate random processes for stress testing
- Monitor PCB for process state changes

## Troubleshooting

### Common Issues
- **Commands Not Recognized**: 
  - Check microphone permissions
  - Ensure exact command phrases
  - Wait for "Command mode activated" confirmation
  
- **Microphone Not Working**:
  - Refresh page and grant permissions
  - Check browser compatibility
  - Test with other voice applications

- **Simulation Not Responding**:
  - Ensure you're on the correct page
  - Check if simulation is already running
  - Try stopping and restarting simulation

### Browser Compatibility
- **Chrome**: Full support ✅
- **Firefox**: Full support ✅
- **Edge**: Full support ✅
- **Safari**: Limited support ⚠️

### Performance Tips
- Close unnecessary browser tabs
- Use wired headset for better audio quality
- Ensure stable internet connection
- Keep browser updated

## Integration with Existing Features

The voice commands work seamlessly with:
- **All UI Controls**: Voice commands complement existing buttons
- **Keyboard Shortcuts**: Can be used alongside keyboard navigation
- **Touch Interface**: Works on touch devices with microphone
- **State Management**: Maintains consistency with manual interactions
- **Error Handling**: Graceful fallback to manual controls

## Advanced Features

### Command Chaining
While not directly supported, you can execute multiple commands in sequence:
```
"Honey, simulate priority, please"
[wait for confirmation]
"Honey, add new process, please"
[wait for confirmation]
"Honey, start simulation, please"
```

### Context Awareness
The system understands context:
- Simulation state (running, paused, stopped)
- Current algorithm selection
- Available processes
- Page location (Schedule vs Main vs OS Simulator)

### Accessibility
- **Screen Reader Compatible**: Works with assistive technologies
- **Keyboard Alternative**: Voice commands don't replace keyboard access
- **Visual Indicators**: Clear visual feedback for hearing-impaired users
- **Customizable**: Adjustable voice synthesis parameters

## Security and Privacy

- **Local Processing**: Speech recognition happens in browser
- **No Data Storage**: Voice data is not stored or transmitted
- **Permission Based**: Requires explicit microphone permission
- **Secure Context**: Only works over HTTPS in production

## Future Enhancements

Potential improvements could include:
- Custom wake word configuration
- Voice command macros
- Multi-language support
- Voice-controlled parameter adjustment
- Natural language processing for complex commands
- Voice-guided tutorials

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify microphone permissions in browser settings
3. Test with simple commands first
4. Ensure you're using a supported browser
5. Check the troubleshooting section above

---

**Note**: This voice command system enhances the CPU scheduling simulator experience but does not replace traditional UI controls. All functionality remains accessible through standard mouse and keyboard interactions. 