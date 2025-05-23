
import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="mx-auto w-full max-w-container px-3 sm:px-4">
      {children}
    </div>
  );
};

export default MainLayout;
