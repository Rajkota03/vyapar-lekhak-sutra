
import React from "react";

interface DulyLogoProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'icon' | 'wordmark' | 'stacked';
}

export const DulyLogo: React.FC<DulyLogoProps> = ({ 
  size = 32, 
  className = "",
  variant = 'default'
}) => {
  // Different variants for different use cases
  if (variant === 'icon') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="dulyIconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="50%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#1E293B" floodOpacity="0.1"/>
          </filter>
        </defs>
        
        {/* Modern hexagonal container */}
        <path
          d="M30 25 L70 25 L85 50 L70 75 L30 75 L15 50 Z"
          fill="url(#dulyIconGradient)"
          filter="url(#shadow)"
        />
        
        {/* Stylized "D" with modern geometry */}
        <path
          d="M35 35 L35 65 L52 65 C60 65 66 59 66 50 C66 41 60 35 52 35 L35 35 Z"
          fill="white"
          fillOpacity="0.95"
        />
        
        {/* Inner accent representing innovation */}
        <circle cx="55" cy="50" r="3" fill="url(#dulyIconGradient)" />
      </svg>
    );
  }

  if (variant === 'wordmark') {
    return (
      <svg
        width={size * 2.5}
        height={size}
        viewBox="0 0 250 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="dulyWordmarkGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        
        {/* Modern typography for "Duly" */}
        <text 
          x="20" 
          y="65" 
          fontSize="48" 
          fontWeight="700" 
          fill="url(#dulyWordmarkGradient)"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          Duly
        </text>
        
        {/* Accent dot */}
        <circle cx="200" cy="45" r="4" fill="#3B82F6" />
      </svg>
    );
  }

  if (variant === 'stacked') {
    return (
      <svg
        width={size * 1.2}
        height={size * 1.5}
        viewBox="0 0 120 150"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <defs>
          <linearGradient id="dulyStackedGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
        
        {/* Icon on top */}
        <path
          d="M25 15 L95 15 L105 45 L95 75 L25 75 L15 45 Z"
          fill="url(#dulyStackedGradient)"
        />
        
        <path
          d="M30 25 L30 65 L55 65 C68 65 78 55 78 45 C78 35 68 25 55 25 L30 25 Z"
          fill="white"
          fillOpacity="0.95"
        />
        
        {/* Text below */}
        <text 
          x="60" 
          y="110" 
          fontSize="24" 
          fontWeight="600" 
          fill="#1E293B"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          Duly
        </text>
        
        <text 
          x="60" 
          y="130" 
          fontSize="10" 
          fill="#64748B"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          INVOICE MANAGEMENT
        </text>
      </svg>
    );
  }

  // Default variant - complete logo with icon and text
  return (
    <svg
      width={size * 3}
      height={size}
      viewBox="0 0 300 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="dulyMainGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <filter id="mainShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#1E293B" floodOpacity="0.12"/>
        </filter>
      </defs>
      
      {/* Modern icon section */}
      <g>
        {/* Hexagonal container with depth */}
        <path
          d="M15 25 L55 25 L70 50 L55 75 L15 75 L0 50 Z"
          fill="url(#dulyMainGradient)"
          filter="url(#mainShadow)"
        />
        
        {/* Stylized "D" */}
        <path
          d="M20 35 L20 65 L37 65 C45 65 51 59 51 50 C51 41 45 35 37 35 L20 35 Z"
          fill="white"
          fillOpacity="0.95"
        />
        
        {/* Modern accent elements */}
        <circle cx="40" cy="50" r="2.5" fill="url(#dulyMainGradient)" />
        <rect x="25" y="42" width="8" height="1.5" rx="0.75" fill="white" fillOpacity="0.7" />
        <rect x="25" y="56" width="6" height="1.5" rx="0.75" fill="white" fillOpacity="0.7" />
      </g>
      
      {/* Professional typography */}
      <g>
        <text 
          x="85" 
          y="58" 
          fontSize="36" 
          fontWeight="700" 
          fill="#1E293B"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          letterSpacing="-0.02em"
        >
          Duly
        </text>
        
        <text 
          x="85" 
          y="75" 
          fontSize="11" 
          fontWeight="500" 
          fill="#64748B"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.05em"
        >
          MODERN INVOICE MANAGEMENT
        </text>
      </g>
      
      {/* Subtle brand accent */}
      <circle cx="280" cy="35" r="3" fill="#3B82F6" fillOpacity="0.6" />
    </svg>
  );
};
