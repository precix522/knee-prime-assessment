
// This file contains the service functions for Vonage SMS API

// Vonage API credentials - Using environment variables for security
const VONAGE_API_KEY = import.meta.env.VITE_VONAGE_API_KEY || "";
const VONAGE_API_SECRET = import.meta.env.VITE_VONAGE_API_SECRET || "";
const VONAGE_BRAND_NAME = import.meta.env.VITE_VONAGE_BRAND_NAME || "Precix";

interface VonageSmsResponse {
  success: boolean;
  message: string;
  requestId?: string;
}

/**
 * Send OTP via Vonage SMS API
 * @param phoneNumber - Recipient's phone number in E.164 format (e.g., +6512345678)
 */
export const sendOTPSms = async (phoneNumber: string): Promise<VonageSmsResponse> => {
  try {
    // Generate a 6-digit OTP code
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log(`[Vonage Service] Sending OTP ${otpCode} to ${phoneNumber}`);
    
    // Check if Vonage credentials are set up
    if (!VONAGE_API_KEY || !VONAGE_API_SECRET) {
      console.warn("[Vonage Service] Using development mode. No actual SMS sent.");
      
      // Store OTP code in session storage for verification (in production, this would be stored securely server-side)
      sessionStorage.setItem(`otp_${phoneNumber}`, otpCode);
      
      return {
        success: true,
        message: `Development mode: OTP code ${otpCode} generated (not sent via SMS)`
      };
    }
    
    // Use the actual Vonage API
    console.log("[Vonage Service] Using Vonage API to send SMS");
    
    // Call the Vonage API
    const response = await fetch('https://rest.nexmo.com/sms/json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        api_key: VONAGE_API_KEY,
        api_secret: VONAGE_API_SECRET,
        from: VONAGE_BRAND_NAME,
        to: phoneNumber,
        text: `Your verification code is: ${otpCode}. Valid for 5 minutes.`
      })
    });
    
    if (!response.ok) {
      console.error(`[Vonage Service] HTTP error: ${response.status}`);
      throw new Error(`HTTP error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log("[Vonage Service] Vonage API response:", data);
    
    if (data && data.messages && data.messages[0].status === '0') {
      // Store OTP code for verification
      sessionStorage.setItem(`otp_${phoneNumber}`, otpCode);
      return {
        success: true,
        message: 'OTP sent successfully',
        requestId: data.messages[0]['message-id']
      };
    } else {
      throw new Error(data.messages?.[0]?.['error-text'] || 'Failed to send SMS');
    }
  } catch (error: any) {
    console.error('[Vonage Service] Error sending OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to send verification code'
    };
  }
};

/**
 * Verify OTP code
 * @param phoneNumber - Phone number the OTP was sent to
 * @param code - OTP code to verify
 */
export const verifyOTPSms = async (phoneNumber: string, code: string): Promise<{ success: boolean; message: string; }> => {
  try {
    console.log(`[Vonage Service] Verifying OTP for ${phoneNumber}`);
    
    // Get the stored OTP code
    const storedOTP = sessionStorage.getItem(`otp_${phoneNumber}`);
    
    if (!storedOTP) {
      console.warn('[Vonage Service] No OTP found for this phone number');
      return {
        success: false,
        message: 'No verification code found. Please request a new code.'
      };
    }
    
    // Verify the OTP code
    if (storedOTP === code) {
      console.log('[Vonage Service] OTP verification successful');
      // Clear the OTP code from storage
      sessionStorage.removeItem(`otp_${phoneNumber}`);
      
      return {
        success: true,
        message: 'OTP verification successful'
      };
    } else {
      console.warn('[Vonage Service] Invalid OTP provided');
      return {
        success: false,
        message: 'Invalid verification code. Please try again.'
      };
    }
  } catch (error: any) {
    console.error('[Vonage Service] Error verifying OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify code'
    };
  }
};
