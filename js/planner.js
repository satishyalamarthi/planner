// Planner Manager - Monthly planner with journaling

class PlannerManager {
    constructor() {
        this.data = {};
        this.currentYear = new Date().getFullYear();
        this.currentMonth = new Date().getMonth();
    }
    
    init() {
        this.loadData();
        this.populateYearSelector();
    }
    
    loadData() {
        this.data = storage.get(CONFIG.STORAGE_KEYS.PLANNER) || {};
    }
    
    saveData() {
        storage.set(CONFIG.STORAGE_KEYS.PLANNER, this.data);
    }
    
    populateYearSelector() {
        const select = document.getElementById('yearSelect');
        if (!select) return;
        
        select.innerHTML = '';
        for (let year = CONFIG.YEARS_RANGE.START; year <= CONFIG.YEARS_RANGE.END; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            if (year === this.currentYear) option.selected = true;
            select.appendChild(option);
        }
    }
    
    render() {
        this.populateYearSelector();
        this.loadYear(this.currentYear);
    }
    
    loadYear(year) {
        this.currentYear = year;
        this.renderMonthTabs();
        this.renderMonthContent(this.currentMonth);
    }
    
    renderMonthTabs() {
        const container = document.getElementById('monthTabs');
        if (!container) return;
        
        container.innerHTML = CONFIG.MONTHS.map((month, index) => `
            <button class="month-tab ${index === this.currentMonth ? 'active' : ''}" 
                    onclick="plannerManager.switchMonth(${index})">
                ${month}
            </button>
        `).join('');
    }
    
    switchMonth(monthIndex) {
        this.currentMonth = monthIndex;
        this.renderMonthTabs();
        this.renderMonthContent(monthIndex);
    }
    
    renderMonthContent(monthIndex) {
        const container = document.getElementById('plannerContent');
        if (!container) return;
        
        const monthKey = `${this.currentYear}-${monthIndex}`;
        const monthData = this.data[monthKey] || this.initMonthData();
        
        container.innerHTML = `
            <div class="planner-month">
                <h2 class="month-heading">
                    <i class="fas fa-calendar-alt"></i>
                    ${CONFIG.MONTHS[monthIndex]} ${this.currentYear}
                </h2>
                
                <!-- Month Mantra -->
                <div class="section-card">
                    <div class="section-header">
                        <h3 class="section-title"><i class="fas fa-quote-left"></i> Mantra for the Month</h3>
                        <button class="btn-icon" onclick="plannerManager.editMantra()">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    <div class="mantra-text">
                        ${monthData.mantra || '<em>Click edit to add your mantra...</em>'}
                    </div>
                </div>
                
                <!-- Calendar View -->
                <div class="section-card">
                    <div class="section-header">
                        <h3 class="section-title"><i class="fas fa-calendar-days"></i> Calendar</h3>
                    </div>
                    ${this.renderCalendar(this.currentYear, monthIndex, monthData)}
                </div>
                
                <!-- Todo Lists -->
                <div class="section-card">
                    <div class="section-header">
                        <h3 class="section-title"><i class="fas fa-list-check"></i> Todo List</h3>
                    </div>
                    <div class="todo-sections">
                        ${this.renderTodoSection('Most Important', 'mostImportant', monthData)}
                        ${this.renderTodoSection('Next in Line', 'nextInLine', monthData)}
                        ${this.renderTodoSection('If There\'s Time', 'ifTime', monthData)}
                        ${this.renderTodoSection('Things to Try/Learn', 'toLearn', monthData)}
                    </div>
                </div>
                
                <!-- Important Dates -->
                <div class="section-card">
                    <div class="section-header">
                        <h3 class="section-title"><i class="fas fa-calendar-star"></i> Important Dates & Birthdays</h3>
                        <button class="btn btn-primary btn-sm" onclick="plannerManager.addImportantDate()">
                            <i class="fas fa-plus"></i> Add
                        </button>
                    </div>
                    <div class="important-dates-list">
                        ${this.renderImportantDates(monthData)}
                    </div>
                </div>
                
                <!-- Noteworthy Section -->
                <div class="section-card">
                    <div class="section-header">
                        <h3 class="section-title"><i class="fas fa-star"></i> Noteworthy</h3>
                        <button class="btn-icon" onclick="plannerManager.editNoteworthy()">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    <div class="noteworthy-content">
                        ${monthData.noteworthy || '<em>Click edit to add notes...</em>'}
                    </div>
                </div>
                
                <!-- Weekly Pages -->
                <div class="section-card">
                    <div class="section-header">
                        <h3 class="section-title"><i class="fas fa-calendar-week"></i> Weekly Pages</h3>
                    </div>
                    ${this.renderWeeklyPages(this.currentYear, monthIndex, monthData)}
                </div>
                
                <!-- Month Highlights -->
                <div class="section-card">
                    <div class="section-header">
                        <h3 class="section-title"><i class="fas fa-highlighter"></i> Month Highlights</h3>
                        <button class="btn-icon" onclick="plannerManager.editHighlights()">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    <div class="highlights-content">
                        ${monthData.highlights || '<em>Click edit to add highlights...</em>'}
                    </div>
                </div>
            </div>
        `;
    }
    
