
import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ title, children, className = "", onClick }) => (
  <section 
    className={`bg-white rounded-md shadow-sm p-3 sm:p-4 mb-3 ${className}`}
    onClick={onClick}
  >
    {title && <h2 className="text-base font-semibold mb-3">{title}</h2>}
    {children}
  </section>
);

export default Card;
