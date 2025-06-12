
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { DulyLogo } from "@/components/ui/DulyLogo";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-slate-50 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div className="space-y-6">
          {/* Main Logo */}
          <div className="flex justify-center">
            <DulyLogo size={48} variant="stacked" />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
              Welcome to Duly
            </h1>
            <p className="text-xl text-slate-600 font-medium">
              Modern Invoice Management for Indian Businesses
            </p>
          </div>
        </div>
        
        <div className="space-y-6">
          <p className="text-slate-600 leading-relaxed">
            Create professional invoices, manage clients, and keep track of your business finances with our intuitive platform designed specifically for Indian businesses.
          </p>
          
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
            <Button size="lg" className="font-semibold" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="font-semibold" onClick={() => navigate("/auth?tab=signin")}>
              Sign In
            </Button>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-200">
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <DulyLogo size={16} variant="icon" />
            <span>GST compliant • Professional templates • Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
