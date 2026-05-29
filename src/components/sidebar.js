/**
 * Sidebar Component (Refined SaaS Design)
 * @returns {string} - HTML string
 */
export const Sidebar = () => {
  const currentPath = window.location.pathname;
  
  const menuItems = [
    { label: 'Dashboard', path: '/pages/dashboard/index.html', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { label: 'Meus Pets', path: '/pages/meus-pets/index.html', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
    { label: 'Calendário', path: '/pages/calendario/index.html', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Notificações', path: '/pages/notificacoes/index.html', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { label: 'Perfil', path: '/pages/perfil/index.html', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { label: 'Configurações', path: '/pages/configuracoes/index.html', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
  ];

  const renderLink = (item) => {
    const isActive = currentPath.startsWith(item.path.replace('/index.html', '')) || currentPath === item.path;
    
    return `
      <a href="${item.path}" class="sidebar-link ${isActive ? 'sidebar-link-active' : ''}">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="${item.icon}" />
        </svg>
        <span>${item.label}</span>
      </a>
    `;
  };

  return `
    <aside id="sidebar" class="app-sidebar no-scrollbar">
      <div class="p-6 flex items-center justify-between border-b border-white/10">
        <a href="/pages/dashboard/index.html" class="flex items-center gap-2.5">
          <img src="/assets/logos/lifepet-logo.svg" alt="LifePet Logo" class="h-8 w-auto invert brightness-0">
          <span class="font-bold text-xl text-white tracking-tight">LifePet</span>
        </a>
        <button id="close-sidebar" class="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all" aria-label="Fechar menu">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <div class="mb-4 px-4">
          <span class="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em]">Menu Principal</span>
        </div>
        ${menuItems.map(item => renderLink(item)).join('')}
      </nav>

      <div class="sidebar-footer">
        <div class="px-4">
          <a href="/pages/login/index.html" class="sidebar-logout">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Sair</span>
          </a>
        </div>
      </div>
    </aside>
  `;
};
