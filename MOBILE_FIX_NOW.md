# Fix Mobile Wrong Data - RIGHT NOW ⚡

Your Google Sheets has correct data, but your mobile is showing wrong markings because it has stale cached data.

## Quick Fix (2 minutes)

### Option 1: Use the Force Refresh Button (Easiest) ⭐

1. **Open** `habit-tracker-v6.html` on your mobile (use the updated file)
2. **Tap** the ☰ menu icon (top-left corner) to open the sidebar
3. **Scroll down** to the sync section (where it shows "Synced" or "Not connected")
4. **Tap** the **"🔄 Force Refresh"** button (below the sync status)
5. **Confirm** when it asks "Force clean sync will completely replace your local data..."
6. **Wait** for "Force sync complete" message (2-5 seconds)
7. **Done!** Your mobile now shows the same data as Google Sheets ✅

### Option 2: Browser Console (Alternative)

1. **Open** habit-tracker on your mobile browser
2. **Open** browser developer tools (method varies by browser):
   - **Chrome Android:** Menu → More Tools → Developer Tools
   - **Safari iOS:** Settings → Safari → Advanced → Web Inspector
   - **Firefox Android:** Menu → Settings → About Firefox → Tap logo 5 times → Settings → Remote debugging
3. **Open Console** tab
4. **Type:** `forceCleanSync()`
5. **Press Enter**
6. **Confirm** the warning
7. **Done!** ✅

### Option 3: Clear Cache + Normal Sync (Slower)

1. **Clear browser cache:**
   - Chrome: Settings → Privacy → Clear browsing data → Cached files
   - Safari: Settings → Safari → Clear History and Website Data
2. **Close** the habit tracker tab completely
3. **Reopen** habit-tracker
4. **Wait** for automatic sync to complete
5. **Done!** ✅

## What Just Happened?

The Force Refresh:
- ✅ Downloaded fresh data from Google Sheets
- ✅ Deleted all stale cached data from your mobile
- ✅ Saved the correct data to local cache
- ✅ Updated the display

Your mobile now matches Google Sheets **exactly**.

## Verify It Worked

Check these:
- [ ] Habit completion marks match Google Sheets
- [ ] Day count is correct (3 days marked shows as 3, not 4)
- [ ] Streaks are accurate
- [ ] Quantity logs show correct values

## If It Still Doesn't Work

1. **Check Google Sheets** - Make sure your Script URL is correct and the script is deployed
2. **Check Sync Status** - Should show green dot with timestamp
3. **Try Again** - Sometimes needs a second try if connection was slow
4. **Contact Support** - Share the browser console output (F12 → Console tab)

## Prevention

To avoid this in the future:
- **Always click sync** after making changes on desktop
- **Wait for green sync dot** before closing browser
- **Use Force Refresh** if ever in doubt
- **Check Google Sheets** to verify data

---

**Your mobile should now be fixed!** 🎉

The wrong markings are gone, and everything should match Google Sheets perfectly.
