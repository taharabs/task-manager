// AI Assistant Class
class AIAssistant {
    constructor(taskManager) {
        this.taskManager = taskManager;
        this.isThinking = false;
    }

    // Parse natural language dates
    parseNaturalDate(text) {
        const today = new Date();
        const textLower = text.toLowerCase().trim();

        const dateMap = {
            'today': this.formatDate(today),
            'tomorrow': this.formatDate(new Date(today.getTime() + 86400000)),
            'next week': this.formatDate(new Date(today.getTime() + 7 * 86400000)),
            'in 2 days': this.formatDate(new Date(today.getTime() + 2 * 86400000)),
            'in 3 days': this.formatDate(new Date(today.getTime() + 3 * 86400000)),
            'in 1 week': this.formatDate(new Date(today.getTime() + 7 * 86400000)),
            'in 2 weeks': this.formatDate(new Date(today.getTime() + 14 * 86400000)),
            'next monday': this.getNextWeekday(1),
            'next tuesday': this.getNextWeekday(2),
            'next wednesday': this.getNextWeekday(3),
            'next thursday': this.getNextWeekday(4),
            'next friday': this.getNextWeekday(5),
            'end of month': this.getEndOfMonth()
        };

        return dateMap[textLower] || null;
    }

    getNextWeekday(weekday) {
        const today = new Date();
        const result = new Date(today);
        result.setDate(today.getDate() + (7 + weekday - today.getDay()) % 7);
        return this.formatDate(result);
    }

