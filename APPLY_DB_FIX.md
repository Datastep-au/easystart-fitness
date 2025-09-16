# URGENT: Apply Database Fix

## Quick Fix for "Database error saving new user"

**The button is probably there but invisible due to CSS issues. First fix the database:**

### Step 1: Fix Database
1. Go to: https://supabase.com/dashboard/project/hzslclenaekvmebzoqio/sql/new
2. Paste this SQL and click "Run":

```sql
-- Fix profiles table RLS policy
create policy "profiles_insertable_by_user" on profiles
  for insert with check (auth.uid() = user_id);
```

### Step 2: Fix CSS Issue
The button is likely invisible. Try this in browser DevTools:
1. Press F12 (Developer Tools)
2. Go to Console tab
3. Paste and run:
```javascript
// Check if buttons exist but are hidden
document.querySelectorAll('button').forEach((btn, i) => {
  if (btn.textContent.includes('Create Account')) {
    console.log(`Button ${i}:`, btn);
    btn.style.backgroundColor = 'red';
    btn.style.color = 'white';
    btn.style.padding = '10px';
  }
});
```

### Step 3: If Button Still Missing
Clear cache and rebuild:
```bash
# Stop dev server (Ctrl+C)
rm -rf node_modules/.vite
npm run dev
```

The button should show as "Create Account" when in signup mode.