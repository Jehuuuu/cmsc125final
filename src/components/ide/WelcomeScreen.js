import React from 'react';
// import the image file for the welcome screen (using PNG instead of GIF for now)
import WelcomeScreenImg from '../../images/ide/welcome.png';

/**
 * 
 * @description React Functional Component for the Welcome Screen
 * @returns JSX element
 */
export default function WelcomeScreen() {
    return (
        // full screen display of image file
        <div style={{ 
            display: 'flex', // use flexbox
            justifyContent: 'center',  // center content horizontally
            alignItems: 'center', // center content vertically
            height: '100vh', //full height of the viewport
            backgroundColor: '#DDA15E', // background color
            }}>
         {/* display the welcome screen image file */}
        <img src={WelcomeScreenImg} // source of the image file
            style={{ 
                width: '100%', // full width of the container
                height: 'auto', // adjust height automatically
                maxWidth: '100%', // not exceed full width of the container 
            }} 
            // text description of the image for screen readers
            alt="darling IDE, powered by HONEY OS. atillo cataques lagumbay marfa puyot reponte. loading..." />
        </div>
    );
} 