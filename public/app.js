const state = { tasks: [], categories: [], filter: 'all', categoryId: 'all', search: '', editingId: null, editingCategoryId: null };
const $ = (selector) => document.querySelector(selector);
const taskList = $('#taskList');

const api = async (url, options = {}) => {
  const response = await fetch(url, { headers: { 'Content-Type': 'application/json' }, ...options });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.mensaje || 'No se pudo completar la operación');
  return data;
};

const fetchTasksForCurrentView = async () => {
  if (state.categoryId !== 'all') {
    return api(`/api/tareas/categoria/${state.categoryId}`);
  }

  if (state.filter === 'pending') {
    return api('/api/tareas/incompletas');
  }

  if (state.filter === 'completed') {
    return api('/api/tareas/completas');
  }

  return api('/api/tareas');
};

const showToast = (message) => { const toast = $('#toast'); toast.textContent = message; toast.classList.add('is-visible'); setTimeout(() => toast.classList.remove('is-visible'), 2800); };
const dateLabel = (date) => new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' }).format(new Date(date));
const visibleTasks = () => state.tasks.filter((task) => {
  const matchesFilter = state.filter === 'all' || (state.filter === 'completed' ? task.completado : !task.completado);
  const matchesCategory = state.categoryId === 'all' || task.categoria?._id === state.categoryId || task.categoria === state.categoryId;
  const query = state.search.toLowerCase();
  return matchesFilter && matchesCategory && (!query || `${task.titulo} ${task.descripcion} ${task.categoria?.nombre || ''}`.toLowerCase().includes(query));
});
const setFilter = async (filter) => {
  state.filter = filter;
  document.querySelectorAll('[data-filter]').forEach((item) => item.classList.toggle('is-active', item.dataset.filter === filter));

  try {
    state.tasks = await fetchTasksForCurrentView();
    render();
  } catch (error) {
    showToast(error.message);
  }
};
const setCategory = async (categoryId) => {
  state.categoryId = categoryId;

  try {
    state.tasks = await fetchTasksForCurrentView();
    render();
  } catch (error) {
    showToast(error.message);
  }
};

const taskMarkup = (task, index) => `<article class="task-card ${task.completado ? 'is-complete' : ''}" style="animation-delay:${index * 35}ms"><button class="check-button" data-action="complete" data-id="${task._id}" aria-label="${task.completado ? 'Tarea completada' : 'Completar tarea'}">${task.completado ? '✓' : ''}</button><div class="task-body"><h3 class="task-title">${escapeHtml(task.titulo)}</h3><p class="task-description">${escapeHtml(task.descripcion)}</p><div class="task-meta"><span class="category-chip">${escapeHtml(task.categoria?.nombre || 'Sin categoría')}</span><span>${dateLabel(task.fechaCreacion)}</span></div></div><div class="task-actions"><button class="icon-button" data-action="edit" data-id="${task._id}" aria-label="Editar tarea">✎</button><button class="icon-button" data-action="delete" data-id="${task._id}" aria-label="Eliminar tarea">⌫</button></div></article>`;

const render = () => {
  const pending = state.tasks.filter((task) => !task.completado).length;
  const completed = state.tasks.filter((task) => task.completado).length;
  $('#allCount').textContent = state.tasks.length; $('#pendingCount').textContent = pending; $('#completedCount').textContent = completed;
  const percent = state.tasks.length ? Math.round((completed / state.tasks.length) * 100) : 0;
  $('#progressValue').textContent = `${percent}%`; $('#progressBar').style.width = `${percent}%`;
  $('#progressText').textContent = state.tasks.length ? `${completed} de ${state.tasks.length} tareas completadas` : 'Empieza creando una tarea';
  const titles = { all: 'Todas las tareas', pending: 'Tareas pendientes', completed: 'Tareas completadas' }; $('#listTitle').textContent = titles[state.filter];
  const tasks = visibleTasks(); $('#listSummary').textContent = `${tasks.length} ${tasks.length === 1 ? 'tarea' : 'tareas'}`;
  if (!tasks.length) { taskList.innerHTML = `<div class="empty-state"><strong>${state.search ? 'No encontramos tareas' : 'Todo despejado por aquí'}</strong><p>${state.search ? 'Prueba con otra palabra.' : 'Crea tu primera tarea y empieza a avanzar.'}</p></div>`; return; }
  const grouped = tasks.reduce((groups, task) => { const key = task.categoria?._id || task.categoria || 'uncategorized'; if (!groups[key]) groups[key] = { name: task.categoria?.nombre || 'Sin categoría', tasks: [] }; groups[key].tasks.push(task); return groups; }, {});
  taskList.innerHTML = Object.values(grouped).map((group) => `<section class="category-group"><div class="category-heading"><div><span class="category-dot"></span><h3>${escapeHtml(group.name)}</h3></div><span>${group.tasks.length} ${group.tasks.length === 1 ? 'tarea' : 'tareas'}</span></div><div class="category-tasks">${group.tasks.map((task, index) => taskMarkup(task, index)).join('')}</div></section>`).join('');
};
const escapeHtml = (value) => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[character]));

