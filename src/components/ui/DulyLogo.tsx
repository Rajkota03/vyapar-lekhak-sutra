
import React from "react";

interface DulyLogoProps {
  size?: number;
  className?: string;
}

export const DulyLogo: React.FC<DulyLogoProps> = ({ 
  size = 32, 
  className = "" 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Modern geometric design with overlapping shapes */}
      <defs>
        <linearGradient id="dulyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      
      {/* Background circle */}
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="url(#dulyGradient)"
        opacity="0.1"
      />
      
      {/* Main "D" shape - modern geometric interpretation */}
      <path
        d="M25 25 L25 75 L50 75 C62.5 75 72.5 65 72.5 52.5 C72.5 40 62.5 25 50 25 L25 25 Z"
        fill="url(#dulyGradient)"
        stroke="none"
      />
      
      {/* Inner accent - representing the "uly" in a minimalist way */}
      <rect
        x="35"
        y="35"
        width="25"
        height="8"
        rx="4"
        fill="white"
        opacity="0.9"
      />
      
      <rect
        x="35"
        y="48"
        width="20"
        height="6"
        rx="3"
        fill="white"
        opacity="0.7"
      />
      
      <rect
        x="35"
        y="58"
        width="15"
        height="6"
        rx="3"
        fill="white"
        opacity="0.5"
      />
    </svg>
  );
};
