# 🎯 Notion Integration Guide for Keerthi's Planner

## 📋 Overview
Your weekly planner now automatically syncs with your Notion page "2026 Goals | This_Week" to pull tasks based on priority tags. Tasks are automatically categorized into three sections:

1. **🔥 Most Important (I_U)** - Important & Urgent tasks
2. **⚡ Next Inline (I_NU, NI_U)** - Important but Not Urgent, or Not Important but Urgent
3. **⏰ If There is Time** - Other tasks with remaining time

## 🚀 Setup Instructions

### Step 1: Create Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Give it a name (e.g., "Keerthi's Planner Sync")
4. Select the workspace where your "2026 Goals" page lives
5. Click **Submit**
6. Copy the **"Internal Integration Token"** (starts with `secret_...`)
   - Keep this safe! This is your API key

### Step 2: Share Your Notion Page with Integration

1. Open your Notion page **"2026 Goals | This_Week"**
2. Click the **"•••"** (three dots) menu at the top right
3. Scroll down and click **"+ Add connections"**
4. Find and select your integration (e.g., "Keerthi's Planner Sync")
5. Click **"Confirm"**

### Step 3: Get Your Page/Database ID

#### If using a Database:
1. Open your Notion database in full page view
2. Look at the URL in your browser:
   ```
   https://www.notion.so/[your-long-id-here]?v=...
   ```
3. The ID is the **32-character code** (without dashes)
4. Example: `2c7c31f7de538054938fe6a0bef07548`

#### If using a regular Page:
1. Open the Notion page
2. Copy the URL - the ID is between the last `/` and the `?` (if any)

### Step 4: Configure in Planner

1. Open `keerthi-planner.html` in your browser
2. Click the **"🎯 Notion"** button in the header
3. Paste your **Notion API Key** (the secret token from Step 1)
4. Paste your **Page/Database ID** (from Step 3)
5. **CORS Proxy URL**: Leave as default (`https://corsproxy.io/?`) or use your own
   - 💡 **Why needed?** Browsers block direct API calls to Notion for security (CORS policy)
   - The proxy acts as a middleman to bypass browser restrictions
   - Alternative proxies: `https://api.allorigins.win/raw?url=` or host your own
6. Click **"💾 Save & Load"**

## 📊 Required Notion Database Structure

For the integration to work properly, your Notion database should have these properties:

### Required Properties:
- **Goals** (Title field) - The task description
- **Priority** (Select) - For priority categorization (I_U, I_NU, NI_U, etc.)
- **completed** (Checkbox) - To filter out completed tasks (checked = done)

### Priority Values:
Use these exact values in your Priority column (case-insensitive):
- `I_U` - Important & Urgent → Goes to "Most Important"
- `I_NU` - Important, Not Urgent → Goes to "Next Inline"
- `NI_U` - Not Important, Urgent → Goes to "Next Inline"
- (Any other value or empty) → Goes to "If There is Time"

### Example Database Structure:
```
┌─────────────────┬──────────┬───────────┐
│ Goals (Title)   │ Priority │ completed │
├─────────────────┼──────────┼───────────┤
│ Review budget   │ I_U      │ ☐         │
│ Plan vacation   │ I_NU     │ ☐         │
│ Reply to emails │ NI_U     │ ☐         │
│ Read article    │ Optional │ ☐         │
│ Done task       │ I_U      │ ☑         │ <- This will be filtered out
└─────────────────┴──────────┴───────────┘
```

## 🔄 How to Use

### Automatic Loading
- Every time you open the **Week View** in your planner, it will automatically load tasks from Notion
- Tasks are loaded **once per day** per week to avoid unnecessary API calls
- Completed tasks (where the **completed** checkbox is checked) are automatically filtered out

### Manual Refresh
- Click the **"🔄 Load from Notion"** button to force refresh
- Useful when you've just added new tasks to Notion

### Manual Task Management
- You can still **add tasks manually** using the "+ Add" buttons
- Manual tasks and Notion tasks are merged together
- Manual tasks persist even after refreshing from Notion
- Each task has a **× delete button** to remove it

