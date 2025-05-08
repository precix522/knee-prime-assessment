
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RememberMeCheckbox } from "./RememberMeCheckbox";
import { CaptchaVerification } from "./CaptchaVerification";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface PhoneFormProps {
  phoneInput: string;
  setPhoneInput: (value: string) => void;
  handleSendOTP: (e: React.FormEvent) => void;
  isLoading: boolean;
  error: string | null;
  rememberMe?: boolean;
  setRememberMe?: (checked: boolean) => void;
  captchaVerified?: boolean;
  setCaptchaVerified?: (verified: boolean) => void;
  captchaError?: string | null;
  setCaptchaError?: (error: string | null) => void;
  devMode?: boolean;
  useVonage?: boolean;
  setUseVonage?: (use: boolean) => void;
}

export const PhoneForm = ({
  phoneInput,
  setPhoneInput,
  handleSendOTP,
  isLoading,
  error,
  rememberMe = false,
  setRememberMe,
  captchaVerified,
  setCaptchaVerified,
  captchaError,
  setCaptchaError,
  devMode = false,
  useVonage = false,
  setUseVonage,
}: PhoneFormProps) => {
  
  const handleCaptchaVerify = (token: string | null) => {
    if (setCaptchaVerified) {
      if (token) {
        setCaptchaVerified(true);
        setCaptchaError && setCaptchaError(null);
      } else {
        setCaptchaVerified(false);
        setCaptchaError && setCaptchaError("Captcha verification failed. Please try again.");
      }
    }
  };

  const handleCaptchaExpire = () => {
    if (setCaptchaVerified) {
      setCaptchaVerified(false);
      setCaptchaError && setCaptchaError("Captcha has expired. Please verify again.");
    }
  };

  return (
    <form onSubmit={handleSendOTP} className="space-y-4">
      <div className="space-y-2">
        <div className="relative">
          <Input
            type="tel"
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder="Enter phone number (e.g., +6512345678)"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="tel"
            required
          />
        </div>
        
        {!devMode && setCaptchaVerified && (
          <div className="mt-4">
            <CaptchaVerification 
              onVerify={handleCaptchaVerify}
              onExpire={handleCaptchaExpire}
              error={captchaError}
            />
          </div>
        )}
        
        {setRememberMe && (
          <RememberMeCheckbox 
            checked={rememberMe} 
            onCheckedChange={setRememberMe} 
          />
        )}
        
        {setUseVonage && (
          <div className="flex items-center space-x-2 mt-2">
            <Switch
              id="use-vonage"
              checked={useVonage}
              onCheckedChange={setUseVonage}
            />
            <Label htmlFor="use-vonage" className="text-sm text-gray-600">
              Use Vonage SMS for OTP
            </Label>
          </div>
        )}
        
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      
      <Button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-colors"
        disabled={isLoading || (!captchaVerified && !devMode && setCaptchaVerified !== undefined)}
      >
        {isLoading ? "Sending..." : "Send Verification Code"}
      </Button>
    </form>
  );
};
