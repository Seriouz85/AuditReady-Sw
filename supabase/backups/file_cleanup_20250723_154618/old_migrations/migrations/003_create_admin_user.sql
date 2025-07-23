-- ============================================================================
-- Create Platform Admin User Account
-- This creates the actual auth user for platform administration
-- ============================================================================

-- Create the auth user account for platform admin
-- Note: This only works in local development or via Supabase Dashboard in production
DO $$
DECLARE
    user_id UUID;
BEGIN
    -- Insert into auth.users (this only works in local Supabase)
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        invited_at,
        confirmation_token,
        confirmation_sent_at,
        recovery_token,
        recovery_sent_at,
        email_change_token_new,
        email_change,
        email_change_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        created_at,
        updated_at,
        phone,
        phone_confirmed_at,
        phone_change,
        phone_change_token,
        phone_change_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'Payam.Razifar@gmail.com',
        crypt('knejs2015', gen_salt('bf')), -- Encrypted password
        NOW(),
        NOW(),
        '',
        NOW(),
        '',
        NULL,
        '',
        '',
        NULL,
        NULL,
        '{"provider": "email", "providers": ["email"]}',
        '{"name": "Payam Razifar", "email": "Payam.Razifar@gmail.com"}',
        FALSE,
        NOW(),
        NOW(),
        NULL,
        NULL,
        '',
        '',
        NULL,
        '',
        0,
        NULL,
        '',
        NULL,
        FALSE,
        NULL
    ) RETURNING id INTO user_id;

    -- Insert into auth.identities
    INSERT INTO auth.identities (
        provider_id,
        user_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at,
        email
    ) VALUES (
        'Payam.Razifar@gmail.com',
        user_id,
        format('{"sub": "%s", "email": "%s", "email_verified": true, "phone_verified": false}', user_id::text, 'Payam.Razifar@gmail.com')::jsonb,
        'email',
        NOW(),
        NOW(),
        NOW(),
        'Payam.Razifar@gmail.com'
    );

    RAISE NOTICE 'Platform admin user created with ID: %', user_id;

EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Could not create auth user (this is normal in production): %', SQLERRM;
END $$;