import React from 'react';

// importing the style file to use for this component
import './Modal.css';

// defining the modal component, specifying the props needed for the modal to be reusable
const Modal = ({ isOpen, onClose, headerText, content, inputField, buttonText1, buttonText2, onCancel, onConfirm }) => {

    // if the modal is not open, it will not render anything
    if (!isOpen) return null;

    // rendering the modal with all the needed contents
    return (
        <>
            {/* this div overlays the background for blurry effect when the modal is opened*/}
            <div className='modal-backdrop' onClick={onClose}></div>

            {/* the overall modal container */}
            <div className='modal'>

                {/* this is the container for the content of the modal */}
                <div className='modal-cont'>

                    {/* this is the container for the header of the modal */}
                    <div className='modal-header'>
                        <h2 className='modal-header'>{headerText}</h2>
                    </div>

                    {/* this is the container for the body of the modal which contains the content */}
                    <div className='modal-body'>
                        {content}
                    
                        {/* this is the container specific for save as file because there is a need for file name input */}
                        <div className='modal-body-input'>
                            {inputField}
                        </div>
                    </div>

                    {/* this is the container for the buttons of the modal both the cancel and confirm buttons */}
                    <div className='modal-btn'>
                        <button className='modal-cancel' onClick={onCancel}>{buttonText1}</button>
                        <button className='modal-submit' onClick={onConfirm}>{buttonText2}</button>
                    </div>
                </div>
            </div>
        </>
    )
}

// this is required so that the Modal component can be used to the files that need it
export default Modal 