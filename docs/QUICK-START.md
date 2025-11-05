# 🚀 Quick Start - Family Reward Chart (No Auth MVP)

Get your family reward chart running in **10 minutes**!

## What You'll Get

✅ Star tracking for Fíadh, Sé, Niall Óg, Mum, and Dad
✅ Cloud sync across all devices
✅ No login required - just works!
✅ Data persists forever in Supabase

---

## Step 1: Create Supabase Project (3 minutes)

1. Go to **https://supabase.com**
2. Sign in or create free account
3. Click **"New Project"**
4. Fill in:
   - **Name:** `family-reward-chart`
   - **Database Password:** (generate strong password - **SAVE THIS!**) gosdAh-piwta7-qywpef
   - **Region:** Choose closest to you
   - **Plan:** Free
5. Click **"Create new project"**
6. ⏰ Wait 2-3 minutes for setup

---

## Step 2: Create Database (2 minutes)

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file: `docs/supabase-schema-simple.sql`
4. Copy ALL the contents
5. Paste into SQL Editor
6. Click **"Run"** (or press Cmd/Ctrl + Enter)
7. ✅ You should see "Success. No rows returned"

### Verify It Worked

Run this query to check your data:
```sql
SELECT * FROM family_members ORDER BY display_order;
```

You should see:
- Fíadh (child, sky blue)
- Sé (child, light green)
- Niall Óg (child, plum)
- Mum (parent, yellow)
- Dad (parent, yellow)

---

## Step 3: Get Your Credentials (1 minute)

1. Go to **Settings** (⚙️ icon in sidebar) → **API**
2. Copy these two values:

   **Project URL:**
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```

   **anon/public key:** (long string under "Project API keys")
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...
   ```

3. **Keep these safe!** You'll need them next.

---

## Step 4: Configure Your App (2 minutes)

1. Open: `apps/reward-chart/public/index.html`

2. Find lines 691-692 (near the top of the `<script>` section):
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
   ```

3. Replace with YOUR actual values:
   ```javascript
   const SUPABASE_URL = 'https://xxxxxxxxxxxxx.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey...';
   ```

4. **Save the file!**

---

## Step 5: Run Your App! (1 minute)

```bash
# Start the dev server
nx serve reward-chart
```

Open your browser to:
```
http://localhost:4200
```

### ✅ Success Indicators

Check the browser console (F12 or Cmd+Option+I):
- You should see: **"✅ Supabase connected!"**
- You should see: **"✅ Loaded family members"**
- You should see: **"✅ Loaded star completions from Supabase"**

---

## Step 6: Test It! (2 minutes)

### Test 1: Add Some Stars
1. Click on any empty star (☆) to fill it (★)
2. Check console - you should see: **"💾 Saved to Supabase"**

### Test 2: Refresh the Page
1. Refresh your browser (Cmd/Ctrl + R)
2. Your stars should **still be there!** ✨

### Test 3: Open on Another Device
1. Open `http://localhost:4200` on your phone/tablet (same network)
2. Click a star on one device
3. Refresh the other device
4. **The star appears!** 🎉

---

## 🎉 You're Done!

Your family reward chart is live with cloud sync!

### What Works Now:
- ✅ Click stars to toggle them
- ✅ Stars save instantly to Supabase
- ✅ Refresh = data persists
- ✅ Multi-device sync (manual refresh)
- ✅ Weekly totals calculate automatically
- ✅ Progress bars toward rewards
- ✅ "New Week" button resets all stars

### What's Next (Optional):
- **Real-time sync:** Add Supabase realtime subscriptions
- **Authentication:** Add login so only family can access
- **Historical tracking:** Save past weeks' data
- **Reward redemption:** Track when rewards are claimed
- **Deploy:** Host on Vercel/Netlify for public URL

---

## Troubleshooting

### "⚠️ Supabase not configured"
- Check you replaced BOTH the URL and KEY
- Make sure there are no extra spaces or quotes
- Restart the dev server

### "Error loading family members"
- Check you ran the SQL schema (`supabase-schema-simple.sql`)
- Verify in Supabase: **Table Editor** → should see `family_members` table

### Stars don't save
- Check browser console for errors
- Verify your anon key has correct permissions (should by default)
- Try the Supabase SQL Editor: `SELECT * FROM star_completions;`

### Can't connect from phone
- Make sure phone is on same WiFi network
- Use your computer's IP address instead of `localhost`
  - Mac: System Preferences → Network → IP Address
  - Windows: `ipconfig` in command prompt
  - Access via: `http://192.168.x.x:4200`

---

## Need Help?

Check the detailed docs:
- **Full schema:** `docs/supabase-schema-simple.sql`
- **Implementation guide:** `docs/implementation-guide.md`
- **Project brief:** `docs/brief.md`

---

**Built with ❤️ for Fíadh, Sé, Niall Óg, Mum, and Dad**
