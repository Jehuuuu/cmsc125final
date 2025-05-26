# Quick Usage Guide - OS Simulator

## Getting Started in 5 Minutes

### 1. Launch the Application
- The simulator should be running at `http://localhost:3000`
- You'll see the main OS Simulation page with all components

### 2. Basic Simulation Run
1. **Default Setup**: The simulator loads with a "basic" scenario by default
2. **Click "Start"**: This begins the simulation
3. **Watch the Magic**: Observe processes moving through queues and memory changes

### 3. Understanding the Interface

#### Top Control Panel
- **Green "Start" Button**: Begin/resume simulation
- **Yellow "Pause" Button**: Temporarily halt
- **Red "Stop" Button**: End simulation completely
- **Blue "Step" Button**: Execute one time unit manually
- **"Auto Run" Button**: Continuous execution (toggle on/off)
- **Speed Slider**: Control auto-run speed (100ms to 3000ms per step)

#### Algorithm Configuration (Left Panel)
- **CPU Algorithm**: Choose FIFO, SJF, Priority, or Round Robin
- **Memory Algorithm**: Choose FIFO, LRU, or OPT
- **Memory Frames**: Set number of physical memory frames (1-10)
- **Time Quantum**: For Round Robin scheduling (1-10 time units)
- **Test Scenario**: Select predefined process sets

#### Process Queues (Main Display)
- **Job Queue**: Processes waiting to be admitted
- **Ready Queue**: Processes ready to execute
- **Waiting Queue**: Processes blocked on page faults
- **Terminated Queue**: Completed processes
- **Currently Running**: Shows the active process

#### Memory Display (Right Panel)
- **Memory Frames**: Visual representation of physical memory
- **Statistics**: Hit rate, fault rate, total accesses
- **Color Coding**: Different colors for different pages

#### Statistics Panel
- **Memory Stats**: Hit/fault rates, efficiency metrics
- **Scheduler Stats**: Waiting times, turnaround times
- **Real-time Updates**: Values change as simulation progresses

#### Log Display
- **Real-time Events**: All simulation events with timestamps
- **Color Coding**: Different colors for different event types
- **Auto-scroll**: Automatically shows latest events

### 4. Try Different Scenarios

#### Basic Scenario (Default)
- 3 processes with simple page access patterns
- Good for understanding basic concepts

#### Page Fault Heavy
- Processes with many unique pages
- Tests memory management algorithms thoroughly

#### Priority Test
- Processes with different priorities
- Best with Priority scheduling algorithm

#### Round Robin Test
- Multiple processes with similar workloads
- Ideal for demonstrating time-slicing

### 5. Experiment with Algorithms

#### CPU Scheduling Comparison
1. Run the same scenario with different CPU algorithms
2. Compare waiting times and turnaround times
3. Notice how process selection changes

#### Memory Management Comparison
1. Try different page replacement algorithms
2. Compare hit rates and fault rates
3. Observe which pages get replaced

#### Parameter Effects
1. Change memory frame count (more frames = fewer faults)
2. Adjust time quantum for Round Robin
3. See how parameters affect performance

### 6. Add Custom Processes

1. **Click "Add Process"**
2. **Fill in Details**:
   - PID: Unique identifier (e.g., "P4")
   - Page Accesses: Comma-separated numbers (e.g., "1,2,3,4,5")
   - Priority: Higher = more important (optional)
   - Arrival Time: When process enters system (optional)
3. **Click "Add Process"** to confirm

### 7. Understanding the Simulation

#### What Happens Each Time Unit
1. **Process Admission**: New processes enter ready queue
2. **Process Selection**: Scheduler picks next process
3. **Memory Access**: Current process accesses one page
4. **Page Fault Handling**: Block process if page not in memory
5. **Page Load Completion**: Unblock processes after page loads
6. **Time Advancement**: Move to next time unit

#### Key Concepts
- **Page Hit**: Page already in memory (fast)
- **Page Fault**: Page not in memory (slow, causes blocking)
- **Process Blocking**: Process waits for page to load
- **Time Slice**: Round Robin gives each process limited time
- **Context Switch**: Changing from one process to another

### 8. Performance Analysis

#### Good Performance Indicators
- **High Hit Rate**: Memory algorithm is working well
- **Low Average Waiting Time**: CPU algorithm is efficient
- **Balanced Queue Sizes**: System is not overloaded

#### What to Look For
- **Memory Thrashing**: Too many page faults
- **Starvation**: Some processes never get CPU time
- **Convoy Effect**: Short processes waiting behind long ones

### 9. Educational Exercises

#### Exercise 1: Algorithm Comparison
1. Load "basic" scenario
2. Run with FIFO CPU + FIFO Memory
3. Note the statistics
4. Reset and try SJF CPU + LRU Memory
5. Compare results

#### Exercise 2: Memory Frame Impact
1. Set frames to 2, run simulation
2. Note hit rate and fault count
3. Reset, set frames to 5, run again
4. Observe the improvement

#### Exercise 3: Round Robin Tuning
1. Use Round Robin with quantum = 1
2. Note context switches and waiting times
3. Try quantum = 5
4. See how it affects performance

### 10. Troubleshooting

#### Simulation Won't Start
- Check if processes are in job queue
- Ensure at least one process has arrival time ≤ current time

#### No Process Movement
- Click "Step" to advance manually
- Check if simulation is paused

#### Performance Issues
- Reduce auto-run speed
- Clear browser cache if needed

## Tips for Best Learning Experience

1. **Start Simple**: Use default settings first
2. **Change One Thing**: Modify one parameter at a time
3. **Watch Closely**: Use step-by-step execution to understand details
4. **Compare Results**: Run same scenario with different algorithms
5. **Read Logs**: The log display explains what's happening
6. **Experiment**: Try extreme values to see edge cases

## Common Patterns to Observe

- **FIFO Memory**: Simple but can be inefficient
- **LRU Memory**: Usually performs better than FIFO
- **OPT Memory**: Best possible performance (theoretical)
- **Priority Scheduling**: High priority processes go first
- **Round Robin**: Fair time sharing among processes
- **SJF**: Shorter jobs complete faster

Enjoy exploring the fascinating world of operating system algorithms! 