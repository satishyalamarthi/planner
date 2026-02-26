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

// Main entry point for POST requests
function doPost(e) {
  try {
    Logger.log('=== NEW REQUEST ===');
    Logger.log('Timestamp: ' + new Date().toISOString());
    
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
    timestamp: new Date().toISOString()
  };
  return ContentService.createTextOutput(JSON.stringify(output))
    .setMimeType(ContentService.MimeType.JSON);
}

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

// Get all planner data from the sheet
function getAllPlannerData() {
  const sheet = getSheet();
  const lastRow = sheet.getLastRow();
  
  if (lastRow <= 1) {
    return {}; // No data yet
  }
  
  const data = sheet.getRange(2, 1, lastRow - 1, 2).getValues();
  const plannerData = {};
  
  data.forEach(row => {
    const key = row[0];
    const valueStr = row[1];
    
    if (key && valueStr) {
      try {
        plannerData[key] = JSON.parse(valueStr);
      } catch(e) {
        Logger.log('Failed to parse value for key: ' + key);
      }
    }
  });
  
  return plannerData;
}

// Save all planner data to the sheet
function saveAllPlannerData(data) {
  Logger.log('▶ saveAllPlannerData called');
  
  const sheet = getSheet();
  const timestamp = new Date().toISOString();
  
  Logger.log('✓ Sheet obtained: PlannerData');
  
  // Clear existing data (except header)
  const lastRow = sheet.getLastRow();
  Logger.log('Current last row: ' + lastRow);
  
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, 3).clearContent();
    Logger.log('✓ Cleared ' + (lastRow - 1) + ' existing rows');
  }
  
  // Convert data object to rows
  const rows = [];
  const dataKeys = Object.keys(data || {});
  Logger.log('Processing ' + dataKeys.length + ' data keys');
  
  dataKeys.forEach(key => {
    const value = data[key];
    const valueStr = JSON.stringify(value);
    rows.push([key, valueStr, timestamp]);
  });
  
  Logger.log('✓ Prepared ' + rows.length + ' rows');
  
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

// Save a single entry (for incremental updates)
function saveSingleEntry(key, value) {
  const sheet = getSheet();
  const timestamp = new Date().toISOString();
  const valueStr = JSON.stringify(value);
  
  // Find if key already exists
  const lastRow = sheet.getLastRow();
  let rowIndex = -1;
  
  if (lastRow > 1) {
    const keys = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < keys.length; i++) {
      if (keys[i][0] === key) {
        rowIndex = i + 2; // +2 because of 0-index and header row
        break;
      }
    }
  }
  
  if (rowIndex > 0) {
    // Update existing row
    sheet.getRange(rowIndex, 2, 1, 2).setValues([[valueStr, timestamp]]);
  } else {
    // Add new row
    sheet.appendRow([key, valueStr, timestamp]);
  }
  
  return { key: key, updated: timestamp };
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
  
  for (let i = 0; i < keys.length; i++) {
    if (keys[i][0] === key) {
      try {
        return JSON.parse(keys[i][1]);
      } catch(e) {
        Logger.log('Failed to parse value for key: ' + key);
        return null;
      }
    }
  }
  
  return null;
}

// Helper function to save data for a specific key
function saveKeyData(key, data) {
  return saveSingleEntry(key, data);
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
 */
