
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`h-8 w-full rounded border border-gray-300 px-2 text-xs focus:border-blue-500 focus:ring-0 ${className}`}
  />
);

export default Input;
