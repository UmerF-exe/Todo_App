// STORAGE KEY
    const STORAGE_KEY = 'ui_todos_v1';

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

    // data
    let todos = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

    // helpers
    function uid(){ return Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
    function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); render(); }

    function addTask(text){
      if(!text) return;
      todos.unshift({ id: uid(), text: text, completed: false, created: Date.now() });
      save();
    }

    function removeTask(id){
      todos = todos.filter(t=>t.id !== id);
      save();
    }

    function toggleTask(id){
      todos = todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      save();
    }

    function editTask(id, newText){
      todos = todos.map(t => t.id === id ? { ...t, text: newText } : t);
      save();
    }

    function clearCompletedTasks(){
      todos = todos.filter(t => !t.completed);
      save();
    }

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
      if(s === 'oldest') out.sort((a,b) => a.created - b.created);
      if(s === 'alpha') out.sort((a,b) => (a.text || '').localeCompare(b.text || ''));
      if(s === 'newest') out.sort((a,b) => b.created - a.created);
      return out;
    }

    // drag/drop helpers using id (works with filtered view)
    function handleDrop(fromId, toId){
      const fromIndex = todos.findIndex(t => t.id === fromId);
      const toIndex = todos.findIndex(t => t.id === toId);
      if(fromIndex === -1 || toIndex === -1) return;
      const [moved] = todos.splice(fromIndex, 1);
      todos.splice(toIndex, 0, moved);
      save();
    }

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
        const editBtn = document.createElement('button'); editBtn.className = 'icon-btn'; editBtn.innerHTML = '<i class="fa-regular fa-pen-to-square"></i>';
        editBtn.onclick = () => {
          const newText = prompt('Edit task', t.text);
          if(newText !== null) editTask(t.id, newText.trim());
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

    // events
    addBtn.addEventListener('click', ()=>{ const v = todoInput.value.trim(); if(!v) return; addTask(v); todoInput.value=''; todoInput.focus(); });
    todoInput.addEventListener('keydown', (e)=>{ if(e.key === 'Enter'){ addBtn.click(); }});
    searchInput.addEventListener('input', render);
    filterSelect.addEventListener('change', render);
    sortSelect.addEventListener('change', render);
    clearCompleted.addEventListener('click', ()=>{ if(confirm('Clear all completed tasks?')) clearCompletedTasks(); });
    addSample.addEventListener('click', ()=>{ addTask('Read a chapter of a book'); addTask('Finish project report'); addTask('Buy groceries'); });
    focusSearchBtn.addEventListener('click', ()=> searchInput.focus());
    quickFilters.forEach(btn => btn.addEventListener('click', (e)=>{ filterSelect.value = btn.dataset.filter; render(); }));

    // export/import
    exportBtn.addEventListener('click', ()=>{
      const dataStr = JSON.stringify(todos, null, 2);
      const blob = new Blob([dataStr],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'todos.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });
    importBtn.addEventListener('click', ()=>{
      const input = document.createElement('input'); input.type = 'file'; input.accept = 'application/json';
      input.onchange = (e)=>{
        const file = e.target.files[0]; if(!file) return;
        const reader = new FileReader(); reader.onload = ()=>{
          try{
            const data = JSON.parse(reader.result);
            if(Array.isArray(data)){
              // sanitize/normalize items
              todos = data.map(it => ({
                id: it.id || uid(),
                text: (it.text||'').toString(),
                completed: !!it.completed,
                created: it.created || Date.now()
              }));
              save();
            } else alert('Invalid file format: expected an array of tasks');
          }catch(err){
            alert('Invalid JSON file');
          }
        };
        reader.readAsText(file);
      };
      input.click();
    });

    // theme toggle (click only, no persistence)
    themeToggle.addEventListener('click', ()=>{
      document.body.classList.toggle('dark');
      const icon = themeToggle.querySelector('i');
      icon.classList.toggle('fa-moon');
      icon.classList.toggle('fa-sun');
    });

    // initialize UI if empty
    if(!todos || !Array.isArray(todos) || todos.length === 0){
      // keep empty by default; user can add sample tasks
      // (No forced initial tasks to preserve user's data)
    } else {
      // ensure created is number for older imports
      todos = todos.map(t => ({ ...t, created: t.created ? Number(t.created) : Date.now() }));
    }

    // initial render
    render();