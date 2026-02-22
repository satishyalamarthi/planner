// Habit Tracker Manager

class HabitsManager {
    constructor() {
        this.habits = [];
        this.currentView = 'today';
        this.currentWeek = new Date();
        this.currentMonth = new Date().getMonth();
        this.currentYear = new Date().getFullYear();
        this.selectedAssignee = 'all';
    }
    
    init() {
        this.loadHabits();
    }
    
    loadHabits() {
        this.habits = storage.get(CONFIG.STORAGE_KEYS.HABITS) || [];
    }
    
    saveHabits() {
        storage.set(CONFIG.STORAGE_KEYS.HABITS, this.habits);
    }
    
    render() {
        const container = document.getElementById('view-habits');
        
        container.innerHTML = `
            <div class="habits-header">
                <div class="view-tabs">
                    <button class="tab-btn active" data-view="today" onclick="habitsManager.switchHabitView('today')">
                        <i class="fas fa-calendar-day"></i> Today
                    </button>
                    <button class="tab-btn" data-view="weekly" onclick="habitsManager.switchHabitView('weekly')">
                        <i class="fas fa-calendar-week"></i> Weekly
                    </button>
                    <button class="tab-btn" data-view="monthly" onclick="habitsManager.switchHabitView('monthly')">
                        <i class="fas fa-calendar"></i> Monthly
                    </button>
                    <button class="tab-btn" data-view="yearly" onclick="habitsManager.switchHabitView('yearly')">
                        <i class="fas fa-calendar-alt"></i> Yearly
                    </button>
                </div>
                
                <div class="habits-toolbar">
                    <div class="assignee-filter">
                        <button class="filter-btn ${this.selectedAssignee === 'all' ? 'active' : ''}" 
                                onclick="habitsManager.filterByAssignee('all')">
                            All
                        </button>
                        <button class="filter-btn ${this.selectedAssignee === 'Satish' ? 'active' : ''}" 
                                onclick="habitsManager.filterByAssignee('Satish')">
                            Satish
                        </button>
                        <button class="filter-btn ${this.selectedAssignee === 'Keerthi' ? 'active' : ''}" 
                                onclick="habitsManager.filterByAssignee('Keerthi')">
                            Keerthi
                        </button>
                        <button class="filter-btn ${this.selectedAssignee === 'Geetanath' ? 'active' : ''}" 
                                onclick="habitsManager.filterByAssignee('Geetanath')">
                            Geetanath
                        </button>
                    </div>
                    
                    <button class="btn btn-primary" onclick="habitsManager.showAddHabitModal()">
                        <i class="fas fa-plus"></i> Add Habit
                    </button>
                </div>
            </div>
            
            <div id="habitsContent" class="habits-content">
                ${this.renderCurrentView()}
            </div>
        `;
        
        this.addHabitStyles();
    }
    
    renderCurrentView() {
        switch (this.currentView) {
            case 'today':
                return this.renderTodayView();
            case 'weekly':
                return this.renderWeeklyView();
            case 'monthly':
                return this.renderMonthlyView();
            case 'yearly':
                return this.renderYearlyView();
            default:
                return this.renderTodayView();
        }
    }
    
