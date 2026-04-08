import React, { useState, useEffect } from 'react';

const NotesInput = () => {
  // 'note' state mein user ka likha hua text store hota hai
  const [note, setNote] = useState('');

  // Jab app pehli baar load ho, tab check karo ki pehle se koi saved note hai ya nahi
  useEffect(() => {
    const saved = localStorage.getItem('calendar-note');
    if (saved) setNote(saved);
  }, []);

  // Jab bhi user kuch type karega, ye function chalega
  const handleChange = (e) => {
    const newValue = e.target.value;
    setNote(newValue);
    
    // Sath hi sath browser ke localStorage mein save kar do taaki refresh pe delete na ho
    localStorage.setItem('calendar-note', newValue); 
  };

  return (
    <div className="mt-2">
      {/* Textarea jahan user apne notes likh sakta hai */}
      <textarea 
        className="w-full h-40 bg-transparent border-none resize-none focus:ring-0 text-sm leading-6 font-handwriting italic"
        placeholder="Yahan apne mahine ke notes likhein..."
        value={note}
        onChange={handleChange}
        
        /* Notebook jaisi lines dikhane ke liye inline CSS styling */
        style={{ 
          backgroundImage: 'linear-gradient(transparent, transparent 23px, #e5e4e7 23px)', 
          backgroundSize: '100% 24px' 
        }}
      />
    </div>
  );
};

export default NotesInput;