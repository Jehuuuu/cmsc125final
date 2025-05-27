// Importing necessary hooks from React
import { useEffect, useState } from "react";
// Importing useNavigate hook from react-router-dom for navigation
import { useNavigate } from "react-router-dom";
// Importing an image
import BG from '../images/schedule.png';
// Importing a component named Welcome
import Welcome from "./Welcome";

// Importing a CSS file
import './Schedule.css';
// Importing a component named VoiceCommands
import VoiceCommands from "../voice/VoiceCommands";
// Importing CPU Voice Guide component
import CPUVoiceGuide from "../components/CPUVoiceGuide";

// Policy data with icons and descriptions
const policies = [
    {
        name: 'First Come, First Serve',
        icon: '⏱️',
        description: 'Processes are executed in the order they arrive in the ready queue.'
    },
    {
        name: 'Shortest Job First',
        icon: '📊',
        description: 'Process with the shortest burst time is executed first.'
    },
    {
        name: 'Priority',
        icon: '⭐',
        description: 'Process with the highest priority is executed first.'
    },
    {
        name: 'Round Robin',
        icon: '🔄',
        description: 'Each process is executed for a fixed time quantum.'
    }
];

// Exporting a functional component named Schedule
export default function Schedule() {
    // Using the useNavigate hook for navigation
    const navigate = useNavigate();
    // Using the useState hook to manage the state of the welcome message
    const [welcome, setWelcome] = useState(localStorage.getItem('welcome')  ? true : false);
    const [showIdeButton, setShowIdeButton] = useState(false);

    // Using the useEffect hook to perform side effects
    useEffect(() => {
        // Checking if the welcome message is not displayed
        if(!welcome) {
            // Setting a timeout to display the welcome message after 10 seconds
            setTimeout(() => {
                // Updating the state of the welcome message to true
                setWelcome(true);
                // Storing the state of the welcome message in the local storage
                localStorage.setItem('welcome', true);
            }, 10000);
        }

        // Show IDE button after a short delay for animation
        setTimeout(() => {
            setShowIdeButton(true);
        }, 1000);
    }, [welcome]) // Adding welcome as a dependency to the useEffect hook

    // Checking if the welcome message is not displayed
    if(!welcome) return <Welcome />

    // Defining a function to handle click events
    function handleClick(policy) {
        // Navigating to the "/simulation" route with the policy as a state
        navigate("/simulation", { state: { policy: policy.name } });
    }

    function handleIdeClick() {
        navigate("/ide");
    }
    
    return (
        <div className="schedule fade-in">
            <header className="header">
                <div className="logo">darling</div>
                {showIdeButton && (
                    <button 
                        className="ide-button fade-in" 
                        onClick={handleIdeClick}
                        title="Switch to darling-ide"
                    >
                        🐝 Open IDE
                    </button>
                )}
            </header>

            <main className="main-content">
                <h1 className="page-title">Scheduling Policies</h1>
                <p className="subtitle">Select a scheduling policy to simulate</p>
                
                <div className="policies-container">
                    {policies.map(policy => (
                        <div 
                            key={policy.name}
                            className="policy-card fade-in"
                            onClick={() => handleClick(policy)}
                        >
                            <div className="policy-icon">{policy.icon}</div>
                            <h2 className="policy-title">{policy.name}</h2>
                            <p className="policy-description">{policy.description}</p>
                        </div>
                    ))}
                </div>

                <VoiceCommands />

                {/* CPU Scheduling Voice Guide */}
                <CPUVoiceGuide />
            </main>

            {/* Rendering an image with the BG as the source and "Schedule" as the alt text */}
            <img src={BG} alt="Schedule" className="bg-sched" />
        </div>
    );
}