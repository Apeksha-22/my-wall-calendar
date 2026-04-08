import React from 'react';
import { MONTHS } from '../../utils/dateUtils';

const HeroSection = ({ month, year }) => {
  return (
    /* Main container: Image aur text ko sahi se fit karne ke liye relative aur overflow-hidden use kiya hai */
    <div className="relative w-full h-64 md:h-80 overflow-hidden rounded-t-xl lg:rounded-l-xl lg:rounded-tr-none">
      
      {/* Background Image: Unsplash se ek random sundar image fetch ho rahi hai theme ke liye */}
      <img 
        src={`https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80`} 
        alt="Month Theme"
        className="w-full h-full object-cover"
      />

      {/* Text Overlay: Image ke upar saal (year) aur mahine (month) ka naam dikhane ke liye */}
      <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center text-white">
        
        {/* Saal (Year) ko thoda light aur spread out (tracking) dikhaya hai design ke liye */}
        <span className="text-xl font-light tracking-[0.3em] uppercase">{year}</span>
        
        {/* Mahine ka naam: MONTHS array se uthaya gaya hai (jaise JANUARY, FEBRUARY) */}
        <h1 className="text-6xl font-serif mt-2">{MONTHS[month]}</h1>
        
      </div>
    </div>
  );
};

export default HeroSection;