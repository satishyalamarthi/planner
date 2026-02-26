# Period & Mood Sync Troubleshooting Guide 🩸😊

## Problem: Period and Mood data not syncing to Google Sheets

Follow these steps in order to fix the issue:

---

## Step 1: Verify Google Apps Script is Updated ⚠️

**This is the most common issue!**

### Check if you deployed the updated script:

1. **Open Google Sheets** → Your "Keerthi Planner Data" or similar spreadsheet
2. **Extensions > Apps Script**
3. **Look at the code** - Search for `savePeriodData` or `saveMoodData`
   - ✅ **Found it?** → Script is updated, go to Step 2
   - ❌ **Not found?** → **You need to update the script!** See below

### Update the Script NOW:

1. In Apps Script editor, **select ALL code** (Ctrl+A)
2. **Delete it**
3. Open [google_appscript.txt](google_appscript.txt)
4. **Copy entire contents**
5. **Paste** into Apps Script editor
6. **Save** (Ctrl+S or disk icon)
7. **Deploy:**
   - Click **Deploy > Manage deployments**
   - Click **✏️ Edit** (pencil icon) on your existing deployment
   - Under "Version", select **New version**
   - Click **Deploy**
   - ✅ Done!

**Important:** You MUST do a new version deployment for changes to take effect!

---

## Step 2: Test Sync in Browser Console

### Open Browser Console:
- **Windows/Linux:** Press **F12** or **Ctrl+Shift+I**
- **Mac:** Press **Cmd+Option+I**
- Click the **Console** tab

### Test Period Sync:

1. Go to **Period Tracker** view in the habit tracker
2. **Click on any date** to mark/unmark it
3. **Look at console** - You should see:
   ```
   ✓ Period data synced to Google Sheets
   ```
4. **If you see an error instead:**
   - Copy the entire error message
   - See "Common Errors" section below

### Test Mood Sync:

1. Go to **Mood Tracker** view in the habit tracker
2. **Click on a mood** (e.g., Happy 😊)
3. **Look at console** - You should see:
   ```
   ✓ Mood data synced to Google Sheets
   ```
4. **If you see an error instead:**
   - Copy the entire error message
   - See "Common Errors" section below

---

## Step 3: Use Debug Info

### Triple-Click Sync Status:

1. In the sidebar (left side), find the **sync status** (shows "Synced" or "Not connected")
2. **Click it 3 times quickly** (triple-click)
3. A **debug dialog** will appear showing:
   - Period dates count (local and server)
   - Mood entries count (local and server)
   - Whether server has period/mood data

### What to look for:

**Good (Working):**
```
Period dates: 5
Mood entries: 10

SERVER DATA:
Server period dates: 5
Server mood entries: 10
Server has periodDates: true
Server has moods: true
```

**Bad (Not working):**
```
Period dates: 5
Mood entries: 10

SERVER DATA:
Server period dates: 0
Server mood entries: 0
Server has periodDates: false  ❌
Server has moods: false        ❌
```

If you see `false` for server data, the script is NOT updated. Go back to Step 1.

---

## Step 4: Check Google Sheets Directly

### Look at your spreadsheet:

1. **Open Google Sheets** → Your habit tracker spreadsheet
2. **Look for sheets** named: **Satish**, **KeerthiSri**, **Geetanath**
3. **Open one of these sheets** (e.g., Satish)
4. **Look for rows** with these habit IDs:
   - `period_tracker` (for period dates)
   - `mood_satish` (for Satish's moods)
   - `mood_keerthisri` (for KeerthiSri's moods)
   - `mood_geetanath` (for Geetanath's moods)

### Example of what you should see:

| habitId | date | done | qtyValue |
|---------|------|------|----------|
| period_tracker | 2026-02-15 | TRUE | |
| period_tracker | 2026-02-16 | TRUE | |
| mood_satish | 2026-02-15 | | happy |
| mood_satish | 2026-02-14 | | good |

**If you DON'T see these rows:**
- The script is not updated OR
- The sync is failing silently
- Check console for errors (Step 2)

---

## Common Errors & Solutions

### Error: "Unknown action: savePeriodData"

**Cause:** Google Apps Script is not updated with the new functions.

**Solution:**
1. Go to Step 1 above
2. Update and redeploy the script
3. Make sure to do a **New version** deployment

---

### Error: "Request failed" or "Network error"

**Cause:** Script URL might be wrong or script not deployed.

**Solution:**
1. Check your Script URL in the habit tracker settings
2. Make sure it ends with `/exec` (not `/dev`)
3. Redeploy the script as Web App
4. Copy the new URL if it changed

---

### Error: "Script function not found"

**Cause:** Old cached version of script still running.

**Solution:**
1. Redeploy with **New version** (not update existing)
2. Wait 1-2 minutes for Google to update
3. Hard refresh browser (Ctrl+F5)
4. Try again

---

### No errors but data not appearing on other device

**Cause:** Data is syncing UP but not syncing DOWN.

**Solution:**
1. On the other device, click **↻ Sync** button
2. Or use **🔄 Force Refresh** button
3. Wait 3-5 seconds
4. Data should appear

---

## Step 5: Force Refresh Test

This is the nuclear option - it will prove whether sync is working:

1. **Open habit tracker on Device A**
2. Mark some period dates and set some moods
3. Triple-click sync status → Check that local has data
4. **Open habit tracker on Device B**
5. Click **🔄 Force Refresh** button
6. Triple-click sync status → Check if server data appeared

**If Device B now has the data:** ✅ Sync is working!
**If Device B still has NO data:** ❌ Script not updated or sync failing

---

## Quick Diagnostic Checklist

Work through this checklist:

- [ ] **Updated Google Apps Script** with new code from google_appscript.txt
- [ ] **Deployed new version** (not just saved)
- [ ] **Browser console shows** "✓ Period/Mood data synced" when making changes
- [ ] **No errors in console** when marking period or setting mood
- [ ] **Debug info shows** server has periodDates: true and moods: true
- [ ] **Google Sheets shows** period_tracker and mood_* rows
- [ ] **Force Refresh** brings data from Google Sheets to device

---

## Still Not Working?

### Last Resort Steps:

1. **Clear all cache:**
   - Triple-click sync status
   - Click OK to clear cache
   - Force Refresh

2. **Manual test in Apps Script:**
   - Go to Apps Script editor
   - Find function `debugShowQtyLogs` (at bottom of script)
   - Click **Run**
   - Check **View > Executions** for output
   - Should show period_tracker and mood_* entries

3. **Check specific error messages:**
   - Open browser console (F12)
   - Try to mark a period date
   - Copy the EXACT error message
   - Share it for more specific help

---

## Expected Behavior

### When working correctly:

**Period Tracker:**
- Click date → Instant UI update → Console: "✓ Period data synced" → Sync status shows timestamp
- Open on other device → Click sync → Period date appears

**Mood Tracker:**
- Click mood → Instant UI update → Console: "✓ Mood data synced" → Sync status shows timestamp
- Open on other device → Click sync → Mood appears

**Force Refresh:**
- Click button → Loads fresh data → Console shows period/mood counts → UI updates with server data

---

## Summary

**Most common issue:** Google Apps Script not updated/deployed with new version.

**Fix:** Update script, deploy NEW VERSION (not update existing), wait 1 minute, test again.

**Verification:** Console should show "✓ Period/Mood data synced", debug info should show server has data, Google Sheets should show period_tracker and mood_* rows.

Good luck! 🎉
