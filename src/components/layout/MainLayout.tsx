
import React from "react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children
}) => {
  return <div className="fluid-container">
      {children}
    </div>;
};

export default MainLayout;
