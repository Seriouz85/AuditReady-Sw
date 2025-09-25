import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface EmailRequest {
  to: Array<{ email: string; name?: string }>;
  subject: string;
  html: string;
  text: string;
  from: {
    email: string;
    name: string;
  };
  category?: string;
}

// Resend API integration for production email sending
async function sendWithResend(emailData: EmailRequest) {
  const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
  
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${emailData.from.name} <${emailData.from.email}>`,
      to: emailData.to.map(recipient => recipient.email),
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
      tags: emailData.category ? [{ name: 'category', value: emailData.category }] : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Resend API error: ${response.status} ${error}`);
  }

  return await response.json();
}

// SendGrid API integration as fallback
async function sendWithSendGrid(emailData: EmailRequest) {
  const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
  
  if (!SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY environment variable is not set');
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: emailData.from,
      personalizations: [{
        to: emailData.to,
        subject: emailData.subject,
      }],
      content: [
        { type: 'text/html', value: emailData.html },
        { type: 'text/plain', value: emailData.text }
      ],
      categories: emailData.category ? [emailData.category] : undefined,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`SendGrid API error: ${response.status} ${error}`);
  }

  return { messageId: `sendgrid-${Date.now()}` };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { to, subject, html, text, from, category }: EmailRequest = await req.json();

    // Validate required fields
    if (!to || !Array.isArray(to) || to.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Recipients (to) are required' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    if (!subject || !html) {
      return new Response(
        JSON.stringify({ error: 'Subject and HTML content are required' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    const isDevelopment = Deno.env.get('ENVIRONMENT') !== 'production';
    const emailData: EmailRequest = { to, subject, html, text, from, category };
    
    console.log('📧 Email Send Request:', {
      to: to.map(recipient => recipient.email),
      subject,
      from: from.email,
      category,
      mode: isDevelopment ? 'development' : 'production',
      html_preview: html.substring(0, 200) + '...',
    });

    // In development mode, just log and return success
    if (isDevelopment) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          message: 'Email logged in development mode',
          recipients: to.length,
          details: {
            subject,
            recipients: to.map(r => r.email),
            timestamp: new Date().toISOString()
          }
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

    // Production mode - attempt to send actual email
    let result;
    let provider = 'none';

    try {
      // Try Resend first (recommended for Supabase projects)
      if (Deno.env.get('RESEND_API_KEY')) {
        result = await sendWithResend(emailData);
        provider = 'resend';
      } 
      // Fallback to SendGrid
      else if (Deno.env.get('SENDGRID_API_KEY')) {
        result = await sendWithSendGrid(emailData);
        provider = 'sendgrid';
      }
      // No email provider configured
      else {
        console.warn('⚠️ No email provider configured. Add RESEND_API_KEY or SENDGRID_API_KEY to environment variables.');
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'No email provider configured',
            message: 'Please configure RESEND_API_KEY or SENDGRID_API_KEY in Edge Function secrets',
            recipients: to.length
          }),
          { 
            status: 503,
            headers: { 
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            }
          }
        );
      }

      console.log(`✅ Email sent successfully via ${provider}:`, {
        messageId: result.id || result.messageId,
        recipients: to.length,
        subject
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          messageId: result.id || result.messageId || `${provider}-${Date.now()}`,
          message: `Email sent successfully via ${provider}`,
          provider,
          recipients: to.length,
          details: {
            subject,
            recipients: to.map(r => r.email),
            timestamp: new Date().toISOString()
          }
        }),
        { 
          status: 200,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );

    } catch (emailError) {
      console.error(`❌ Failed to send email via ${provider}:`, emailError);
      
      return new Response(
        JSON.stringify({ 
          success: false,
          error: `Email delivery failed via ${provider}`,
          details: emailError.message,
          provider,
          recipients: to.length
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        }
      );
    }

  } catch (error) {
    console.error('Email service error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
});