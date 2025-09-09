import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EmailRecipient {
  email: string;
  name?: string;
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
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const emailRequest: EmailRequest = await req.json()
    
    // Get Resend API key from environment
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    console.log('🔑 RESEND_API_KEY available:', !!RESEND_API_KEY)
    
    if (!RESEND_API_KEY) {
      // Fallback to demo mode if no API key
      console.log('📧 Demo mode: Email would be sent', {
        to: emailRequest.to.map(r => r.email),
        subject: emailRequest.subject,
        from: emailRequest.from?.email || 'noreply@auditready.com'
      })
      
      return new Response(
        JSON.stringify({ 
          success: true,
          demo: true,
          messageId: `demo-${Date.now()}`,
          message: 'Email logged in demo mode - no RESEND_API_KEY configured'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Prepare Resend request (much simpler than SendGrid!)
    const resendRequest = {
      from: emailRequest.from?.email 
        ? `${emailRequest.from.name || 'AuditReady'} <${emailRequest.from.email}>`
        : `${Deno.env.get('DEFAULT_FROM_NAME') || 'AuditReady Platform'} <${Deno.env.get('DEFAULT_FROM_EMAIL') || 'noreply@auditready.com'}>`,
      to: emailRequest.to.map(recipient => 
        recipient.name 
          ? `${recipient.name} <${recipient.email}>`
          : recipient.email
      ),
      subject: emailRequest.subject,
      html: emailRequest.html,
      ...(emailRequest.text && { text: emailRequest.text }),
      ...(emailRequest.category && { tags: [{ name: 'category', value: emailRequest.category }] })
    }

    // Send email via Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(resendRequest),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('❌ Resend API error:', {
        status: response.status,
        statusText: response.statusText,
        result,
        request: { ...resendRequest, html: '[HTML_CONTENT]' } // Don't log full HTML
      })
      throw new Error(`Resend API error: ${response.status} - ${result.message || result.error || response.statusText}`)
    }

    console.log('✅ Email sent successfully via Resend:', result.id)

    return new Response(
      JSON.stringify({ 
        success: true,
        messageId: result.id,
        message: 'Email sent successfully via Resend',
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