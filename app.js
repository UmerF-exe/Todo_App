// app.js (module)
// Reworked to use Firestore for persistence (real-time). Keep this file as type="module".

import { db } from './firebase.js';
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// DOM refs
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const countMeta = document.getElementById('countMeta');
const statTotal = document.getElementById('statTotal');
const statActive = document.getElementById('statActive');
const statComplete = document.getElementById('statComplete');
const searchInput = document.getElementById('searchInput');
const filterSelect = document.getElementById('filterSelect');
const sortSelect = document.getElementById('sortSelect');
const clearCompleted = document.getElementById('clearCompleted');
const addSample = document.getElementById('addSample');
const dateNow = document.getElementById('dateNow');
const importBtn = document.getElementById('importBtn');
const exportBtn = document.getElementById('exportBtn');
const focusSearchBtn = document.getElementById('focusSearch');
const quickFilters = document.querySelectorAll('.quick-filter');
const themeToggle = document.getElementById('themeToggle');

// Firestore collection ref
const todosCol = collection(db, 'todos');

// Local cache
let todos = [];

/* -------------------------
   Firestore realtime listener
   ------------------------- */
onSnapshot(todosCol, snapshot => {
  todos = snapshot.docs.map(d => {
    const data = d.data();
    // Convert Firestore Timestamps (if any) to ms
    let created = data.created;
    if (created && typeof created.toMillis === 'function') {
      created = created.toMillis();
    } else if (typeof created === 'number') {
      created = created;
    } else {
      created = Date.now();
    }
    return {
      id: d.id,
      text: data.text || '',
      completed: !!data.completed,
      created,
      order: typeof data.order === 'number' ? data.order : (created || 0)
    };
  });
  render();
}, err => {
  console.error('Firestore onSnapshot error:', err);
});

/* -------------------------
   Helpers and CRUD (Firestore)
   ------------------------- */
function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }

function getMaxOrder() {
  if (!todos.length) return 0;
  return todos.reduce((m, t) => Math.max(m, Number(t.order || 0)), 0);
}

async function addTask(text){
  if(!text) return;
  try {
    const newOrder = getMaxOrder() + 1;
    await addDoc(todosCol, {
      text,
      completed: false,
      created: Date.now(),
      order: newOrder
    });
  } catch (err) {
    console.error('addTask error:', err);
    alert('Could not add task. Check console.');
  }
}

async function removeTask(id){
  try {
    await deleteDoc(doc(db, 'todos', id));
  } catch (err) {
    console.error('removeTask error:', err);
  }
}

async function toggleTask(id){
  try {
    const t = todos.find(x => x.id === id);
    if (!t) return;
    await updateDoc(doc(db, 'todos', id), { completed: !t.completed });
  } catch (err) {
    console.error('toggleTask error:', err);
  }
}

async function editTask(id, newText){
  try {
    await updateDoc(doc(db, 'todos', id), { text: newText });
  } catch (err) {
    console.error('editTask error:', err);
  }
}

async function clearCompletedTasks(){
  try {
    const toDelete = todos.filter(t => t.completed).map(t => t.id);
    // delete one by one (small sets). For many docs use writeBatch.
    for (const id of toDelete) {
      await deleteDoc(doc(db, 'todos', id));
    }
  } catch (err) {
    console.error('clearCompletedTasks error:', err);
  }
}

/* -------------------------
   Utility / UI helpers
   ------------------------- */
function formatTime(ts){
  if(!ts) return '—';
  const d = new Date(ts);
  return d.toLocaleString();
}

function applyFilters(list){
  const q = searchInput.value.trim().toLowerCase();
  let out = list.filter(t => (t.text || '').toLowerCase().includes(q));
  const f = filterSelect.value;
  if(f === 'active') out = out.filter(t => !t.completed);
  if(f === 'completed') out = out.filter(t => t.completed);
  const s = sortSelect.value;
  if(s === 'oldest') out.sort((a,b) => (a.order || a.created) - (b.order || b.created));
  if(s === 'alpha') out.sort((a,b) => (a.text || '').localeCompare(b.text || ''));
  if(s === 'newest') out.sort((a,b) => (b.order || b.created) - (a.order || a.created));
  return out;
}

/* -------------------------
   Drag/drop order persistence
   ------------------------- */
function handleDrop(fromId, toId){
  const fromIndex = todos.findIndex(t => t.id === fromId);
  const toIndex = todos.findIndex(t => t.id === toId);
  if(fromIndex === -1 || toIndex === -1) return;
  const [moved] = todos.splice(fromIndex, 1);
  todos.splice(toIndex, 0, moved);

  // Recompute orders: give top item highest order (n ... 1)
  const n = todos.length;
  // Update Firestore orders (small sets acceptable). Use updateDoc per item.
  todos.forEach((t, idx) => {
    const newOrder = n - idx;
    if (Number(t.order || 0) !== newOrder) {
      updateDoc(doc(db, 'todos', t.id), { order: newOrder }).catch(err => console.error('order update err', err));
    }
  });
}

/* -------------------------
   Render UI
   ------------------------- */