    renderCalendar(year, month, monthData) {
        const daysInMonth = dateUtils.getDaysInMonth(year, month);
        const firstDay = dateUtils.getFirstDayOfMonth(year, month);
        const today = new Date();
        
        let html = '<div class="calendar"><div class="calendar-days">';
        
        // Day headers
        CONFIG.DAYS_OF_WEEK.forEach(day => {
            html += `<div class="calendar-day-header">${day}</div>`;
        });
        
        // Empty cells before month starts
        for (let i = 0; i < firstDay; i++) {
            html += '<div class="calendar-day empty"></div>';
        }
        
        // Days of month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = dateUtils.getDateString(date);
            const isToday = dateUtils.isToday(date);
            const hasAttachment = monthData.attachments && monthData.attachments[dateStr];
            
            html += `
                <div class="calendar-day ${isToday ? 'today' : ''} ${hasAttachment ? 'has-attachment' : ''}"
                     onclick="plannerManager.openDayModal('${dateStr}')">
                    <div class="day-number">${day}</div>
                    ${hasAttachment ? '<i class="fas fa-paperclip attachment-icon"></i>' : ''}
                </div>
            `;
        }
        
        html += '</div></div>';
        return html;
    }
    
    renderTodoSection(title, key, monthData) {
        const todos = monthData.todos?.[key] || [];
        
        return `
            <div class="todo-section">
                <h4 class="todo-section-title">${title}</h4>
                <div class="todo-items">
                    ${todos.map((todo, index) => `
                        <div class="todo-item ${todo.completed ? 'completed' : ''}">
                            <input type="checkbox" 
                                   ${todo.completed ? 'checked' : ''}
                                   onchange="plannerManager.toggleTodo('${key}', ${index})">
                            <span class="todo-text">${escapeHtml(todo.text)}</span>
                            <button class="btn-icon-tiny" onclick="plannerManager.deleteTodo('${key}', ${index})">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="btn btn-ghost btn-sm mt-2" onclick="plannerManager.addTodo('${key}')">
                    <i class="fas fa-plus"></i> Add Item
                </button>
            </div>
        `;
    }
    
    renderImportantDates(monthData) {
        const dates = monthData.importantDates || [];
        
        if (dates.length === 0) {
            return '<p class="text-muted">No important dates added yet.</p>';
        }
        
        return dates.map((date, index) => `
            <div class="important-date-item">
                <div class="date-icon">${date.type === 'birthday' ? '🎂' : '📅'}</div>
                <div class="date-info">
                    <div class="date-title">${escapeHtml(date.title)}</div>
                    <div class="date-date">${date.date}</div>
                </div>
                <button class="btn-icon-tiny" onclick="plannerManager.deleteImportantDate(${index})">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `).join('');
    }
    
    renderWeeklyPages(year, month, monthData) {
        const weeks = this.getWeeksInMonth(year, month);
        
        return weeks.map((week, weekIndex) => `
            <div class="weekly-page">
                <div class="week-header">
                    <h4>Week ${weekIndex + 1}</h4>
                    <button class="btn-icon" onclick="plannerManager.openWeekModal(${weekIndex})">
                        <i class="fas fa-pen"></i>
                    </button>
                </div>
                <div class="week-preview">
                    ${week.days.slice(0, 3).map(day => `
                        <div class="day-preview">
                            <strong>${CONFIG.DAYS_OF_WEEK[day.getDay()]} ${day.getDate()}</strong>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    }
    
    getWeeksInMonth(year, month) {
        const weeks = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        
        let currentWeek = [];
        for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
            currentWeek.push(new Date(d));
            if (d.getDay() === 6 || d.getTime() === lastDay.getTime()) {
                weeks.push({ days: [...currentWeek] });
                currentWeek = [];
            }
        }
        
        return weeks;
    }
    
    initMonthData() {
        return {
            mantra: '',
            todos: {
                mostImportant: [],
                nextInLine: [],
                ifTime: [],
                toLearn: []
            },
            importantDates: [],
            noteworthy: '',
            highlights: '',
            weeks: [],
            attachments: {}
        };
    }
    
    getMonthKey() {
        return `${this.currentYear}-${this.currentMonth}`;
    }
    
    getMonthData() {
        const key = this.getMonthKey();
        if (!this.data[key]) {
            this.data[key] = this.initMonthData();
        }
        return this.data[key];
    }
    
    // CRUD operations
    editMantra() {
        const monthData = this.getMonthData();
        const modal = createModal({
            title: '✨ Edit Month Mantra',
            content: `
                <div class="form-group">
                    <textarea id="mantraText" rows="4" placeholder="Enter your mantra for the month...">${monthData.mantra || ''}</textarea>
                </div>
            `,
            onConfirm: () => {
                monthData.mantra = document.getElementById('mantraText').value;
                this.saveData();
                this.renderMonthContent(this.currentMonth);
                showToast('Mantra updated! ✨', 'success');
                return true;
            }
        });
        showModal(modal);
    }
    
    addTodo(section) {
        const modal = createModal({
            title: '➕ Add Todo',
            content: `
                <div class="form-group">
                    <input type="text" id="todoText" placeholder="Enter todo item...">
                </div>
            `,
            onConfirm: () => {
                const text = document.getElementById('todoText').value.trim();
                if (!text) return false;
                
                const monthData = this.getMonthData();
                if (!monthData.todos[section]) monthData.todos[section] = [];
                monthData.todos[section].push({ text, completed: false });
                
                this.saveData();
                this.renderMonthContent(this.currentMonth);
                showToast('Todo added!', 'success');
                return true;
            }
        });
        showModal(modal);
    }
    
    toggleTodo(section, index) {
        const monthData = this.getMonthData();
        monthData.todos[section][index].completed = !monthData.todos[section][index].completed;
        this.saveData();
    }
    
    deleteTodo(section, index) {
        const monthData = this.getMonthData();
        monthData.todos[section].splice(index, 1);
        this.saveData();
        this.renderMonthContent(this.currentMonth);
    }
    
    addImportantDate() {
        const modal = createModal({
            title: '📅 Add Important Date',
            content: `
                <div class="form-group">
                    <label>Title</label>
                    <input type="text" id="dateTitle" placeholder="e.g., Doctor Appointment">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="dateDate">
                </div>
                <div class="form-group">
                    <label>Type</label>
                    <select id="dateType">
                        <option value="event">Event</option>
                        <option value="birthday">Birthday</option>
                        <option value="appointment">Appointment</option>
                    </select>
                </div>
            `,
            onConfirm: () => {
                const title = document.getElementById('dateTitle').value.trim();
                const date = document.getElementById('dateDate').value;
                const type = document.getElementById('dateType').value;
                
                if (!title || !date) return false;
                
                const monthData = this.getMonthData();
                if (!monthData.importantDates) monthData.importantDates = [];
                monthData.importantDates.push({ title, date, type });
                
                this.saveData();
                this.renderMonthContent(this.currentMonth);
                showToast('Date added!', 'success');
                return true;
            }
        });
        showModal(modal);
    }
    
    deleteImportantDate(index) {
        const monthData = this.getMonthData();
        monthData.importantDates.splice(index, 1);
        this.saveData();
        this.renderMonthContent(this.currentMonth);
    }
    
    editNoteworthy() {
        const monthData = this.getMonthData();
        const modal = createModal({
            title: '⭐ Edit Noteworthy',
            content: `
                <div class="form-group">
                    <textarea id="noteworthyText" rows="6" placeholder="Add noteworthy items...">${monthData.noteworthy || ''}</textarea>
                </div>
            `,
            onConfirm: () => {
                monthData.noteworthy = document.getElementById('noteworthyText').value;
                this.saveData();
                this.renderMonthContent(this.currentMonth);
                showToast('Updated!', 'success');
                return true;
            }
        });
        showModal(modal);
    }
    
    editHighlights() {
        const monthData = this.getMonthData();
        const modal = createModal({
            title: '✨ Edit Month Highlights',
            content: `
                <div class="form-group">
                    <textarea id="highlightsText" rows="8" placeholder="Add your month highlights...">${monthData.highlights || ''}</textarea>
                </div>
            `,
            onConfirm: () => {
                monthData.highlights = document.getElementById('highlightsText').value;
                this.saveData();
                this.renderMonthContent(this.currentMonth);
                showToast('Highlights updated!', 'success');
                return true;
            }
        });
        showModal(modal);
    }
    
    openDayModal(dateStr) {
        showToast('Daily journal editor coming soon! 📝', 'info');
        // TODO: Implement full daily journal with attachments, emojis, etc.
    }
    
    openWeekModal(weekIndex) {
        showToast('Weekly planner editor coming soon! 📅', 'info');
        // TODO: Implement weekly planning page
    }
}

const plannerManager = new PlannerManager();
