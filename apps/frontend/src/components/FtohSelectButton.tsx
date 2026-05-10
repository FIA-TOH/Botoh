'use client';

import React, { useState } from 'react';

interface FtohSelectButtonProps {
  label: string;
  options: string[];
  onSelect: (option: string) => void;
  className?: string;
  disabled?: boolean;
}

export function FtohSelectButton({ 
  label: initialLabel,
  options, 
  onSelect, 
  className = '', 
  disabled = false 
}: FtohSelectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(options[0] || initialLabel);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option: string) => {
    setSelectedOption(option);
    onSelect(option);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Main Button */}
      <button
        disabled={disabled}
        onClick={handleToggle}
        className={`w-full py-3 px-4 hover:bg-red-700 disabled:bg-red-500 disabled:cursor-not-allowed text-white font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between ${className}`}
        style={{ backgroundColor: '#FF232B' }}
      >
        <span>{selectedOption}</span>
        {/* Arrow Icon */}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="currentColor" 
          className={`w-5 h-5 transition-transform duration-200 ${isOpen ? '-rotate-90' : ''}`}
        >
          <path fillRule="evenodd" d="M12.53 16.28a.75.75 0 01-1.06 0l-7.5-7.5a.75.75 0 011.06-1.06L12 14.69l6.97-6.97a.75.75 0 111.06 1.06l-7.5 7.5z" clipRule="evenodd" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute top-full left-0 right-0 mt-1 bg-[#1E1E1E] border-2 border-white z-50"
          style={{ borderRadius: '0' }}
        >
          {options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleSelect(option)}
              className="w-full px-4 py-2 text-left text-white hover:bg-[#FF232B] transition-colors"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
