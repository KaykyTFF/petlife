import { Sidebar } from '../components/sidebar.js';
import { Header } from '../components/header.js';

/**
 * App Layout
 * @param {Object} options
 * @param {string} options.title - Page title for the header (not used directly in global top nav, kept for compatibility if needed)
 * @param {string} options.content - Main content HTML
 */
export const renderAppLayout = ({ title, content }) => {
  const root = document.getElementById('app') || document.body;
  
  const html = `
    <div class="app-shell font-sans text-[var(--color-text)]">
      <!-- Global Top Nav -->
      ${Header()}

      <!-- Sidebar -->
      ${Sidebar()}

      <!-- Main Content Area -->
      <main class="app-main bg-[var(--color-background)]">
        <div class="page-container animate-fade-in">
          ${content}
        </div>
      </main>

      <!-- Mobile Overlay -->
      <div id="sidebar-overlay" class="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 hidden transition-opacity duration-300"></div>
    </div>
  `;

  root.innerHTML = html;

  // Sidebar Toggle Logic
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

    // ESC key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('open')) {
        closeDrawer();
      }
    });
  }
};
