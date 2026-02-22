// Goal Manager - Comprehensive goal tracking with nested sub-goals

class GoalsManager {
    constructor() {
        this.goals = [];
        this.categories = ['Health & Fitness', 'Career & Finance', 'Personal Growth', 'Relationships', 'Education', 'Hobbies', 'Travel', 'Home & Living', 'Spiritual', 'Other'];
        this.quarters = ['Q1 2026', 'Q2 2026', 'Q3 2026', 'Q4 2026'];
        this.labels = ['High Priority', 'In Progress', 'Blocked', 'Review'];
        this.types = ['Project', 'Milestone', 'Task', 'Habit', 'Learning'];
        this.filters = { category: [], quarter: [], owner: [], priority: [], label: [], type: [] };
    }
    
    init() {
        this.loadGoals();
    }
    
    loadGoals() {
        this.goals = storage.get(CONFIG.STORAGE_KEYS.GOALS) || [];
    }
    
    saveGoals() {
        storage.set(CONFIG.STORAGE_KEYS.GOALS, this.goals);
    }
    
    render() {
        const container = document.getElementById('view-goals');
        
        container.innerHTML = `
            <div class="goals-header">
                <button class="btn btn-primary" onclick="goalsManager.showAddGoalModal()">
                    <i class="fas fa-plus"></i> Add Goal
                </button>
                <button class="btn btn-ghost" onclick="goalsManager.showManageAttributes()">
                    <i class="fas fa-sliders-h"></i> Manage Attributes
                </button>
            </div>
            
            <div class="goals-filters">
                ${this.renderFilters()}
            </div>
            
            <div class="goals-list">
                ${this.renderGoalTree()}
            </div>
        `;
        
        this.addGoalsStyles();
    }
    
    renderFilters() {
        return `
            <div class="filter-bar">
                <select onchange="goalsManager.updateFilter('priority', this.value)" class="filter-select">
                    <option value="">All Priorities</option>
                    ${CONFIG.GOAL_PRIORITIES.map(p => `<option value="${p.value}">${p.label}</option>`).join('')}
                </select>
                
                <select onchange="goalsManager.updateFilter('owner', this.value)" class="filter-select">
                    <option value="">All Owners</option>
                    <option value="Satish">Satish</option>
                    <option value="Keerthi">Keerthi</option>
                </select>
                
                <button class="btn btn-ghost btn-sm" onclick="goalsManager.clearFilters()">
                    <i class="fas fa-times"></i> Clear Filters
                </button>
            </div>
        `;
    }
    
