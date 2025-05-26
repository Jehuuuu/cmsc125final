# OS Simulator Voice Commands

## Overview
The OS Simulator now includes comprehensive voice command support, allowing you to control the simulation hands-free using natural speech.

## How to Use Voice Commands

### Basic Format
All voice commands follow this pattern:
```
"Honey" + [command] + "please"
```

### Example
```
"Honey, start simulation, please"
```

## Available Voice Commands

### Simulation Controls
- **"start simulation"** - Start the OS simulation
- **"pause simulation"** - Pause the running simulation  
- **"stop simulation"** - Stop the simulation completely
- **"step simulation"** - Execute one step of the simulation
- **"auto run"** - Start automatic continuous execution
- **"stop auto run"** - Stop automatic execution
- **"reset simulation"** - Reset simulation to initial state

### Process Management
- **"add process"** - Open the add process form

### CPU Scheduling Algorithms
- **"set fifo cpu"** - Set CPU algorithm to FIFO
- **"set shortest job first"** - Set CPU algorithm to SJF
- **"set priority scheduling"** - Set CPU algorithm to Priority
- **"set round robin"** - Set CPU algorithm to Round Robin

### Memory Management Algorithms
- **"set fifo memory"** - Set memory algorithm to FIFO
- **"set lru memory"** - Set memory algorithm to LRU
- **"set optimal memory"** - Set memory algorithm to Optimal

### Test Scenarios
- **"load basic scenario"** - Load basic test scenario
- **"load page fault scenario"** - Load page fault heavy scenario
- **"load priority scenario"** - Load priority test scenario
- **"load round robin scenario"** - Load round robin test scenario
- **"load custom scenario"** - Load custom empty scenario

## Features

### Visual Feedback
- **Floating Speech Indicator**: Shows real-time speech recognition with transcript display
- **Microphone Status Indicator**: Shows whether microphone is on/off with animated waves
- **Command Mode Badge**: Appears when "Honey" is detected and command mode is active
- Toast notifications appear for each command execution
- Success/error messages provide immediate feedback
- Voice guide component shows all available commands

### Smart Integration
- Commands are context-aware (disabled when appropriate)
- Algorithm changes are disabled during simulation
- Automatic element targeting using IDs and data attributes

### Browser Compatibility
- Works with modern browsers that support Web Speech API
- Graceful fallback for unsupported browsers

## Technical Implementation

### Files Modified
1. **`src/voice/commands.js`** - Added OS simulator commands
2. **`src/voice/VoiceCommands.js`** - Enhanced with floating indicators and visual feedback
3. **`src/voice/VoiceCommands.css`** - New styling for floating indicators and animations
4. **`src/pages/OSSimulation.js`** - Added voice component and button IDs
5. **`src/components/AlgorithmSelector.js`** - Added data attributes for targeting
6. **`src/components/OSVoiceGuide.js`** - New voice guide component

### Command Types
1. **Simple Commands** - Direct button clicks using IDs
2. **Algorithm Commands** - Dropdown value changes with events
3. **Simulation Commands** - Class-based targeting for dynamic buttons

## Usage Tips

1. **Clear Speech** - Speak clearly and at normal pace
2. **Quiet Environment** - Use in a quiet environment for better recognition
3. **Watch Indicators** - Monitor the floating speech indicator to see what's being recognized
4. **Check Microphone Status** - The microphone indicator shows if your mic is active
5. **Wait for Feedback** - Wait for toast notification before next command
6. **Check Guide** - Use the voice guide button to see all available commands
7. **Microphone Permissions** - Ensure browser has microphone access

## Troubleshooting

### Common Issues
- **Commands not recognized**: Check microphone permissions
- **Element not found**: Ensure you're on the OS simulation page
- **Algorithm changes ignored**: Stop simulation first before changing algorithms

### Browser Support
- Chrome: Full support
- Firefox: Full support  
- Safari: Limited support
- Edge: Full support

## Integration with Existing Features

The voice commands work seamlessly with:
- CPU Scheduler voice commands (existing)
- IDE voice commands (existing)
- All existing UI controls
- Toast notification system
- React state management

## Visual Indicators

### Speech Recognition Indicator
- **Location**: Floating panel above microphone button
- **Shows**: Real-time transcript of detected speech
- **Colors**: Blue border (normal), Green border (command mode active)
- **Auto-hide**: Disappears 3 seconds after speech stops

### Microphone Status Indicator  
- **Location**: Floating panel to the left of microphone button
- **Shows**: Current microphone state with animated waves when active
- **Colors**: Green (microphone on), Red (microphone off)
- **Animation**: Sound waves when actively listening

### Command Mode Badge
- **Location**: Above microphone button
- **Shows**: "Command Mode" with pulsing dot
- **Appears**: When "Honey" is detected and system is ready for commands
- **Color**: Orange background with white text

### Microphone Button States
- **Gray**: Microphone off
- **Green**: Microphone on and listening
- **Orange**: Command mode active (after "Honey" detected)
- **Animations**: Pulsing effect when active, hover effects

## Future Enhancements

Potential improvements could include:
- Speed control voice commands
- Memory frame count adjustment
- Process priority modification
- Custom time quantum setting
- Simulation statistics queries
- Voice command confidence indicators
- Custom wake word configuration 