    renderTodayView() {
        const today = dateUtils.getDateString(new Date());
        const filteredHabits = this.getFilteredHabits();
        const todayHabits = filteredHabits.filter(habit => this.isHabitActiveToday(habit, today));
        
        if (todayHabits.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <h3>No habits for today</h3>
                    <p>Add some habits to get started!</p>
                </div>
            `;
        }
        
        return `
            <div class="habits-list">
                ${todayHabits.map(habit => this.renderHabitCard(habit, today)).join('')}
            </div>
        `;
    }
    
    renderHabitCard(habit, date) {
        const isCompleted = this.isHabitCompleted(habit, date);
        const value = this.getHabitValue(habit, date);
        
        return `
            <div class="habit-card ${isCompleted ? 'completed' : ''}">
                <button class="habit-check ${isCompleted ? 'done' : ''}" 
                        onclick="habitsManager.toggleHabit('${habit.id}', '${date}')">
                    <i class="fas fa-check"></i>
                </button>
                
                <div class="habit-info">
                    <div class="habit-name">${escapeHtml(habit.name)}</div>
                    <div class="habit-meta">
                        <span class="habit-freq">
                            <i class="fas fa-repeat"></i> ${habit.frequency}
                        </span>
                        <span class="habit-assignees">
                            ${habit.assignees.map(a => `<span class="assignee-badge">${a}</span>`).join('')}
                        </span>
                        ${habit.type === 'weightage' ? `
                            <span class="habit-target">
                                <i class="fas fa-bullseye"></i> Target: ${habit.target}
                            </span>
                        ` : ''}
                    </div>
                </div>
                
                ${habit.type === 'weightage' && isCompleted ? `
                    <div class="habit-value">
                        <input type="text" 
                               value="${value || ''}" 
                               placeholder="${habit.target}"
                               class="habit-value-input"
                               onchange="habitsManager.setHabitValue('${habit.id}', '${date}', this.value)">
                    </div>
                ` : ''}
                
                <div class="habit-actions">
                    <button class="btn-icon-small" onclick="habitsManager.editHabit('${habit.id}')" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon-small" onclick="habitsManager.deleteHabit('${habit.id}')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }
    
    renderWeeklyView() {
        const weekRange = dateUtils.getWeekRange(new Date(this.currentWeek));
        const filteredHabits = this.getFilteredHabits();
        
        let html = `
            <div class="week-navigation">
                <button class="btn-icon" onclick="habitsManager.changeWeek(-1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <div class="week-range">
                    ${dateUtils.formatDate(weekRange.start)} - ${dateUtils.formatDate(weekRange.end)}
                </div>
                <button class="btn-icon" onclick="habitsManager.changeWeek(1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <button class="btn btn-ghost" onclick="habitsManager.goToToday()">
                    Today
                </button>
            </div>
            
            <div class="week-grid">
                <table class="habits-table">
                    <thead>
                        <tr>
                            <th>Habit</th>
                            ${CONFIG.DAYS_OF_WEEK.map(day => `<th>${day}</th>`).join('')}
                            <th>Progress</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${filteredHabits.map(habit => this.renderWeeklyHabitRow(habit, weekRange)).join('')}
                    </tbody>
                </table>
            </div>
        `;
        
        return html;
    }
    
    renderWeeklyHabitRow(habit, weekRange) {
        const cells = [];
        const currentDate = new Date(weekRange.start);
        let completedCount = 0;
        let totalDays = 0;
        
        for (let i = 0; i < 7; i++) {
            const dateStr = dateUtils.getDateString(currentDate);
            const isActive = this.isHabitActiveToday(habit, dateStr);
            const isCompleted = this.isHabitCompleted(habit, dateStr);
            
            if (isActive) totalDays++;
            if (isCompleted) completedCount++;
            
            cells.push(`
                <td>
                    <button class="week-cell-check ${isCompleted ? 'done' : ''} ${!isActive ? 'disabled' : ''}"
                            ${!isActive ? 'disabled' : ''}
                            onclick="habitsManager.toggleHabit('${habit.id}', '${dateStr}')">
                        <i class="fas fa-check"></i>
                    </button>
                </td>
            `);
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        const percentage = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;
        
        return `
            <tr>
                <td class="habit-name-cell">
                    <div>${escapeHtml(habit.name)}</div>
                    <div class="habit-meta-small">
                        ${habit.assignees.map(a => `<span class="assignee-badge-small">${a[0]}</span>`).join('')}
                    </div>
                </td>
                ${cells.join('')}
                <td class="progress-cell">
                    <div class="progress-info">
                        <span class="progress-count">${completedCount}/${totalDays}</span>
                        <span class="progress-percent">${percentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${percentage}%"></div>
                    </div>
                </td>
            </tr>
        `;
    }
    
    renderMonthlyView() {
        const year = this.currentYear;
        const month = this.currentMonth;
        const daysInMonth = dateUtils.getDaysInMonth(year, month);
        const firstDay = dateUtils.getFirstDayOfMonth(year, month);
        const filteredHabits = this.getFilteredHabits();
        
        let html = `
            <div class="month-navigation">
                <button class="btn-icon" onclick="habitsManager.changeMonth(-1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h2 class="month-title">
                    ${CONFIG.MONTHS[month]} ${year}
                </h2>
                <button class="btn-icon" onclick="habitsManager.changeMonth(1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            
            <div class="monthly-stats">
                ${filteredHabits.map(habit => {
                    const stats = this.getMonthlyHabitStats(habit, year, month);
                    return `
                        <div class="habit-monthly-card">
                            <div class="habit-monthly-header">
                                <h4>${escapeHtml(habit.name)}</h4>
                                <div class="habit-monthly-progress">
                                    <span class="progress-count">${stats.completed}/${stats.total}</span>
                                    <span class="progress-percent">${stats.percentage}%</span>
                                </div>
                            </div>
                            <div class="mini-calendar">
                                ${this.renderMiniCalendar(habit, year, month, daysInMonth, firstDay)}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        return html;
    }

    renderMiniCalendar(habit, year, month, daysInMonth, firstDay) {
        let html = '<div class="mini-cal-grid">';
        
        // Empty cells for days before month starts
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="mini-cal-day empty"></div>';
        }
        
        // Days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = dateUtils.getDateString(date);
            const isActive = this.isHabitActiveToday(habit, dateStr);
            const isCompleted = this.isHabitCompleted(habit, dateStr);
            const isToday = dateUtils.isToday(date);
            
            html += `
                <div class="mini-cal-day ${isCompleted ? 'completed' : ''} ${isToday ? 'today' : ''} ${!isActive ? 'inactive' : ''}"
                     ${isActive ? `onclick="habitsManager.toggleHabit('${habit.id}', '${dateStr}')"` : ''}>
                    ${day}
                </div>
            `;
        }
        
        html += '</div>';
        return html;
    }
    
