const dayNames = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];
const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const shortDays = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
const colors = { reading: 'event-reading', review: 'event-review', exam: 'event-exam' };
const today = new Date(2025, 5, 18);
let weekStart = new Date(2025, 5, 15);
let events = JSON.parse(localStorage.getItem('studygotchi-events')) || [
  { id: 1, title: 'อ่านชีวะ บทที่ 3', day: 1, start: '09:00', end: '10:30', type: 'reading', description: 'สรุปเรื่องเซลล์และการลำเลียงสาร' },
  { id: 2, title: 'ทำโจทย์คณิต ชุดที่ 2', day: 2, start: '13:00', end: '14:30', type: 'review', description: '' },
  { id: 3, title: 'อ่านสรุปฟิสิกส์', day: 3, start: '10:00', end: '11:00', type: 'reading', description: '' },
  { id: 4, title: 'ทบทวนศัพท์อังกฤษ', day: 4, start: '16:00', end: '17:00', type: 'review', description: '' },
  { id: 5, title: 'สอบย่อยชีวะ', day: 5, start: '09:00', end: '10:00', type: 'exam', description: 'บทที่ 1-3' },
  { id: 6, title: 'อ่านเคมีอินทรีย์', day: 6, start: '14:00', end: '16:00', type: 'reading', description: '' }
];
let editingId = null;

const $ = (selector) => document.querySelector(selector);
const timeToMinutes = (time) => { const [hours, minutes] = time.split(':').map(Number); return hours * 60 + minutes; };
const formatTime = (time) => time.replace(':00', '.00').replace(':30', '.30');
const saveEvents = () => localStorage.setItem('studygotchi-events', JSON.stringify(events));

function renderMiniCalendar() {
  const first = new Date(weekStart.getFullYear(), weekStart.getMonth(), 1);
  const totalDays = new Date(weekStart.getFullYear(), weekStart.getMonth() + 1, 0).getDate();
  let html = `<div class="mini-head"><strong>${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear() + 543}</strong><span class="mini-nav">‹　›</span></div><div class="mini-week">${shortDays.map((day) => `<span>${day}</span>`).join('')}</div><div class="mini-dates">`;
  for (let i = 0; i < first.getDay(); i += 1) html += '<span class="muted">·</span>';
  for (let day = 1; day <= totalDays; day += 1) {
    const selected = day === today.getDate() && weekStart.getMonth() === today.getMonth() ? 'selected' : '';
    html += `<span class="${selected}">${day}</span>`;
  }
  $('#miniCalendar').innerHTML = `${html}</div>`;
}

function renderCalendar() {
  const dates = Array.from({ length: 7 }, (_, index) => new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + index));
  $('#monthTitle').textContent = `${monthNames[weekStart.getMonth()]} ${weekStart.getFullYear() + 543}`;
  $('#weekHeader').innerHTML = '<div class="timezone">GMT+7</div>' + dates.map((date) => {
    const isToday = date.toDateString() === today.toDateString();
    return `<div class="day-header ${isToday ? 'today' : ''}"><span>${dayNames[date.getDay()]}</span><strong>${date.getDate()}</strong></div>`;
  }).join('');
  $('#timeColumn').innerHTML = Array.from({ length: 12 }, (_, index) => `<div class="time-label">${String(index + 7).padStart(2, '0')}:00</div>`).join('');
  $('#weekGrid').innerHTML = '';
  events.forEach((event) => {
    const top = (timeToMinutes(event.start) - 420) / 60 * 60;
    const height = Math.max((timeToMinutes(event.end) - timeToMinutes(event.start)) / 60 * 60, 38);
    const element = document.createElement('article');
    element.className = `event ${colors[event.type] || colors.reading}`;
    element.dataset.type = event.type;
    element.style.cssText = `left:calc(${event.day} * 14.2857% + 5px);top:${top}px;width:calc(14.2857% - 10px);height:${height}px`;
    element.innerHTML = `<div class="event-title">${event.title}</div><div class="event-time">${formatTime(event.start)} - ${formatTime(event.end)}</div>`;
    element.addEventListener('click', () => openModal(event));
    $('#weekGrid').appendChild(element);
  });
  renderMiniCalendar();
}

function openModal(event = null) {
  editingId = event?.id || null;
  $('#modalTitle').textContent = event ? 'แก้ไขตาราง' : 'วางแผนการอ่าน';
  $('#deleteEvent').hidden = !event;
  $('#eventForm').title.value = event?.title || '';
  $('#eventForm').day.value = event?.day ?? 1;
  $('#eventForm').type.value = event?.type || 'reading';
  $('#eventForm').start.value = event?.start || '09:00';
  $('#eventForm').end.value = event?.end || '10:00';
  $('#eventForm').description.value = event?.description || '';
  $('#modalBackdrop').hidden = false;
  $('#eventForm').title.focus();
}
function closeModal() { $('#modalBackdrop').hidden = true; }

$('#daySelect').innerHTML = dayNames.slice(1).map((name, index) => `<option value="${index + 1}">${name}</option>`).join('');
$('#createButton').addEventListener('click', () => openModal());
$('#closeModal').addEventListener('click', closeModal);
$('#cancelModal').addEventListener('click', closeModal);
$('#modalBackdrop').addEventListener('click', (event) => { if (event.target.id === 'modalBackdrop') closeModal(); });
$('#eventForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  if (timeToMinutes(data.end) <= timeToMinutes(data.start)) return;
  if (editingId) events = events.map((item) => item.id === editingId ? { ...item, ...data } : item);
  else events.push({ ...data, id: Date.now() });
  saveEvents(); renderCalendar(); closeModal();
});
$('#deleteEvent').addEventListener('click', () => { events = events.filter((item) => item.id !== editingId); saveEvents(); renderCalendar(); closeModal(); });
$('#prevWeek').addEventListener('click', () => { weekStart.setDate(weekStart.getDate() - 7); renderCalendar(); });
$('#nextWeek').addEventListener('click', () => { weekStart.setDate(weekStart.getDate() + 7); renderCalendar(); });
$('#todayButton').addEventListener('click', () => { weekStart = new Date(2025, 5, 15); renderCalendar(); });
document.querySelectorAll('[data-filter]').forEach((checkbox) => checkbox.addEventListener('change', () => {
  const filters = [...document.querySelectorAll('[data-filter]')];
  const showAll = filters.find((item) => item.dataset.filter === 'all').checked;
  document.querySelectorAll('.event').forEach((eventElement) => {
    const matchingFilter = filters.find((item) => item.dataset.filter === eventElement.dataset.type);
    eventElement.style.display = showAll || matchingFilter?.checked ? '' : 'none';
  });
}));
renderCalendar();