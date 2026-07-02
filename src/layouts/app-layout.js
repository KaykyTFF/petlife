import { Sidebar } from '../components/sidebar.js';
import { Header } from '../components/header.js';
import { requireAuth, logoutUser } from '../js/auth.js';
import { initCustomSelects } from '../js/utils/custom-select.js';

/**
 * Layout do App
 * @param {Object} options - Opções do layout.
 * @param {string} options.title - Título da página para o cabeçalho (não usado diretamente na navegação global, mantido por compatibilidade).
 * @param {string} options.content - HTML do conteúdo principal.
 */
export const renderAppLayout = ({ title, content }) => {
  // Verifica Autenticação
  if (!requireAuth()) return;

  const root = document.getElementById('app') || document.body;

  const html = `
    <div class="app-shell font-sans text-[var(--color-text)]">
      <!-- Navegação Global Superior -->
      ${Header()}

      <!-- Barra Lateral -->
      ${Sidebar()}

      <!-- Área de Conteúdo Principal -->
      <main class="app-main bg-[var(--color-background)]">
        <div class="page-container animate-fade-in">
          ${content}
        </div>
      </main>

      <!-- Sobreposição Mobile -->
      <div id="sidebar-overlay" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 hidden transition-opacity duration-300"></div>
    </div>
  `;

  root.innerHTML = html;

  // Lógica de Alternância da Barra Lateral
  const menuToggle = document.getElementById('menu-toggle');
  const closeSidebar = document.getElementById('close-sidebar');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebar-overlay');

  if (sidebar && overlay) {
    const openDrawer = () => {
      sidebar.classList.add('open');
      overlay.classList.remove('hidden');
      menuToggle?.setAttribute('aria-expanded', 'true');
    };

    const closeDrawer = () => {
      sidebar.classList.remove('open');
      overlay.classList.add('hidden');
      menuToggle?.setAttribute('aria-expanded', 'false');
    };

    menuToggle?.addEventListener('click', openDrawer);
    closeSidebar?.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // Tecla ESC para fechar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Tratar Logout
    const logoutBtn = sidebar.querySelector('.sidebar-logout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        logoutUser();
      });
    }
  }

  // Inicializa os selects customizados no carregamento inicial e configura o MutationObserver para novos selects (como em modais)
  initCustomSelects();

  if (!window.customSelectsObserver) {
    window.customSelectsObserver = new MutationObserver((mutations) => {
      let hasNewSelect = false;
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            if (node.tagName === 'SELECT' || (node.getElementsByTagName && node.getElementsByTagName('select').length > 0)) {
              hasNewSelect = true;
              break;
            }
          }
        }
        if (hasNewSelect) break;
      }
      if (hasNewSelect) {
        initCustomSelects();
      }
    });
    window.customSelectsObserver.observe(document.body, { childList: true, subtree: true });
  }
};
