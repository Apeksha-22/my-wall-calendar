import { useState } from 'react';

export const useCalendarRange = () => {
  // startDate aur endDate ko track karne ke liye states
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Jab bhi user calendar mein kisi date par click karega, ye function chalega
  const handleDateClick = (date) => {
    
    // Case 1: Agar koi date select nahi hai, ya pehle se hi dono (start aur end) selected hain
    // Toh naye click ko 'start date' maan lo aur purani range clear kar do
    if (!startDate || (startDate && endDate)) {
      setStartDate(date);
      setEndDate(null);
    } 
    
    // Case 2: Agar user ne jo date chuni hai wo 'start date' se pehle ki hai
    // Toh use hi naya 'start date' bana do (kyunki range hamesha aage ki taraf honi chahiye)
    else if (date < startDate) {
      setStartDate(date);
    } 
    
    // Case 3: Agar upar ki koi condition match nahi hui, matlab user ne 'start date' ke baad ki date chuni hai
    // Toh ise 'end date' maan lo aur range complete kar do
    else {
      setEndDate(date);
    }
  };

  // Sari selection ko clear karne ke liye function
  const clearRange = () => {
    setStartDate(null);
    setEndDate(null);
  };

  // In functions aur states ko bahar export karna taaki components ise use kar sakein
  return { startDate, endDate, handleDateClick, clearRange };
};