    renderYearlyView() {
        const filteredHabits = this.getFilteredHabits();
        
        let html = `
            <div class="year-navigation">
                <button class="btn-icon" onclick="habitsManager.changeYearlyYear(-1)">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h2 class="year-title">${this.currentYear}</h2>
                <button class="btn-icon" onclick="habitsManager.changeYearlyYear(1)">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            
            <div class="yearly-stats">
                ${filteredHabits.map(habit => {
                    const yearStats = this.getYearlyHabitStats(habit, this.currentYear);
                    return `
                        <div class="habit-yearly-card">
                            <div class="habit-yearly-header">
                                <h3>${escapeHtml(habit.name)}</h3>
                                <div class="habit-yearly-progress">
                                    <span class="progress-count">${yearStats.completed}/${yearStats.total}</span>
                                    <span class="progress-percent">${yearStats.percentage}%</span>
                                </div>
                            </div>
                            
                            <div class="yearly-months-grid">
                                ${CONFIG.MONTHS.map((monthName, monthIndex) => {
                                    const monthStats = this.getMonthlyHabitStats(habit, this.currentYear, monthIndex);
                                    return `
                                        <div class="yearly-month-card" onclick="habitsManager.goToMonth(${monthIndex})">
                                            <div class="month-name">${monthName}</div>
                                            <div class="month-progress">
                                                <div class="progress-bar">
                                                    <div class="progress-fill" style="width: ${monthStats.percentage}%"></div>
                                                </div>
                                                <span class="month-percent">${monthStats.percentage}%</span>
                                            </div>
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        return html;
    }
    
    // Habit CRUD operations
    showAddHabitModal() {
        const modal = createModal({
            title: '➕ Add New Habit',
            content: this.getHabitFormHTML(),
            confirmText: 'Add Habit',
            onConfirm: () => this.saveNewHabit()
        });
        
        showModal(modal);
    }
    
    getHabitFormHTML(habit = null) {
        return `
            <div class="form-group">
                <label for="habitName"><i class="fas fa-heading"></i> Habit Name</label>
                <input type="text" id="habitName" placeholder="e.g., Morning Exercise" 
                       value="${habit ? escapeHtml(habit.name) : ''}" required>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-check-square"></i> Habit Type</label>
                <div class="radio-group">
                    <label class="radio-option">
                        <input type="radio" name="habitType" value="checkbox" 
                               ${!habit || habit.type === 'checkbox' ? 'checked' : ''}>
                        <span>Checkbox (Just check off)</span>
                    </label>
                    <label class="radio-option">
                        <input type="radio" name="habitType" value="weightage" 
                               ${habit && habit.type === 'weightage' ? 'checked' : ''}>
                        <span>Weightage (Track value like 6L, 80kg, 60min)</span>
                    </label>
                </div>
            </div>
            
            <div class="form-group" id="targetGroup" style="${!habit || habit.type === 'checkbox' ? 'display:none' : ''}">
                <label for="habitTarget"><i class="fas fa-bullseye"></i> Target Value</label>
                <input type="text" id="habitTarget" placeholder="e.g., 8L, 30min, 10km" 
                       value="${habit && habit.target ? escapeHtml(habit.target) : ''}">
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-repeat"></i> Frequency</label>
                <select id="habitFrequency">
                    <option value="daily" ${!habit || habit.frequency === 'daily' ? 'selected' : ''}>Daily</option>
                    <option value="weekly" ${habit && habit.frequency === 'weekly' ? 'selected' : ''}>Weekly</option>
                    <option value="monthly" ${habit && habit.frequency === 'monthly' ? 'selected' : ''}>Monthly</option>
                    <option value="custom" ${habit && habit.frequency === 'custom' ? 'selected' : ''}>Custom</option>
                </select>
            </div>
            
            <div class="form-group" id="customFreqGroup" style="${habit && habit.frequency === 'custom' ? '' : 'display:none'}">
                <label><i class="fas fa-calendar-check"></i> Custom Frequency</label>
                <div class="custom-freq-inputs">
                    <input type="number" id="customFreqCount" min="1" 
                           value="${habit && habit.customFreq ? habit.customFreq.count : 2}">
                    <span>times per</span>
                    <select id="customFreqPeriod">
                        <option value="week" ${habit && habit.customFreq && habit.customFreq.period === 'week' ? 'selected' : ''}>Week</option>
                        <option value="month" ${habit && habit.customFreq && habit.customFreq.period === 'month' ? 'selected' : ''}>Month</option>
                    </select>
                </div>
            </div>
            
            <div class="form-group">
                <label><i class="fas fa-users"></i> Assignees (can select multiple)</label>
                <div class="assignee-options">
                    <label class="assignee-option">
                        <input type="checkbox" name="assignee" value="Satish" 
                               ${!habit || (habit.assignees && habit.assignees.includes('Satish')) ? 'checked' : ''}>
                        <span>Satish</span>
                    </label>
                    <label class="assignee-option">
                        <input type="checkbox" name="assignee" value="Keerthi" 
                               ${!habit || (habit.assignees && habit.assignees.includes('Keerthi')) ? 'checked' : ''}>
                        <span>Keerthi</span>
                    </label>
                    <label class="assignee-option">
                        <input type="checkbox" name="assignee" value="Geetanath" 
                               ${habit && habit.assignees && habit.assignees.includes('Geetanath') ? 'checked' : ''}>
                        <span>Geetanath</span>
                    </label>
                </div>
            </div>
            
            <script>
                // Show/hide custom frequency
                document.getElementById('habitFrequency').addEventListener('change', function() {
                    document.getElementById('customFreqGroup').style.display = 
                        this.value === 'custom' ? 'block' : 'none';
                });
                
                // Show/hide target field based on type
                document.querySelectorAll('input[name="habitType"]').forEach(radio => {
                    radio.addEventListener('change', function() {
                        document.getElementById('targetGroup').style.display = 
                            this.value === 'weightage' ? 'block' : 'none';
                    });
                });
            </script>
        `;
    }
    
    saveNewHabit() {
        const name = document.getElementById('habitName').value.trim();
        const type = document.querySelector('input[name="habitType"]:checked').value;
        const target = document.getElementById('habitTarget').value.trim();
        const frequency = document.getElementById('habitFrequency').value;
        const assignees = Array.from(document.querySelectorAll('input[name="assignee"]:checked'))
                              .map(cb => cb.value);
        
        if (!name) {
            showToast('Please enter a habit name', 'error');
            return false;
        }
        
        if (assignees.length === 0) {
            showToast('Please select at least one assignee', 'error');
            return false;
        }
        
        const habit = {
            id: generateId(),
            name,
            type,
            target: type === 'weightage' ? target : '',
            frequency,
            assignees,
            completions: {},
            createdAt: new Date().toISOString()
        };
        
        if (frequency === 'custom') {
            habit.customFreq = {
                count: parseInt(document.getElementById('customFreqCount').value),
                period: document.getElementById('customFreqPeriod').value
            };
        }
        
        this.habits.push(habit);
        this.saveHabits();
        this.render();
        
        showToast('Habit added successfully! 🎉', 'success');
        return true;
    }
    
    editHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        const modal = createModal({
            title: '✏️ Edit Habit',
            content: this.getHabitFormHTML(habit),
            confirmText: 'Save Changes',
            onConfirm: () => this.updateHabit(habitId)
        });
        
        showModal(modal);
    }
    
    updateHabit(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return false;
        
        const name = document.getElementById('habitName').value.trim();
        const type = document.querySelector('input[name="habitType"]:checked').value;
        const target = document.getElementById('habitTarget').value.trim();
        const frequency = document.getElementById('habitFrequency').value;
        const assignees = Array.from(document.querySelectorAll('input[name="assignee"]:checked'))
                              .map(cb => cb.value);
        
        if (!name || assignees.length === 0) {
            showToast('Please fill in all required fields', 'error');
            return false;
        }
        
        habit.name = name;
        habit.type = type;
        habit.target = type === 'weightage' ? target : '';
        habit.frequency = frequency;
        habit.assignees = assignees;
        
        if (frequency === 'custom') {
            habit.customFreq = {
                count: parseInt(document.getElementById('customFreqCount').value),
                period: document.getElementById('customFreqPeriod').value
            };
        }
        
        this.saveHabits();
        this.render();
        
        showToast('Habit updated successfully! ✅', 'success');
        return true;
    }
    
    deleteHabit(habitId) {
        confirmDialog('Are you sure you want to delete this habit?', () => {
            this.habits = this.habits.filter(h => h.id !== habitId);
            this.saveHabits();
            this.render();
            showToast('Habit deleted', 'info');
        });
    }
    
    toggleHabit(habitId, date) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        if (!habit.completions) habit.completions = {};
        if (!habit.completions[date]) {
            habit.completions[date] = { completed: true, value: '' };
        } else {
            habit.completions[date].completed = !habit.completions[date].completed;
        }
        
        this.saveHabits();
        this.render();
    }
    
    setHabitValue(habitId, date, value) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit || !habit.completions || !habit.completions[date]) return;
        
        habit.completions[date].value = value;
        this.saveHabits();
    }
    
    // Helper methods
    isHabitCompleted(habit, date) {
        return habit.completions && habit.completions[date] && habit.completions[date].completed;
    }
    
    getHabitValue(habit, date) {
        return habit.completions && habit.completions[date] ? habit.completions[date].value : '';
    }
    
    isHabitActiveToday(habit, dateStr) {
        const date = new Date(dateStr);
        const dayOfWeek = date.getDay();
        
        switch (habit.frequency) {
            case 'daily':
                return true;
            case 'weekly':
                // Active once per week (e.g., Mondays)
                return dayOfWeek === 1;
            case 'monthly':
                // Active on 1st of month
                return date.getDate() === 1;
            case 'custom':
                // For custom, always show (user can track whenever)
                return true;
            default:
                return true;
        }
    }
    
    getFilteredHabits() {
        if (this.selectedAssignee === 'all') {
            return this.habits;
        }
        return this.habits.filter(h => h.assignees.includes(this.selectedAssignee));
    }
    
    getMonthlyHabitStats(habit, year, month) {
        const daysInMonth = dateUtils.getDaysInMonth(year, month);
        let completed = 0;
        let total = 0;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = dateUtils.getDateString(date);
            
            if (this.isHabitActiveToday(habit, dateStr)) {
                total++;
                if (this.isHabitCompleted(habit, dateStr)) {
                    completed++;
                }
            }
        }
        
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
    }
    
    getYearlyHabitStats(habit, year) {
        let completed = 0;
        let total = 0;
        
        for (let month = 0; month < 12; month++) {
            const stats = this.getMonthlyHabitStats(habit, year, month);
            completed += stats.completed;
            total += stats.total;
        }
        
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
    }
    
    // Navigation methods
    switchHabitView(view) {
        this.currentView = view;
        
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === view) {
                btn.classList.add('active');
            }
        });
        
        document.getElementById('habitsContent').innerHTML = this.renderCurrentView();
    }
    
    filterByAssignee(assignee) {
        this.selectedAssignee = assignee;
        this.render();
    }
    
    changeWeek(delta) {
        this.currentWeek = dateUtils.addDays(this.currentWeek, delta * 7);
        document.getElementById('habitsContent').innerHTML = this.renderCurrentView();
    }
    
    goToToday() {
        this.currentWeek = new Date();
        document.getElementById('habitsContent').innerHTML = this.renderCurrentView();
    }
    
    changeMonth(delta) {
        this.currentMonth += delta;
        if (this.currentMonth > 11) {
            this.currentMonth = 0;
            this.currentYear++;
        } else if (this.currentMonth < 0) {
            this.currentMonth = 11;
            this.currentYear--;
        }
        document.getElementById('habitsContent').innerHTML = this.renderCurrentView();
    }
    
    changeYearlyYear(delta) {
        this.currentYear += delta;
        document.getElementById('habitsContent').innerHTML = this.renderCurrentView();
    }
    
    goToMonth(monthIndex) {
        this.currentMonth = monthIndex;
        this.switchHabitView('monthly');
    }
    
    addHabitStyles() {
        // Add additional styles specific to habits view
        if (!document.getElementById('habits-dynamic-styles')) {
            const style = document.createElement('style');
            style.id = 'habits-dynamic-styles';
            style.textContent = `
                .habits-header {
                    margin-bottom: 2rem;
                }
                
                .view-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 1.5rem;
                    flex-wrap: wrap;
                }
                
                .tab-btn {
                    padding: 0.75rem 1.25rem;
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    font-family: 'Poppins', sans-serif;
                    font-size: 0.95rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .tab-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }
                
                .tab-btn.active {
                    background: var(--gradient-primary);
                    color: white;
                    border-color: transparent;
                }
                
                .habits-toolbar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 1rem;
                }
                
                .assignee-filter {
                    display: flex;
                    gap: 0.5rem;
                    flex-wrap: wrap;
                }
                
                .filter-btn {
                    padding: 0.5rem 1rem;
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    color: var(--text-secondary);
                    font-family: 'Poppins', sans-serif;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                
                .filter-btn:hover {
                    background: var(--bg-hover);
                    color: var(--text-primary);
                }
                
                .filter-btn.active {
                    background: var(--gradient-secondary);
                    color: white;
                    border-color: transparent;
                }
                
                .habits-content {
                    margin-top: 2rem;
                }
                
                .habits-list {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                }
                
                .habit-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all var(--transition-fast);
                }
                
                .habit-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                }
                
                .habit-card.completed {
                    border-color: var(--accent-green);
                    background: linear-gradient(to right, rgba(107, 207, 127, 0.1), var(--bg-card));
                }
                
                .habit-check {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    border: 3px solid var(--border-color);
                    background: none;
                    color: transparent;
                    font-size: 1.25rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all var(--transition-fast);
                }
                
                .habit-check:hover {
                    border-color: var(--accent-green);
                    background: rgba(107, 207, 127, 0.1);
                }
                
                .habit-check.done {
                    background: var(--gradient-success);
                    border-color: var(--accent-green);
                    color: white;
                }
                
                .habit-info {
                    flex: 1;
                    min-width: 0;
                }
                
                .habit-name {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                
                .habit-meta {
                    display: flex;
                    gap: 0.75rem;
                    align-items: center;
                    flex-wrap: wrap;
                    font-size: 0.85rem;
                    color: var(--text-muted);
                }
                
                .habit-freq {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                    padding: 0.25rem 0.75rem;
                    background: var(--bg-tertiary);
                    border-radius: var(--radius-sm);
                }
                
                .habit-assignees {
                    display: flex;
                    gap: 0.5rem;
                }
                
                .assignee-badge {
                    padding: 0.25rem 0.65rem;
                    background: var(--gradient-primary);
                    color: white;
                    border-radius: var(--radius-sm);
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                .habit-target {
                    display: inline-flex;
                    align-items: center;
                    gap: 0.25rem;
                }
                
                .habit-value {
                    min-width: 120px;
                }
                
                .habit-value-input {
                    width: 100%;
                    padding: 0.5rem;
                    background: var(--bg-tertiary);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    color: var(--text-primary);
                    font-family: 'Poppins', sans-serif;
                    text-align: center;
                }
                
                .habit-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                
                .btn-icon-small {
                    width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: var(--bg-tertiary);
                    border: none;
                    border-radius: var(--radius-sm);
                    color: var(--text-muted);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                
                .btn-icon-small:hover {
                    background: var(--gradient-primary);
                    color: white;
                }
                
                /* Weekly View Styles */
                .week-navigation, .month-navigation, .year-navigation {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                
                .week-range, .month-title, .year-title {
                    font-size: 1.25rem;
                    font-weight: 600;
                    min-width: 300px;
                    text-align: center;
                }
                
                .habits-table {
                    width: 100%;
                    background: var(--bg-card);
                    border-radius: var(--radius-lg);
                    overflow: hidden;
                    border-collapse: collapse;
                }
                
                .habits-table th {
                    background: var(--bg-tertiary);
                    padding: 1rem;
                    text-align: left;
                    font-weight: 600;
                    border-bottom: 2px solid var(--border-color);
                }
                
                .habits-table td {
                    padding: 0.875rem;
                    border-bottom: 1px solid var(--border-color);
                }
                
                .habits-table tr:last-child td {
                    border-bottom: none;
                }
                
                .week-cell-check {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    border: 2px solid var(--border-color);
                    background: none;
                    color: transparent;
                    font-size: 0.9rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all var(--transition-fast);
                    margin: 0 auto;
                }
                
                .week-cell-check:not(.disabled):hover {
                    border-color: var(--accent-green);
                    background: rgba(107, 207, 127, 0.1);
                }
                
                .week-cell-check.done {
                    background: var(--gradient-success);
                    border-color: var(--accent-green);
                    color: white;
                }
                
                .week-cell-check.disabled {
                    opacity: 0.3;
                    cursor: not-allowed;
                }
                
                .progress-info {
                    display: flex;
                    gap: 0.5rem;
                    align-items: center;
                    margin-bottom: 0.5rem;
                }
                
                .progress-count {
                    font-weight: 600;
                }
                
                .progress-percent {
                    color: var(--accent-green);
                    font-weight: 700;
                }
                
                .progress-bar {
                    height: 8px;
                    background: var(--border-color);
                    border-radius: 4px;
                    overflow: hidden;
                }
                
                .progress-fill {
                    height: 100%;
                    background: var(--gradient-success);
                    transition: width var(--transition-normal);
                }
                
                /* Monthly View Styles */
                .monthly-stats {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 1.5rem;
                }
                
                .habit-monthly-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 1.25rem;
                }
                
                .habit-monthly-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1rem;
                }
                
                .habit-monthly-header h4 {
                    font-size: 1.1rem;
                }
                
                .mini-cal-grid {
                    display: grid;
                    grid-template-columns: repeat(7, 1fr);
                    gap: 0.25rem;
                }
                
                .mini-cal-day {
                    aspect-ratio: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: var(--radius-sm);
                    font-size: 0.85rem;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    background: var(--bg-tertiary);
                }
                
                .mini-cal-day.empty {
                    background: transparent;
                    cursor: default;
                }
                
                .mini-cal-day.inactive {
                    opacity: 0.3;
                    cursor: default;
                }
                
                .mini-cal-day.completed {
                    background: var(--gradient-success);
                    color: white;
                    font-weight: 700;
                }
                
                .mini-cal-day.today {
                    border: 2px solid var(--accent-blue);
                }
                
                .mini-cal-day:not(.empty):not(.inactive):hover {
                    transform: scale(1.1);
                }
                
                /* Yearly View Styles */
                .yearly-stats {
                    display: flex;
                    flex-direction: column;
                    gap: 2rem;
                }
                
                .habit-yearly-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                }
                
                .habit-yearly-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                }
                
                .yearly-months-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 1rem;
                }
                
