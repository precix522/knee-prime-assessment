
// This file sets up the API routes for the Twilio service, email service, and Vonage SMS

import { sendOTP, verifyOTP, validateSession } from './twilio-service';
import { sendOTPSms, verifyOTPSms } from './vonage-service';
import { sendEmail } from './email-service';

// API route for sending OTP
export async function handleSendOTP(request: Request): Promise<Response> {
  try {
    const body = await request.json().catch(err => {
      console.error('Failed to parse request body:', err);
      return {};
    });
    
    const { phone_number, use_vonage } = body;
    
    // Basic validation
    if (!phone_number) {
      console.error('API Error - Send OTP: Missing phone number');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Phone number is required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Format phone number if needed
    const formattedPhone = phone_number.startsWith('+') ? phone_number : `+${phone_number}`;
    
    console.log(`Attempting to send OTP to ${formattedPhone} using ${use_vonage ? 'Vonage' : 'Twilio'}`);
    
    let result;
    
    // Use Vonage if specified, otherwise use Twilio
    if (use_vonage) {
      console.log('Using Vonage SMS for OTP');
      result = await sendOTPSms(formattedPhone);
    } else {
      console.log('Using Twilio for OTP');
      result = await sendOTP(formattedPhone);
    }
    
    console.log('OTP send result:', result);
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('API Error - Send OTP:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// API route for verifying OTP
export async function handleVerifyOTP(request: Request): Promise<Response> {
  try {
    const { phone_number, code, use_vonage } = await request.json();
    
    // Basic validation
    if (!phone_number || !code) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Phone number and code are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Format phone number if needed
    const formattedPhone = phone_number.startsWith('+') ? phone_number : `+${phone_number}`;
    
    let result;
    
    // Use Vonage if specified, otherwise use Twilio
    if (use_vonage) {
      console.log('Using Vonage SMS for OTP verification');
      result = await verifyOTPSms(formattedPhone, code);
      
      // Add session_id for consistency with Twilio implementation
      if (result.success) {
        const sessionId = `vonage_${Date.now()}_${formattedPhone.replace(/[^0-9]/g, '')}`;
        result = {
          ...result,
          session_id: sessionId
        };
      }
    } else {
      console.log('Using Twilio for OTP verification');
      result = await verifyOTP(formattedPhone, code);
    }
    
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('API Error - Verify OTP:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// API route for validating session
export async function handleValidateSession(request: Request): Promise<Response> {
  try {
    const { session_id } = await request.json();
    
    // Call the Twilio service to validate session
    const result = await validateSession(session_id);
    
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('API Error - Validate Session:', error);
    return new Response(
      JSON.stringify({ valid: false, phone_number: null }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}

// API route for sending emails
export async function handleSendEmail(request: Request): Promise<Response> {
  try {
    const emailData = await request.json();
    
    // Validate the email data
    if (!emailData.to || !emailData.from || !emailData.subject || !emailData.html) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required email fields' }),
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }
    
    console.log('Processing email request:', emailData);
    
    // Call the email service to send the email
    const result = await sendEmail(emailData);
    
    console.log('Email service result:', result);
    
    // Return a JSON response with the result
    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    console.error('API Error - Send Email:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message || 'Server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }
}
