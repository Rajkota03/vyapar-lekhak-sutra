
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate("/dashboard");
    }
  }, [loading, user, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Duly</h1>
          <p className="text-xl text-gray-600 mb-8">
            Modern Invoice Management for Indian Businesses
          </p>
        </div>
        
        <div className="space-y-4">
          <p className="text-gray-600">
            Create professional invoices, manage clients, and keep track of your business finances easily.
          </p>
          
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4 justify-center">
            <Button size="lg" onClick={() => navigate("/auth")}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth?tab=signin")}>
              Sign In
            </Button>
          </div>
        </div>
        
        <div className="pt-8">
          <p className="text-sm text-gray-500">
            Designed for Indian businesses with GST support
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
