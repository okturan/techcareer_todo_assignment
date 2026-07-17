// API endpoints
const API_BASE_URL = '/api/todos';

// DOM elements
const todoForm = document.getElementById('todoForm');
const todoList = document.getElementById('todoList');
const todoCount = document.getElementById('todoCount');
const appStatus = document.getElementById('appStatus');

function setStatus(message, tone = 'neutral') {
    appStatus.textContent = message;
    appStatus.dataset.tone = tone;
}

async function errorMessage(response, fallback) {
    const message = await response.text();
    return message || fallback;
}

// Fetch all todos
async function fetchTodos() {
    try {
        const response = await fetch(API_BASE_URL);
        if (!response.ok) {
            throw new Error(await errorMessage(response, 'Unable to load tasks'));
        }
        const todos = await response.json();
        renderTodos(todos);
        setStatus(todos.length ? 'Tasks are up to date.' : 'Ready for your first task.');
    } catch (error) {
        console.error('Error fetching todos:', error);
        setStatus(error.message || 'Unable to load tasks.', 'error');
    }
}

// Create new todo
async function createTodo(title, details) {
    try {
        const response = await fetch(API_BASE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, details }),
        });
        if (response.ok) {
            await fetchTodos();
            setStatus('Task added.', 'success');
            return true;
        }
        setStatus(await errorMessage(response, 'Unable to add task.'), 'error');
        return false;
    } catch (error) {
        console.error('Error creating todo:', error);
        setStatus('Unable to reach the API.', 'error');
        return false;
    }
}

// Toggle todo completion
async function toggleTodo(id, title, details, completed) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                details,
                completed: !completed
            }),
        });
        if (response.ok) {
            await fetchTodos();
            setStatus(completed ? 'Task reopened.' : 'Task completed.', 'success');
        } else {
            setStatus(await errorMessage(response, 'Unable to update task.'), 'error');
        }
    } catch (error) {
        console.error('Error toggling todo:', error);
        setStatus('Unable to reach the API.', 'error');
    }
}

// Edit todo
async function editTodo(id, title, details, completed) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                title, 
                details,
                completed
            }),
        });
        if (response.ok) {
            return true;
        }
        setStatus(await errorMessage(response, 'Unable to save changes.'), 'error');
        return false;
    } catch (error) {
        console.error('Error editing todo:', error);
        setStatus('Unable to reach the API.', 'error');
        return false;
    }
}

// Delete todo
async function deleteTodo(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/${id}`, {
            method: 'DELETE',
        });
        if (response.ok) {
            await fetchTodos();
            setStatus('Task deleted.', 'success');
        } else {
            setStatus(await errorMessage(response, 'Unable to delete task.'), 'error');
        }
    } catch (error) {
        console.error('Error deleting todo:', error);
        setStatus('Unable to reach the API.', 'error');
    }
}

// Switch to edit mode
function switchToEditMode(todoElement, id, title, details, completed) {
    const contentDiv = todoElement.querySelector('.todo-content');
    const actionsDiv = todoElement.querySelector('.todo-actions');

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'edit-input';
    titleInput.id = `edit-title-${id}`;
    titleInput.value = title;
    titleInput.setAttribute('aria-label', `Edit title for ${title}`);

    const detailsInput = document.createElement('textarea');
    detailsInput.className = 'edit-input details-textarea';
    detailsInput.id = `edit-details-${id}`;
    detailsInput.value = details;
    detailsInput.setAttribute('aria-label', `Edit details for ${title}`);

    contentDiv.replaceChildren(titleInput, detailsInput);
    actionsDiv.replaceChildren(
        createActionButton('Save', 'save-btn', { id, completed }),
        createActionButton('Cancel', 'cancel-btn')
    );
}

function createActionButton(label, className, data = {}) {
    const button = document.createElement('button');
    button.textContent = label;
    button.className = className;

    Object.entries(data).forEach(([key, value]) => {
        button.dataset[key] = String(value);
    });

    if (data.title) {
        button.setAttribute('aria-label', `${label} ${data.title}`);
    }

    return button;
}

// Render todos in the DOM
function renderTodos(todos) {
    todoList.replaceChildren();
    todoCount.textContent = `${todos.length} ${todos.length === 1 ? 'task' : 'tasks'}`;

    if (todos.length === 0) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-state';
        const emptyTitle = document.createElement('strong');
        emptyTitle.textContent = 'No tasks yet';
        const emptyMessage = document.createElement('span');
        emptyMessage.textContent = 'Add one above to exercise the browser UI and REST API.';
        emptyState.append(emptyTitle, emptyMessage);
        todoList.append(emptyState);
        return;
    }

    todos.forEach(todo => {
        const todoElement = document.createElement('div');
        todoElement.className = `todo-item ${todo.completed ? 'completed' : ''}`;
        todoElement.setAttribute('role', 'listitem');

        const content = document.createElement('div');
        content.className = 'todo-content';

        const title = document.createElement('div');
        title.className = 'todo-title';
        title.textContent = todo.title;

        const details = document.createElement('div');
        details.className = 'todo-details';
        details.textContent = todo.details;

        const actions = document.createElement('div');
        actions.className = 'todo-actions';
        const todoData = {
            id: todo.id,
            title: todo.title,
            details: todo.details,
            completed: todo.completed,
        };
        actions.append(
            createActionButton(todo.completed ? 'Undo' : 'Complete', 'toggle-btn', todoData),
            createActionButton('Edit', 'edit-btn', todoData),
            createActionButton('Delete', 'delete-btn', { id: todo.id, title: todo.title })
        );

        content.append(title, details);
        todoElement.append(content, actions);
        todoList.appendChild(todoElement);
    });
}

// Form submit handler
todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titleInput = document.getElementById('title');
    const detailsInput = document.getElementById('details');
    
    const success = await createTodo(titleInput.value, detailsInput.value);
    
    if (success) {
        titleInput.value = '';
        detailsInput.value = '';
    }
});

// Add event delegation for todo actions
todoList.addEventListener('click', async (e) => {
    const button = e.target;
    const todoItem = button.closest('.todo-item');

    if (button.classList.contains('edit-btn')) {
        switchToEditMode(
            todoItem,
            button.dataset.id,
            button.dataset.title,
            button.dataset.details,
            button.dataset.completed === 'true'
        );
    } else if (button.classList.contains('save-btn')) {
        const id = button.dataset.id;
        const completed = button.dataset.completed === 'true';
        const titleInput = document.getElementById(`edit-title-${id}`);
        const detailsInput = document.getElementById(`edit-details-${id}`);
        
        if (titleInput && detailsInput) {
            const success = await editTodo(
                id,
                titleInput.value,
                detailsInput.value,
                completed
            );
            if (success) {
                await fetchTodos();
                setStatus('Task updated.', 'success');
            }
        }
    } else if (button.classList.contains('cancel-btn')) {
        fetchTodos();
    } else if (button.classList.contains('toggle-btn')) {
        const { id, title, details, completed } = button.dataset;
        await toggleTodo(id, title, details, completed === 'true');
    } else if (button.classList.contains('delete-btn')) {
        await deleteTodo(button.dataset.id);
    }
});

// Initial load
fetchTodos();
