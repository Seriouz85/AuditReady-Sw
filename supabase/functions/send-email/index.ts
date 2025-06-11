import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRecipient {
  email: string;
  name?: string;
  substitutions?: Record<string, string>;
}

interface EmailRequest {
  to: EmailRecipient[];
  subject: string;
  html: string;
  text?: string;
  from?: {
    email: string;
    name: string;
  };
  category?: string;
  attachments?: Array<{
    content: string;
    filename: string;
    type: string;
  }>;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const emailRequest: EmailRequest = await req.json()
    
    // Get SendGrid API key from environment
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY')
    if (!SENDGRID_API_KEY) {
      throw new Error('SendGrid API key not configured')
    }

    // Prepare SendGrid request
    const sendgridRequest = {
      personalizations: emailRequest.to.map(recipient => ({
        to: [{ email: recipient.email, name: recipient.name }],
        substitutions: recipient.substitutions || {},
      })),
      from: emailRequest.from || {
        email: Deno.env.get('DEFAULT_FROM_EMAIL') || 'noreply@auditready.com',
        name: Deno.env.get('DEFAULT_FROM_NAME') || 'AuditReady Platform',
      },
      subject: emailRequest.subject,
      content: [
        ...(emailRequest.text ? [{ type: 'text/plain', value: emailRequest.text }] : []),
        { type: 'text/html', value: emailRequest.html },
      ],
      categories: emailRequest.category ? [emailRequest.category] : [],
      attachments: emailRequest.attachments,
      mail_settings: {
        sandbox_mode: {
          enable: Deno.env.get('SENDGRID_SANDBOX_MODE') === 'true',
        },
      },
      tracking_settings: {
        click_tracking: {
          enable: true,
        },
        open_tracking: {
          enable: true,
        },
      },
    }

    // Send email via SendGrid
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendgridRequest),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('SendGrid error:', error)
      throw new Error(`SendGrid API error: ${response.status}`)
    }

    // Get message ID from response headers
    const messageId = response.headers.get('x-message-id')

    return new Response(
      JSON.stringify({ 
        success: true,
        messageId,
        message: 'Email sent successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Email send error:', error)
    
    // In development/demo mode, return success anyway
    if (Deno.env.get('DEMO_MODE') === 'true') {
      return new Response(
        JSON.stringify({ 
          success: true,
          messageId: `demo-${Date.now()}`,
          message: 'Email sent (demo mode)',
          demo: true,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    }
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})