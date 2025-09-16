# Database Fix Instructions

## Issue: "Database error saving new user"

The app is currently running at: http://localhost:5174/

Before testing user registration, you need to apply a database fix to the Supabase instance.

## How to Fix:

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Navigate to your project: https://supabase.com/dashboard/project/hzslclenaekvmebzoqio

2. **Open SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run the Fix**
   Copy and paste this SQL command:
   ```sql
   -- Add missing INSERT policy for profiles table
   create policy "profiles_insertable_by_user" on profiles
     for insert with check (auth.uid() = user_id);
   ```

4. **Click "Run" to execute**

5. **Verify the Fix**
   Run this query to check policies are working:
   ```sql
   select schemaname, tablename, policyname, permissive, roles, cmd, qual 
   from pg_policies 
   where tablename = 'profiles';
   ```

## What to Test After Fix:

### 1. User Registration (Fixed)
- Go to http://localhost:5174/
- Try creating a new account with:
  - Name: Test User
  - Email: test@example.com  
  - Password: password123
- Should work without "Database error"

### 2. UI Styling (Fixed)
- Check that icons in form fields don't overlap with text
- Input fields should look clean and professional
- Icons should be properly spaced from text

### 3. Full App Flow
- After successful registration, you should be able to:
  - Complete the 5-step onboarding process
  - Generate a personalized workout program
  - Access the "Today" view with your workout

## Alternative: Use Pre-Built Version
If you prefer, you can also test the fixes on the live deployment:
https://datastep-au.github.io/easystart-fitness/

The database fix needs to be applied there as well for full functionality.