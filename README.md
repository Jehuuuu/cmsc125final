# Operating System Simulator

A comprehensive React-based operating system simulator that demonstrates the interaction between CPU scheduling algorithms and memory management (page replacement algorithms).

## Features

### CPU Scheduling Algorithms
- **FIFO (First In, First Out)**: Processes are scheduled in the order they arrive
- **SJF (Shortest Job First)**: Processes with fewer remaining page accesses are prioritized
- **Priority Scheduling**: Processes are scheduled based on their priority values
- **Round Robin**: Time-sliced scheduling with configurable time quantum

### Memory Management
- **Physical Memory Simulation**: Configurable number of memory frames
- **Page Replacement Algorithms**:
  - **FIFO**: Replace the oldest page in memory
  - **LRU (Least Recently Used)**: Replace the least recently accessed page
  - **OPT (Optimal)**: Replace the page that will be accessed furthest in the future

### Process Management
- **Four Process Queues**:
  - **Job Queue**: Processes waiting to be admitted
  - **Ready Queue**: Processes ready to execute
  - **Waiting Queue**: Processes blocked on page faults
  - **Terminated Queue**: Completed processes

### Real-time Visualization
- Live queue state updates
- Memory frame visualization with color-coded pages
- Comprehensive logging system
- Performance statistics and metrics
- Interactive simulation controls

## Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn package manager

### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd cmsc125final
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to `http://localhost:3000`

## How to Use

### Basic Operation
1. **Select Algorithms**: Choose CPU scheduling and page replacement algorithms from the configuration panel
2. **Configure Parameters**: Set memory frame count and time quantum for Round Robin
3. **Load Test Scenario**: Choose from predefined scenarios or add custom processes
4. **Run Simulation**: Use the control buttons to start, pause, step through, or auto-run the simulation
5. **Monitor Progress**: Watch real-time updates of queues, memory, and statistics

### Simulation Controls
- **Start**: Begin or resume simulation
- **Pause**: Temporarily halt the simulation
- **Stop**: End the simulation completely
- **Step**: Execute one time unit manually
- **Auto Run**: Continuously execute with adjustable speed
- **Reset**: Clear all data and return to initial state

### Test Scenarios
- **Basic**: Simple scenario with 3 processes for general testing
- **Page Fault Heavy**: Processes with many unique pages to test memory management
- **Priority Test**: Processes with different priorities for priority scheduling
- **Round Robin Test**: Multiple processes ideal for time-slicing demonstration

### Adding Custom Processes
1. Click "Add Process" button
2. Enter process details:
   - **PID**: Unique process identifier
   - **Page Accesses**: Comma-separated list of page numbers
   - **Priority**: Higher numbers = higher priority (optional)
   - **Arrival Time**: When the process enters the job queue (optional)

## Architecture

### Core Classes

#### `OSSimulator.js`
Main orchestrator that coordinates all simulation components:
- Manages simulation time and state
- Coordinates between scheduler and memory manager
- Handles process admission and completion
- Provides logging and statistics

#### `Scheduler.js`
Handles CPU scheduling and process queue management:
- Implements all four scheduling algorithms
- Manages process state transitions
- Tracks waiting times and turnaround times
- Handles Round Robin time slicing

#### `MemoryManager.js`
Manages physical memory and page replacement:
- Simulates memory frames
- Implements three page replacement algorithms
- Tracks page hits, faults, and replacements
- Maintains access order for LRU algorithm

#### `Process.js`
Represents individual processes:
- Stores process attributes (PID, priority, arrival time)
- Manages page access sequence
- Tracks execution progress and statistics
- Handles status changes

### UI Components

#### `OSSimulation.js`
Main simulation page with:
- Simulation controls and status
- Algorithm configuration
- Real-time state display
- Speed control and auto-run functionality

#### `QueueDisplay.js`
Visualizes all process queues:
- Shows processes in each queue with details
- Displays currently running process
- Color-coded status indicators
- Process progress information

#### `MemoryDisplay.js`
Shows memory state:
- Visual representation of memory frames
- Color-coded pages
- Hit/fault statistics
- Algorithm-specific information

#### `LogDisplay.js`
Real-time event logging:
- Categorized log entries (scheduler, memory, time)
- Auto-scrolling display
- Timestamp information
- Color-coded message types

#### `StatisticsDisplay.js`
Performance metrics:
- Memory management statistics (hit rate, fault rate)
- CPU scheduling metrics (waiting time, turnaround time)
- Algorithm efficiency indicators
- Process completion statistics

#### `AlgorithmSelector.js`
Configuration panel:
- Algorithm selection dropdowns
- Parameter adjustment controls
- Test scenario selection
- Real-time configuration updates

## Simulation Logic

### Process Flow
1. **Job Queue → Ready Queue**: Processes are admitted based on arrival time
2. **Ready Queue → Running**: Scheduler selects next process based on algorithm
3. **Running → Waiting**: Process blocks on page fault
4. **Waiting → Ready**: Process unblocks after page load simulation
5. **Running → Terminated**: Process completes all page accesses

### Memory Management
1. **Page Access**: Current process attempts to access a page
2. **Hit Check**: Determine if page is already in memory
3. **Page Fault**: If not in memory, select victim page for replacement
4. **Process Blocking**: Block process while page loads (simulated)
5. **Page Load**: Move process back to ready queue after one time unit

### Time Management
- Each time unit represents one memory access attempt
- Round Robin uses configurable time quantum
- Page loads are simulated as taking one time unit
- Waiting times are tracked for all processes

## Performance Metrics

### Memory Management
- **Hit Rate**: Percentage of memory accesses that don't cause page faults
- **Fault Rate**: Percentage of memory accesses that cause page faults
- **Total Replacements**: Number of pages replaced during simulation

### CPU Scheduling
- **Average Waiting Time**: Mean time processes spend in ready queue
- **Average Turnaround Time**: Mean time from arrival to completion
- **Throughput**: Number of processes completed per time unit

## Educational Value

This simulator demonstrates:
- **Algorithm Comparison**: See how different algorithms perform with the same workload
- **Parameter Impact**: Understand how frame count and time quantum affect performance
- **Process Interaction**: Observe how CPU scheduling and memory management interact
- **Real-time Visualization**: Watch algorithms in action with step-by-step execution
- **Performance Analysis**: Compare efficiency metrics across different configurations

## Technical Details

### Built With
- **React 18**: Modern React with hooks and functional components
- **React Bootstrap**: Responsive UI components
- **Material-UI Icons**: Professional iconography
- **React Router**: Client-side routing
- **React Hot Toast**: User notifications

### Browser Compatibility
- Chrome (recommended)
- Firefox
- Safari
- Edge

### Performance Considerations
- Efficient state management with React hooks
- Optimized rendering with proper key props
- Limited log history to prevent memory issues
- Responsive design for various screen sizes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Developed for CMSC 125 (Operating Systems) coursework
- Inspired by classic OS textbook algorithms
- Built with modern web technologies for educational accessibility