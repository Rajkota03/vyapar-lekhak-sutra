
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SheetBody } from "@/components/ui/SheetBody";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const UserSettings: React.FC = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) return;

      const { error } = await supabase.auth.resetPasswordForEmail(user.email);
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
    <Sheet open onOpenChange={() => navigate('/settings')}>
      <SheetContent className="w-full">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/settings')}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <SheetTitle>User Account</SheetTitle>
          </div>
        </SheetHeader>
        
        <SheetBody>
          <div className="space-y-6">
            <div className="space-y-4">
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
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
};

export default UserSettings;
