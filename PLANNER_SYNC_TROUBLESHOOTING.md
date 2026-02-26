# Keerthi Planner Sync Troubleshooting Guide

## Problem: Data not appearing in Google Sheets

### Step 1: Verify Script Setup

1. **Open Google Sheets** where you deployed the script
2. Go to **Extensions > Apps Script**
3. **Verify** the code matches [planner-sync-appscript.gs](planner-sync-appscript.gs)
4. Check if there's a **PlannerData** sheet in your spreadsheet
   - If not, the script hasn't been triggered yet

### Step 2: Check Deployment

1. In Apps Script, click **Deploy > Manage deployments**
2. Verify:
   - ✅ Type: **Web app**
   - ✅ Execute as: **Me** (your email)
   - ✅ Who has access: **Anyone** or **Anyone with the link**
3. **Copy the Web app URL** (NOT the script project URL)
   - Should look like: `https://script.google.com/macros/s/XXXXX/exec`

### Step 3: Configure Planner

1. **Open** [keerthi-planner.html](keerthi-planner.html) in your browser
2. Click the **⚙️ gear icon** (top right)
3. **Paste the Web app URL** into the Script URL field
4. Click **Save**
5. Click **🔄 Load from Cloud** to test connection

### Step 4: Debug in Browser

1. **Open Developer Console**:
   - Press `F12` or `Ctrl+Shift+I` (Windows)
   - Press `Cmd+Option+I` (Mac)
2. Go to the **Console** tab
3. Type: `debugPlanner()` and press Enter
4. **Check the output**:
   ```javascript
   {
     db: {...},           // Your local data
     keys: [...],         // All data keys
     totalEntries: 25     // Number of entries
   }
   ```

### Step 5: Manual Sync Test

In the browser console, run:
```javascript
forceSyncToSheets()
```

Watch for console logs:
- ✅ **Green checkmark messages** = Success
- ❌ **Red error messages** = Problem found

### Step 6: Check Google Apps Script Logs

1. In Apps Script editor, click **View > Executions**
2. Look for recent executions
3. Click on any execution to see logs
4. Check for errors or warnings

---

## Common Issues & Solutions

### Issue 1: "No script URL configured"
**Solution**: You need to paste the Web App URL in the planner settings (⚙️ icon)

### Issue 2: "CORS error" or "blocked by CORS policy"
**Solution**: 
1. Re-deploy as **NEW deployment** (not update existing)
2. Make sure "Who has access" is set to **Anyone**
3. Use the new deployment URL

### Issue 3: Empty PlannerData sheet after sync
**Possible causes**:
- No data in browser localStorage
- Wrong script URL
- Deployment permissions issue

**Solution**:
1. In browser console, run: `localStorage.getItem('kplanner-v5')`
2. If it returns `null` or `{}`, you have no local data
3. Add some data in the planner (tasks, notes, etc.)
4. Run `forceSyncToSheets()` again

### Issue 4: "Request timeout"
**Solution**:
- Your script might be taking too long
- Check Google Apps Script quotas
- Try syncing with less data first

### Issue 5: Authorization issues
**Solution**:
1. In Apps Script, click **Deploy > Test deployments**
2. Click **Execute** to authorize the script
3. Grant all requested permissions
4. Re-deploy as Web app

---

## Verification Checklist

- [ ] Apps Script code matches planner-sync-appscript.gs
- [ ] Script deployed as Web app with correct permissions
- [ ] Web app URL copied correctly (ends with `/exec`)
- [ ] URL pasted in planner settings
- [ ] Browser console shows no errors
- [ ] `debugPlanner()` shows data entries > 0
- [ ] PlannerData sheet exists in Google Sheets
- [ ] Apps Script execution logs show successful saves

---

## Manual Data Inspection

### Check what's in localStorage:
```javascript
JSON.parse(localStorage.getItem('kplanner-v5'))
```

### Force immediate sync:
```javascript
forceSyncToSheets()
```

### Load latest from cloud:
```javascript
loadFromSheets()
```

### Clear local data (⚠️ WARNING: This deletes your local data):
```javascript
localStorage.removeItem('kplanner-v5')
location.reload()
```

---

## Still Not Working?

1. **Export your data** (just in case):
   ```javascript
   copy(JSON.stringify(JSON.parse(localStorage.getItem('kplanner-v5')), null, 2))
   ```
   This copies your data to clipboard. Save it to a text file.

2. **Create a fresh deployment**:
   - Delete the current deployment
   - Create a brand new Web app deployment
   - Use the new URL in planner settings

3. **Check updated files**:
   - Make sure you're using the latest version of keerthi-planner.html with logging enabled
   - The console should show detailed sync messages

4. **Share the console logs**:
   - Open console (`F12`)
   - Run `forceSyncToSheets()`
   - Copy all the log messages
   - This will help identify the exact issue
