
import React from "react";
import { Card } from "@/components/ui/primitives/Card";
import { Switch } from "@/components/ui/switch";

interface SignatureSectionProps {
  showMySignature: boolean;
  requireClientSignature: boolean;
  onShowMySignatureChange: (value: boolean) => void;
  onRequireClientSignatureChange: (value: boolean) => void;
}

const SignatureSection: React.FC<SignatureSectionProps> = ({
  showMySignature,
  requireClientSignature,
  onShowMySignatureChange,
  onRequireClientSignatureChange,
}) => {
  return (
    <Card title="Signatures">
      <div className="flex items-center justify-between py-2">
        <span className="text-sm">My Signature</span>
        <Switch
          checked={showMySignature}
          onCheckedChange={onShowMySignatureChange}
        />
      </div>
      <div className="flex items-center justify-between py-2">
        <span className="text-sm">Client's Signature</span>
        <Switch
          checked={requireClientSignature}
          onCheckedChange={onRequireClientSignatureChange}
        />
      </div>
    </Card>
  );
};

export default SignatureSection;