    getEndOfMonth() {
        const today = new Date();
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return this.formatDate(lastDay);
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Suggest better task titles
    improveTaskTitle(title) {
        const improvements = {
            'do': 'Complete',
            'make': 'Create',
            'fix': 'Resolve',
            'buy': 'Purchase',
            'call': 'Contact',
            'send': 'Deliver',
            'check': 'Review',
            'talk': 'Discuss',
            'meet': 'Coordinate with',
            'help': 'Assist with'
        };

        let improved = title;
        Object.keys(improvements).forEach(basic => {
            if (improved.toLowerCase().startsWith(basic + ' ')) {
                improved = improvements[basic] + improved.substring(basic.length);
            }
        });

        // Add action verbs if missing
        if (!improved.match(/^(Complete|Create|Review|Update|Prepare|Organize|Analyze|Design|Implement|Test)/i)) {
            const context = improved.toLowerCase();
            if (context.includes('email') || context.includes('message')) improved = 'Send ' + improved;
            else if (context.includes('meeting') || context.includes('call')) improved = 'Schedule ' + improved;
            else if (context.includes('bug') || context.includes('issue')) improved = 'Fix ' + improved;
            else if (context.includes('report') || context.includes('document')) improved = 'Prepare ' + improved;
        }

        return improved !== title ? improved : null;
    }

    // Suggest priority based on content
    suggestPriority(title, description = '') {
        const text = (title + ' ' + description).toLowerCase();

        if (text.includes('urgent') || text.includes('asap') || text.includes('critical') ||
            text.includes('deadline') || text.includes('important') || text.includes('!!!')) {
            return 'High';
        }

        if (text.includes('should') || text.includes('need') || text.includes('required') ||
            text.includes('this week') || text.includes('soon')) {
            return 'Medium';
        }

        return 'Low';
    }

    // Suggest tags based on content
    suggestTags(title, description = '') {
        const text = (title + ' ' + description).toLowerCase();
        const tags = [];

        if (text.includes('work') || text.includes('office') || text.includes('job')) tags.push('work');
        if (text.includes('personal') || text.includes('home') || text.includes('family')) tags.push('personal');
        if (text.includes('urgent') || text.includes('asap')) tags.push('urgent');
        if (text.includes('important')) tags.push('important');
        if (text.includes('meeting') || text.includes('call')) tags.push('meeting');
        if (text.includes('email') || text.includes('message')) tags.push('communication');
        if (text.includes('shopping') || text.includes('buy')) tags.push('shopping');
        if (text.includes('health') || text.includes('exercise') || text.includes('doctor')) tags.push('health');

        return tags.slice(0, 3); // Return max 3 tags
    }

    // Generate task suggestions based on existing tasks
    generateTaskSuggestions() {
        const tasks = this.taskManager.tasks;
        const suggestions = [];

        // Find patterns in existing tasks
        const workTasks = tasks.filter(t => t.project === 'Work');
        const personalTasks = tasks.filter(t => t.project === 'Personal');

        if (workTasks.length > 0) {
            suggestions.push({
                title: 'Prepare weekly work report',
                description: 'Compile progress and achievements for the week',
                priority: 'Medium',
                project: 'Work',
                tags: ['report', 'weekly']
            });
        }

        if (personalTasks.some(t => t.tags.includes('health'))) {
            suggestions.push({
                title: 'Schedule exercise routine',
                description: 'Plan weekly workout sessions',
                priority: 'Medium',
                project: 'Health',
                tags: ['health', 'exercise']
            });
        }

        // Generic productive tasks
        suggestions.push(
            {
                title: 'Review and update task priorities',
                description: 'Ensure tasks are properly prioritized for the week',
                priority: 'High',
                project: 'Personal',
                tags: ['planning', 'review']
            },
            {
                title: 'Clean and organize workspace',
                description: 'Declutter physical or digital workspace for better productivity',
                priority: 'Low',
                project: 'Personal',
                tags: ['organization']
            }
        );

        return suggestions;
    }

    // Analyze productivity patterns
    getProductivityInsights() {
        const tasks = this.taskManager.tasks;
        const completed = tasks.filter(t => t.status === 'Done');
        const highPriority = tasks.filter(t => t.priority === 'High');
        const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done');

        return {
            completionRate: tasks.length > 0 ? Math.round((completed.length / tasks.length) * 100) : 0,
            highPriorityCompleted: highPriority.filter(t => t.status === 'Done').length,
            totalHighPriority: highPriority.length,
            overdueTasks: overdue.length,
            averagePriority: this.calculateAveragePriority(tasks)
        };
    }

    calculateAveragePriority(tasks) {
        const priorityWeights = { 'High': 3, 'Medium': 2, 'Low': 1 };
        const total = tasks.reduce((sum, task) => sum + priorityWeights[task.priority], 0);
        return tasks.length > 0 ? total / tasks.length : 0;
    }

    // Process natural language queries
    processQuery(query) {
        const queryLower = query.toLowerCase();
        this.showThinking();

        setTimeout(() => {
            let response = '';

            if (queryLower.includes('what should i work on') || queryLower.includes('what to do')) {
                response = this.getWorkSuggestion();
            } else if (queryLower.includes('overdue') || queryLower.includes('late')) {
                response = this.getOverdueSummary();
            } else if (queryLower.includes('priority') || queryLower.includes('important')) {
                response = this.getPrioritySummary();
            } else if (queryLower.includes('productivity') || queryLower.includes('progress')) {
                response = this.getProductivitySummary();
            } else if (queryLower.includes('suggest') || queryLower.includes('idea')) {
                response = this.getTaskSuggestions();
            } else {
                response = "I can help you with: task suggestions, productivity insights, priority management, and overdue tasks. Try asking 'What should I work on?' or 'Show me my progress'.";
            }

            this.showResponse(response);
        }, 1000);
    }

    getWorkSuggestion() {
        const highPriority = this.taskManager.tasks.filter(t => t.priority === 'High' && t.status !== 'Done');
        const overdue = this.taskManager.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done');

        if (overdue.length > 0) {
            return `You have ${overdue.length} overdue tasks. I recommend starting with "${overdue[0].title}" since it's past due.`;
        } else if (highPriority.length > 0) {
            return `Focus on your high-priority task: "${highPriority[0].title}". It's marked as important and needs your attention.`;
        } else {
            const nextTask = this.taskManager.tasks.find(t => t.status !== 'Done');
            return nextTask ?
                `Start with "${nextTask.title}". Once complete, you'll build momentum for the rest of your tasks.` :
                'All tasks are complete! Great job! Consider adding new tasks to stay productive.';
        }
    }

    getOverdueSummary() {
        const overdue = this.taskManager.tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done');
        if (overdue.length === 0) return 'No overdue tasks! Excellent time management.';

        return `You have ${overdue.length} overdue task${overdue.length > 1 ? 's' : ''}: ${overdue.map(t => `"${t.title}"`).join(', ')}. Consider rescheduling or prioritizing these.`;
    }

    getPrioritySummary() {
        const highPriority = this.taskManager.tasks.filter(t => t.priority === 'High' && t.status !== 'Done');
        if (highPriority.length === 0) return 'No high-priority tasks pending. Good work!';

        return `You have ${highPriority.length} high-priority task${highPriority.length > 1 ? 's' : ''} to focus on: ${highPriority.map(t => `"${t.title}"`).join(', ')}.`;
    }

    getProductivitySummary() {
        const insights = this.getProductivityInsights();
        return `Your completion rate is ${insights.completionRate}%. You've completed ${insights.highPriorityCompleted} of ${insights.totalHighPriority} high-priority tasks. ${insights.overdueTasks > 0 ? `Watch out for ${insights.overdueTasks} overdue tasks.` : 'No overdue tasks!'}`;
    }

    getTaskSuggestions() {
        const suggestions = this.generateTaskSuggestions();
        return `Here are some task ideas:\n${suggestions.map(s => `• ${s.title} (${s.priority} priority)`).join('\n')}`;
    }

    showThinking() {
        const aiContent = document.getElementById('aiDynamicSuggestions');
        aiContent.innerHTML = `
            <div class="ai-thinking">
                <div class="ai-dot"></div>
                <div class="ai-dot"></div>
                <div class="ai-dot"></div>
                AI is thinking...
            </div>
        `;
    }

    showResponse(response) {
        const aiContent = document.getElementById('aiDynamicSuggestions');
        aiContent.innerHTML = `
            <div class="ai-suggestion">
                <h4>💬 AI Response</h4>
                <p>${response}</p>
                <div class="ai-actions">
                    <button class="ai-btn" onclick="taskManager.aiProcessQuery('suggest tasks')">More Suggestions</button>
                    <button class="ai-btn ai-btn-outline" onclick="taskManager.aiClearResponse()">Clear</button>
                </div>
            </div>
        `;
    }
}

// Enhanced Task Manager Class with AI
class TaskManager {
    constructor() {
        this.tasks = this.loadTasks();
        this.currentView = 'table';
        this.editingTaskId = null;
        this.draggedTask = null;
        this.selectedTasks = new Set();
        this.currentFilters = {
            search: '',
            status: '',
            priority: '',
            saved: 'all'
        };
        this.currentDate = new Date();
        this.ai = new AIAssistant(this);
        this.init();
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('taskManagerData');
            if (saved) {
                const tasks = JSON.parse(saved);
                console.log('✅ Loaded tasks from localStorage:', tasks);
                return tasks;
            }
        } catch (e) {
            console.log('❌ Error loading saved data, using sample data');
        }