function render(){
  const list = applyFilters([...todos]);
  todoList.innerHTML = '';
  if(list.length === 0){
    todoList.innerHTML = '<div class="empty">No tasks — add your first task.</div>';
  }
  list.forEach(t => {
    const item = document.createElement('div'); item.className = 'item'; item.draggable = true;
    // left
    const left = document.createElement('div'); left.className = 'left';
    const checkbox = document.createElement('div'); checkbox.className = 'checkbox';
    checkbox.innerHTML = t.completed ? '<i class="fa-solid fa-check"></i>' : '';
    checkbox.onclick = () => toggleTask(t.id);

    const txt = document.createElement('div');
    const title = document.createElement('div'); title.className = 'text' + (t.completed ? ' completed' : ''); title.textContent = t.text;
    const meta = document.createElement('div'); meta.className = 'meta'; meta.textContent = formatTime(t.created);
    txt.appendChild(title); txt.appendChild(meta);

    left.appendChild(checkbox); left.appendChild(txt);

    // actions
    const actions = document.createElement('div'); actions.className = 'actions';
    const editBtn = document.createElement('button'); editBtn.className = 'icon-btn success'; editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
    editBtn.onclick = () => {
      const newText = prompt('Edit task', t.text);
      if(newText !== null) {
        const trimmed = newText.trim();
        if(trimmed.length === 0){
          if(confirm('Save empty text? This will delete the task. Delete instead?')) {
            removeTask(t.id);
          }
          return;
        }
        editTask(t.id, trimmed);
      }
    };
    const delBtn = document.createElement('button'); delBtn.className = 'icon-btn danger'; delBtn.innerHTML = '<i class="fa-solid fa-trash"></i>';
    delBtn.onclick = () => { if(confirm('Delete this task?')) removeTask(t.id); };

    actions.appendChild(editBtn); actions.appendChild(delBtn);

    item.appendChild(left); item.appendChild(actions);
    // drag/drop data-id
    item.dataset.id = t.id;
    item.ondragstart = (e) => {
      e.dataTransfer.setData('text/plain', t.id);
      e.dataTransfer.effectAllowed = 'move';
    };
    item.ondragover = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };
    item.ondrop = (e) => {
      e.preventDefault();
      const fromId = e.dataTransfer.getData('text/plain');
      const toId = t.id;
      if(fromId && toId && fromId !== toId) handleDrop(fromId, toId);
    };

    todoList.appendChild(item);
  });

  // stats
  const total = todos.length;
  const complete = todos.filter(t => t.completed).length;
  const active = total - complete;
  statTotal.textContent = total; statActive.textContent = active; statComplete.textContent = complete;
  countMeta.textContent = `${applyFilters([...todos]).length} visible • ${total} total`;
  dateNow.textContent = new Date().toLocaleDateString();
}

/* -------------------------
   Events (wire up UI)
   ------------------------- */
addBtn.addEventListener('click', async () => {
  const v = todoInput.value.trim();
  if(!v) return;
  await addTask(v);
  todoInput.value = '';
  todoInput.focus();
});
todoInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ addBtn.click(); }});
searchInput.addEventListener('input', render);
filterSelect.addEventListener('change', render);
sortSelect.addEventListener('change', render);
clearCompleted.addEventListener('click', ()=>{ if(confirm('Clear all completed tasks?')) clearCompletedTasks(); });
addSample.addEventListener('click', ()=>{ addTask('Read a chapter of a book'); addTask('Finish project report'); addTask('Buy groceries'); });
focusSearchBtn.addEventListener('click', ()=> searchInput.focus());
quickFilters.forEach(btn => btn.addEventListener('click', (e)=>{ filterSelect.value = btn.dataset.filter; render(); }));

// export (downloads current live tasks snapshot)
exportBtn.addEventListener('click', ()=>{
  const dataStr = JSON.stringify(todos.map(t => ({
    id: t.id, text: t.text, completed: t.completed, created: t.created, order: t.order
  })), null, 2);
  const blob = new Blob([dataStr],{type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'todos.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
});

// import (adds tasks into Firestore)
importBtn.addEventListener('click', ()=>{
  const input = document.createElement('input'); input.type = 'file'; input.accept = 'application/json';
  input.onchange = async (e)=>{
    const file = e.target.files[0]; if(!file) return;
    const reader = new FileReader(); reader.onload = async ()=>{
      try{
        const data = JSON.parse(reader.result);
        if(Array.isArray(data)){
          for(const it of data){
            // sanitize
            const text = (it.text||'').toString();
            if(!text) continue;
            const newOrder = getMaxOrder() + 1;
            await addDoc(todosCol, {
              text,
              completed: !!it.completed,
              created: it.created ? Number(it.created) : Date.now(),
              order: newOrder
            });
          }
        } else alert('Invalid file format: expected an array of tasks');
      }catch(err){
        alert('Invalid JSON file');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };
  input.click();
});

// theme toggle (no persistence)
themeToggle.addEventListener('click', ()=>{
  document.body.classList.toggle('dark');
  const icon = themeToggle.querySelector('i');
  icon.classList.toggle('fa-moon');
  icon.classList.toggle('fa-sun');
});

// initial render placeholder until Firestore snapshot arrives
render();
