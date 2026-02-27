/**
 * KEERTHI'S PLANNER - Google Apps Script Sync
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets and create a new spreadsheet named "Keerthi Planner Data"
 * 2. Go to Extensions > Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Execute as: "Me"
 * 7. Who has access: "Anyone" (or "Anyone with the link")
 * 8. Click "Deploy" and copy the Web App URL
 * 9. Paste the URL into your planner's sync settings
 * 
 * This script will create a single sheet named "PlannerData" to store all planner entries
 */

// Helper function to get Indian Standard Time (IST) timestamp
function getISTTimestamp() {
  const now = new Date();
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds
  const istTime = new Date(now.getTime() + istOffset);
  return istTime.toISOString().replace('Z', '+05:30');
}

// Main entry point for POST requests
function doPost(e) {
  try {
    Logger.log('=== NEW REQUEST ===');
    Logger.log('Timestamp: ' + getISTTimestamp());
    
    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;
    Logger.log('Action: ' + action);
    
    if (action === 'saveAll') {
      const dataKeys = payload.data ? Object.keys(payload.data) : [];
      Logger.log('saveAll request with ' + dataKeys.length + ' keys');
      Logger.log('Data keys: ' + dataKeys.join(', '));
    }
    
    let result;
    switch(action) {
      case 'getAll':
        result = getAllPlannerData();
        Logger.log('getAll returned ' + Object.keys(result).length + ' keys');
        return response(result);
      case 'saveAll':
        result = saveAllPlannerData(payload.data);
        Logger.log('saveAll completed: ' + JSON.stringify(result));
        return response(result);
      case 'getKeyData':
        Logger.log('getKeyData for key: ' + payload.key);
        result = getKeyData(payload.key);
        return response(result);
      case 'saveSingle':
        return response(saveSingleEntry(payload.key, payload.value));
      case 'toggleCompletion':
        return response(toggleCompletion(payload.habitId, payload.dateKey, payload.value));
      case 'saveHabit':
        return response(saveHabit(payload.habit, payload.isEdit));
      case 'saveQtyLog':
        return response(saveQtyLog(payload.habitId, payload.dateKey, payload.qtyValue));
      case 'savePeriodData':
        return response(saveKeyData('ritual_period_dates', payload.periodDates));
      case 'saveMoodData':
        return response(saveKeyData('ritual_moods', payload.moods));
      case 'archiveOldData':
        result = archiveOldData(payload.cutoffDate);
        Logger.log('archiveOldData completed: ' + JSON.stringify(result));
        return response(result);
      case 'restoreFromArchive':
        result = restoreFromArchive(payload.year);
        Logger.log('restoreFromArchive completed: ' + JSON.stringify(result));
        return response(result);
      default:
        Logger.log('Unknown action: ' + action);
        return response(null, 'Unknown action: ' + action);
    }
  } catch(err) {
    Logger.log('ERROR: ' + err.toString());
    Logger.log('Stack: ' + err.stack);
    return response(null, 'Server error: ' + err.toString());
  }
}

// Helper function to format JSON responses
function response(data, error) {
  const output = {
    ok: !error,
    data: data,
    error: error || null,
    timestamp: getISTTimestamp()
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

// Constants for data splitting
const MAX_CELL_SIZE = 45000; // Safe limit below Google's 50K char limit
const SPLIT_SUFFIX = '_part'; // Suffix for split data parts

// Get or create the PlannerData sheet
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('PlannerData');
  
  if (!sheet) {
    sheet = ss.insertSheet('PlannerData');
    // Set up headers
    sheet.getRange('A1:C1').setValues([['Key', 'Value (JSON)', 'Last Updated']]);
    sheet.getRange('A1:C1').setFontWeight('bold');
    sheet.getRange('A1:C1').setBackground('#4285F4');
    sheet.getRange('A1:C1').setFontColor('#FFFFFF');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 200); // Key column
    sheet.setColumnWidth(2, 600); // Value column
    sheet.setColumnWidth(3, 180); // Timestamp column
  }
  
  return sheet;
}

