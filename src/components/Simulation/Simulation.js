import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import man from '../../images/man.gif';
import woman from '../../images/woman.gif';
import Video from '../Video.js';
import { addRow, deleteAllRows, getRows } from '../data-funcs.js';
import jsonData from '../data.json';
import './Simulation.css';

/**
 * This function is the simulation component designed to cater simulation for various scheduling policies.
 */

export default function Simulation(props) {
    /** state variables **/
    const location = useLocation();
    const [rows, setRows] = useState([]); //rows of data
    const [running, setRunning] = useState([]); //running processes
    const [valuemax, setValueMax] = useState(0); //maximum value
    const [totalSteps, setTotalSteps] = useState(0); //total steps
    const [doneProcess, setDoneProcess] = useState([]); //all entering processes
    const [timeline, setTimeline] = useState([0, 0]); //timeline
    const [onLoad, setOnLoad] = useState(true); //flag for page load
    const [showVideo, setShowVideo] = useState(false); //flag to show video
    const [videoFlag, setVideoFlag] = useState(false); //flag for video

    // fetch all current processes
    useEffect(() => {
        async function fetchData() {
            const rows = await getRows("pcb");
            setRows(rows);
        }

        fetchData();
    }, [jsonData]);

    // process the running processes
    useEffect(() => {
        async function getRunningProcess() {
            const current_running = rows.filter(row => row.status === 'Running');

            if(current_running.length > 0) {
                const curr = current_running[0]; // current running process
                var newArr = running; // holder for updated running processes
                var time = timeline;
                time.pop();
                
                if(running.length > 0) {
                    const lastIndex = running.length - 1; // last index of processes ran
                    
                    // check if last process is the same with current running
                    const sameID = running[lastIndex].id === curr.id;
                    const sameBurst = running[lastIndex].init_burst === curr.init_burst;
                    const sameIO = running[lastIndex].io_time === curr.io_time;

                    if(sameID && sameBurst && sameIO) {
                        // update last index details
                        newArr[lastIndex] = curr;
                        time[time.length - 1] = time[time.length - 2] + curr.steps;
                    } else {
                        // update last index steps
                        // if policy is preemptive
                        if (location.state.policy !== "First Come, First Serve"
                            && location.state.policy !== "Round Robin") {
                            const lastOne = rows.find(item => item.id === newArr[lastIndex].id);
    
                            if(lastOne?.status === "Ready") {
                                newArr[lastIndex].steps += 1;
                                time[time.length - 1] += 1;
                            }
                        }
                         
                        // add curr
                        newArr.push(curr)
                        time.push(time[time.length - 1] + curr.steps)
                    }
                } else {
                    // add new element to array if array is empty
                    newArr.push(curr)
                    time.push(time[time.length - 1] + curr.steps)
                }

                // push changes to variable
                time.push(valuemax);
                setTimeline(time);
                setRunning(newArr);
            }
        }
        
        getRunningProcess();
    }, [jsonData])  

    // count the maximum value
    useEffect(() => {
        var max = valuemax;

        if(doneProcess.length < 1) {
            setDoneProcess(rows);
            max += rows.reduce((sum, item) => sum += Number(item.init_burst), 0);
        } else {
            rows.forEach(item => {
                if(!doneProcess.find(x => (x.id === item.id) && (x.init_burst === item.init_burst))) {
                    max += Number(item.init_burst);
                    setDoneProcess(prev => [...prev, item]);
                } 
            })
        }

        // push value calculated to variable
        setValueMax(max);
    }, [jsonData])

    // count the running total steps
    useEffect(() => {
        if(running.length > 0) {
            setTotalSteps(running.reduce((sum, row) => sum + row.steps, 0));
        }
    }, [running])

    // reset timeline every reload
    useEffect(() => {
        (async () => {
            if(onLoad) {
                await deleteAllRows("pcb");
                await deleteAllRows("queue");
                await deleteAllRows("memory");
                var segment = {
                    block_size: 24,
                    row_id:"",
                    location: 0,
                    process_id: "",
                    job_size: "",
                    status: "Free",
                    fragmentation: "None",
                    splittable: true
                }

                await addRow(segment, "memory")
                setOnLoad(false);
              }
        })()
    }, []);

    // show animations
    useEffect(() => {
        if(totalSteps === valuemax && valuemax !== 0 && !videoFlag) {
            setShowVideo(true);
            setTimeout(() => {
                setShowVideo(false);
                setVideoFlag(true);
            }, 7000)
        } 

        if (totalSteps !== valuemax){
            setVideoFlag(false);
        }
    }, [totalSteps, valuemax])
    
    return (
        <div className="progress-container">
            {/** Counter display for totalSteps and valuemax */}
            <div className="counter-display" style={{
                textAlign: 'center',
                padding: '10px',
                marginBottom: '10px',
                backgroundColor: 'var(--color-blue)',
                color: 'white',
                borderRadius: '5px',
                fontWeight: 'bold'
            }}>
                Current Time Unit: {totalSteps} / Total Time Units: {valuemax}
            </div>
            {/** use to display the moving people for interactive simulation */}
            <div className='gif-container'> 
                <img 
                    key="man" 
                    src={man} 
                    alt="man-gif" 
                    className="man-gif gif" 
                    style={{left: `${(totalSteps / valuemax) * 93}%`}}
                />
                <img src={woman} alt="woman-gif" className="woman-gif gif" />
            </div>
            {/** displays progress of the status timeline */}
            <div className='progress-timeline'>
                <div className="progress" style={{height: '8vh'}}>
                    {running.map((item, index) => {
                        const percentage = item.steps / valuemax * 100;
                        return (
                            <div className={`progress-bar ${item.steps !== 0 ? 'process-outline' : ''}`} 
                                key={index}
                                role="progressbar" 
                                style={{width: `${percentage}%`, backgroundColor: 'var(--color-blue)'}} 
                                aria-valuenow={item.steps} 
                                aria-valuemin="0" 
                                aria-valuemax={valuemax}
                            >
                                <span className="label">P{item.process_id}</span>
                            </div>
                        )
                    })}
                </div>
                {/** displays and keep track of the timeline */}
                <div className='progress-track'>
                <div className="timeline"> 
                    {timeline.map((item, index) => {
                        const percentage = (item - timeline[index !== 0 ? index-1 : 0]) / valuemax   * 100;
                        return (
                            <div className="timeline-item" key={index} style={{width: `${percentage}%`}}> 
                                {index === timeline.length - 1 && item === timeline[index - 1] ? "" : item} 
                            </div> 
                        )
                    })} 
                </div>
            </div>
            </div>
            <Video open={showVideo} close={() => setShowVideo(false)} />
        </div>
    )
}