/**
 * Global Header Component (Linear/SaaS inspired)
 * @returns {string} - HTML string
 */
export const Header = () => {
  const currentPath = window.location.pathname;
  
  const navItems = [
    { label: 'Dashboard', path: '/pages/dashboard/index.html', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Meus Pets', path: '/pages/meus-pets/index.html', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { label: 'Calendário', path: '/pages/calendario/index.html', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Adicionar Pet', path: '/pages/adicionar-pet/index.html', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
  ];

  const renderNavLink = (item) => {
    const isActive = currentPath.startsWith(item.path.replace('/index.html', '')) || currentPath === item.path;
    return `
      <a href="${item.path}" class="header-nav-link ${isActive ? 'header-nav-link-active' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}" />
        </svg>
        <span>${item.label}</span>
      </a>
    `;
  };

  const isNotificationsActive = currentPath.includes('/pages/notificacoes/');

  return `
    <header class="global-topbar">
      <!-- Left: Brand & Menu -->
      <div class="flex items-center gap-4">
        <button id="menu-toggle" class="p-2 -ml-2 text-[var(--color-text-muted)] hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-lg transition-all" aria-expanded="false" aria-label="Abrir menu">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        
        <a href="/pages/dashboard/index.html" class="flex items-center gap-2.5 group">
          <div class="p-1.5 bg-[var(--color-primary)] rounded-xl group-hover:scale-110 transition-transform shadow-sm">
            <img src="/assets/logos/lifepet-logo.svg" alt="LifePet Logo" class="h-6 w-6 invert brightness-0">
          </div>
          <div class="flex flex-col">
            <span class="font-bold text-lg text-[var(--color-text)] tracking-tight leading-none">LifePet</span>
            <span class="text-[10px] text-[var(--color-text-muted)] font-medium uppercase tracking-wider">Pet Care</span>
          </div>
        </a>
      </div>

      <!-- Center: Navigation -->
      <nav class="header-nav">
        ${navItems.map(item => renderNavLink(item)).join('')}
      </nav>

      <!-- Right: Actions & Profile -->
      <div class="flex items-center gap-3">
        <div class="hidden sm:flex items-center gap-2 mr-2">
          <a href="/pages/notificacoes/index.html" class="p-2 ${isNotificationsActive ? 'text-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'text-[var(--color-text-muted)]'} hover:text-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 rounded-full transition-all relative group" aria-label="Abrir notificações">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-accent)] rounded-full border-2 border-white animate-pulse"></span>
          </a>
        </div>

        <div class="h-8 w-px bg-[var(--color-input-border)] mx-1"></div>

        <a href="/pages/perfil/index.html" class="flex items-center gap-3 pl-2 group">
          <div class="hidden md:flex flex-col items-end">
            <span class="text-sm font-bold text-[var(--color-text)] leading-none">Kayky</span>
            <span class="text-[11px] text-[var(--color-text-muted)] font-medium">Tutor Gold</span>
          </div>
          <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-button)] text-white flex items-center justify-center text-sm font-bold shadow-sm group-hover:shadow-md transition-all">
            K
          </div>
        </a>
      </div>
    </header>
  `;
};
