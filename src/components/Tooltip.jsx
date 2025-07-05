import React, { useState } from 'react';

export const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-block"
        role="tooltip"
      >
        {children}
      </div>
      {isVisible && (
        <div 
          className="absolute z-10 p-2 mt-1 text-xs text-white bg-gray-800 rounded shadow-lg whitespace-nowrap"
          style={{
            left: '50%',
            transform: 'translateX(-50%)',
            bottom: '100%',
            marginBottom: '0.25rem'
          }}
        >
          {text}
          <div 
            className="absolute w-2 h-2 bg-gray-800 transform rotate-45 -bottom-1 left-1/2 -ml-1"
            style={{
              boxShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
