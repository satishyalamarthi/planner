# 🌈 Keerthi's Planner - Google Sheets Sync Setup Guide

## 📋 Overview
Your planner now supports cloud sync with Google Sheets! This allows you to:
- Access your planner data from multiple devices
- Have automatic backup in Google Sheets
- Never lose your planning data

## 🚀 Step-by-Step Setup

### Step 1: Create Google Sheet
1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it "Keerthi Planner Data" (or any name you prefer)
4. The script will automatically create a sheet named "PlannerData" when first run

### Step 2: Set Up Apps Script
1. In your Google Sheet, click **Extensions** > **Apps Script**
2. Delete any existing code in the editor
3. Copy ALL the code from `planner-sync-appscript.gs`
4. Paste it into the Apps Script editor
5. Click **Save** (disk icon) and name your project (e.g., "Planner Sync")

### Step 3: Deploy as Web App
1. In Apps Script, click **Deploy** > **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "Planner Sync API" (or anything)
   - **Execute as**: **Me** (your Google account)
   - **Who has access**: **Anyone** (or "Anyone with the link")
5. Click **Deploy**
6. **Important**: You may see a warning "Google hasn't verified this app"
   - Click "Advanced"
   - Click "Go to [Your Project Name] (unsafe)"
   - This is safe because it's YOUR script
7. Click **Authorize** and grant permissions
8. Copy the **Web App URL** (looks like: `https://script.google.com/macros/s/AKfycbxxx.../exec`)
   - **IMPORTANT**: Copy the FULL URL including `/exec` at the end

### Step 4: Connect Planner to Google Sheets
1. Open your `keerthi-planner.html` in a browser
2. Look at the left sidebar (at the bottom)
3. Click **⚙️ Sync Settings** button
4. Paste the Web App URL you copied
5. Click **💾 Save & Sync**
6. Wait for "✓ Synced with Google Sheets" message

### Step 5: Verify Sync
1. Go back to your Google Sheet
2. You should now see a "PlannerData" sheet with columns:
   - **Key**: Data identifiers (e.g., "2026-02", "2026-02-15", "yr-2026")
   - **Value (JSON)**: Your planner data in JSON format
   - **Last Updated**: Timestamp of last sync
3. Add some data in your planner (write notes, add tasks, etc.)
4. Check that the sync status shows: ✅ with green dot and timestamp

## 📊 What Gets Synced?

### Monthly Data (Key: `YYYY-MM`)
- Monthly mantra and intentions
- Tasks and to-do lists
- Important dates and events
- Month highlights and reflections
- Notes and journal entries

### Daily Data (Key: `YYYY-MM-DD`)
- Daily notes and journal
- Photos and images
- Stickers
- Gratitude entries

### Weekly Data (Key: `YYYY-MM-wN`)
- Week plan and intentions
- Weekly reflection
- Week checklist items

### Yearly Data
- **Vision Board** (Key: `yr-YYYY`)
  - Vision board title
  - Section content (Love, Career, Health, etc.)
  - Section images
  - Power words
  - Full board images

- **Year Reflection** (Key: `yrR-YYYY`)
  - Accomplishments
  - Challenges overcome
  - Gratitude
  - Self-discoveries
  - Future intentions
  - Letter to self
  - Year photos

## 🔄 How Sync Works

### Automatic Sync
- **Every time you save**: Data automatically syncs to Google Sheets
- **On page load**: Data is downloaded from Google Sheets
- The planner merges local and cloud data intelligently

### Sync Status Indicators
- **🟢 Green dot + timestamp**: Successfully synced
- **🟡 Yellow dot "Syncing…"**: Currently syncing
- **🔴 Red dot "Sync failed"**: Sync error occurred
- **⚫ Gray dot "Not configured"**: No Script URL set

### Manual Sync
- Click the **⚙️ Sync Settings** button anytime to check/change URL
- Click **Save & Sync** to force a sync operation

## 🔧 Troubleshooting

### Problem: "Sync failed" error
**Solutions:**
1. Check your internet connection
2. Verify the Script URL is complete (ends with `/exec`)
3. Re-deploy the Apps Script:
   - Go to Apps Script > **Deploy** > **Manage deployments**
   - Click **Edit** (pencil icon)
   - Create **New version**
   - Click **Deploy**
   - Copy the NEW URL and paste it in planner

### Problem: "Request timeout" error
**Solutions:**
1. Your Google Apps Script might be taking too long
2. Try refreshing the page and syncing again
3. Check if Google Sheets is accessible (not down)

### Problem: Data not showing up in Google Sheets
**Solutions:**
1. Check the "PlannerData" sheet exists
2. Verify the deployment is set to "Execute as: Me"
3. Make sure "Who has access" is set to "Anyone"
4. Try making a small change in planner to trigger a sync

### Problem: Authorization errors
**Solutions:**
1. Re-authorize the Apps Script:
   - Apps Script > **Run** > Select any function > **Review permissions**
   - Click **Allow**
2. Make sure you're logged into the correct Google account

### Problem: Old data not syncing
**Solutions:**
1. The script syncs your entire `db` object
2. To force a full re-sync:
   - Clear the "PlannerData" sheet
   - In planner, click Sync Settings and Save & Sync again

## 📱 Multi-Device Usage

### Setting up a new device:
1. Open planner on the new device
2. Click **⚙️ Sync Settings**
3. Paste the SAME Web App URL
4. Click **Save & Sync**
5. All your data will download automatically!

### Best Practices:
- Always let the sync complete (green dot) before closing
- If using multiple devices, refresh to get latest data
- The script handles conflicts by merging data intelligently

## 🔐 Privacy & Security

### Your Data is Safe:
- ✅ Data is stored in YOUR Google Sheet (not mine)
- ✅ Only YOU have access (unless you share the sheet)
- ✅ Apps Script runs under YOUR Google account
- ✅ No third-party services involved
- ✅ All data stays within Google's infrastructure

### Access Control:
- The Web App URL is private - don't share it publicly
- If compromised, you can:
  1. Disable the deployment in Apps Script
  2. Create a new deployment (new URL)
  3. Update the URL in your planner

## 🆘 Getting Help

### View Logs (for debugging):
1. Open Apps Script editor
2. Click **Executions** (clock icon on left)
3. Click any execution to see logs
4. Look for error messages

### Common Log Messages:
- ✅ `ok: true` - Sync successful
- ❌ `error: "..."` - Shows what went wrong

### Still Need Help?
- Check the Apps Script code comments
- Verify each setup step was completed
- Try creating a fresh deployment
- Test with a simple note first

## 🎉 Success!
Once set up correctly, you'll see:
- Green sync dot in sidebar
- Timestamp showing last sync time
- Data automatically saving to Google Sheets
- Seamless experience across devices

Enjoy your cloud-synced planner! 🌈✨
