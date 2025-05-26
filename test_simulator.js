// Simple test script for OS Simulator core functionality
// Run this with: node test_simulator.js

// Import the core classes (adjust paths if needed)
const { OSSimulator } = require('./src/core/OSSimulator.js');
const { Process } = require('./src/core/Process.js');
const { Scheduler } = require('./src/core/Scheduler.js');
const { MemoryManager } = require('./src/core/MemoryManager.js');

console.log('🧪 Testing OS Simulator Core Functionality\n');

// Test 1: Process Creation
console.log('Test 1: Process Creation');
try {
    const process = new Process('P1', [1, 2, 3, 2, 1], 1, 0);
    console.log('✅ Process created successfully');
    console.log(`   PID: ${process.pid}, Pages: [${process.pageAccesses.join(', ')}]`);
} catch (error) {
    console.log('❌ Process creation failed:', error.message);
}

// Test 2: Memory Manager
console.log('\nTest 2: Memory Manager');
try {
    const memoryManager = new MemoryManager(3);
    memoryManager.setAlgorithm('FIFO');
    
    // Test page accesses
    let result1 = memoryManager.accessPage(1, []);
    let result2 = memoryManager.accessPage(2, []);
    let result3 = memoryManager.accessPage(3, []);
    let result4 = memoryManager.accessPage(4, []); // Should cause replacement
    
    console.log('✅ Memory Manager working');
    console.log(`   Frames: [${memoryManager.frames.join(', ')}]`);
    console.log(`   Stats: ${memoryManager.hits} hits, ${memoryManager.faults} faults`);
} catch (error) {
    console.log('❌ Memory Manager failed:', error.message);
}

// Test 3: Scheduler
console.log('\nTest 3: Scheduler');
try {
    const scheduler = new Scheduler();
    scheduler.setAlgorithm('FIFO');
    
    const p1 = new Process('P1', [1, 2, 3], 1, 0);
    const p2 = new Process('P2', [4, 5, 6], 2, 0);
    
    scheduler.addToJobQueue(p1);
    scheduler.addToJobQueue(p2);
    scheduler.admitProcess(p1);
    scheduler.admitProcess(p2);
    
    const nextProcess = scheduler.selectNextProcess();
    
    console.log('✅ Scheduler working');
    console.log(`   Selected process: ${nextProcess ? nextProcess.pid : 'None'}`);
    console.log(`   Ready queue size: ${scheduler.readyQueue.length}`);
} catch (error) {
    console.log('❌ Scheduler failed:', error.message);
}

// Test 4: OS Simulator Integration
console.log('\nTest 4: OS Simulator Integration');
try {
    const simulator = new OSSimulator(3, 2);
    
    // Add test processes
    simulator.addProcess('P1', [1, 2, 3, 2, 1], 1, 0);
    simulator.addProcess('P2', [2, 3, 4, 3, 2], 2, 0);
    
    // Start simulation
    simulator.start();
    
    // Run a few steps
    let steps = 0;
    while (simulator.step() && steps < 10) {
        steps++;
    }
    
    const state = simulator.getSimulationState();
    
    console.log('✅ OS Simulator integration working');
    console.log(`   Simulation ran for ${steps} steps`);
    console.log(`   Current time: ${state.currentTime}`);
    console.log(`   Total processes: ${state.queues.jobQueue.length + state.queues.readyQueue.length + state.queues.waitingQueue.length + state.queues.terminatedQueue.length + (state.queues.currentProcess ? 1 : 0)}`);
    console.log(`   Memory hit rate: ${(state.memoryStats.hitRate * 100).toFixed(1)}%`);
} catch (error) {
    console.log('❌ OS Simulator integration failed:', error.message);
}

// Test 5: Algorithm Switching
console.log('\nTest 5: Algorithm Switching');
try {
    const simulator = new OSSimulator(4, 3);
    
    // Test CPU algorithms
    simulator.setCPUSchedulingAlgorithm('SJF');
    simulator.setCPUSchedulingAlgorithm('Priority');
    simulator.setCPUSchedulingAlgorithm('RoundRobin');
    
    // Test memory algorithms
    simulator.setPageReplacementAlgorithm('LRU');
    simulator.setPageReplacementAlgorithm('OPT');
    simulator.setPageReplacementAlgorithm('FIFO');
    
    console.log('✅ Algorithm switching working');
} catch (error) {
    console.log('❌ Algorithm switching failed:', error.message);
}

// Test 6: Test Scenarios
console.log('\nTest 6: Test Scenarios');
try {
    const simulator = new OSSimulator(3, 2);
    
    const scenarios = ['basic', 'page_fault_heavy', 'priority_test', 'round_robin_test'];
    
    scenarios.forEach(scenario => {
        simulator.loadTestScenario(scenario);
        const state = simulator.getSimulationState();
        console.log(`   ${scenario}: ${state.queues.jobQueue.length} processes loaded`);
    });
    
    console.log('✅ Test scenarios working');
} catch (error) {
    console.log('❌ Test scenarios failed:', error.message);
}

console.log('\n🎉 Core functionality tests completed!');
console.log('\n📝 Next steps:');
console.log('   1. Open http://localhost:3000 in your browser');
console.log('   2. Try the different algorithms and scenarios');
console.log('   3. Use the step-by-step execution to understand the flow');
console.log('   4. Compare performance metrics between algorithms');
console.log('\n📚 See USAGE_GUIDE.md for detailed instructions'); 