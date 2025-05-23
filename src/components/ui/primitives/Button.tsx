
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ className = "", ...props }) => (
  <button
    {...props}
    className={`h-8 px-3 rounded text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60 ${className}`}
  />
);

export default Button;