// Helper function to split large data into chunks
function splitLargeData(key, valueStr) {
  if (valueStr.length <= MAX_CELL_SIZE) {
    return [[key, valueStr]];
  }
  
  Logger.log('⚠️ Key "' + key + '" exceeds ' + MAX_CELL_SIZE + ' chars (' + valueStr.length + ' chars). Splitting...');
  
  const parts = [];
  let partNum = 1;
  
  // First part uses original key
  parts.push([key, valueStr.substring(0, MAX_CELL_SIZE)]);
  
  // Additional parts use _part2, _part3, etc.
  for (let i = MAX_CELL_SIZE; i < valueStr.length; i += MAX_CELL_SIZE) {
    partNum++;
    const chunk = valueStr.substring(i, Math.min(i + MAX_CELL_SIZE, valueStr.length));
    parts.push([key + SPLIT_SUFFIX + partNum, chunk]);
  }
  
  Logger.log('✓ Split into ' + parts.length + ' parts');
  return parts;
}

// Helper function to merge split data parts
function mergeSplitData(data) {
  const merged = {};
  const processedKeys = new Set();
  
  Object.keys(data).forEach(key => {
    // Skip if already processed as part of a split
    if (processedKeys.has(key)) return;
    
    // Check if this key has split parts
    if (key.includes(SPLIT_SUFFIX)) {
      // This is a part key, skip it (will be handled by base key)
      return;
    }
    
    // Check if there are additional parts
    let fullValue = data[key];
    let partNum = 2;
    let foundParts = false;
    
    while (data[key + SPLIT_SUFFIX + partNum]) {
      if (!foundParts) {
        Logger.log('🔗 Merging split data for key: ' + key);
        foundParts = true;
      }
      fullValue += data[key + SPLIT_SUFFIX + partNum];
      processedKeys.add(key + SPLIT_SUFFIX + partNum);
      partNum++;
    }
    
    if (foundParts) {
      Logger.log('✓ Merged ' + (partNum - 1) + ' parts for "' + key + '" (' + fullValue.length + ' chars)');
    }
    
    // Parse the merged JSON
    try {
      merged[key] = JSON.parse(fullValue);
    } catch(e) {
      Logger.log('❌ Failed to parse merged data for key: ' + key);
      merged[key] = fullValue; // Keep as string if parsing fails
    }
  });
  
  return merged;
}

// Get all planner data from the sheet
function getAllPlannerData() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return {}; // No data yet
  }
  
  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const rawData = {};
  
  // First pass: collect all data (including split parts as strings)
  data.forEach(row => {
    const key = row[0];
    const valueStr = row[1];
    
    if (key && valueStr) {
      rawData[key] = valueStr;
    }
  });
  
  // Second pass: merge split data and parse JSON
  const plannerData = mergeSplitData(rawData);
  
  return plannerData;
}