        // Return sample data if nothing is saved
        return [
            {
                id: '1',
                title: 'Complete project proposal',
                description: 'Finish the draft and send for review',
                priority: 'High',
                dueDate: this.formatDate(new Date()),
                project: 'Work',
                status: 'In Progress',
                tags: ['urgent', 'client'],
                comments: [
                    { text: 'Need to include budget section', date: '2023-11-20', author: 'You' }
                ],
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                title: 'Buy groceries',
                description: 'Milk, eggs, bread, and fruits',
                priority: 'Medium',
                dueDate: this.formatDate(new Date(Date.now() + 86400000)), // Tomorrow
                project: 'Personal',
                status: 'Todo',
                tags: ['shopping'],
                comments: [],
                createdAt: new Date().toISOString()
            }
        ];
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    saveTasks() {
        console.log('💾 Saving tasks to localStorage:', this.tasks);
        localStorage.setItem('taskManagerData', JSON.stringify(this.tasks));
    }

    resetDatabase() {
        if (confirm('Are you sure you want to reset the database? This will delete all tasks and cannot be undone.')) {
            localStorage.removeItem('taskManagerData');
            this.tasks = [];
            this.saveTasks();
            this.selectedTasks.clear();
            this.renderAllViews();
            this.showNotification('Database reset successfully!');
        }
    }

    init() {
        this.setupEventListeners();
        this.setupTheme();
        this.setupDragAndDrop();
        this.setupSmartInputs(); // Add this line
        this.renderAllViews();
    }

    setupTheme() {
        const savedTheme = localStorage.getItem('taskManagerTheme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        this.updateThemeToggle(savedTheme);
    }

    updateThemeToggle(theme) {
        const themeToggle = document.getElementById('themeToggle');
        themeToggle.textContent = theme === 'dark' ? '☀️' : '🌙';
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('taskManagerTheme', newTheme);
        this.updateThemeToggle(newTheme);

        this.showNotification(`${newTheme === 'dark' ? 'Dark' : 'Light'} mode enabled`);
    }

    setupDragAndDrop() {
        // Event listeners will be added dynamically when rendering board view
    }

    setupEventListeners() {
        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            this.openModal();
        });

        // Reset database button
        document.getElementById('resetDatabaseBtn').addEventListener('click', () => {
            this.resetDatabase();
        });

        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => {
            this.toggleTheme();
        });

