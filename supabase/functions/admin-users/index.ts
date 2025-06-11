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
      case 'POST':
        return await handleCreateUser(supabaseAdmin, req)
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
    // Get specific user
    const { data: user, error } = await supabaseAdmin.auth.admin.getUserById(userId)
    if (error) throw error

    // Get organization membership
    const { data: orgMembership } = await supabaseAdmin
      .from('organization_users')
      .select(`
        *,
        organization:organizations(name, slug, subscription_tier)
      `)
      .eq('email', user.email)

    return new Response(
      JSON.stringify({
        ...user,
        organization_memberships: orgMembership || [],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } else {
    // Get all users with pagination
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1000, // Adjust as needed
    })

    if (error) throw error

    // Enrich with organization data
    const enrichedUsers = await Promise.all(
      users.users.map(async (user: any) => {
        const { data: orgMembership } = await supabaseAdmin
          .from('organization_users')
          .select(`
            *,
            organization:organizations(name, slug, subscription_tier)
          `)
          .eq('email', user.email)

        return {
          ...user,
          organization_memberships: orgMembership || [],
        }
      })
    )

    return new Response(
      JSON.stringify({
        users: enrichedUsers,
        total: users.total || enrichedUsers.length,
      }),
      {
        headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    }
  )
}