    renderGoalTree() {
        const rootGoals = this.goals.filter(g => !g.parentId);
        const filtered = this.applyFilters(rootGoals);
        
        if (filtered.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-bullseye"></i>
                    <h3>No goals yet</h3>
                    <p>Start by adding your first goal!</p>
                </div>
            `;
        }
        
        return filtered.map(goal => this.renderGoalCard(goal, 0)).join('');
    }
    
    renderGoalCard(goal, depth) {
        const subGoals = this.goals.filter(g => g.parentId === goal.id);
        const progress = this.calculateProgress(goal);
        const priorityColor = getColorForPriority(goal.priority);
        
        return `
            <div class="goal-card" style="margin-left: ${depth * 2}rem;">
                <div class="goal-header" onclick="goalsManager.toggleGoal('${goal.id}')">
                    <button class="goal-toggle ${subGoals.length > 0 ? '' : 'hidden'}">
                        <i class="fas fa-chevron-${goal.expanded !== false ? 'down' : 'right'}"></i>
                    </button>
                    
                    <div class="goal-title-section">
                        <div class="goal-title">${escapeHtml(goal.name)}</div>
                        <div class="goal-meta">
                            ${goal.due ? `<span class="goal-due"><i class="fas fa-calendar"></i> ${goal.due}</span>` : ''}
                            ${goal.owners ? goal.owners.map(o => `<span class="owner-badge">${o}</span>`).join('') : ''}
                        </div>
                    </div>
                    
                    <div class="goal-indicators">
                        <div class="priority-badge" style="background: ${priorityColor}">
                            ${goal.priority || 'N/A'}
                        </div>
                        <div class="progress-circle" data-progress="${progress}">
                            <svg width="50" height="50">
                                <circle cx="25" cy="25" r="20" fill="none" stroke="var(--border-color)" stroke-width="4"/>
                                <circle cx="25" cy="25" r="20" fill="none" stroke="${priorityColor}" stroke-width="4"
                                        stroke-dasharray="${2 * Math.PI * 20}" 
                                        stroke-dashoffset="${2 * Math.PI * 20 * (1 - progress / 100)}"
                                        transform="rotate(-90 25 25)"/>
                                <text x="25" y="30" text-anchor="middle" font-size="12" fill="var(--text-primary)">${progress}%</text>
                            </svg>
                        </div>
                    </div>
                    
                    <div class="goal-actions" onclick="event.stopPropagation()">
                        <button class="btn-icon-small" onclick="goalsManager.showAddSubGoalModal('${goal.id}')" title="Add Sub-Goal">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn-icon-small" onclick="goalsManager.editGoal('${goal.id}')" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-icon-small" onclick="goalsManager.deleteGoal('${goal.id}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${goal.expanded !== false && subGoals.length > 0 ? `
                    <div class="sub-goals">
                        ${subGoals.map(sg => this.renderGoalCard(sg, depth + 1)).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }
    
    showAddGoalModal(parentId = null) {
        const modal = createModal({
            title: parentId ? '➕ Add Sub-Goal' : '🎯 Add New Goal',
            content: this.getGoalFormHTML(null, parentId),
            confirmText: 'Add Goal',
            onConfirm: () => this.saveNewGoal(parentId)
        });
        
        showModal(modal);
    }
    
    showAddSubGoalModal(parentId) {
        this.showAddGoalModal(parentId);
    }
    
    getGoalFormHTML(goal = null, parentId = null) {
        return `
            <div class="goal-form">
                <div class="form-group">
                    <label><i class="fas fa-bullseye"></i> Goal Name</label>
                    <input type="text" id="goalName" placeholder="Enter goal name" value="${goal ? escapeHtml(goal.name) : ''}" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Due Date</label>
                        <input type="date" id="goalDue" value="${goal ? goal.due : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label><i class="fas fa-flag"></i> Priority</label>
                        <select id="goalPriority">
                            ${CONFIG.GOAL_PRIORITIES.map(p => 
                                `<option value="${p.value}" ${goal && goal.priority === p.value ? 'selected' : ''}>${p.label}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-users"></i> Owners</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" name="owner" value="Satish" ${!goal || (goal.owners && goal.owners.includes('Satish')) ? 'checked' : ''}> Satish</label>
                        <label><input type="checkbox" name="owner" value="Keerthi" ${!goal || (goal.owners && goal.owners.includes('Keerthi')) ? 'checked' : ''}> Keerthi</label>
                    </div>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-tags"></i> Categories</label>
                    <select id="goalCategory" multiple size="3">
                        ${this.categories.map(c => 
                            `<option value="${c}" ${goal && goal.categories && goal.categories.includes(c) ? 'selected' : ''}>${c}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="form-group">
                    <label><i class="fas fa-comment"></i> Comments</label>
                    <textarea id="goalComments" rows="3" placeholder="Add any notes...">${goal ? escapeHtml(goal.comments || '') : ''}</textarea>
                </div>
            </div>
        `;
    }
    
    saveNewGoal(parentId) {
        const name = document.getElementById('goalName').value.trim();
        const due = document.getElementById('goalDue').value;
        const priority = document.getElementById('goalPriority').value;
        const owners = Array.from(document.querySelectorAll('input[name="owner"]:checked')).map(cb => cb.value);
        const categories = Array.from(document.getElementById('goalCategory').selectedOptions).map(opt => opt.value);
        const comments = document.getElementById('goalComments').value.trim();
        
        if (!name) {
            showToast('Please enter a goal name', 'error');
            return false;
        }
        
        const goal = {
            id: generateId(),
            name,
            due,
            priority,
            owners,
            categories,
            comments,
            parentId: parentId || null,
            progress: 0,
            status: 'not-started',
            createdAt: new Date().toISOString()
        };
        
        this.goals.push(goal);
        this.saveGoals();
        this.render();
        
        showToast('Goal added successfully! 🎯', 'success');
        return true;
    }
    
    editGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return;
        
        const modal = createModal({
            title: '✏️ Edit Goal',
            content: this.getGoalFormHTML(goal),
            confirmText: 'Save Changes',
            onConfirm: () => this.updateGoal(goalId)
        });
        
        showModal(modal);
    }
    
    updateGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (!goal) return false;
        
        goal.name = document.getElementById('goalName').value.trim();
        goal.due = document.getElementById('goalDue').value;
        goal.priority = document.getElementById('goalPriority').value;
        goal.owners = Array.from(document.querySelectorAll('input[name="owner"]:checked')).map(cb => cb.value);
        goal.categories = Array.from(document.getElementById('goalCategory').selectedOptions).map(opt => opt.value);
        goal.comments = document.getElementById('goalComments').value.trim();
        
        this.saveGoals();
        this.render();
        
        showToast('Goal updated! ✅', 'success');
        return true;
    }
    
    deleteGoal(goalId) {
        confirmDialog('Delete this goal and all its sub-goals?', () => {
            this.deleteGoalRecursive(goalId);
            this.saveGoals();
            this.render();
            showToast('Goal deleted', 'info');
        });
    }
    
    deleteGoalRecursive(goalId) {
        const subGoals = this.goals.filter(g => g.parentId === goalId);
        subGoals.forEach(sg => this.deleteGoalRecursive(sg.id));
        this.goals = this.goals.filter(g => g.id !== goalId);
    }
    
    toggleGoal(goalId) {
        const goal = this.goals.find(g => g.id === goalId);
        if (goal) {
            goal.expanded = goal.expanded === false ? true : false;
            this.render();
        }
    }
    
    calculateProgress(goal) {
        const subGoals = this.goals.filter(g => g.parentId === goal.id);
        if (subGoals.length === 0) {
            return goal.progress || 0;
        }
        
        const totalProgress = subGoals.reduce((sum, sg) => sum + this.calculateProgress(sg), 0);
        return Math.round(totalProgress / subGoals.length);
    }
    
    applyFilters(goals) {
        return goals; // Simplified - add filter logic as needed
    }
    
    updateFilter(type, value) {
        // Implement filtering logic
        this.render();
    }
    
    clearFilters() {
        this.filters = { category: [], quarter: [], owner: [], priority: [], label: [], type: [] };
        this.render();
    }
    
    showManageAttributes() {
        showToast('Attribute management coming soon!', 'info');
    }
    
    addGoalsStyles() {
        if (!document.getElementById('goals-dynamic-styles')) {
            const style = document.createElement('style');
            style.id = 'goals-dynamic-styles';
            style.textContent = `
                .goals-header {
                    display: flex;
                    gap: 1rem;
                    margin-bottom: 2rem;
                }
                
                .goals-filters {
                    margin-bottom: 2rem;
                }
                
                .filter-bar {
                    display: flex;
                    gap: 1rem;
                    flex-wrap: wrap;
                }
                
                .filter-select {
                    padding: 0.625rem 1rem;
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-family: 'Poppins', sans-serif;
                }
                
                .goal-card {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    margin-bottom: 1rem;
                    transition: all var(--transition-fast);
                }
                
                .goal-card:hover {
                    box-shadow: var(--shadow-md);
                }
                
                .goal-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1.25rem;
                    cursor: pointer;
                }
                
                .goal-toggle {
                    width: 32px;
                    height: 32px;
                    background: var(--bg-tertiary);
                    border: none;
                    border-radius: var(--radius-sm);
                    color: var(--text-secondary);
                    cursor: pointer;
                    transition: all var(--transition-fast);
                }
                
                .goal-toggle.hidden {
                    visibility: hidden;
                }
                
                .goal-title-section {
                    flex: 1;
                    min-width: 0;
                }
                
                .goal-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    margin-bottom: 0.5rem;
                }
                
                .goal-meta {
                    display: flex;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                    font-size: 0.85rem;
                }
                
                .goal-due {
                    color: var(--text-muted);
                }
                
                .owner-badge {
                    padding: 0.25rem 0.625rem;
                    background: var(--gradient-primary);
                    color: white;
                    border-radius: var(--radius-sm);
                    font-size: 0.75rem;
                    font-weight: 600;
                }
                
                .goal-indicators {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .priority-badge {
                    padding: 0.5rem 1rem;
                    border-radius: var(--radius-md);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 700;
                    text-transform: uppercase;
                }
                
                .progress-circle svg {
                    transform: rotate(-90deg);
                }
                
                .goal-actions {
                    display: flex;
                    gap: 0.5rem;
                }
                
                .sub-goals {
                    border-top: 1px solid var(--border-color);
                    padding-top: 1rem;
                }
                
                .checkbox-group {
                    display: flex;
                    gap: 1rem;
                }
                
                .checkbox-group label {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                
                .form-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 1rem;
                }
                
                @media (max-width: 768px) {
                    .form-row {
                        grid-template-columns: 1fr;
                    }
                    
                    .goal-header {
                        flex-wrap: wrap;
                    }
                    
                    .goal-indicators {
                        width: 100%;
                        justify-content: space-between;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

const goalsManager = new GoalsManager();
