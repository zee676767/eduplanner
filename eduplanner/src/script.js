let assignments = JSON.parse(localStorage.getItem('tasks')) || [];
let subjects = JSON.parse(localStorage.getItem('subs')) || ["General", "Math", "Science"];

assignments = assignments.map(t => ({ ...t, date: new Date(t.date) }));
let currentView = new Date();
currentView.setDate(1);
let activeDate = null;

const save = () => {
  localStorage.setItem('tasks', JSON.stringify(assignments));
  localStorage.setItem('subs', JSON.stringify(subjects));
};

function updateSubjectPanel() {
  const list = document.getElementById('subjectList');
  const dropdown = document.getElementById('modalSubjectDropdown');
  list.innerHTML = subjects.map(s => `
    <div class="subject-chip">${s} <span style="cursor:pointer;color:#999;font-weight:bold" onclick="delSub('${s}')">×</span></div>
  `).join('');
  dropdown.innerHTML = subjects.map(s => `<option value="${s}">${s}</option>`).join('');
}

function addNewSubject() {
  const input = document.getElementById('newSubjectInput');
  const val = input.value.trim();
  if (val && !subjects.includes(val)) {
    subjects.push(val);
    input.value = '';
    save(); updateSubjectPanel();
  }
}

function delSub(s) { subjects = subjects.filter(i => i !== s); save(); updateSubjectPanel(); }

function openModal(d, m, y) {
  activeDate = new Date(y, m, d);
  document.getElementById('taskModal').style.display = 'flex';
  updateSubjectPanel();
}

function closeModal() { document.getElementById('taskModal').style.display = 'none'; }

document.getElementById('saveTaskBtn').onclick = () => {
  const name = document.getElementById('modalTaskName').value;
  const sub = document.getElementById('modalSubjectDropdown').value;
  if (name) {
    assignments.push({ id: Date.now(), name, subject: sub, date: activeDate, completed: false });
    document.getElementById('modalTaskName').value = '';
    save(); updateSidebar(); render(); closeModal();
  }
};

function render() {
  const grid = document.getElementById('daysGrid');
  grid.innerHTML = "";
  const m = currentView.getMonth();
  const y = currentView.getFullYear();
  document.getElementById('monthSelect').value = m;
  document.getElementById('yearSelect').value = y;

  const start = new Date(y, m, 1).getDay();
  const days = new Date(y, m + 1, 0).getDate();

  for (let x = 0; x < start; x++) grid.appendChild(document.createElement('div'));
  for (let i = 1; i <= days; i++) {
    const box = document.createElement('div');
    box.className = 'day-box';
    box.innerText = i;
    const isMarked = assignments.some(a => 
      a.date.toDateString() === new Date(y, m, i).toDateString() && !a.completed
    );
    if (isMarked) box.classList.add('has-assignment');
    box.onclick = () => openModal(i, m, y);
    grid.appendChild(box);
  }
}

function updateSidebar() {
  const container = document.getElementById('taskContainer');
  container.innerHTML = "";
  assignments.sort((a,b) => a.date - b.date);
  
  let lastH = "";
  const today = new Date(); today.setHours(0,0,0,0);

  assignments.forEach(t => {
    const h = t.date.toLocaleString('default', { month: 'long', year: 'numeric' });
    if (h !== lastH) {
      container.innerHTML += `<div class="month-group-header">${h}</div>`;
      lastH = h;
    }

    const diff = Math.ceil((t.date - today) / 86400000);
    let status = t.completed ? "is-done" : (diff <= 1 ? "due-urgent" : "");
    let timeText = t.completed ? "Task Completed" : (diff < 0 ? "Overdue" : diff === 0 ? "Due Today" : `Due in ${diff} days`);

    container.innerHTML += `
      <div class="task-item ${status}">
        <div class="task-subject-tag">${t.subject}</div>
        <strong>${t.name}</strong>
        <span>${timeText}</span>
        <div class="task-actions">
          <button class="task-btn" onclick="toggle(${t.id})">${t.completed ? 'Undo' : 'Mark Done'}</button>
          <button class="task-btn delete" onclick="delTask(${t.id})">Delete</button>
        </div>
      </div>`;
  });
  if (!assignments.length) container.innerHTML = '<p style="color:#999; font-size:18px; margin-top:20px;">No upcoming tasks.</p>';
}

window.toggle = id => { const t = assignments.find(a => a.id === id); t.completed = !t.completed; save(); updateSidebar(); render(); };
window.delTask = id => { assignments = assignments.filter(a => a.id !== id); save(); updateSidebar(); render(); };

document.getElementById('prevMonth').onclick = () => { currentView.setMonth(currentView.getMonth() - 1); render(); };
document.getElementById('nextMonth').onclick = () => { currentView.setMonth(currentView.getMonth() + 1); render(); };

(function setup() {
  const ms = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  document.getElementById('monthSelect').innerHTML = ms.map((m, i) => `<option value="${i}">${m}</option>`).join('');
  for (let i = 2024; i <= 2030; i++) document.getElementById('yearSelect').innerHTML += `<option value="${i}">${i}</option>`;
  document.getElementById('monthSelect').onchange = e => { currentView.setMonth(e.target.value); render(); };
  document.getElementById('yearSelect').onchange = e => { currentView.setFullYear(e.target.value); render(); };
  updateSubjectPanel(); updateSidebar(); render();
})();