const loadData = async () => {
  try {
    const [categories, tasks] = await Promise.all([api('/api/categorias'), fetchTasksForCurrentView()]);
    state.categories = categories;
    state.tasks = tasks;
    renderCategories();
    render();
    $('#statusText').textContent = 'API conectada';
    $('.api-status').classList.add('is-online');
  } catch (error) {
    $('#statusText').textContent = 'API no disponible';
    showToast(error.message);
  }
};
const renderCategories = () => { $('#categoryInput').innerHTML = state.categories.length ? state.categories.map((category) => `<option value="${category._id}">${escapeHtml(category.nombre)}</option>`).join('') : '<option value="">Crea una categoría primero</option>'; $('#categoryFilter').innerHTML = `<option value="all">Todas las categorías</option>${state.categories.map((category) => `<option value="${category._id}">${escapeHtml(category.nombre)}</option>`).join('')}`; $('#categoryFilter').value = state.categoryId; $('#existingCategory').innerHTML = `<option value="">Selecciona una categoría</option>${state.categories.map((category) => `<option value="${category._id}">${escapeHtml(category.nombre)}</option>`).join('')}`; };
const openTaskDialog = async (task) => {
  const taskDetails = task ? await api(`/api/tareas/${task._id}`) : null;
  state.editingId = taskDetails?._id || task?._id || null;
  $('#dialogEyebrow').textContent = taskDetails ? 'Editar tarea' : 'Nueva tarea';
  $('#dialogTitle').textContent = taskDetails ? 'Actualiza tu tarea' : 'Crea una tarea';
  $('#titleInput').value = taskDetails?.titulo || task?.titulo || '';
  $('#descriptionInput').value = taskDetails?.descripcion || task?.descripcion || '';
  $('#categoryInput').value = taskDetails?.categoria?._id || taskDetails?.categoria || task?.categoria?._id || task?.categoria || state.categories[0]?._id || '';
  $('#formError').textContent = '';
  $('#taskDialog').showModal();
  $('#titleInput').focus();
};
const closeTaskDialog = () => $('#taskDialog').close();
const openCategoryDialog = () => { state.editingCategoryId = null; $('#categoryError').textContent = ''; $('#categoryForm').reset(); $('#saveCategory').textContent = 'Crear categoría'; $('#categoryDialog').showModal(); $('#categoryName').focus(); };
const loadCategoryForEdit = async () => { const categoryId = $('#existingCategory').value; if (!categoryId) { $('#categoryError').textContent = 'Selecciona una categoría para editar.'; return; } try { const category = await api(`/api/categorias/${categoryId}`); state.editingCategoryId = category._id; $('#categoryName').value = category.nombre; $('#categoryDescription').value = category.descripcion; $('#saveCategory').textContent = 'Actualizar categoría'; $('#categoryError').textContent = ''; } catch (error) { $('#categoryError').textContent = error.message; } };

$('#taskForm').addEventListener('submit', async (event) => { event.preventDefault(); const payload = { titulo: $('#titleInput').value.trim(), descripcion: $('#descriptionInput').value.trim(), categoria: $('#categoryInput').value }; if (!payload.titulo || !payload.descripcion || !payload.categoria) { $('#formError').textContent = 'Completa todos los campos para continuar.'; return; } try { if (state.editingId) await api(`/api/tareas/${state.editingId}`, { method: 'PUT', body: JSON.stringify(payload) }); else await api('/api/tareas', { method: 'POST', body: JSON.stringify(payload) }); closeTaskDialog(); showToast(state.editingId ? 'Tarea actualizada' : 'Tarea creada'); await loadData(); } catch (error) { $('#formError').textContent = error.message; } });
$('#categoryForm').addEventListener('submit', async (event) => { event.preventDefault(); const payload = { nombre: $('#categoryName').value.trim(), descripcion: $('#categoryDescription').value.trim() }; try { const category = state.editingCategoryId ? await api(`/api/categorias/${state.editingCategoryId}`, { method: 'PUT', body: JSON.stringify(payload) }) : await api('/api/categorias', { method: 'POST', body: JSON.stringify(payload) }); if (state.editingCategoryId) { state.categories = state.categories.map((item) => item._id === category._id ? category : item); } else { state.categories.push(category); } renderCategories(); $('#categoryInput').value = category._id; $('#categoryDialog').close(); showToast(state.editingCategoryId ? 'Categoría actualizada' : 'Categoría creada'); await loadData(); } catch (error) { $('#categoryError').textContent = error.message; } });
taskList.addEventListener('click', async (event) => { const button = event.target.closest('[data-action]'); if (!button) return; const task = state.tasks.find((item) => item._id === button.dataset.id); try { if (button.dataset.action === 'edit') await openTaskDialog(task); if (button.dataset.action === 'complete') { await api(`/api/tareas/${task._id}/completar`, { method: 'PATCH' }); showToast('Tarea completada'); await loadData(); } if (button.dataset.action === 'delete' && confirm(`¿Eliminar "${task.titulo}"?`)) { await api(`/api/tareas/${task._id}`, { method: 'DELETE' }); showToast('Tarea eliminada'); await loadData(); } } catch (error) { showToast(error.message); } });
document.querySelectorAll('[data-filter]').forEach((item) => item.addEventListener('click', () => setFilter(item.dataset.filter))); $('#categoryFilter').addEventListener('change', (event) => setCategory(event.target.value)); $('#searchInput').addEventListener('input', (event) => { state.search = event.target.value; render(); }); $('#openCreate').addEventListener('click', async () => { await openTaskDialog(); }); $('#cancelDialog').addEventListener('click', closeTaskDialog); $('#closeDialog').addEventListener('click', closeTaskDialog); $('#openCategory').addEventListener('click', openCategoryDialog); $('#loadCategory').addEventListener('click', loadCategoryForEdit); $('#cancelCategory').addEventListener('click', () => $('#categoryDialog').close()); $('#closeCategory').addEventListener('click', () => $('#categoryDialog').close());
loadData();