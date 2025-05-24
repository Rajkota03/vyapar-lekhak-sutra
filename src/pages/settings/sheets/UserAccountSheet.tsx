
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SheetLayout } from "@/components/ui/SheetLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const UserAccountSheet: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (user) {
          setEmail(user.email || "");
          setFirstName(user.user_metadata?.first_name || "");
          setLastName(user.user_metadata?.last_name || "");
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
      navigate('/settings');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    try {
      if (!email) return;

      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      toast({
        title: "Password Reset",
        description: "Password reset email sent",
      });
    } catch (error) {
      console.error('Error sending reset email:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to send reset email",
      });
    }
  };

  return (
    <SheetLayout title="User Account">
      <div className="space-y-6">
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              disabled
              className="bg-gray-50"
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Enter first name"
            />
          </div>
          
          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Enter last name"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={handleResetPassword}
          >
            Reset Password
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700"
          >
            Delete Account
          </Button>
        </div>

        <Button 
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </SheetLayout>
  );
};

export default UserAccountSheet;
