-- Fix for profiles table RLS policy
-- Run this in Supabase SQL Editor if you're getting "Database error saving new user"

-- Add missing INSERT policy for profiles table
create policy "profiles_insertable_by_user" on profiles
  for insert with check (auth.uid() = user_id);

-- Verify policies are working
select schemaname, tablename, policyname, permissive, roles, cmd, qual 
from pg_policies 
where tablename = 'profiles';