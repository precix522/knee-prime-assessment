
// API route for sending OTP
import { handleSendOTP } from '../../api/api-endpoints';

export default async function handler(req: Request) {
  try {
    console.log('Send OTP API route hit');
    
    // Check the request method
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Method not allowed. Use POST.' 
        }),
        { 
          status: 405,
          headers: { 
            'Content-Type': 'application/json',
            'Allow': 'POST'
          }
        }
      );
    }
    
    return await handleSendOTP(req);
  } catch (error: any) {
    console.error('Send OTP handler error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message || 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
