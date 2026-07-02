
import { getCalendarEventsByMonth } from '../services/healthService.js';
import { getPets } from '../services/petService.js';
import { StatusBadge } from '../../components/status-badge.js';
import { DateUtils } from '../utils/dateUtils.js';

class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.allEvents = []; // Todos os eventos do mês
    this.filteredEvents = []; // Eventos após o filtro de pet
    this.selectedDayEvents = [];
    this.selectedDate = new Date();
    this.pets = [];
    this.selectedPetId = 'all';
    this.isLoading = false;
    this.isMonthChanging = true;
    
    this.init();
  }

  async init() {
    await Promise.all([
        this.loadPets(),
        this.loadEvents()
    ]);
    
    this.renderHeaderFilters();
    this.updateSelectedDayEvents();
    this.render();
    this.setupEventListeners();
  }

  async loadPets() {
      try {
          const res = await getPets();
          this.pets = Array.isArray(res) ? res : (res && Array.isArray(res.results) ? res.results : []);
      } catch (err) {
          console.error("Failed to load pets:", err);
          this.pets = [];
      }
  }

  async loadEvents() {
    this.isLoading = true;
    
    // Transição suave: alterna a opacidade em vez de reconstruir o DOM imediatamente
    const layoutEl = document.querySelector('.calendar-layout');
    if (layoutEl) {
        layoutEl.classList.add('opacity-60', 'pointer-events-none');
    } else {
        this.render();
    }
    
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    try {
        this.allEvents = await getCalendarEventsByMonth(year, month);
        this.applyPetFilter();
    } catch (err) {
        console.error("Failed to load events:", err);
        this.allEvents = [];
        this.filteredEvents = [];
    } finally {
        this.isLoading = false;
        this.render();
    }
  }

  applyPetFilter() {
      if (this.selectedPetId === 'all') {
          this.filteredEvents = [...this.allEvents];
      } else {
          this.filteredEvents = this.allEvents.filter(e => e.pet?.id == this.selectedPetId);
      }
      this.updateSelectedDayEvents();
  }

  updateSelectedDayEvents() {
      if (!this.selectedDate) {
          this.selectedDayEvents = [];
          return;
      }
      
      this.selectedDayEvents = this.filteredEvents.filter(e => {
          const d = new Date(e.date + 'T12:00:00');
          return d.getDate() === this.selectedDate.getDate() && 
                 d.getMonth() === this.selectedDate.getMonth() && 
                 d.getFullYear() === this.selectedDate.getFullYear();
      });
  }

  async navigate(direction) {
    if (this.isLoading) return;

    this.isMonthChanging = true;

    if (direction === 'prev') {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    } else if (direction === 'next') {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    } else if (direction === 'today') {
      this.currentDate = new Date();
      this.selectedDate = new Date();
    }
    
    if (direction !== 'today') {
        this.selectedDate = null;
        this.selectedDayEvents = [];
    }

    await this.loadEvents();
  }

  getMonthName(date = this.currentDate) {
    return DateUtils.getMonthName(date);
  }

  getDaysInMonth() {
    return DateUtils.getDaysInMonth(this.currentDate.getFullYear(), this.currentDate.getMonth());
  }

  getFirstDayOfMonth() {
    return DateUtils.getFirstDayOfMonth(this.currentDate.getFullYear(), this.currentDate.getMonth());
  }

  handleDayClick(day) {
    this.selectedDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), day);
    this.updateSelectedDayEvents();
    this.render();
  }

  renderHeaderFilters() {
      const headerRight = document.querySelector('.page-header .flex.items-center.gap-2');
      if (!headerRight) return;

      // Verifica se o filtro já existe
      if (document.getElementById('pet-filter-container')) return;

      const filterHtml = `
        <div id="pet-filter-container" class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mr-0 sm:mr-4 w-full sm:w-auto mb-4 sm:mb-0">
            <label for="pet-filter" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Filtrar por pet</label>
            <select id="pet-filter" class="bg-white border border-[var(--color-input-border)] rounded-lg px-3 py-1.5 text-xs font-bold text-[var(--color-text)] focus:ring-1 focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] outline-none transition-all cursor-pointer min-w-full sm:min-w-[160px] shadow-sm">
                <option value="all">Todos os pets</option>
                ${this.pets.map(p => `<option value="${p.id}">${p.nome || p.name}</option>`).join('')}
            </select>
        </div>
      `;
      headerRight.insertAdjacentHTML('beforebegin', filterHtml);

      document.getElementById('pet-filter').addEventListener('change', (e) => {
          this.selectedPetId = e.target.value;
          this.applyPetFilter();
          this.render();
      });
  }

  getSkeletonHtml() {
      return `
        <div class="calendar-layout animate-pulse">
            <div class="calendar-panel">
                <div class="card p-0 overflow-hidden">
                    <div class="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div class="w-48 h-8 bg-slate-100 rounded-lg"></div>
                        <div class="w-16 h-8 bg-slate-100 rounded-lg"></div>
                    </div>
                    <div class="grid grid-cols-7 border-b border-slate-50 bg-slate-50">
                        ${Array.from({length: 7}).map(() => `<div class="py-3 h-10 border-r border-slate-100"></div>`).join('')}
                    </div>
                    <div class="grid grid-cols-7 bg-white">
                        ${Array.from({length: 35}).map(() => `<div class="min-h-[100px] border-b border-r border-slate-50"></div>`).join('')}
                    </div>
                </div>
            </div>
            <div class="calendar-details-panel">
                <div class="card h-[400px] bg-slate-50/50"></div>
            </div>
        </div>
      `;
  }

  render() {
    const root = document.getElementById('calendar-content');
    if (!root) return;

    if (this.isLoading && this.allEvents.length === 0) {
        root.innerHTML = this.getSkeletonHtml();
        return;
    }

    const year = this.currentDate.getFullYear();
    const monthName = this.getMonthName();
    const daysInMonth = this.getDaysInMonth();
    const firstDay = this.getFirstDayOfMonth();
    
    const today = new Date();
    const isCurrentMonth = today.getFullYear() === year && today.getMonth() === this.currentDate.getMonth();

    const html = `
      <div class="calendar-layout transition-opacity duration-200 ${this.isLoading ? 'opacity-60 pointer-events-none' : ''}">
        <!-- Calendar Grid -->
        <div class="calendar-panel ${this.isMonthChanging ? 'fade-in' : ''}">
          <div class="card p-0 overflow-hidden shadow-sm border-slate-100">
            <div class="p-5 flex items-center justify-between bg-[#006F93] rounded-t-2xl">
              <div class="flex items-center gap-4">
                <button id="prev-month" class="p-2 bg-white/90 hover:bg-white text-[#006F93] rounded-xl transition-all border-none shadow-sm flex items-center justify-center cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h2 class="text-base font-bold text-white min-w-[140px] text-center">${monthName} ${year}</h2>
                <button id="next-month" class="p-2 bg-white/90 hover:bg-white text-[#006F93] rounded-xl transition-all border-none shadow-sm flex items-center justify-center cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <button id="go-today" class="bg-white hover:bg-slate-50 text-[#006F93] font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all cursor-pointer border-none">Hoje</button>
            </div>
            
            <div class="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
              ${['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => `
                <div class="py-3 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-r border-slate-100 last:border-r-0">${day}</div>
              `).join('')}
            </div>

            <div class="grid grid-cols-7 bg-white">
              ${Array.from({ length: firstDay }).map(() => `
                <div class="min-h-[100px] bg-slate-50/30 border-b border-r border-slate-100"></div>
              `).join('')}

              ${Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dayEvents = this.filteredEvents.filter(e => {
                    const d = new Date(e.date + 'T12:00:00');
                    return d.getDate() === day;
                });
                const isToday = isCurrentMonth && today.getDate() === day;
                const isSelected = this.selectedDate && this.selectedDate.getDate() === day && this.selectedDate.getMonth() === this.currentDate.getMonth() && this.selectedDate.getFullYear() === this.currentDate.getFullYear();

                return `
                  <div class="calendar-day min-h-[100px] p-2 border-b border-r border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer group ${isSelected ? 'bg-primary/5' : ''}" data-day="${day}">
                    <div class="flex justify-between items-start mb-1">
                      <span class="text-xs font-bold w-7 h-7 flex items-center justify-center rounded-full transition-all ${isToday ? 'bg-primary text-white shadow-sm' : isSelected ? 'bg-primary/20 text-primary' : 'text-slate-500 group-hover:text-primary'}">${day}</span>
                    </div>
                    
                    <div class="space-y-1">
                      ${dayEvents.slice(0, 2).map(event => `
                        <div class="px-1.5 py-1 rounded text-[9px] font-bold truncate flex items-center gap-1.5 ${this.getEventStyles(event.type)}">
                          <span class="w-1 h-1 rounded-full ${this.getEventBullet(event.type)} flex-shrink-0"></span>
                          <span class="truncate">${event.pet?.name || 'Pet'}: ${this.getEventShortName(event.type)}</span>
                        </div>
                      `).join('')}
                      ${dayEvents.length > 2 ? `<p class="text-[9px] font-bold text-slate-400 pl-1">+ ${dayEvents.length - 2} eventos</p>` : ''}
                    </div>
                  </div>
                `;
              }).join('')}

              ${Array.from({ length: (7 - (daysInMonth + firstDay) % 7) % 7 }).map(() => `
                <div class="min-h-[100px] bg-slate-50/30 border-b border-r border-slate-100 last:border-r-0"></div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Selected Day Details Sidebar -->
        <div class="calendar-details-panel">
          <div class="card border-slate-100 shadow-sm">
            <div class="mb-6">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Agenda do dia</p>
                <h3 class="text-base font-bold text-slate-800">
                  ${this.selectedDate ? `${this.selectedDate.getDate()} de ${this.getMonthName(this.selectedDate)}` : 'Selecione um dia'}
                </h3>
            </div>

            <div class="calendar-day-card space-y-4">
              ${this.selectedDayEvents.length > 0 ? this.selectedDayEvents.map(event => `
                <a href="/pages/detalhes-pet/index.html?id=${event.pet?.id || ''}&tab=${this.getEventTabName(event.type)}" class="block p-4 rounded-2xl bg-white border border-slate-100 shadow-sm space-y-3 hover:border-primary/30 transition-colors hover:shadow-md cursor-pointer no-underline text-current">
                  <div class="flex justify-between items-start">
                    <div>
                      <p class="text-[10px] font-bold text-primary uppercase tracking-wider">${this.getEventTypeName(event.type)}</p>
                      <h4 class="text-sm font-bold text-slate-800 mt-0.5">${event.title}</h4>
                    </div>
                    ${StatusBadge(this.translateStatus(event.status), this.getStatusType(event.status))}
                  </div>
                  
                  <div class="flex items-center gap-3">
                    ${event.pet?.photo ? `
                        <div class="w-8 h-8 rounded-full overflow-hidden border border-slate-200">
                            <img src="${event.pet.photo}" class="w-full h-full object-cover" alt="${event.pet.name}">
                        </div>
                    ` : `
                        <div class="w-8 h-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-[10px] font-bold text-primary">
                          ${event.pet?.name ? event.pet.name.substring(0, 2).toUpperCase() : '??'}
                        </div>
                    `}
                    <div class="min-w-0">
                      <p class="text-xs font-bold text-slate-700 truncate">${event.pet?.name || 'Pet'}</p>
                      <p class="text-[10px] text-slate-500 font-medium">${event.time}h</p>
                    </div>
                  </div>
                </a>
              `).join('') : `
                <div class="text-center py-12 px-6 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                  <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-300">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p class="text-sm font-bold text-slate-400">Nenhum evento agendado para este dia.</p>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    root.innerHTML = html;
    this.isMonthChanging = false;
  }

  getEventStyles(type) {
    switch (type) {
      case 'vaccine': return 'bg-amber-50 text-amber-700 border-l-2 border-amber-400';
      case 'deworming': return 'bg-emerald-50 text-emerald-700 border-l-2 border-emerald-400';
      case 'appointment': return 'bg-sky-50 text-sky-700 border-l-2 border-sky-400';
      default: return 'bg-slate-50 text-slate-700 border-l-2 border-slate-400';
    }
  }

  getEventTabName(type) {
    switch (type) {
      case 'vaccine': return 'vacinas';
      case 'deworming': return 'vermifugo';
      case 'appointment': return 'consultas';
      default: return 'resumo';
    }
  }

  getEventBullet(type) {
    switch (type) {
      case 'vaccine': return 'bg-amber-400';
      case 'deworming': return 'bg-emerald-400';
      case 'appointment': return 'bg-sky-400';
      default: return 'bg-slate-400';
    }
  }

  getEventTypeName(type) {
    switch (type) {
      case 'vaccine': return 'Vacina';
      case 'deworming': return 'Vermífugo';
      case 'appointment': return 'Consulta';
      default: return 'Evento';
    }
  }

  getEventShortName(type) {
    switch (type) {
      case 'vaccine': return 'Vacina';
      case 'deworming': return 'Verm';
      case 'appointment': return 'Cons';
      default: return 'Ev';
    }
  }

  translateStatus(status) {
    const map = {
        'scheduled': 'Agendado',
        'completed': 'Realizado',
        'concluido': 'Realizado',
        'cancelled': 'Cancelado',
        'pending': 'Pendente',
        'atrasado': 'Atrasado',
        'em_dia': 'Em dia',
        'próximo': 'Próximo',
        'sem_data': 'Sem data'
    };
    return map[status] || status;
  }

  getStatusType(status) {
      if (['completed', 'concluido', 'success', 'em_dia'].includes(status)) return 'success';
      if (['atrasado', 'cancelled', 'danger'].includes(status)) return 'danger';
      if (['scheduled', 'info', 'próximo'].includes(status)) return 'info';
      return 'warning';
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      const prevBtn = e.target.closest('#prev-month');
      const nextBtn = e.target.closest('#next-month');
      const todayBtn = e.target.closest('#go-today');
      
      if (prevBtn) this.navigate('prev');
      if (nextBtn) this.navigate('next');
      if (todayBtn) this.navigate('today');
      
      const dayEl = e.target.closest('.calendar-day');
      if (dayEl) {
        const day = parseInt(dayEl.dataset.day);
        this.handleDayClick(day);
      }
    });
  }
}

export const initCalendar = () => new Calendar();