// Save all planner data to the sheet
function saveAllPlannerData(data) {
  Logger.log('▶ saveAllPlannerData called');
  
  const sheet = getSheet();
  const timestamp = getISTTimestamp();
  
  Logger.log('✓ Sheet obtained: PlannerData');
  
  // Clear existing data (except header)
  const lastRow = sheet.getLastRow();
  Logger.log('Current last row: ' + lastRow);
  
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
    Logger.log('✓ Cleared ' + (lastRow - 1) + ' existing rows');
  }
  
  // Convert data object to rows (with automatic splitting for large entries)
  const rows = [];
  const dataKeys = Object.keys(data || {});
  Logger.log('Processing ' + dataKeys.length + ' data keys');
  
  let tasksCount = 0;
  let learnCount = 0;
  let splitCount = 0;
  
  dataKeys.forEach(key => {
    const value = data[key];
    const valueStr = JSON.stringify(value);
    
    // Check size and split if needed
    const parts = splitLargeData(key, valueStr);
    if (parts.length > 1) splitCount++;
    
    // Add all parts to rows
    parts.forEach(([partKey, partValue]) => {
      rows.push([partKey, partValue, timestamp]);
    });
    
    // Log tasks and learn data specifically
    if (value && typeof value === 'object') {
      if (value['td-done'] || value['td-doing'] || value['td-plan']) {
        tasksCount++;
        Logger.log('✓ Key "' + key + '" contains tasks:');
        if (value['td-done']) Logger.log('  - td-done: ' + value['td-done'].length + ' items');
        if (value['td-doing']) Logger.log('  - td-doing: ' + value['td-doing'].length + ' items');
        if (value['td-plan']) Logger.log('  - td-plan: ' + value['td-plan'].length + ' items');
      }
      if (value['learn']) {
        learnCount++;
        Logger.log('✓ Key "' + key + '" contains learn: ' + value['learn'].length + ' items');
      }
    }
  });
  
  Logger.log('✓ Prepared ' + rows.length + ' rows (' + dataKeys.length + ' entries)');
  if (splitCount > 0) Logger.log('📦 Split ' + splitCount + ' large entries across multiple cells');
  if (tasksCount > 0) Logger.log('✓ Found tasks data in ' + tasksCount + ' keys');
  if (learnCount > 0) Logger.log('✓ Found learn data in ' + learnCount + ' keys');
  
  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 3).setValues(rows);
    Logger.log('✓ Wrote ' + rows.length + ' rows to sheet');
    Logger.log('Sample keys: ' + dataKeys.slice(0, 5).join(', '));
  } else {
    Logger.log('⚠ No data to save!');
  }
  
  const result = { saved: rows.length, timestamp: timestamp };
  Logger.log('✓ Returning result: ' + JSON.stringify(result));
  
  return result;
}

// Save a single entry (for incremental updates) - OPTIMIZED FOR BATCH OPERATIONS
function saveSingleEntry(key, value) {
  Logger.log('💾 saveSingleEntry called for key: ' + key);
  
  const sheet = getSheet();
  const timestamp = getISTTimestamp();
  const valueStr = JSON.stringify(value);
  
  Logger.log('📏 Data size: ' + valueStr.length + ' chars');
  
  // Check if data needs to be split
  const parts = splitLargeData(key, valueStr);
  Logger.log('📦 Split into ' + parts.length + ' part(s)');
  
  // Get all existing data
  const lastRow = sheet.getLastRow();
  let existingData = [];
  
  if (lastRow > 1) {
    existingData = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
    Logger.log('📋 Found ' + existingData.length + ' existing rows in sheet');
  }
  
  // Filter out rows matching this key (base key and all parts)
  const filteredData = existingData.filter(row => {
    const existingKey = row[0];
    const shouldDelete = existingKey === key || existingKey.startsWith(key + SPLIT_SUFFIX);
    if (shouldDelete) {
      Logger.log('🗑️ Removing old row: ' + existingKey);
    }
    return !shouldDelete;
  });
  
  Logger.log('✂️ Removed ' + (existingData.length - filteredData.length) + ' old row(s)');
  
  // Add new parts to filtered data
  parts.forEach(([partKey, partValue]) => {
    filteredData.push([partKey, partValue, timestamp]);
    Logger.log('➕ Adding new row: ' + partKey + ' (' + partValue.length + ' chars)');
  });
  
  // Clear all data (except header) and write back in one operation
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
    Logger.log('🧹 Cleared sheet');
  }
  
  if (filteredData.length > 0) {
    sheet.getRange(2, 1, filteredData.length, 3).setValues(filteredData);
    Logger.log('✍️ Wrote ' + filteredData.length + ' row(s) to sheet in SINGLE batch operation');
  }
  
  Logger.log('✅ saveSingleEntry completed successfully');
  
  return { 
    key: key, 
    updated: timestamp,
    parts: parts.length > 1 ? parts.length : undefined
  };
}

// Toggle a habit completion status
function toggleCompletion(habitId, dateKey, value) {
  const completionsKey = 'ritual_completions';
  const completions = getKeyData(completionsKey) || {};
  
  if (!completions[habitId]) {
    completions[habitId] = {};
  }
  
  if (value) {
    completions[habitId][dateKey] = true;
  } else {
    delete completions[habitId][dateKey];
  }
  
  saveKeyData(completionsKey, completions);
  return { habitId: habitId, dateKey: dateKey, value: value };
}

