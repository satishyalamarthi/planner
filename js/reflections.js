// Reflections Manager

class ReflectionsManager {
    constructor() {
        this.reflections = {};
    }
    
    init() {
        this.loadReflections();
    }
    
    loadReflections() {
        this.reflections = storage.get(CONFIG.STORAGE_KEYS.REFLECTIONS) || {};
    }
    
    saveReflections() {
        storage.set(CONFIG.STORAGE_KEYS.REFLECTIONS, this.reflections);
    }
    
    render() {
        const container = document.getElementById('view-reflections');
        const currentYear = new Date().getFullYear();
        
        container.innerHTML = `
            <div class="reflections-header">
                <h2 class="page-heading">
                    <i class="fas fa-book-open"></i>
                    Reflections
                </h2>
            </div>
            
            <div class="reflections-tabs">
                <button class="tab-btn active" onclick="reflectionsManager.switchTab('monthly')">
                    <i class="fas fa-calendar-days"></i> Monthly
                </button>
                <button class="tab-btn" onclick="reflectionsManager.switchTab('yearly')">
                    <i class="fas fa-calendar"></i> Yearly
                </button>
            </div>
            
            <div id="reflectionsContent">
                ${this.renderMonthlyReflections()}
            </div>
        `;
        
        this.addStyles();
    }
    
