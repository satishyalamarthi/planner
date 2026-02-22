# ✨ Life Planner - Digital Journal & Goal Tracker

A stunning, feature-rich web application for planning, habit tracking, and goal management. Designed for Satish, Keerthi, and Geetanath with beautiful dark theme UI and Google Sheets integration.

## 🌟 Features

### 📅 **Planner**
- Monthly calendar with attachment indicators
- Monthly mantra and highlights
- Todo lists organized by priority
- Important dates and birthdays tracking
- Weekly planning pages
- Daily journal entries
- Image attachments for journaling
- Emoji and sticker support
- PDF export functionality
- Data from 2020-2050

### ✅ **Habit Tracker**
- Multiple habit types (checkbox, weightage)
- Flexible frequencies (daily, weekly, monthly, custom)
- Multiple assignees per habit
- Today, Weekly, Monthly, and Yearly views
- Progress tracking with counts and percentages
- Mini calendars for monthly visualization
- Habit completion history

### 🎯 **Goal Manager**
- Nested sub-goals up to 5 levels deep
- Multiple categories, quarters, and labels
- Priority system (Important/Urgent matrix)
- Owner assignment (multi-select)
- Progress calculation (automatic for nested goals)
- Quick filter bar
- Collapsible goal tree view
- Custom attributes

### ✨ **Vision Board**
- Upload and organize inspiring images
- Grid layout with hover effects
- Title and description for each image
- Easy add/edit/delete functionality

### 📖 **Reflections**
- Monthly reflections with predefined questions
- Year-end reflection template
- Automatic habit data population
- Rich text editing

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- GitHub Pages hosting (optional)
- Google account (for Sheets sync)

### Installation

1. **Clone or Download** this repository

2. **For GitHub Pages Deployment:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin <your-repo-url>
   git push -u origin main
   ```

3. **Enable GitHub Pages:**
   - Go to repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: /planner
   - Save

4. **Access your app:**
   - URL: `https://your-username.github.io/your-repo-name/`

### Local Development

To run locally:
```bash
# Navigate to planner directory
cd planner

# Start a simple HTTP server
# Python 3:
python -m http.server 8000

# Python 2:
python -m SimpleHTTPServer 8000

# Node.js (if you have http-server):
npx http-server -p 8000

# Then open: http://localhost:8000
```

## 👥 User Accounts

### Default Users & Passwords

| User | Default Password | Notes |
|------|-----------------|-------|
| Satish | `satish123` | Full access |
| Keerthi | `keerthi123` | Full access |
| Geetanath | `keerthi123` | Managed by Keerthi |

⚠️ **Important:** Change default passwords after first login!

### Changing Password
1. Click "Change Password" on login screen
2. Select user
3. Enter current password
4. Enter and confirm new password
5. Save

## 📊 Google Sheets Integration

### Setup Instructions

1. **Follow the guide in `GoogleSheetsScripts/README.md`**

2. **Key steps:**
   - Create Google Spreadsheet
   - Set up Apps Script
   - Deploy as web app
   - Configure credentials in `js/config.js`

3. **Sync your data:**
   - Click Settings (⚙️) → Sync Now
   - Or automatic sync on data changes

### Data Structure
- **Habits Sheet:** Tracks all habits and completions
- **Goals Sheet:** Stores goals hierarchy
- **Planner Sheet:** Monthly planning data
- **Reflections Sheet:** Monthly and yearly reflections
- **Vision Board Sheet:** Image URLs and metadata

## 🎨 Customization

### Changing Theme Colors

Edit `planner/styles.css`:

```css
:root {
    --accent-purple: #9b6dff;  /* Primary purple */
    --accent-pink: #ff6bc5;    /* Secondary pink */
    --accent-blue: #4da3ff;    /* Accent blue */
    /* ... more colors */
}
```

### Adding Custom Habit Frequencies

Edit `js/config.js`:

```javascript
HABIT_FREQUENCIES: [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    // Add your own...
]
```

### Adding Goal Categories

Edit `js/config.js`:

```javascript
GOAL_CATEGORIES: [
    'Health & Fitness',
    'Your Custom Category',
    // Add more...
]
```

## 📱 Mobile Support

The app is fully responsive and works on:
- ✅ Desktop (1920px+)
- ✅ Laptop (1366px+)
- ✅ Tablet (768px+)
- ✅ Mobile (375px+)
- ✅ iOS devices
- ✅ Android devices

## 💾 Data Storage

### Local Storage
- All data stored in browser's localStorage
- No server required for basic functionality
- Export/import for backup

### Google Sheets
- Optional cloud backup
- Real-time synchronization
- Access data from anywhere

### Export/Import
1. **Export:** Settings → Export Data (JSON file)
2. **Import:** Settings → Import Data (Select JSON file)
3. **PDF Export:** Click PDF icon in header

## 🔒 Security & Privacy

### Data Privacy
- ✅ All data stored locally in browser
- ✅ No external tracking or analytics
- ✅ Google Sheets sync is optional
- ✅ Full control over your data

### Best Practices
- Change default passwords immediately
- Keep backup exports in secure location
- Don't share API keys publicly
- Use HTTPS for GitHub Pages

## 🛠️ Troubleshooting

### Common Issues

**Problem:** Login not working
- **Solution:** Clear browser cache and localStorage
- Check browser console for errors

**Problem:** Sync failing
- **Solution:** Verify Apps Script deployment
- Check API credentials in config.js
- Ensure spreadsheet permissions

**Problem:** Images not loading
- **Solution:** Check file size (max 5MB recommended)
- Verify image format (JPG, PNG, GIF)
- Check browser console

**Problem:** Mobile layout issues
- **Solution:** Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Update to latest browser version

## 🎯 Feature Roadmap

### Coming Soon
- [ ] Enhanced PDF export with styling
- [ ] Dark/Light theme toggle
- [ ] Notion import tool
- [ ] Advanced habit statistics
- [ ] Goal progress charts
- [ ] Collaborative features
- [ ] Mobile app (PWA)
- [ ] Offline mode

## 📚 Usage Tips

### Habit Tracking
- Set up habits at start of month
- Review weekly progress
- Use custom frequency for flexible tracking
- Track multiple assigned at once

### Goal Management
- Break large goals into sub-goals
- Use priority matrix for focus
- Review goals weekly
- Update progress regularly

### Planning
- Set monthly mantra for motivation
- Plan week ahead on Sundays
- Journal daily for reflection
- Export month-end for archives

### Vision Board
- Add images that inspire you
- Review weekly for motivation
- Update quarterly with new goals
- Keep board focused (10-15 images)

## 🤝 Support & Contribution

### Getting Help
- Check this README
- Review code comments
- Check browser console
- See GoogleSheetsScripts/README.md

### Reporting Issues
- Include browser and version
- Describe steps to reproduce
- Share console errors
- Note expected vs actual behavior

## 📄 License

This is a personal project. Feel free to use and modify for personal use.

## 🙏 Acknowledgments

- Font Awesome for icons
- Google Fonts for typography
- Google Sheets for data sync
- GitHub Pages for hosting

---

**Made with ❤️ for Satish, Keerthi, and Geetanath**

*Version 1.0.0 - February 2026*

---

## Quick Links

- [Google Sheets Setup Guide](../GoogleSheetsScripts/README.md)
- [Configuration File](js/config.js)
- [Habit Tracker](index.html#habits)
- [Goal Manager](index.html#goals)
- [Planner](index.html#planner)
