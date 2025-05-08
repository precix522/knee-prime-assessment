
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTwilioAuthStore } from "../utils/twilio-auth-store";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Icons } from "../components/Icons";
import { PhoneForm } from "../components/auth/PhoneForm";
import { OTPForm } from "../components/auth/OTPForm";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Navbar } from "../components/Navbar";

export default function VonageLogin() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [useVonage, setUseVonage] = useState(true); // Default to Vonage
  const { verifyOTP, validateSession, setAuthUser } = useTwilioAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientID = searchParams.get("patientId");
  
  useEffect(() => {
    const storedPhone = localStorage.getItem('rememberedPhone');
    if (storedPhone) {
      setPhone(storedPhone);
    }
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const isValid = await validateSession();
      if (isValid) {
        const { user } = useTwilioAuthStore.getState();
        if (user) handleRedirectBasedOnRole(user);
      }
    };
    
    checkAuthStatus();
  }, [navigate, patientID]);

  const handleRedirectBasedOnRole = (user: any) => {
    if (user.profile_type === 'admin') {
      toast.success("Welcome admin! Redirecting to dashboard...");
      navigate("/dashboard");
    } else if (user.profile_type === 'patient') {
      toast.success("Welcome patient! Redirecting to dashboard...");
      navigate("/dashboard");
    } else if (patientID) {
      toast.success("Welcome! Redirecting to your report...");
      navigate(`/report-viewer?patientId=${encodeURIComponent(patientID)}`);
    } else {
      toast.success("Welcome! Redirecting to dashboard...");
      navigate("/dashboard");
    }
  };

  const formatPhoneNumber = (input: string): string => {
    // Format the phone number for display purposes
    if (!input) return "";
    
    // Keep only the last 4 digits visible
    const hiddenPart = input.slice(0, -4).replace(/\d/g, '*');
    const visiblePart = input.slice(-4);
    
    return `${hiddenPart}${visiblePart}`;
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!phone) {
      setError("Phone number is required.");
      setLoading(false);
      return;
    }

    if (!captchaVerified && !devMode) {
      setCaptchaError("Please verify that you are human.");
      setError("Please complete the captcha verification.");
      setLoading(false);
      return;
    }

    try {
      // Format phone number if needed
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      console.log(`Sending OTP to ${formattedPhone} using ${useVonage ? 'Vonage' : 'Twilio'}`);
      
      // Direct API call with better error handling
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          use_vonage: useVonage
        })
      });

      const data = await response.json();
      console.log("OTP send response:", data);

      if (!response.ok) {
        throw new Error(data.message || `Server error: ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.message || "Failed to send OTP");
      }

      toast.success("Verification code sent successfully!");
      setOtpSent(true);
      setCountdown(60); // 60 second countdown for resend
      
      // If in dev mode, show the OTP code (only for development)
      if (devMode && data.message?.includes("Development mode")) {
        const otpMatch = data.message.match(/OTP code (\d+)/);
        if (otpMatch && otpMatch[1]) {
          toast.info(`Dev mode: OTP is ${otpMatch[1]}`);
        }
      }
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      setError(err.message || "Failed to send OTP. Please try again.");
      toast.error(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!otp) {
      setError("Verification code is required.");
      setLoading(false);
      return;
    }

    try {
      // Format phone number if needed
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      
      // If using dev mode
      if (devMode) {
        // Simulate successful verification
        console.log("Dev mode: Simulating OTP verification");
        const mockUser = {
          id: "dev-user-id-" + Date.now(),
          phone: formattedPhone,
          profile_type: "patient",
        };
        
        setAuthUser(mockUser);
        toast.success("Dev mode: OTP verified successfully!");
        handleRedirectBasedOnRole(mockUser);
        return;
      }
      
      // Normal verification flow
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phone_number: formattedPhone,
          code: otp,
          use_vonage: useVonage
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Failed to verify OTP");
      }

      // Save the session ID
      if (data.session_id) {
        const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
        localStorage.setItem('gator_prime_session_id', data.session_id);
        localStorage.setItem('gator_prime_session_expiry', expiryTime.toString());
      }

      // Fetch or create user profile
      const user = await verifyOTP(formattedPhone, otp);
      if (!user) {
        throw new Error("Failed to get user profile");
      }

      toast.success("OTP verified successfully!");
      handleRedirectBasedOnRole(user);
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      setError(err.message || "Failed to verify OTP. Please try again.");
      toast.error(err.message || "Failed to verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    setOtp("");
    handleSendOTP(new Event('submit') as any);
  };

  const handleBackToPhone = () => {
    setOtpSent(false);
    setOtp("");
  };

  const toggleDevMode = () => {
    setDevMode(!devMode);
    toast.info(devMode ? "Developer mode disabled." : "Developer mode enabled. OTP verification will be bypassed.");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex flex-col items-center justify-center flex-grow py-10">
        <Card className="w-full max-w-md space-y-4 p-4">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              {otpSent ? "Verify OTP" : "Vonage SMS Verification"}
            </CardTitle>
            <CardDescription className="text-center">
              {otpSent
                ? "Enter the verification code we sent to your phone."
                : "Enter your phone number to receive a verification code via SMS."}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {devMode && (
              <Alert variant="destructive" className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle>Developer Mode Active</AlertTitle>
                <AlertDescription>
                  OTP verification will be bypassed in dev mode.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {otpSent ? (
              <OTPForm
                otpCode={otp}
                setOtpCode={setOtp}
                handleVerifyOTP={handleVerifyOTP}
                isLoading={loading}
                error={error}
                formattedPhone={formatPhoneNumber(phone)}
                phoneNumber={phone}
                countdown={countdown}
                onResendOTP={handleResendOTP}
                onBackToPhone={handleBackToPhone}
              />
            ) : (
              <PhoneForm
                phoneInput={phone}
                setPhoneInput={setPhone}
                handleSendOTP={handleSendOTP}
                isLoading={loading}
                error={error}
                captchaVerified={captchaVerified}
                setCaptchaVerified={setCaptchaVerified}
                captchaError={captchaError}
                setCaptchaError={setCaptchaError}
                devMode={devMode}
                useVonage={useVonage}
                setUseVonage={setUseVonage}
              />
            )}

            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">Developer Mode</span>
              <button
                type="button"
                onClick={toggleDevMode}
                className={`px-3 py-1 text-xs rounded-full ${
                  devMode 
                    ? "bg-green-500 text-white" 
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {devMode ? "Enabled" : "Disabled"}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