// Save a habit
function saveHabit(habit, isEdit) {
  const habitsKey = 'ritual_habits';
  let habits = getKeyData(habitsKey) || [];
  
  if (isEdit) {
    // Update existing habit
    const index = habits.findIndex(h => h.id === habit.id);
    if (index >= 0) {
      habits[index] = habit;
    } else {
      habits.push(habit);
    }
  } else {
    // Add new habit
    habits.push(habit);
  }
  
  saveKeyData(habitsKey, habits);
  return { habitId: habit.id, saved: true };
}

// Save a quantity log entry
function saveQtyLog(habitId, dateKey, qtyValue) {
  const qtyLogsKey = 'ritual_qtylogs';
  const qtyLogs = getKeyData(qtyLogsKey) || {};
  
  if (!qtyLogs[habitId]) {
    qtyLogs[habitId] = {};
  }
  
  if (qtyValue === null || qtyValue === undefined) {
    delete qtyLogs[habitId][dateKey];
  } else {
    qtyLogs[habitId][dateKey] = qtyValue;
  }
  
  saveKeyData(qtyLogsKey, qtyLogs);
  return { habitId: habitId, dateKey: dateKey, qtyValue: qtyValue };
}

// Helper function to get data for a specific key
function getKeyData(key) {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) return null;
  
  const keys = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  
  // Collect base key and any parts
  let valueStr = null;
  const parts = {};
  
  for (let i = 0; i < keys.length; i++) {
    const rowKey = keys[i][0];
    const rowValue = keys[i][1];
    
    // Found base key
    if (rowKey === key) {
      valueStr = rowValue;
    }
    // Found a part of this key
    else if (rowKey.startsWith(key + SPLIT_SUFFIX)) {
      const partMatch = rowKey.match(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + SPLIT_SUFFIX + '(\\d+)'));
      if (partMatch) {
        parts[parseInt(partMatch[1])] = rowValue;
      }
    }
  }
  
  if (valueStr === null) return null;
  
  // Merge parts if any exist
  if (Object.keys(parts).length > 0) {
    const partNumbers = Object.keys(parts).map(n => parseInt(n)).sort((a, b) => a - b);
    partNumbers.forEach(partNum => {
      valueStr += parts[partNum];
    });
    Logger.log('🔗 Merged ' + (partNumbers.length + 1) + ' parts for key: ' + key);
  }
  
  // Parse and return
  try {
    return JSON.parse(valueStr);
  } catch(e) {
    Logger.log('Failed to parse value for key: ' + key);
    return null;
  }
}

// Helper function to save data for a specific key
function saveKeyData(key, data) {
  return saveSingleEntry(key, data);
}

// Archive old data (move entries older than cutoff to archive key)
function archiveOldData(cutoffDate) {
  Logger.log('▶ archiveOldData called with cutoff: ' + cutoffDate);
  
  const sheet = getSheet();
  const cutoff = new Date(cutoffDate);
  const allData = getAllPlannerData();
  const keysToArchive = [];
  const archivedData = {};
  
  // Find keys older than cutoff
  Object.keys(allData).forEach(key => {
    // Skip special keys that shouldn't be archived
    if (key.startsWith('ritual_') || key === 'planner_script_url' || key.startsWith('notion_')) {
      return;
    }
    
    // Skip split data parts (they'll be handled with their base key)
    if (key.includes(SPLIT_SUFFIX)) {
      return;
    }
    
    // Parse date from key (format: YYYY-MM, YYYY-MM-DD, YYYY-MM-wN, yr-YYYY, yrR-YYYY)
    const dateMatch = key.match(/^(\d{4})-(\d{2})/);
    if (dateMatch) {
      const year = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]);
      const keyDate = new Date(year, month - 1, 1);
      
      if (keyDate < cutoff) {
        keysToArchive.push(key);
        archivedData[key] = allData[key];
      }
    }
  });
  
  Logger.log('Found ' + keysToArchive.length + ' keys to archive');
  
  if (keysToArchive.length === 0) {
    return { archived: 0, message: 'No old data to archive' };
  }
  
  // Get existing archive or create new
  let archive = getKeyData('planner_archive') || {};
  
  // Add to archive
  keysToArchive.forEach(key => {
    archive[key] = archivedData[key];
  });
  
  // Save updated archive
  saveKeyData('planner_archive', archive);
  
  // Remove archived keys from main storage
  keysToArchive.forEach(key => {
    delete allData[key];
  });
  
  // Save cleaned data
  saveAllPlannerData(allData);
  
  Logger.log('✓ Archived ' + keysToArchive.length + ' entries');
  
  return {
    archived: keysToArchive.length,
    keys: keysToArchive,
    message: 'Archived ' + keysToArchive.length + ' old entries'
  };
}

