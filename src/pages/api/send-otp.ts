
// API route for sending OTP
import { handleSendOTP } from '../../api/api-endpoints';

export default async function handler(req: Request) {
  try {
    console.log('Send OTP API route hit');
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
