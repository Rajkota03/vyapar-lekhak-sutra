
import React from "react";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ title, children, className = "" }) => (
  <section className={`bg-white rounded-md shadow-sm p-4 sm:p-5 mb-4 ${className}`}>
    {title && <h2 className="text-lg font-semibold mb-3">{title}</h2>}
    {children}
  </section>
);

export default Card;
