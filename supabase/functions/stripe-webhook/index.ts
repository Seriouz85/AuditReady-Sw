import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.18.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
  apiVersion: '2023-10-16',
})

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    return new Response('No signature', { status: 400 })
  }

  try {
    const body = await req.text()
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    
    // Verify webhook signature
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider
    )

    // Initialize Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const organizationId = session.metadata?.organization_id

        if (organizationId && session.subscription) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)
          
          // Create subscription record
          await supabaseAdmin.from('subscriptions').insert({
            organization_id: organizationId,
            stripe_subscription_id: subscription.id,
            stripe_customer_id: subscription.customer as string,
            tier: subscription.metadata.tier || 'starter',
            status: subscription.status,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
            metadata: {
              price_id: subscription.items.data[0].price.id,
              product_id: subscription.items.data[0].price.product,
            },
          })

          // Update organization tier
          await supabaseAdmin
            .from('organizations')
            .update({ 
              subscription_tier: subscription.metadata.tier || 'starter',
              subscription_starts_at: new Date().toISOString(),
            })
            .eq('id', organizationId)

          // Send welcome email after successful payment
          try {
            // Get organization details and owner
            const { data: org } = await supabaseAdmin
              .from('organizations')
              .select(`
                name,
                organization_users!inner(
                  users!inner(email, user_metadata)
                )
              `)
              .eq('id', organizationId)
              .eq('organization_users.role', 'admin')
              .single()

            if (org && org.organization_users[0]?.users?.email) {
              const user = org.organization_users[0].users
              const userName = user.user_metadata?.first_name || user.email.split('@')[0]
              
              // Send welcome email via send-email function
              const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-email`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
                },
                body: JSON.stringify({
                  to: [{
                    email: user.email,
                    name: userName
                  }],
                  subject: `Welcome to AuditReady - Your ${subscription.metadata.tier || 'starter'} plan is ready!`,
                  html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                      <h2 style="color: #2563eb;">Welcome to AuditReady!</h2>
                      <p>Hi ${userName},</p>
                      <p>Congratulations! Your payment has been processed successfully and your <strong>${subscription.metadata.tier || 'starter'}</strong> plan is now active.</p>
                      
                      <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="margin-top: 0;">Your Account Details:</h3>
                        <ul>
                          <li><strong>Organization:</strong> ${org.name}</li>
                          <li><strong>Plan:</strong> ${subscription.metadata.tier || 'starter'}</li>
                          <li><strong>Login Email:</strong> ${user.email}</li>
                        </ul>
                      </div>
                      
                      <p><a href="${Deno.env.get('SITE_URL') || 'https://app.auditready.com'}/app" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Access Your Dashboard</a></p>
                      
                      <p>You can now:</p>
                      <ul>
                        <li>Add compliance standards to your organization</li>
                        <li>Manage requirements and track progress</li>
                        <li>Invite team members</li>
                        <li>Generate compliance reports</li>
                      </ul>
                      
                      <p>If you have any questions, please don't hesitate to reach out to our support team.</p>
                      
                      <p>Best regards,<br>The AuditReady Team</p>
                    </div>
                  `,
                  category: 'welcome-payment'
                })
              })

              if (!emailResponse.ok) {
                console.error('Failed to send welcome email:', await emailResponse.text())
              }
            }
          } catch (emailError) {
            console.error('Error sending welcome email:', emailError)
            // Don't fail the webhook if email fails
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription record
        await supabaseAdmin
          .from('subscriptions')
          .update({
            status: subscription.status,
            tier: subscription.metadata.tier,
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscription.cancel_at_period_end,
            canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
          })
          .eq('stripe_subscription_id', subscription.id)
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Update subscription status
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', subscription.id)

        // Downgrade organization to free tier
        const { data: sub } = await supabaseAdmin
          .from('subscriptions')
          .select('organization_id')
          .eq('stripe_subscription_id', subscription.id)
          .single()

        if (sub) {
          await supabaseAdmin
            .from('organizations')
            .update({ 
              subscription_tier: 'free',
              subscription_ends_at: new Date().toISOString(),
            })
            .eq('id', sub.organization_id)
        }
        break
      }

      case 'invoice.created':
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const organizationId = invoice.metadata?.organization_id || 
          (await supabaseAdmin
            .from('subscriptions')
            .select('organization_id')
            .eq('stripe_customer_id', invoice.customer as string)
            .single()).data?.organization_id

        if (organizationId) {
          await supabaseAdmin.from('invoices').upsert({
            organization_id: organizationId,
            stripe_invoice_id: invoice.id,
            amount_due: invoice.amount_due,
            amount_paid: invoice.amount_paid,
            currency: invoice.currency,
            status: invoice.status || 'draft',
            invoice_pdf: invoice.invoice_pdf,
            hosted_invoice_url: invoice.hosted_invoice_url,
            period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
            period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
            due_date: invoice.due_date ? new Date(invoice.due_date * 1000).toISOString() : null,
            paid_at: invoice.status === 'paid' ? new Date().toISOString() : null,
          })
        }
        break
      }
    }

    // Log webhook event
    await supabaseAdmin.from('enhanced_audit_logs').insert({
      action: `stripe_webhook_${event.type}`,
      resource_type: 'webhook',
      resource_id: event.id,
      actor_type: 'system',
      details: {
        event_type: event.type,
        event_id: event.id,
        livemode: event.livemode,
      },
    })

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 400 }
    )
  }
})