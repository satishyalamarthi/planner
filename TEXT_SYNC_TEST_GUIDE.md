# 🧪 Quick Test Guide - Text Sync Fix

## How to Verify the Fix Works

### Before Testing
1. **Refresh your browser** to load the latest code
2. Make sure your Google Sheets sync is configured
3. Open your Google Sheet in another tab to watch changes

### Test 1: Complete Text Saves (Main Fix)

1. **In planner:**
   - Open the Monthly view
   - Click on the "My mantra for February 2026" textarea
   - Type a long sentence slowly: "I am grateful for every opportunity that comes my way this month"
   
2. **Watch for:**
   - "✓ Saved!" toast appears while typing (local save)
   - Sync status stays at previous timestamp while typing
   - **1.5 seconds after you stop typing**, sync status updates to "Synced · [new time]"

3. **In Google Sheets:**
   - Look at the "PlannerData" sheet
   - Find the row with Key matching your current month (e.g., `2026-02`)
   - Look at the "Value (JSON)" column
   - Search for "mantra" in the JSON
   - **Should see the COMPLETE sentence** ✅

### Test 2: Multiple Fields

1. Type in mantra field: "First text"
2. Wait 2 seconds (watch sync complete)
3. Type in "This month I am attracting" field: "Second text"
4. Wait 2 seconds
5. Check Google Sheets - **both texts should be complete** ✅

### Test 3: Rapid Typing

1. Type really fast: "The quick brown fox jumps over the lazy dog"
2. Don't pause between words
3. After finishing, wait 2 seconds
4. Check Google Sheets - **complete sentence should be saved** ✅

### Test 4: Close Browser Quickly

1. Type something in any text field
2. **Immediately close the browser/tab** (don't wait for sync)
3. Reopen the planner
4. Check Google Sheets
5. **Text should still be saved** (beforeunload handler) ✅

### Test 5: Old Behavior (What Should NOT Happen)

❌ **You should NOT see:**
- Only first letter saved in Google Sheets
- Partial words (e.g., "Hel" instead of "Hello")
- Text from previous edit appearing in new field
- Sync status updating on every keystroke

✅ **You SHOULD see:**
- Complete text always saved
- Sync happens 1.5 seconds after you stop typing
- "✓ Saved!" toast while typing (local save)
- Sync status updating only after you pause

## Debugging

### Check Console (F12 → Console)
Look for:
```
// When typing - no immediate sync logs
// After 1.5 seconds:
Notion API response status: 200
Synced · [timestamp]
```

### Check Sync Timing
- Start typing: note the time in sync status (e.g., "Synced · 2:45:30 PM")
- Type for 3 seconds continuously
- **Time should NOT change** while typing
- Stop typing
- After ~1.5 seconds: **time should update** (e.g., "Synced · 2:45:33 PM")

### If It's Still Saving Incomplete Text:

1. **Hard refresh**: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Check browser console for errors
3. Verify you're using the latest version:
   - Search for `syncDebounceTimer` in page source (View → Developer → View Source)
   - Should see `let syncDebounceTimer=null;`
   - If not found, you're on old version - refresh again

## Expected Behavior Summary

| Action | Local Storage | Google Sheets | Sync Status |
|--------|--------------|---------------|-------------|
| Type "H" | Saves "H" | (waits) | Previous time |
| Type "e" | Saves "He" | (waits) | Previous time |
| Type "llo" | Saves "Hello" | (waits) | Previous time |
| Stop typing | Still "Hello" | (waits 1.5s) | Previous time |
| 1.5s passes | Still "Hello" | **Syncs "Hello"** | ✅ **Updates to new time** |

## Success Indicators 🎉

✅ Complete sentences save to Google Sheets  
✅ Sync happens 1-2 seconds after you stop typing  
✅ No incomplete words or partial text  
✅ Local saves are instant (✓ Saved! toast)  
✅ Cloud syncs are batched (efficient)  
✅ Closing browser doesn't lose data  

---

**If all tests pass, your sync is working perfectly!** 🌈✨
