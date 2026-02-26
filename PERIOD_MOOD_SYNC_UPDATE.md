# Period & Mood Tracker Sync Update 🩸😊

## What's New

Period tracker and mood tracker now **automatically sync** with Google Sheets, just like habits! 

Previously, these trackers only saved to localStorage (local device only). Now they sync across all your devices.

---

## Features Added ✅

### 1. **Automatic Sync on Save**
- **Period Tracker:** Every time you mark/unmark a period day, it syncs to Google Sheets
- **Mood Tracker:** Every time you set or delete a mood, it syncs to Google Sheets

### 2. **Load on Startup**
- When you open the habit tracker, it loads the latest period and mood data from Google Sheets
- Your data appears on all devices automatically

### 3. **Force Refresh Support**
- The "🔄 Force Refresh" button now also syncs period and mood data
- Perfect for fixing any sync issues

### 4. **Multi-Device Support**
- Mark period days on mobile → see them on desktop
- Set mood on desktop → see it on mobile
- All changes sync automatically (within seconds)

---

## How It Works

### Backend (Google Sheets)
Period and mood data are stored in the assignee sheets using special row types:

**Period Tracker:**
- Uses habit ID: `period_tracker`
- Stores period dates as completion rows
- Example: `period_tracker | 2026-02-15 | true | `

**Mood Tracker:**
- Uses habit ID pattern: `mood_<userId>` (e.g., `mood_satish`)
- Stores mood ID in the qtyValue column
- Example: `mood_satish | 2026-02-15 | | happy`

### Frontend (Habit Tracker)
- `savePeriodData()` → Saves to localStorage + Google Sheets
- `saveMoodData()` → Saves to localStorage + Google Sheets
- `loadFromSheets()` → Loads period and mood data from server
- `forceCleanSync()` → Force refreshes including period and mood

---

## Files Updated

### 1. **google_appscript.txt** (Backend)
- **Lines 27-28:** Added `savePeriodData` and `saveMoodData` action handlers
- **Lines 209-246:** Return period and mood data in `getAll()` response
- **Lines 411-489:** New functions `savePeriodData()` and `saveMoodData()`

### 2. **habit-tracker-v6.html** (Frontend)
- **Lines 987-988, 1026-1028:** Added period/mood logging to Force Refresh
- **Lines 1009-1020:** Save period and mood data in Force Clean Sync
- **Lines 1163-1197:** Load and merge period/mood data in normal sync
- **Lines 2157-2171:** Updated `savePeriodData()` to sync to Sheets
- **Lines 2248-2262:** Updated `saveMoodData()` to sync to Sheets

---

## How to Apply the Update

### Step 1: Update Google Apps Script (Required)
1. Open your Google Sheets spreadsheet
2. Go to **Extensions > Apps Script**
3. **Replace the entire script** with contents from [google_appscript.txt](google_appscript.txt)
4. Click **Save** (Ctrl+S)
5. **Deploy:**
   - Click **Deploy > New deployment** (or **Manage deployments > Edit**)
   - Select type: **Web app**
   - Click **Deploy**
   - Copy the Web App URL (keep it for use in habit tracker)

### Step 2: Update Habit Tracker HTML
1. Use the updated [habit-tracker-v6.html](habit-tracker-v6.html)
2. Open it in your browser
3. If you already have the sync URL configured, it's ready to go!
4. If not, configure it in settings

### Step 3: Test the Sync
**Test Period Tracker:**
1. Go to Period Tracker view
2. Click on a date to mark it
3. Check browser console (F12) → should see: `✓ Period data synced to Google Sheets`
4. Open on another device → the marked date should appear

**Test Mood Tracker:**
1. Go to Mood Tracker view
2. Set your mood for today
3. Check browser console → should see: `✓ Mood data synced to Google Sheets`
4. Open on another device → your mood should appear

---

## Verification Checklist

After updating, verify everything works:

