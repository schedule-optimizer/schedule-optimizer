import React, { useRef, useState, useEffect } from 'react';
import { createEvent } from "../../Common/Services/EventService.js";
import AddForm from './AddForm.js';


//component that allows user to dynamically add a class to their schedule.
export const AddClass = ({ events, buildings, eventsUpdateFunction }) => {

  //function to handle change to the autocomplete input
  const handleAutocompleteChange = (e, value) => {

    e.preventDefault();
    setAutoValue(value);

    //if a value is given, set the newClass building to the selected building's id,
    //otherwise set it to an empty string
    if (value) {
      setNewClass((prev) => ({
        ...prev,
        building: value.id
      }));
    } else {
      setNewClass((prev) => ({
        ...prev,
        building: ''
      }));
    }
  }

  //function to handle change to input field
  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;

    //update the newclass variable's attribute whose corresponding input was altered
    setNewClass(() => ({
      ...newClass,  // Spread the previous state object
      [name]: value  // dynamically update the field by name
    }));
  };

  //function to attempt to create a new class
  const handleAddSubmit = (e) => {
    e.preventDefault();

    //if all input fields are not filled out, don't attempt to create a new class
    if ((newClass.days.length === 0) || !newClass.name || !newClass.code || !newClass.startTime || !newClass.endTime || !newClass.room || !newClass.instructor || !newClass.building) {
        setStatus("Please Enter information for all fields")
    } else {
         // Trigger add flag to create event and
        // re-render list with new event
        setFlag(true);
    }
  };


  //function to handle a change to teh checkbox input that tracks days
  const handleCheckboxChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {

      // Update days array based on checkbox state
      setNewClass((prev) => {
        const days = checked
          ? [...prev.days, value] // Add day if checked
          : prev.days.filter((day) => day !== value); // Remove day if unchecked
        return { ...prev, days };
      });

    } else {
      // Populate other input fields with same information as before the checkbox was changed
      setNewClass((prev) => ({ ...prev, [name]: value }));
    }
  };



  //initializes hook to manage the value selected by autocomplete input
  const  [autoValue, setAutoValue] = useState(null)

  //initializes hooks for status, the button to create new class, and the new class to create
  const [status, setStatus] = useState('');
  const [addClassFlag, setFlag] = useState(false);
  const [newClass, setNewClass] = useState({
    code: '',
    name: '',
    instructor: '',
    building: '',
    room: '',
    startTime: '',
    endTime: '',
    days: [],
  });



useEffect(() => {
    // Check for add flag
    if (addClassFlag) {

        const { code, name, instructor, building, room, startTime, endTime, days } = newClass;


        createEvent(code, name, instructor, building, room, startTime, endTime, days)
            .then((result) => {
                
                // Update class list and status message
                eventsUpdateFunction([...events, result]);
                setStatus("Class added");

                // Reset new class's state and attributes
                setNewClass({
                    code: '',
                    name: '',
                    instructor: '',
                    building: '',
                    room: '',
                    startTime: '',
                    endTime: '',
                    days: [],
                });
                
                // Reset the form element
                if (formRef.current) {
                    formRef.current.reset();
                }
                // Clear autocomplete
                setAutoValue(null)
            })
            .catch((error) => {
                setStatus("Failed to add class");
                console.error(error);
            })
            .finally(() => {
                // After everything else is done, reset the add class flag
                setFlag(false);
            });
    }
}, [eventsUpdateFunction, addClassFlag, events, newClass, buildings]);


  //reference to form html element, which allows the form to be reset in the JS code
  const formRef = useRef(null);

  return (
    <>
        <AddForm
            isClassForm={true}
            buildings={buildings}
            newEvent={newClass}
            onChange={handleInputChange}
            onAutocompleteChange={handleAutocompleteChange}
            onCheckboxChange={handleCheckboxChange}
            onClick={handleAddSubmit}
            status={status}
            formRef={formRef}
            autoCompleteValue={autoValue}
        />
    </>
  );
};

export default AddClass;