    renderMonthlyReflections() {
        const year = new Date().getFullYear();
        const month = new Date().getMonth();
        const key = `${year}-${month}`;
        const reflection = this.reflections[key] || {};
        
        return `
            <div class="monthly-reflections">
                <div class="reflection-selector">
                    <select id="monthSelect" onchange="reflectionsManager.loadMonthReflection(this.value)">
                        ${CONFIG.MONTHS.map((m, i) => 
                            `<option value="${i}" ${i === month ? 'selected' : ''}>${m} ${year}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="reflection-questions">
                    ${this.renderQuestion('What made my soul happy this month?', 'soulHappy', reflection)}
                    ${this.renderQuestion('What worked well?', 'worked', reflection)}
                    ${this.renderQuestion('What didn\'t work?', 'didntWork', reflection)}
                    ${this.renderQuestion('Content I loved', 'lovedContent', reflection)}
                    ${this.renderQuestion('Food that I enjoyed', 'enjoyedFood', reflection)}
                    ${this.renderQuestion('Places I visited', 'visitedPlaces', reflection)}
                </div>
                
                <div class="habits-summary">
                    <h3><i class="fas fa-chart-line"></i> Habits Tracked This Month</h3>
                    <p class="text-muted">Habit data will be automatically populated from Habit Tracker</p>
                </div>
                
                <button class="btn btn-primary mt-3" onclick="reflectionsManager.saveMonthlyReflection()">
                    <i class="fas fa-save"></i> Save Reflection
                </button>
            </div>
        `;
    }
    
    renderQuestion(question, key, reflection) {
        return `
            <div class="reflection-question">
                <label class="question-label">
                    <i class="fas fa-comment-dots"></i>
                    ${question}
                </label>
                <textarea id="ref_${key}" rows="4" class="reflection-textarea">${reflection[key] || ''}</textarea>
            </div>
        `;
    }
    
    renderYearlyReflections() {
        const year = new Date().getFullYear();
        const reflection = this.reflections[`year-${year}`] || {};
        
        return `
            <div class="yearly-reflections">
                <div class="reflection-selector">
                    <h2>${year} Year-End Reflection</h2>
                </div>
                
                <div class="reflection-questions">
                    ${this.renderQuestion('What were your biggest accomplishments this year?', 'accomplishments', reflection)}
                    ${this.renderQuestion('What challenges did you overcome?', 'challenges', reflection)}
                    ${this.renderQuestion('What are you most grateful for?', 'grateful', reflection)}
                    ${this.renderQuestion('What did you learn about yourself?', 'learned', reflection)}
                    ${this.renderQuestion('What will you carry forward into next year?', 'carryForward', reflection)}
                </div>
                
                <button class="btn btn-primary mt-3" onclick="reflectionsManager.saveYearlyReflection()">
                    <i class="fas fa-save"></i> Save Reflection
                </button>
            </div>
        `;
    }
    
    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        event.target.closest('.tab-btn').classList.add('active');
        
        const content = document.getElementById('reflectionsContent');
        content.innerHTML = tab === 'monthly' ? this.renderMonthlyReflections() : this.renderYearlyReflections();
    }
    
    loadMonthReflection(monthIndex) {
        const year = new Date().getFullYear();
        const key = `${year}-${monthIndex}`;
        const reflection = this.reflections[key] || {};
        
        // Update textareas
        Object.keys(reflection).forEach(k => {
            const el = document.getElementById(`ref_${k}`);
            if (el) el.value = reflection[k] || '';
        });
    }
    
    saveMonthlyReflection() {
        const year = new Date().getFullYear();
        const month = document.getElementById('monthSelect').value;
        const key = `${year}-${month}`;
        
        const questions = ['soulHappy', 'worked', 'didntWork', 'lovedContent', 'enjoyedFood', 'visitedPlaces'];
        const reflection = {};
        
        questions.forEach(q => {
            const el = document.getElementById(`ref_${q}`);
            if (el) reflection[q] = el.value;
        });
        
        this.reflections[key] = reflection;
        this.saveReflections();
        
        showToast('Monthly reflection saved! 📖', 'success');
    }
    
    saveYearlyReflection() {
        const year = new Date().getFullYear();
        const key = `year-${year}`;
        
        const questions = ['accomplishments', 'challenges', 'grateful', 'learned', 'carryForward'];
        const reflection = {};
        
        questions.forEach(q => {
            const el = document.getElementById(`ref_${q}`);
            if (el) reflection[q] = el.value;
        });
        
        this.reflections[key] = reflection;
        this.saveReflections();
        
        showToast('Yearly reflection saved! 🎉', 'success');
    }
    
    addStyles() {
        if (!document.getElementById('reflections-styles')) {
            const style = document.createElement('style');
            style.id = 'reflections-styles';
            style.textContent = `
                .reflections-header {
                    margin-bottom: 2rem;
                }
                
                .reflections-tabs {
                    display: flex;
                    gap: 0.5rem;
                    margin-bottom: 2rem;
                }
                
                .reflection-selector {
                    margin-bottom: 2rem;
                }
                
                #monthSelect {
                    width: 100%;
                    max-width: 300px;
                    padding: 0.75rem 1rem;
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-family: 'Poppins', sans-serif;
                    font-size: 1rem;
                }
                
                .reflection-questions {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }
                
                .reflection-question {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                }
                
                .question-label {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    font-weight: 600;
                    font-size: 1.1rem;
                    margin-bottom: 1rem;
                    color: var(--text-primary);
                }
                
                .question-label i {
                    color: var(--accent-purple);
                }
                
                .reflection-textarea {
                    width: 100%;
                    padding: 1rem;
                    background: var(--bg-tertiary);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-md);
                    color: var(--text-primary);
                    font-family: 'Patrick Hand', cursive;
                    font-size: 1.1rem;
                    line-height: 1.8;
                    resize: vertical;
                    transition: all var(--transition-fast);
                }
                
                .reflection-textarea:focus {
                    outline: none;
                    border-color: var(--accent-purple);
                    box-shadow: 0 0 0 3px rgba(155, 109, 255, 0.2);
                }
                
                .habits-summary {
                    background: var(--bg-card);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 1.5rem;
                    margin-top: 2rem;
                }
                
                .habits-summary h3 {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                }
                
                @media (max-width: 768px) {
                    .reflection-question {
                        padding: 1rem;
                    }
                    
                    .question-label {
                        font-size: 1rem;
                    }
                    
                    .reflection-textarea {
                        font-size: 1rem;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

const reflectionsManager = new ReflectionsManager();