- [ ] **Period Tracker:**
  - [ ] Mark a period day → syncs to Google Sheets
  - [ ] Unmark a day → syncs the removal
  - [ ] Data appears on other devices
  - [ ] Force Refresh loads period data correctly

- [ ] **Mood Tracker:**
  - [ ] Set mood for today → syncs to Google Sheets
  - [ ] Change mood → updates sync
  - [ ] Delete mood → syncs the deletion
  - [ ] Data appears on other devices for all users (Satish, KeerthiSri, Geetanath)
  - [ ] Force Refresh loads mood data correctly

- [ ] **Habit Tracker (still working):**
  - [ ] Habits still sync correctly
  - [ ] Completions still sync
  - [ ] Quantity logs still sync
  - [ ] Force Refresh still works for habits

---

## Troubleshooting

### Period/Mood Data Not Syncing

**Check Console Logs:**
1. Press F12 to open browser console
2. Mark a period day or set a mood
3. Look for:
   - ✅ `✓ Period data synced to Google Sheets`
   - ✅ `✓ Mood data synced to Google Sheets`
   - ❌ `Failed to sync period data to sheets: ...` (error message)

**Common Issues:**

1. **"Failed to sync" error:**
   - Check Script URL is configured
   - Check Script is deployed as Web App
   - Re-deploy the script (Step 1 above)

2. **Data not appearing on other device:**
   - Click the ↻ Sync button or Force Refresh
   - Wait 2-3 seconds for sync to complete
   - Check that both devices use the same Script URL

3. **Old data showing after update:**
   - Click **🔄 Force Refresh** button
   - This will load fresh data from Google Sheets

### Verify in Google Sheets

You can manually check the data in your Google Sheets:

1. Open the spreadsheet
2. Look at the assignee sheets (Satish, KeerthiSri, Geetanath)
3. Look for rows with:
   - **Period data:** `habitId = "period_tracker"`
   - **Mood data:** `habitId = "mood_satish"` (or other user)

**Example rows:**
```
habitId          | date       | done | qtyValue
-----------------+------------+------+----------
period_tracker   | 2026-02-15 | TRUE | 
mood_satish      | 2026-02-15 |      | happy
mood_keerthisri  | 2026-02-14 |      | good
```

---

## Technical Details

### Data Storage Format

**Google Sheets Storage:**
- Period and mood data use the same sheets as habits (assignee sheets)
- Special habit IDs distinguish them from regular habits
- Leverages existing sync infrastructure

**localStorage Keys:**
- Period: `ritual_period_dates` → `{ "2026-02-15": true, ... }`
- Mood: `ritual_moods` → `{ "satish": { "2026-02-15": "happy" }, ... }`

### Sync Flow

**Save Flow:**
```
User Action
  ↓
Save to localStorage (immediate, offline-first)
  ↓
Send to Google Sheets (async, background)
  ↓
Update sync status (green dot)
```

**Load Flow:**
```
App Starts / User clicks Sync
  ↓
Load from localStorage (instant display)
  ↓
Fetch from Google Sheets (background)
  ↓
Merge with local data
  ↓
Update display (if changes detected)
```

---

## Benefits

✅ **Multi-Device Access** - Period and mood data on all your devices
✅ **Data Backup** - Data stored safely in Google Sheets
✅ **Automatic Sync** - No manual export/import needed
✅ **Offline-First** - Works offline, syncs when online
✅ **Consistent** - Uses same sync system as habits
✅ **Reliable** - Force Refresh to fix any issues

---

## What's Next?

Your period and mood trackers now have the same powerful sync capabilities as your habit tracker! 

**Quick Actions:**
1. **Update your Google Apps Script** (most important!)
2. **Test period sync** - Mark a date and check on another device
3. **Test mood sync** - Set a mood and check on another device
4. **Use Force Refresh** if you see any sync issues

Enjoy seamless tracking across all your devices! 🎉

---

**Need Help?**
- Check the console logs (F12) for detailed sync information
- Use Force Refresh to reset to Google Sheets data
- Verify your Script URL is configured correctly
- Make sure you deployed the updated script
