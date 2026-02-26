# Data Corruption Fix - Deployment Guide

## Problem Identified

**Root Cause**: Period tracker and mood tracker entries were being included in the `completions` and `qtyLogs` data structures, causing them to be treated as habits. This corrupted the habit data and caused:
- Habit data to appear "lost" after updating mood/period
- Duplicate entries in Google Sheets  
- Old habit data showing on PC even after force refresh

## Fix Applied

Modified `google_appscript.txt` (Lines 164-168) to filter out period_tracker and mood_* entries:

```javascript
allRows.forEach(row => {
  const habitId = row[0];
  const dateKey = row[1];
  const completedVal = row[2];
  const qtyVal = row[3];
  
  // CRITICAL FIX: Skip period_tracker and mood_* entries
  // These should only be in periodDates/moods, NOT in completions/qtyLogs
  if (habitId === 'period_tracker' || habitId.startsWith('mood_')) {
    return; // Skip this entry
  }
  
  // Rest of the code...
});
```

## Deployment Steps

### Step 1: Update Google Apps Script

1. Open your Google Sheets habit tracker file
2. Go to **Extensions** > **Apps Script**
3. Find the `getAll()` function (around line 95)
4. Locate the `allRows.forEach(row => {` loop (around line 164)
5. Add the filter check **immediately after** getting habitId:

```javascript
allRows.forEach(row => {
  const habitId = row[0];
  const dateKey = row[1];
  const completedVal = row[2];
  const qtyVal = row[3];
  
  // Add these lines HERE:
  if (habitId === 'period_tracker' || habitId.startsWith('mood_')) {
    return;
  }
  
  // ... rest of your existing code
});
```

### Step 2: Deploy New Version

**IMPORTANT**: You must create a NEW deployment for changes to take effect!

1. Click **Deploy** > **Manage deployments**
2. Click the ✏️ (Edit) icon next to your existing deployment
3. Under "Version", click **New version**
4. Add description: "Fix: Filter period/mood from habit completions"
5. Click **Deploy**
6. Copy the new deployment URL if it changed

### Step 3: Update Frontend (if URL changed)

If you got a new deployment URL:

1. Open `habit-tracker-v6.html`
2. Find the line with `const SCRIPT_URL = "..."`
3. Replace with your new deployment URL
4. Save the file

### Step 4: Verify the Fix

1. Open the habit tracker in your browser
2. Open browser console (F12)
3. Click **Force Clean Sync** button
4. Check the console output - you should see:

```
🔄 FORCE CLEAN SYNC - Starting...
Before sync - Local data:
  - Habits: X
  - Completions: Y habits
📡 Calling getAll API...
✓ Received data from Google Sheets:
  - Habits: X
  - Completions: Y habits (should match habits count)
  - Period dates: Z dates
  - Mood data: 3 users
```

5. **Key verification**: The number of completions should match or be less than the number of habits. If completions > habits, the fix didn't apply.

### Step 5: Test Complete Flow

1. **Update a mood**: Set mood for one user
2. **Check console**: Should see successful mood save
3. **Check habits**: Verify habit data is still present and correct
4. **Check Sheets**: Verify no duplicate entries in assignee sheets
5. **Test on mobile**: Force refresh and verify data syncs correctly

## Enhanced Force Refresh

The force refresh now has better logging to help diagnose issues:

- Shows local data **before** sync
- Shows server data **after** receiving it
- Warns if server returns zero habits
- Shows actual habit IDs and names
- Reports each step of the process

## Troubleshooting

### "Server returned ZERO habits"

If you see this warning but you have habits in Sheets:
- Make sure you're looking at the correct Google Sheet
- Check that the "Habits" sheet has data starting from row 2
- Verify the script is reading from the correct spreadsheet

### Completions Count > Habits Count

This means the filter didn't apply yet:
- Double-check you deployed a **new version** (not just saved)
- Make sure you're using the **new deployment URL**
- Try clearing browser cache and reloading

### Habit Data Still Getting Lost

If habits still disappear after updating mood/period:
1. Check browser console for errors
2. Verify the script deployment is active
3. Check that `periodDates` and `moods` are saving to separate localStorage keys
4. Make sure the `savePeriodData` and `saveMoodData` functions have `await` keywords

### Force Refresh Shows Old Data

If force refresh doesn't clear old data:
1. Check browser console - it should show "Before sync" and "After sync" data
2. Verify the API call returns data (look for "✓ Received data")
3. If habits.length is correct but UI shows old data, there might be a rendering issue
4. Try a hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

## Testing Checklist

- [ ] Backend script updated with filter
- [ ] New deployment created and URL confirmed
- [ ] Frontend SCRIPT_URL updated (if URL changed)
- [ ] Force clean sync completes without errors
- [ ] Habit count matches between server and local
- [ ] Update mood - habits remain intact
- [ ] Update period - habits remain intact
- [ ] No duplicate entries in Google Sheets
- [ ] Mobile device syncs correctly
- [ ] Console shows detailed sync logs

## What Changed

### Backend (google_appscript.txt)
- Added filter in `getAll()` to skip period_tracker and mood_* entries when building completions/qtyLogs
- This ensures period and mood data only appear in their dedicated data structures

### Frontend (habit-tracker-v6.html)
- Enhanced `forceCleanSync()` with detailed logging
- Shows before/after data counts
- Warns when server returns unexpected data
- Reports each step for debugging

## Recovery Steps (if data is already corrupted)

If your sheets already have corrupted data:

1. **Manual cleanup** (recommended):
   - Open each assignee sheet (Satish, KeerthiSri, Geetanath)
   - Look for rows with `habit_id` = "period_tracker" or "mood_*"
   - Note: These entries should exist ONLY for their specific purposes
   - Delete any entries that are incorrectly duplicated

2. **Force clean sync**:
   - After deploying the fix, do a force clean sync
   - This will load clean data from sheets to your browser

3. **Verify**:
   - Check that habits display correctly
   - Update a mood and verify habits don't disappear
   - Check mobile devices sync properly

---

**Last Updated**: Fix deployed on [DATE]
**Status**: Ready for testing
**Next Step**: Deploy to Google Apps Script with new version