### Task Completion
- Check the checkbox to mark tasks as done
- Task completions are saved locally in your planner
- To sync completions back to Notion, you'll need to update Notion manually

## 🎨 User Interface

### Three Priority Sections:

#### 🔥 Most Important (Red/Coral theme)
- These are your top priorities with `I_U` tag
- Should be completed first
- Highlighted with a red/coral background

#### ⚡ Next Inline (Yellow theme)
- Tasks with `I_NU` or `NI_U` tags
- Work on these after Most Important tasks
- Highlighted with a yellow background

#### ⏰ If There is Time (Teal theme)
- All remaining tasks
- Optional tasks to work on if time permits
- Highlighted with a teal/cyan background

## 🔧 Troubleshooting

### "⚠️ Configure Notion settings first"
- You haven't set up the API key and Page ID yet
- Click **🎯 Notion** button to configure

### "⚠️ Failed to load: Failed to fetch"
**This is a CORS (Cross-Origin Resource Sharing) error:**
- Browsers block direct calls to Notion API for security
- **Solution**: Use a CORS proxy (already configured by default)
- Default proxy: `https://corsproxy.io/?`
- **Alternative proxies** you can try:
  - `https://api.allorigins.win/raw?url=`
  - `https://cors-anywhere.herokuapp.com/` (may require activation)
  - Host your own CORS proxy server
- Change the proxy in Notion settings if the default doesn't work
- Check browser console (F12) for detailed error messages

### "⚠️ Failed to load: 401 Unauthorized"
- Your API key is incorrect
- Generate a new integration token and update settings

### "⚠️ Failed to load: 404 Not Found"
- Your Page/Database ID is incorrect
- Make sure you shared the page with your integration
- Copy the ID again from the URL

### Tasks not appearing?
1. Make sure your Notion database has tasks with the **completed** checkbox unchecked
2. Check that your database has a "Goals" title field
3. Check that your database has a "Priority" select field
4. Verify the integration has access to the page
5. Open browser console (F12) to see detailed error messages

### CORS Errors
- **Already fixed!** The integration now uses a CORS proxy by default
- If you still see CORS errors, try these alternative proxies:
  1. `https://api.allorigins.win/raw?url=`
  2. `https://thingproxy.freeboard.io/fetch/`
  3. Host your own proxy server for better reliability
- Change the proxy URL in 🎯 Notion settings

## 💡 Tips & Best Practices

1. **Priority Consistently**: Use the exact priority values (`I_U`, `I_NU`, `NI_U`) for proper categorization
2. **One Database**: Keep all weekly tasks in one "This_Week" database in Notion
3. **Mark as Completed**: Check the **completed** checkbox in Notion to hide finished tasks
4. **Weekly Review**: At the start of each week, review and set Priority in Notion before loading
5. **Backup**: Your planner still syncs with Google Sheets, so you have a backup
6. **Manual Override**: You can always add, edit, or delete tasks locally without affecting Notion

## 🔐 Privacy & Security

- Your Notion API key is stored **locally** in your browser's localStorage
- API calls go through a CORS proxy to work around browser restrictions
- The default proxy (corsproxy.io) is a public service - use at your own risk
- For sensitive data, consider hosting your own CORS proxy
- No data is sent to any server except:
  1. The CORS proxy (to forward requests)
  2. Notion API (to fetch your tasks)
- The integration only **reads** from your Notion database
- It does **not write back** to Notion (one-way sync)
- API key never leaves your device (stored locally)

## 📱 Mobile Usage

- Works on mobile browsers that support localStorage
- Notion API calls work from mobile devices
- Use the same setup process on mobile after initial configuration

## 🆘 Need Help?

- Check the browser console (F12 → Console) for detailed error messages
- Verify your Notion database structure matches the requirements
- Make sure the integration has proper permissions
- Test the API key and database ID in Notion's API docs

---

**Happy Planning! 🌈✨**
