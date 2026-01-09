const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const dateInput = document.getElementById('dateInput');
const todoList = document.getElementById('todoList');
const emptyState = document.getElementById('emptyState');
const filterSelect = document.getElementById('filterSelect');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const errorMessage = document.getElementById('errorMessage');

let todos = JSON.parse(localStorage.getItem('todos')) || [];

function init() {
    renderTodos();
    todoForm.addEventListener('submit', handleSubmit);
    filterSelect.addEventListener('change', renderTodos);
    deleteAllBtn.addEventListener('click', deleteAllTodos);
}

function handleSubmit(e) {
    e.preventDefault();
    
    const taskText = todoInput.value.trim();
    const dueDate = dateInput.value;
    
    if (!validateInput(taskText, dueDate)) {
        return;
    }
    
    const newTodo = {
        id: generateId(),
        text: taskText,
        dueDate: dueDate,
        completed: false,
        createdAt: new Date().toISOString()
    };
    
    todos.unshift(newTodo);
    saveTodos();
    renderTodos();
    clearForm();
    hideError();
}

function validateInput(taskText, dueDate) {
    if (!taskText) {
        showError('Please enter a task');
        shakeInput(todoInput);
        return false;
    }
    
    if (taskText.length < 3) {
        showError('Task must be at least 3 characters');
        shakeInput(todoInput);
        return false;
    }
    
    if (taskText.length > 100) {
        showError('Task must be less than 100 characters');
        shakeInput(todoInput);
        return false;
    }
    
    if (!dueDate) {
        showError('Please select a due date');
        shakeInput(dateInput);
        return false;
    }
    
    return true;
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('visible');
}

function hideError() {
    errorMessage.textContent = '';
    errorMessage.classList.remove('visible');
}

function shakeInput(input) {
    input.classList.add('shake');
    setTimeout(() => {
        input.classList.remove('shake');
    }, 400);
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function renderTodos() {
    const filterValue = filterSelect.value;
    let filteredTodos = [...todos];
    
    if (filterValue === 'pending') {
        filteredTodos = todos.filter(todo => !todo.completed);
    } else if (filterValue === 'completed') {
        filteredTodos = todos.filter(todo => todo.completed);
    }
    
    if (filteredTodos.length === 0) {
        todoList.parentElement.classList.add('hidden');
        emptyState.classList.remove('hidden');
    } else {
        todoList.parentElement.classList.remove('hidden');
        emptyState.classList.add('hidden');
        
        todoList.innerHTML = filteredTodos.map(todo => createTodoHTML(todo)).join('');
        
        attachEventListeners();
    }
}

function createTodoHTML(todo) {
    const formattedDate = formatDate(todo.dueDate);
    const statusClass = todo.completed ? 'completed' : 'pending';
    const statusText = todo.completed ? 'Completed' : 'Pending';
    const taskClass = todo.completed ? 'task-text completed' : 'task-text';
    const completeIcon = todo.completed ? '↩' : '✓';
    const completeTitle = todo.completed ? 'Mark as pending' : 'Mark as completed';
    
    return `
        <tr data-id="${todo.id}">
            <td><span class="${taskClass}" title="${escapeHtml(todo.text)}">${escapeHtml(todo.text)}</span></td>
            <td><span class="due-date">${formattedDate}</span></td>
            <td><span class="status-badge ${statusClass}">${statusText}</span></td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn complete-btn" title="${completeTitle}" data-action="complete">
                        ${completeIcon}
                    </button>
                    <button class="action-btn delete-btn" title="Delete task" data-action="delete">
                        ✕
                    </button>
                </div>
            </td>
        </tr>
    `;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    };
    
    return date.toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function attachEventListeners() {
    const completeButtons = document.querySelectorAll('[data-action="complete"]');
    const deleteButtons = document.querySelectorAll('[data-action="delete"]');
    
    completeButtons.forEach(btn => {
        btn.addEventListener('click', handleComplete);
    });
    
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', handleDelete);
    });
}

function handleComplete(e) {
    const row = e.target.closest('tr');
    const id = row.dataset.id;
    
    const todoIndex = todos.findIndex(todo => todo.id === id);
    if (todoIndex !== -1) {
        todos[todoIndex].completed = !todos[todoIndex].completed;
        saveTodos();
        renderTodos();
    }
}

function handleDelete(e) {
    const row = e.target.closest('tr');
    const id = row.dataset.id;
    
    row.style.opacity = '0';
    row.style.transform = 'translateX(20px)';
    row.style.transition = 'all 0.3s ease';
    
    setTimeout(() => {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        renderTodos();
    }, 300);
}

function deleteAllTodos() {
    if (todos.length === 0) {
        showError('No tasks to delete');
        return;
    }
    
    if (confirm('Are you sure you want to delete all tasks?')) {
        todos = [];
        saveTodos();
        renderTodos();
        hideError();
    }
}

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function clearForm() {
    todoInput.value = '';
    dateInput.value = '';
    todoInput.focus();
}

document.addEventListener('DOMContentLoaded', init);
