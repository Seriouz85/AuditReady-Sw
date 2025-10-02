import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase Admin client
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

    // Verify the requesting user is a platform admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Invalid token')
    }

    // Check if user is platform admin
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('platform_administrators')
      .select('id')
      .eq('email', user.email)
      .eq('is_active', true)
      .single()

    if (adminError || !adminData) {
      throw new Error('Platform administrator access required')
    }

    const url = new URL(req.url)
    const action = url.pathname.split('/').pop()

    switch (req.method) {
      case 'GET':
        return await handleGetUsers(supabaseAdmin, action)
      case 'POST': {
        const bodyText = await req.text()
        const body = bodyText ? JSON.parse(bodyText) : {}
        if (body.action === 'reset_password') {
          return await handlePasswordReset(supabaseAdmin, body)
        } else if (body.action === 'remove_mfa') {
          return await handleRemoveMFA(supabaseAdmin, body)
        }
        // For user creation, we need to create a new request with the body
        const createReq = new Request(req.url, {
          method: 'POST',
          headers: req.headers,
          body: bodyText,
        })
        return await handleCreateUser(supabaseAdmin, createReq)
      }
      case 'PUT':
        return await handleUpdateUser(supabaseAdmin, req, action)
      case 'DELETE':
        return await handleDeleteUser(supabaseAdmin, action)
      default:
        throw new Error('Method not allowed')
    }
  } catch (error) {
    console.error('Admin users API error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})

async function handleGetUsers(supabaseAdmin: any, userId?: string) {
  if (userId && userId !== 'admin-users') {
    // Get specific user from organization_users
    const { data: orgUser, error: orgError } = await supabaseAdmin
      .from('organization_users')
      .select(`
        *,
        organization:organizations(name, slug, subscription_tier)
      `)
      .eq('user_id', userId)
      .single()

    if (orgError) throw orgError

    // Try to get auth user data (may fail, that's ok)
    let authUser = null
    try {
      const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
      authUser = user
    } catch (e) {
      console.log('Could not fetch auth user, using org data only')
    }

    return new Response(
      JSON.stringify({
        id: orgUser.user_id,
        email: authUser?.email || orgUser.user_id,
        created_at: orgUser.created_at,
        last_sign_in_at: orgUser.last_login_at,
        organization_memberships: [orgUser],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } else {
    // WORKAROUND: auth.admin.listUsers() has database issues
    // Instead, query auth.users directly via SQL using service role
    console.log('🔍 Querying auth.users directly via SQL')

    const { data: authUsers, error: authSqlError } = await supabaseAdmin
      .rpc('get_all_auth_users')

    let allUsers = []

    if (authSqlError || !authUsers) {
      console.warn('⚠️ RPC failed, trying direct approach:', authSqlError?.message)

      // Fallback: Get user IDs from organization_users and platform_administrators
      const { data: orgUsers } = await supabaseAdmin
        .from('organization_users')
        .select('user_id')

      const { data: adminUsers } = await supabaseAdmin
        .from('platform_administrators')
        .select('id')

      // Collect all unique user IDs
      const userIds = new Set()
      orgUsers?.forEach((u: any) => userIds.add(u.user_id))
      adminUsers?.forEach((u: any) => userIds.add(u.id))

      // Also add known user IDs
      userIds.add('031dbc29-51fd-4135-9582-a9c5b63f7451') // demo user
      userIds.add('40bb613f-aba0-4566-8d84-3b316e5093de') // payam
      userIds.add('5cfd0d8d-3768-4f21-a38f-5626270c78af') // admin

      console.log('🔍 Found', userIds.size, 'unique user IDs')

      // Fetch each user individually
      allUsers = await Promise.all(
        Array.from(userIds).map(async (userId: any) => {
          try {
            const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
            if (!error && data?.user) {
              return data.user
            }
          } catch (e) {
            console.log(`Could not fetch user ${userId}:`, e)
          }
          return null
        })
      )

      allUsers = allUsers.filter(u => u !== null)
    } else {
      allUsers = authUsers
    }

    console.log('✅ Got', allUsers.length, 'auth users')

    // Get organization memberships for enrichment
    const { data: orgUsers, error: orgError } = await supabaseAdmin
      .from('organization_users')
      .select(`
        user_id,
        created_at,
        last_login_at,
        organization:organizations(name, slug, subscription_tier)
      `)

    // Create a map of user_id to organization data
    const orgMap = new Map()
    if (!orgError && orgUsers) {
      orgUsers.forEach((orgUser: any) => {
        if (!orgMap.has(orgUser.user_id)) {
          orgMap.set(orgUser.user_id, [])
        }
        orgMap.get(orgUser.user_id).push(orgUser)
      })
    }

    // Map all auth users with organization data if available
    const enrichedUsers = allUsers.map((authUser: any) => {
      const orgMemberships = orgMap.get(authUser.id) || []

      return {
        id: authUser.id,
        email: authUser.email || 'No email found',
        created_at: authUser.created_at,
        last_sign_in_at: authUser.last_sign_in_at,
        email_confirmed_at: authUser.email_confirmed_at,
        user_metadata: authUser.user_metadata || {},
        organization_memberships: orgMemberships,
      }
    })

    console.log('✅ Returning', enrichedUsers.length, 'enriched users')

    return new Response(
      JSON.stringify({
        users: enrichedUsers,
        total: enrichedUsers.length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
}

async function handleCreateUser(supabaseAdmin: any, req: Request) {
  const body = await req.json()
  const { email, password, userData, organizationId, role } = body

  // Create user in Supabase Auth
  const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: userData || {},
    email_confirm: true, // Auto-confirm email for admin-created users
  })

  if (createError) throw createError

  // Add to organization if specified
  if (organizationId) {
    const { error: orgError } = await supabaseAdmin
      .from('organization_users')
      .insert({
        organization_id: organizationId,
        email: email,
        name: userData?.name || email.split('@')[0],
        role: role || 'user',
        is_active: true,
      })

    if (orgError) {
      // If organization insertion fails, clean up the auth user
      await supabaseAdmin.auth.admin.deleteUser(user.user.id)
      throw orgError
    }
  }

  // Log user creation
  await supabaseAdmin.from('enhanced_audit_logs').insert({
    action: 'user_created_by_admin',
    resource_type: 'auth_user',
    resource_id: user.user.id,
    actor_type: 'platform_admin',
    details: {
      email,
      organization_id: organizationId,
      role,
    },
  })

  return new Response(
    JSON.stringify({ user: user.user }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    }
  )
}

async function handleUpdateUser(supabaseAdmin: any, req: Request, userId: string) {
  const body = await req.json()
  const { userData, organizationMemberships, suspended } = body

  // Update user metadata
  if (userData) {
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: userData,
    })

    if (updateError) throw updateError
  }

  // Handle suspension/unsuspension
  if (suspended !== undefined) {
    if (suspended) {
      // Suspend user
      const { error: suspendError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: '876000h', // 100 years (effectively permanent)
      })

      if (suspendError) throw suspendError
    } else {
      // Unsuspend user
      const { error: unsuspendError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        ban_duration: 'none',
      })

      if (unsuspendError) throw unsuspendError
    }
  }

  // Update organization memberships
  if (organizationMemberships) {
    const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (!user) throw new Error('User not found')

    // Remove existing memberships
    await supabaseAdmin
      .from('organization_users')
      .delete()
      .eq('email', user.email)

    // Add new memberships
    if (organizationMemberships.length > 0) {
      const memberships = organizationMemberships.map((membership: any) => ({
        organization_id: membership.organization_id,
        email: user.email,
        name: user.user_metadata?.name || user.email.split('@')[0],
        role: membership.role || 'user',
        is_active: true,
      }))

      const { error: insertError } = await supabaseAdmin
        .from('organization_users')
        .insert(memberships)

      if (insertError) throw insertError
    }
  }

  // Log user update
  await supabaseAdmin.from('enhanced_audit_logs').insert({
    action: 'user_updated_by_admin',
    resource_type: 'auth_user',
    resource_id: userId,
    actor_type: 'platform_admin',
    details: {
      updates: body,
    },
  })

  return new Response(
    JSON.stringify({ message: 'User updated successfully' }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handleDeleteUser(supabaseAdmin: any, userId: string) {
  // Get user details before deletion
  const { data: user } = await supabaseAdmin.auth.admin.getUserById(userId)
  
  // Remove from organization memberships
  if (user) {
    await supabaseAdmin
      .from('organization_users')
      .delete()
      .eq('email', user.email)
  }

  // Delete user from auth
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
  if (deleteError) throw deleteError

  // Log user deletion
  await supabaseAdmin.from('enhanced_audit_logs').insert({
    action: 'user_deleted_by_admin',
    resource_type: 'auth_user',
    resource_id: userId,
    actor_type: 'platform_admin',
    details: {
      email: user?.email,
    },
  })

  return new Response(
    JSON.stringify({ message: 'User deleted successfully' }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handlePasswordReset(supabaseAdmin: any, body: any) {
  const { email } = body

  if (!email) {
    throw new Error('Email is required for password reset')
  }

  // Send password reset email using Supabase Auth
  const { error } = await supabaseAdmin.auth.admin.generateLink({
    type: 'recovery',
    email: email,
  })

  if (error) throw error

  // Log the password reset action
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users?.users.find((u: any) => u.email === email)

  if (user) {
    await supabaseAdmin.from('user_activity_log').insert({
      user_id: user.id,
      activity_type: 'password_reset',
      metadata: {
        email,
        reset_sent_at: new Date().toISOString(),
        initiated_by_admin: true,
      },
    })
  }

  return new Response(
    JSON.stringify({
      message: 'Password reset email sent successfully',
      success: true
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}

async function handleRemoveMFA(supabaseAdmin: any, body: any) {
  const { userId, factorId } = body

  if (!userId || !factorId) {
    throw new Error('User ID and Factor ID are required')
  }

  // Delete the MFA factor using admin client
  const { error } = await supabaseAdmin.auth.admin.mfa.deleteFactor({
    id: factorId,
    userId: userId,
  })

  if (error) throw error

  // Log the MFA removal action
  await supabaseAdmin.from('user_activity_log').insert({
    user_id: userId,
    activity_type: 'mfa_device_removed',
    metadata: {
      factor_id: factorId,
      removed_at: new Date().toISOString(),
      removed_by_admin: true,
    },
  })

  return new Response(
    JSON.stringify({
      message: 'MFA device removed successfully',
      success: true
    }),
    {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}