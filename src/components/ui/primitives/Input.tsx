
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input: React.FC<InputProps> = ({ className = "", ...props }) => (
  <input
    {...props}
    className={`h-9 w-full rounded-md border border-gray-300 px-2 text-sm focus:border-blue-500 focus:ring-0 ${className}`}
  />
);

export default Input;
