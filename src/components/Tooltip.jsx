import React, { useState, useEffect } from 'react';

export const Tooltip = ({ text, children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = React.useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isRightAligned, setIsRightAligned] = useState(false);

  const updateTooltipPosition = () => {
    if (tooltipRef.current) {
      const rect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const tooltipWidth = 250; // Approximate width of the tooltip
      
      // Default position: show to the right
      let left = rect.right + 10; // 10px right of the element
      let top = rect.top + window.scrollY;
      let alignRight = false;
      
      // If tooltip would go off the right edge of the screen
      if (left + tooltipWidth > viewportWidth) {
        alignRight = true;
        left = rect.left - tooltipWidth - 10; // Show to the left instead
      }
      
      setPosition({ top, left });
      setIsRightAligned(alignRight);
    }
  };

  useEffect(() => {
    if (isVisible) {
      updateTooltipPosition();
      // Recalculate on window resize
      window.addEventListener('resize', updateTooltipPosition);
      return () => window.removeEventListener('resize', updateTooltipPosition);
    }
  }, [isVisible]);

  return (
    <div className="relative inline-flex items-center">
      <div
        ref={tooltipRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        className="inline-flex items-center"
        role="tooltip"
      >
        {children}
      </div>
      {isVisible && (
        <div 
          className="fixed z-50 p-3 text-sm text-white bg-gray-800 rounded shadow-lg whitespace-normal"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            width: '250px',
            transform: 'translateY(-50%)',
          }}
        >
          {text}
          <div 
            className={`absolute w-2 h-2 bg-gray-800 transform rotate-45 ${
              isRightAligned ? 'right-[-4px]' : 'left-[-4px]'
            }`}
            style={{
              top: '50%',
              transform: 'translateY(-50%) rotate(45deg)',
              boxShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Tooltip;