                .yearly-month-card {
                    background: var(--bg-tertiary);
                    border: 1px solid var(--border-color);
                    border-radius: var(--radius-md);
                    padding: 1rem;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                
                .yearly-month-card:hover {
                    transform: translateY(-2px);
                    box-shadow: var(--shadow-md);
                    border-color: var(--accent-purple);
                }
                
                .month-name {
                    font-weight: 600;
                    margin-bottom: 0.75rem;
                }
                
                .month-progress {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .month-progress .progress-bar {
                    flex: 1;
                }
                
                .month-percent {
                    font-weight: 700;
                    color: var(--accent-green);
                    min-width: 45px;
                }
                
                /* Form Styles */
                .radio-group, .assignee-options {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                
                .radio-option, .assignee-option {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    padding: 0.75rem;
                    background: var(--bg-tertiary);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-md);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                
                .radio-option:hover, .assignee-option:hover {
                    border-color: var(--accent-purple);
                }
                
                .radio-option input:checked ~ span,
                .assignee-option input:checked ~ span {
                    font-weight: 600;
                }
                
                .custom-freq-inputs {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .custom-freq-inputs input {
                    width: 80px;
                    padding: 0.5rem;
                    background: var(--bg-tertiary);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-sm);
                    color: var(--text-primary);
                }
                
                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: var(--text-muted);
                }
                
                .empty-state i {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.3;
                }
                
                .empty-state h3 {
                    font-size: 1.5rem;
                    color: var(--text-secondary);
                    margin-bottom: 0.5rem;
                }
                
                @media (max-width: 768px) {
                    .habits-toolbar {
                        flex-direction: column;
                        align-items: stretch;
                    }
                    
                    .assignee-filter {
                        justify-content: center;
                    }
                    
                    .monthly-stats {
                        grid-template-columns: 1fr;
                    }
                    
                    .yearly-months-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    
                    .habits-table {
                        font-size: 0.85rem;
                    }
                    
                    .habits-table th,
                    .habits-table td {
                        padding: 0.5rem;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Initialize habits manager
const habitsManager = new HabitsManager();