// Restore archived data for a specific year
function restoreFromArchive(year) {
  Logger.log('▶ restoreFromArchive called for year: ' + year);
  
  const archive = getKeyData('planner_archive') || {};
  const allData = getAllPlannerData();
  const keysToRestore = [];
  
  // Find keys matching the year
  Object.keys(archive).forEach(key => {
    if (key.startsWith(year + '-') || key.startsWith('yr-' + year) || key.startsWith('yrR-' + year)) {
      keysToRestore.push(key);
      allData[key] = archive[key];
      delete archive[key];
    }
  });
  
  if (keysToRestore.length === 0) {
    return { restored: 0, message: 'No archived data found for ' + year };
  }
  
  // Save updated archive
  saveKeyData('planner_archive', archive);
  
  // Save restored data
  saveAllPlannerData(allData);
  
  Logger.log('✓ Restored ' + keysToRestore.length + ' entries for ' + year);
  
  return {
    restored: keysToRestore.length,
    keys: keysToRestore,
    message: 'Restored ' + keysToRestore.length + ' entries from archive'
  };
}

// Optional: Clean up old data (for maintenance)
function cleanupOldData() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) return;
  
  const data = sheet.getRange(2, 1, lastRow - 1, 3).getValues();
  const cutoffDate = new Date();
  cutoffDate.setFullYear(cutoffDate.getFullYear() - 5); // Keep 5 years of data
  
  const rowsToDelete = [];
  
  data.forEach((row, index) => {
    const key = row[0];
    const timestamp = new Date(row[2]);
    
    // Parse year from key (format: YYYY-MM, YYYY-MM-DD, yr-YYYY, yrR-YYYY)
    const yearMatch = key.match(/(\d{4})/);
    if (yearMatch) {
      const year = parseInt(yearMatch[1]);
      if (year < cutoffDate.getFullYear()) {
        rowsToDelete.push(index + 2); // +2 for header and 0-index
      }
    }
  });
  
  // Delete rows in reverse order to maintain indices
  rowsToDelete.reverse().forEach(rowNum => {
    sheet.deleteRow(rowNum);
  });
  
  return { deletedRows: rowsToDelete.length };
}

/**
 * TROUBLESHOOTING:
 * 
 * If sync fails:
 * 1. Check that the Web App is deployed as "Execute as: Me"
 * 2. Check that access is set to "Anyone" or "Anyone with the link"
 * 3. Make sure you copied the full Web App URL (not the Script URL)
 * 4. Try re-deploying as a NEW deployment (not update existing)
 * 5. Check the Apps Script logs (View > Executions)
 * 
 * Data structure:
 * - Monthly data: Key = "YYYY-MM", Value = {mantra, tasks, events, etc.}
 * - Daily data: Key = "YYYY-MM-DD", Value = {note, imgs, stickers, etc.}
 * - Weekly data: Key = "YYYY-MM-wN", Value = {plan, jrnl, items, etc.}
 * - Yearly vision: Key = "yr-YYYY", Value = {vb-title, vb-sections, etc.}
 * - Year reflection: Key = "yrR-YYYY", Value = {yr-1 through yr-6, imgs}
 * 
 * AUTOMATIC DATA SPLITTING:
 * - Large entries (>45K chars) are automatically split across multiple rows
 * - Split parts use keys like: "2026-02_part2", "2026-02_part3", etc.
 * - Data is seamlessly merged when loading - completely transparent to the user
 * - This bypasses Google Sheets 50K character per cell limit
 * - No limit on journal entry size! Write as much as you want.
 */