        // Search and filters
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentFilters.search = e.target.value;
            this.renderAllViews();
        });

        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.renderAllViews();
        });

        document.getElementById('priorityFilter').addEventListener('change', (e) => {
            this.currentFilters.priority = e.target.value;
            this.renderAllViews();
        });

        // Saved searches
        document.querySelectorAll('.search-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                document.querySelectorAll('.search-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilters.saved = e.target.dataset.filter;
                this.applySavedFilter();
            });
        });

        // Bulk actions
        document.getElementById('selectAll').addEventListener('change', (e) => {
            this.toggleSelectAll(e.target.checked);
        });

        document.getElementById('bulkComplete').addEventListener('click', () => {
            this.bulkUpdateStatus('Done');
        });

        document.getElementById('bulkDelete').addEventListener('click', () => {
            this.bulkDeleteTasks();
        });

        document.getElementById('bulkMove').addEventListener('click', () => {
            this.showBulkMoveModal();
        });

        document.getElementById('bulkClear').addEventListener('click', () => {
            this.clearSelection();
        });

        // Calendar navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });

        document.getElementById('nextMonth').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });

        document.getElementById('todayBtn').addEventListener('click', () => {
            this.currentDate = new Date();
            this.renderCalendar();
        });

        // Modal close buttons
        document.getElementById('closeTaskModal').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('closeDetailModal').addEventListener('click', () => {
            this.closeDetailModal();
        });

        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            if (this.editingTaskId) {
                this.updateTask();
            } else {
                this.addTask();
            }
        });

        // View toggle buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchView(e.target.dataset.view);
            });
        });

        // Add AI event listeners
        document.getElementById('aiToggle').addEventListener('click', () => {
            this.aiTogglePanel();
        });

        document.getElementById('aiClose').addEventListener('click', () => {
            this.aiClosePanel();
        });

        document.getElementById('aiInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.aiProcessQuery();
            }
        });

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.id === 'taskModal') {
                this.closeModal();
            }
            if (e.target.id === 'taskDetailModal') {
                this.closeDetailModal();
            }
        });

        // Close AI suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.ai-smart-input')) {
                document.getElementById('titleSuggestions').classList.remove('show');
                document.getElementById('dateSuggestions').classList.remove('show');
            }
        });

        // Use event delegation for dynamic elements
        document.addEventListener('click', (e) => {
            // Handle edit buttons
            if (e.target.classList.contains('edit-btn') && e.target.dataset.taskId) {
                this.handleEdit(e.target.dataset.taskId);
            }

            // Handle delete buttons
            if (e.target.classList.contains('delete-btn') && e.target.dataset.taskId) {
                this.handleDelete(e.target.dataset.taskId);
            }

            // Handle view details buttons
            if (e.target.classList.contains('comment-btn') && e.target.dataset.taskId) {
                this.handleViewDetails(e.target.dataset.taskId);
            }

            // Handle comment delete buttons
            if (e.target.classList.contains('comment-delete') && e.target.dataset.taskId && e.target.dataset.commentIndex !== undefined) {
                this.deleteComment(e.target.dataset.taskId, parseInt(e.target.dataset.commentIndex));
            }

            // Handle add comment button in detail modal
            if (e.target.id === 'addCommentBtn' && e.target.dataset.taskId) {
                const commentText = document.getElementById('newCommentText').value;
                this.addComment(e.target.dataset.taskId, commentText);
            }

            // Handle task selection
            if (e.target.type === 'checkbox' && e.target.classList.contains('task-select')) {
                this.toggleTaskSelection(e.target.dataset.taskId, e.target.checked);
            }

            // Handle calendar task clicks
            if (e.target.classList.contains('calendar-task')) {
                this.handleViewDetails(e.target.dataset.taskId);
            }
        });
    }

    applySavedFilter() {
        const today = this.formatDate(new Date());

        switch (this.currentFilters.saved) {
            case 'today':
                this.currentFilters.search = '';
                this.currentFilters.status = '';
                this.currentFilters.priority = '';
                // Filter will be applied in getFilteredTasks
                break;
            case 'overdue':
                this.currentFilters.search = '';
                this.currentFilters.status = '';
                this.currentFilters.priority = '';
                break;
            case 'high-priority':
                this.currentFilters.search = '';
                this.currentFilters.status = '';
                this.currentFilters.priority = 'High';
                break;
            default:
                this.currentFilters.search = '';
                this.currentFilters.status = '';
                this.currentFilters.priority = '';
        }

        this.renderAllViews();
    }

    getFilteredTasks() {
        const today = this.formatDate(new Date());

        return this.tasks.filter(task => {
            // Search filter
            if (this.currentFilters.search) {
                const searchTerm = this.currentFilters.search.toLowerCase();
                const matchesSearch =
                    task.title.toLowerCase().includes(searchTerm) ||
                    task.description.toLowerCase().includes(searchTerm) ||
                    task.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
                    task.project.toLowerCase().includes(searchTerm);
                if (!matchesSearch) return false;
            }

            // Status filter
            if (this.currentFilters.status && task.status !== this.currentFilters.status) {
                return false;
            }

            // Priority filter
            if (this.currentFilters.priority && task.priority !== this.currentFilters.priority) {
                return false;
            }

            // Saved search filters
            if (this.currentFilters.saved === 'today' && task.dueDate !== today) {
                return false;
            }

            if (this.currentFilters.saved === 'overdue' && (!task.dueDate || task.dueDate >= today)) {
                return false;
            }

            return true;
        });
    }

    toggleSelectAll(checked) {
        const filteredTasks = this.getFilteredTasks();

        if (checked) {
            filteredTasks.forEach(task => this.selectedTasks.add(task.id));
        } else {
            filteredTasks.forEach(task => this.selectedTasks.delete(task.id));
        }

        this.updateBulkActions();
        this.renderAllViews();
    }

    toggleTaskSelection(taskId, checked) {
        if (checked) {
            this.selectedTasks.add(taskId);
        } else {
            this.selectedTasks.delete(taskId);
            document.getElementById('selectAll').checked = false;
        }

        this.updateBulkActions();
    }

    clearSelection() {
        this.selectedTasks.clear();
        document.getElementById('selectAll').checked = false;
        this.updateBulkActions();
        this.renderAllViews();
    }

    updateBulkActions() {
        const bulkActions = document.getElementById('bulkActions');
        const selectedCount = document.getElementById('selectedCount');

        if (this.selectedTasks.size > 0) {
            bulkActions.classList.add('show');
            selectedCount.textContent = `${this.selectedTasks.size} task${this.selectedTasks.size !== 1 ? 's' : ''} selected`;
        } else {
            bulkActions.classList.remove('show');
        }
    }

    bulkUpdateStatus(newStatus) {
        this.selectedTasks.forEach(taskId => {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                task.status = newStatus;
            }
        });

        this.saveTasks();
        this.clearSelection();
        this.renderAllViews();
        this.showNotification(`Updated ${this.selectedTasks.size} tasks to ${newStatus}`);
    }

    bulkDeleteTasks() {
        if (confirm(`Are you sure you want to delete ${this.selectedTasks.size} tasks?`)) {
            this.tasks = this.tasks.filter(task => !this.selectedTasks.has(task.id));
            this.saveTasks();
            this.clearSelection();
            this.renderAllViews();
            this.showNotification(`Deleted ${this.selectedTasks.size} tasks`);
        }
    }

    showBulkMoveModal() {
        const status = prompt('Move selected tasks to (Todo/In Progress/Done):');
        if (status && ['Todo', 'In Progress', 'Done'].includes(status)) {
            this.bulkUpdateStatus(status);
        }
    }

    setupDragAndDropListeners() {
        const taskCards = document.querySelectorAll('.task-card');

        taskCards.forEach(card => {
            card.addEventListener('dragstart', (e) => {
                this.draggedTask = e.target.dataset.taskId;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });

            card.addEventListener('dragend', (e) => {
                e.target.classList.remove('dragging');
                document.querySelectorAll('.drop-zone').forEach(zone => {
                    zone.classList.remove('drag-over');
                });
            });
        });

        const containers = document.querySelectorAll('.tasks-container');

        containers.forEach(container => {
            container.addEventListener('dragover', (e) => {
                e.preventDefault();
                container.classList.add('drag-over');
            });

            container.addEventListener('dragleave', (e) => {
                if (!container.contains(e.relatedTarget)) {
                    container.classList.remove('drag-over');
                }
            });

            container.addEventListener('drop', (e) => {
                e.preventDefault();
                container.classList.remove('drag-over');

                if (this.draggedTask) {
                    const newStatus = container.dataset.status;
                    this.updateTaskStatus(this.draggedTask, newStatus);
                    this.draggedTask = null;
                }
            });
        });
    }

    updateTaskStatus(taskId, newStatus) {
        const taskIndex = this.tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex].status = newStatus;
            this.saveTasks();
            this.renderAllViews();
            this.showNotification(`Task moved to ${newStatus}`);
        }
    }

    openModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        modal.style.display = 'block';

        if (taskId) {
            this.editingTaskId = taskId;
            document.getElementById('modalTitle').textContent = 'Edit Task';
            document.getElementById('submitBtnText').textContent = 'Update Task';
            this.populateForm(taskId);
        } else {
            this.editingTaskId = null;
            document.getElementById('modalTitle').textContent = 'Add New Task';
            document.getElementById('submitBtnText').textContent = 'Add Task';
            document.getElementById('taskForm').reset();
            // Set default due date to today
            document.getElementById('taskDueDate').value = this.formatDate(new Date());
        }
    }

    closeModal() {
        document.getElementById('taskModal').style.display = 'none';
        this.editingTaskId = null;
    }

    openDetailModal(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const content = document.getElementById('taskDetailContent');
            content.innerHTML = this.renderTaskDetail(task);
            document.getElementById('taskDetailModal').style.display = 'block';
        }
    }

    closeDetailModal() {
        document.getElementById('taskDetailModal').style.display = 'none';
    }

    populateForm(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description || '';
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskDueDate').value = task.dueDate || '';
            document.getElementById('taskProject').value = task.project;
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskTags').value = task.tags ? task.tags.join(', ') : '';
        }
    }

    addTask() {
        const task = {
            id: Date.now().toString(),
            title: document.getElementById('taskTitle').value,
            description: document.getElementById('taskDescription').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            project: document.getElementById('taskProject').value,
            status: document.getElementById('taskStatus').value,
            tags: document.getElementById('taskTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
            comments: [],
            createdAt: new Date().toISOString()
        };

        console.log('➕ Adding new task:', task);
        this.tasks.push(task);
        this.saveTasks();
        this.renderAllViews();
        this.closeModal();
        this.showNotification('Task added successfully!');
    }

    updateTask() {
        const taskIndex = this.tasks.findIndex(t => t.id === this.editingTaskId);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = {
                ...this.tasks[taskIndex],
                title: document.getElementById('taskTitle').value,
                description: document.getElementById('taskDescription').value,
                priority: document.getElementById('taskPriority').value,
                dueDate: document.getElementById('taskDueDate').value,
                project: document.getElementById('taskProject').value,
                status: document.getElementById('taskStatus').value,
                tags: document.getElementById('taskTags').value.split(',').map(tag => tag.trim()).filter(tag => tag)
            };

            this.saveTasks();
            this.renderAllViews();
            this.closeModal();
            this.showNotification('Task updated successfully!');
        }
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderAllViews();
            this.closeDetailModal();
            this.showNotification('Task deleted successfully!');
        }
    }

    addComment(taskId, commentText) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && commentText.trim()) {
            if (!task.comments) task.comments = [];

            task.comments.push({
                text: commentText,
                date: new Date().toLocaleDateString(),
                author: 'You'
            });

            this.saveTasks();
            this.renderAllViews();

            // Refresh the detail modal if it's open
            if (document.getElementById('taskDetailModal').style.display === 'block') {
                this.openDetailModal(taskId);
            }

            // Clear the comment textarea
            document.getElementById('newCommentText').value = '';

            this.showNotification('Comment added!');
        }
    }

    deleteComment(taskId, commentIndex) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.comments && task.comments[commentIndex]) {
            task.comments.splice(commentIndex, 1);
            this.saveTasks();
            this.renderAllViews();

            // Refresh the detail modal if it's open
            if (document.getElementById('taskDetailModal').style.display === 'block') {
                this.openDetailModal(taskId);
            }

            this.showNotification('Comment deleted!');
        }
    }

    switchView(view) {
        this.currentView = view;

        // Update active view buttons
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        // Show/hide views
        document.querySelectorAll('.view').forEach(viewEl => {
            viewEl.classList.remove('active');
        });
        document.getElementById(`${view}View`).classList.add('active');

        // Special handling for calendar view
        if (view === 'calendar') {
            this.renderCalendar();
        }
    }

    renderAllViews() {
        console.log('🔄 Rendering all views with tasks:', this.tasks);
        const filteredTasks = this.getFilteredTasks();

        this.renderTableView(filteredTasks);
        this.renderBoardView(filteredTasks);
        this.renderListView(filteredTasks);
        this.checkEmptyStates();

        // Setup drag and drop after rendering
        setTimeout(() => {
            this.setupDragAndDropListeners();
        }, 100);
    }

    renderTableView(tasks = this.getFilteredTasks()) {
        const tbody = document.getElementById('taskTableBody');
        tbody.innerHTML = '';

        if (tasks.length === 0) {
            document.getElementById('tableEmptyState').style.display = 'block';
            return;
        }

        document.getElementById('tableEmptyState').style.display = 'none';

        tasks.forEach(task => {
            const isSelected = this.selectedTasks.has(task.id);
            const row = document.createElement('tr');
            row.className = isSelected ? 'task-row selected' : 'task-row';
            row.innerHTML = `
                <td><input type="checkbox" class="task-select select-checkbox" data-task-id="${task.id}" ${isSelected ? 'checked' : ''}></td>
                <td class="task-cell">
                    <div><strong>${task.title}</strong></div>
                    ${task.description ? `<div style="font-size: 12px; color: var(--text-secondary); margin-top: 5px;">${task.description}</div>` : ''}
                    ${task.comments && task.comments.length > 0 ?
                `<div style="font-size: 12px; color: var(--accent-color); margin-top: 5px;">${task.comments.length} comment${task.comments.length !== 1 ? 's' : ''}</div>` : ''}
                </td>
                <td class="priority-cell priority-${task.priority}">${task.priority}</td>
                <td>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</td>
                <td>${task.project}</td>
                <td><span class="status-cell status-${task.status.replace(' ', '-')}">${task.status}</span></td>
                <td>${task.tags && task.tags.length > 0 ? task.tags.map(tag => `<span style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 10px; font-size: 11px;">${tag}</span>`).join(' ') : ''}</td>
                <td>
                    <button class="action-btn edit-btn" data-task-id="${task.id}">✏️</button>
                    <button class="action-btn delete-btn" data-task-id="${task.id}">🗑️</button>
                    <button class="action-btn comment-btn" data-task-id="${task.id}">💬</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    renderBoardView(tasks = this.getFilteredTasks()) {
        const statuses = ['Todo', 'In Progress', 'Done'];
        console.log('🎯 Rendering board view with tasks:', tasks);

        statuses.forEach(status => {
            const container = document.querySelector(`.tasks-container[data-status="${status}"]`);
            if (!container) {
                console.error(`❌ Container not found for status: ${status}`);
                return;
            }

            container.innerHTML = '';

            const statusTasks = tasks.filter(task => task.status === status);
            console.log(`📋 Tasks for ${status}:`, statusTasks);

            // Update count
            let countElement;
            if (status === 'Todo') {
                countElement = document.getElementById('todoCount');
            } else if (status === 'In Progress') {
                countElement = document.getElementById('inProgressCount');
            } else if (status === 'Done') {
                countElement = document.getElementById('doneCount');
            }

            if (countElement) {
                countElement.textContent = statusTasks.length;
            } else {
                console.error(`❌ Count element not found for status: ${status}`);
            }

            if (statusTasks.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'drop-zone';
                emptyMessage.textContent = `Drop tasks here for ${status}`;
                container.appendChild(emptyMessage);
            } else {
                statusTasks.forEach(task => {
                    console.log(`🎫 Rendering task in ${status}:`, task.title);
                    const isSelected = this.selectedTasks.has(task.id);
                    const card = document.createElement('div');
                    card.className = isSelected ? 'task-card selected' : 'task-card';
                    card.dataset.taskId = task.id;
                    card.draggable = true;
                    card.innerHTML = `
                        <h4>${task.title}</h4>
                        ${task.description ? `<p style="font-size: 14px; color: var(--text-secondary); margin: 8px 0;">${task.description}</p>` : ''}
                        <div class="task-meta">
                            <span class="priority-${task.priority}">${task.priority}</span>
                            <span>${task.project}</span>
                            <span>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                        </div>
                        ${task.tags && task.tags.length > 0 ?
                        `<div style="margin-top: 8px;">${task.tags.map(tag => `<span style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-right: 5px;">${tag}</span>`).join('')}</div>` : ''}
                        <div class="task-actions">
                            <button class="action-btn edit-btn" data-task-id="${task.id}">✏️</button>
                            <button class="action-btn delete-btn" data-task-id="${task.id}">🗑️</button>
                            <button class="action-btn comment-btn" data-task-id="${task.id}">💬</button>
                        </div>
                    `;
                    container.appendChild(card);
                });
            }
        });

        this.checkEmptyStates();
    }

    renderListView(tasks = this.getFilteredTasks()) {
        const container = document.getElementById('listContainer');
        container.innerHTML = '';

        if (tasks.length === 0) {
            document.getElementById('listEmptyState').style.display = 'block';
            return;
        }

        document.getElementById('listEmptyState').style.display = 'none';

        tasks.forEach(task => {
            const isSelected = this.selectedTasks.has(task.id);
            const item = document.createElement('div');
            item.className = isSelected ? 'list-item selected' : 'list-item';
            item.innerHTML = `
                <div class="list-item-content">
                    <h4>${task.title}</h4>
                    ${task.description ? `<p style="font-size: 14px; color: var(--text-secondary); margin: 5px 0;">${task.description}</p>` : ''}
                    <div class="list-item-meta">
                        <span class="priority-${task.priority}">${task.priority}</span>
                        <span>${task.project}</span>
                        <span>${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}</span>
                        <span class="status-${task.status.replace(' ', '-')}">${task.status}</span>
                        ${task.tags && task.tags.length > 0 ?
                `<span>${task.tags.map(tag => `<span style="background: var(--bg-tertiary); padding: 2px 6px; border-radius: 10px; font-size: 11px; margin-right: 5px;">${tag}</span>`).join('')}</span>` : ''}
                    </div>
                    ${task.comments && task.comments.length > 0 ?
                `<div style="margin-top: 8px;">
                        <div style="font-size: 12px; color: var(--accent-color);">${task.comments.length} comment${task.comments.length !== 1 ? 's' : ''}</div>
                    </div>` : ''}
                </div>
                <div class="list-item-actions">
                    <button class="action-btn edit-btn" data-task-id="${task.id}">✏️</button>
                    <button class="action-btn delete-btn" data-task-id="${task.id}">🗑️</button>
                    <button class="action-btn comment-btn" data-task-id="${task.id}">💬</button>
                </div>
            `;
            container.appendChild(item);
        });
    }

    renderCalendar() {
        const calendarGrid = document.getElementById('calendarGrid');
        const currentMonth = document.getElementById('currentMonth');

        // Update month header
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        currentMonth.textContent = `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;

        // Clear previous calendar
        calendarGrid.innerHTML = '';

        // Add day headers
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        dayNames.forEach(day => {
            const dayHeader = document.createElement('div');
            dayHeader.className = 'calendar-day-header';
            dayHeader.textContent = day;
            calendarGrid.appendChild(dayHeader);
        });

        // Get first day of month and total days
        const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
        const totalDays = lastDay.getDate();
        const startingDay = firstDay.getDay();

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day other-month';
            calendarGrid.appendChild(emptyDay);
        }

        // Add days of the month
        const today = this.formatDate(new Date());
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            if (dateStr === today) {
                dayElement.classList.add('today');
            }

            dayElement.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="calendar-tasks" id="tasks-${dateStr}"></div>
            `;

            calendarGrid.appendChild(dayElement);

            // Add tasks for this day
            const tasksForDay = this.tasks.filter(task => task.dueDate === dateStr);
            const tasksContainer = dayElement.querySelector('.calendar-tasks');

            tasksForDay.forEach(task => {
                const taskElement = document.createElement('div');
                taskElement.className = `calendar-task priority-${task.priority}`;
                taskElement.textContent = task.title;
                taskElement.dataset.taskId = task.id;
                tasksContainer.appendChild(taskElement);
            });
        }
    }

    renderTaskDetail(task) {
        return `
            <div class="task-detail-header">
                <div>
                    <div class="task-detail-title">${task.title}</div>
                    <div class="task-detail-meta">
                        <span class="priority-${task.priority}">${task.priority} Priority</span>
                        <span class="status-${task.status.replace(' ', '-')}">${task.status}</span>
                        <span>${task.project}</span>
                        <span>${task.dueDate ? 'Due: ' + new Date(task.dueDate).toLocaleDateString() : 'No due date'}</span>
                    </div>
                </div>
                <div>
                    <button class="action-btn edit-btn" data-task-id="${task.id}">✏️ Edit</button>
                    <button class="action-btn delete-btn" data-task-id="${task.id}">🗑️ Delete</button>
                </div>
            </div>
            
            ${task.description ? `
            <div class="task-detail-description">
                <h4>Description</h4>
                <p>${task.description}</p>
            </div>
            ` : ''}
            
            ${task.tags && task.tags.length > 0 ? `
            <div style="margin-bottom: 20px;">
                <h4>Tags</h4>
                <div>${task.tags.map(tag => `<span style="background: var(--bg-tertiary); padding: 5px 10px; border-radius: 15px; font-size: 12px; margin-right: 5px;">${tag}</span>`).join('')}</div>
            </div>
            ` : ''}
            
            <div class="comments-section">
                <h4>Comments (${task.comments ? task.comments.length : 0})</h4>
                
                <div class="comments-container">
                    ${task.comments && task.comments.length > 0 ?
                task.comments.map((comment, index) => `
                            <div class="comment">
                                <button class="comment-delete" data-task-id="${task.id}" data-comment-index="${index}">×</button>
                                <div>${comment.text}</div>
                                <div class="comment-meta">
                                    <span>By ${comment.author}</span>
                                    <span>${comment.date}</span>
                                </div>
                            </div>
                        `).join('')
                :
                '<p>No comments yet. Add the first comment!</p>'
            }
                </div>
                
                <div class="add-comment">
                    <textarea id="newCommentText" placeholder="Add a comment..."></textarea>
                    <button id="addCommentBtn" data-task-id="${task.id}">Add Comment</button>
                </div>
            </div>
        `;
    }

    checkEmptyStates() {
        const hasTasks = this.getFilteredTasks().length > 0;
        console.log('📊 Empty state check - Has tasks:', hasTasks);

        document.getElementById('tableEmptyState').style.display = hasTasks ? 'none' : 'block';
        document.getElementById('boardEmptyState').style.display = hasTasks ? 'none' : 'block';
        document.getElementById('listEmptyState').style.display = hasTasks ? 'none' : 'block';
    }

    // Public handler methods
    handleEdit(taskId) {
        this.openModal(taskId);
    }

    handleDelete(taskId) {
        this.deleteTask(taskId);
    }

    handleViewDetails(taskId) {
        this.openDetailModal(taskId);
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            if (notification.parentNode) {
                document.body.removeChild(notification);
            }
        }, 3000);
    }

    // AI Methods
    aiTogglePanel() {
        const panel = document.getElementById('aiPanel');
        const toggle = document.getElementById('aiToggle');

        if (panel.classList.contains('open')) {
            panel.classList.remove('open');
            toggle.classList.remove('active');
        } else {
            panel.classList.add('open');
            toggle.classList.add('active');
            this.aiGenerateDynamicSuggestions();
        }
    }

    aiClosePanel() {
        document.getElementById('aiPanel').classList.remove('open');
        document.getElementById('aiToggle').classList.remove('active');
    }

    aiGenerateDynamicSuggestions() {
        const insights = this.ai.getProductivityInsights();
        const dynamicContent = document.getElementById('aiDynamicSuggestions');

        let html = '';

        if (insights.overdueTasks > 0) {
            html += `
                <div class="ai-suggestion">
                    <h4>⚠️ Overdue Tasks Alert</h4>
                    <p>You have ${insights.overdueTasks} overdue task${insights.overdueTasks > 1 ? 's' : ''}. Consider addressing these soon.</p>
                    <div class="ai-actions">
                        <button class="ai-btn" onclick="taskManager.applyFilter('overdue')">Show Overdue</button>
                    </div>
                </div>
            `;
        }

        if (insights.completionRate < 50) {
            html += `
                <div class="ai-suggestion">
                    <h4>📈 Improve Completion Rate</h4>
                    <p>Your task completion rate is ${insights.completionRate}%. Try breaking down larger tasks into smaller steps.</p>
                    <div class="ai-actions">
                        <button class="ai-btn" onclick="taskManager.aiSuggestTaskBreakdown()">Get Breakdown Help</button>
                    </div>
                </div>
            `;
        }

        dynamicContent.innerHTML = html;
    }

    aiSuggestTasks() {
        const suggestions = this.ai.generateTaskSuggestions();
        const aiContent = document.getElementById('aiDynamicSuggestions');

        let html = '<div class="ai-suggestion"><h4>🎯 Suggested Tasks</h4>';

        suggestions.forEach((suggestion, index) => {
            html += `
                <div style="margin: 10px 0; padding: 10px; background: var(--bg-tertiary); border-radius: 6px;">
                    <strong>${suggestion.title}</strong><br>
                    <small>${suggestion.description}</small>
                    <div style="margin-top: 8px;">
                        <button class="ai-btn" onclick="taskManager.aiAddSuggestedTask(${index})">Add Task</button>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        aiContent.innerHTML = html;

        // Store suggestions for later use
        this.aiSuggestions = suggestions;
    }

    aiAddSuggestedTask(index) {
        const suggestion = this.aiSuggestions[index];
        if (suggestion) {
            document.getElementById('taskTitle').value = suggestion.title;
            document.getElementById('taskDescription').value = suggestion.description;
            document.getElementById('taskPriority').value = suggestion.priority;
            document.getElementById('taskProject').value = suggestion.project;
            document.getElementById('taskTags').value = suggestion.tags.join(', ');

            this.aiClosePanel();
            this.openModal();

            this.showNotification('AI task suggestion loaded! Review and save.');
        }
    }

    aiOptimizeCurrent() {
        const title = document.getElementById('taskTitle').value;
        const description = document.getElementById('taskDescription').value;

        if (title) {
            const improvedTitle = this.ai.improveTaskTitle(title);
            const suggestedPriority = this.ai.suggestPriority(title, description);
            const suggestedTags = this.ai.suggestTags(title, description);

            if (improvedTitle) {
                document.getElementById('taskTitle').value = improvedTitle;
            }

            if (suggestedPriority) {
                document.getElementById('taskPriority').value = suggestedPriority;
            }

            if (suggestedTags.length > 0) {
                document.getElementById('taskTags').value = suggestedTags.join(', ');
            }

            this.showNotification('AI optimization applied!');
        }
    }

    aiShowInsights() {
        const insights = this.ai.getProductivityInsights();
        const aiContent = document.getElementById('aiDynamicSuggestions');

        const html = `
            <div class="ai-suggestion">
                <h4>📊 Productivity Insights</h4>
                <p><strong>Completion Rate:</strong> ${insights.completionRate}%</p>
                <p><strong>High Priority Progress:</strong> ${insights.highPriorityCompleted}/${insights.totalHighPriority} completed</p>
                <p><strong>Overdue Tasks:</strong> ${insights.overdueTasks}</p>
                <p><strong>Average Priority Score:</strong> ${insights.averagePriority.toFixed(1)}/3</p>
                <div class="ai-actions">
                    <button class="ai-btn" onclick="taskManager.aiSuggestImprovements()">Get Improvement Tips</button>
                </div>
            </div>
        `;

        aiContent.innerHTML = html;
    }

    aiProcessQuery() {
        const input = document.getElementById('aiInput');
        const query = input.value.trim();

        if (query) {
            this.ai.processQuery(query);
            input.value = '';
        }
    }

    aiClearResponse() {
        document.getElementById('aiDynamicSuggestions').innerHTML = '';
    }

    aiEnableSmartSearch() {
        document.getElementById('searchInput').placeholder = 'Try: "overdue work tasks" or "high priority this week"';
        this.showNotification('Smart search enabled! Use natural language to find tasks.');
    }

    aiShowDateExamples() {
        const aiContent = document.getElementById('aiDynamicSuggestions');
        const examples = [
            'tomorrow',
            'next Monday',
            'in 3 days',
            'next week',
            'end of month'
        ];

        let html = '<div class="ai-suggestion"><h4>⏰ Date Examples</h4><p>Try these in the due date field:</p><ul style="margin: 10px 0; padding-left: 20px;">';

        examples.forEach(example => {
            const parsed = this.ai.parseNaturalDate(example);
            html += `<li>"${example}" → ${parsed || 'Not recognized'}</li>`;
        });

        html += '</ul></div>';
        aiContent.innerHTML = html;
    }

    // Smart input handling for task form
    setupSmartInputs() {
        const titleInput = document.getElementById('taskTitle');
        const dateInput = document.getElementById('taskDueDate');

        titleInput.addEventListener('input', (e) => {
            this.handleTitleInput(e.target.value);
        });

        dateInput.addEventListener('input', (e) => {
            this.handleDateInput(e.target.value);
        });
    }

    handleTitleInput(value) {
        if (value.length > 3) {
            const improved = this.ai.improveTaskTitle(value);
            const suggestions = document.getElementById('titleSuggestions');

            if (improved) {
                suggestions.innerHTML = `
                    <div class="ai-suggestion-item" onclick="taskManager.applyTitleSuggestion('${improved}')">
                        ✨ Improve to: "${improved}"
                    </div>
                `;
                suggestions.classList.add('show');
            } else {
                suggestions.classList.remove('show');
            }
        }
    }

    handleDateInput(value) {
        if (value) {
            const parsed = this.ai.parseNaturalDate(value);
            const suggestions = document.getElementById('dateSuggestions');

            if (parsed) {
                suggestions.innerHTML = `
                    <div class="ai-suggestion-item" onclick="taskManager.applyDateSuggestion('${parsed}')">
                        📅 Set to: ${parsed}
                    </div>
                `;
                suggestions.classList.add('show');
            } else {
                suggestions.classList.remove('show');
            }
        }
    }

    applyTitleSuggestion(title) {
        document.getElementById('taskTitle').value = title;
        document.getElementById('titleSuggestions').classList.remove('show');
    }

    applyDateSuggestion(date) {
        document.getElementById('taskDueDate').value = date;
        document.getElementById('dateSuggestions').classList.remove('show');
    }
}

// Initialize the app when the page loads
let taskManager;
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Initializing Task Manager with AI...');
    taskManager = new TaskManager();
});