/**
 * Auth Layout
 * @param {Object} options
 * @param {string} options.title - Page title
 * @param {string} options.subtitle - Page subtitle
 * @param {string} options.content - Form content HTML
 */
export const renderAuthLayout = ({ title, subtitle, content }) => {
  const root = document.getElementById('app') || document.body;
  
  const html = `
    <div class="auth-wrapper">
      
      <!-- Left Panel: Branding Showcase -->
      <div class="w-full md:w-[60%] flex-shrink-0 min-h-[40vh] md:min-h-full login-brand-panel">
        <div class="flex flex-col items-center text-center max-w-lg">
          <img src="/assets/logos/lifepet-logo.svg" alt="Logo LifePet" class="w-64 md:w-80 lg:w-[460px] h-auto object-contain transition-all duration-700 hover:scale-105 drop-shadow-2xl">
          <div class="mt-12 hidden md:block">
            <h2 class="text-3xl font-black text-[#006F93] tracking-tighter leading-tight mb-4">LifePet Care OS</h2>
            <p class="text-lg text-slate-500 font-medium">A tecnologia que aproxima você da saúde do seu melhor amigo.</p>
          </div>
        </div>
      </div>

      <!-- Right Panel: Focus Area -->
      <div class="w-full md:w-[40%] flex-1 login-form-panel">
        <div class="w-full max-w-sm mx-auto">
          ${title ? `<h1 class="text-3xl lg:text-4xl font-black mb-2 tracking-tighter text-white uppercase">${title}</h1>` : ''}
          ${subtitle ? `<p class="text-[var(--color-accent)] text-lg mb-10 font-bold leading-tight opacity-90">${subtitle}</p>` : ''}
          ${title && !subtitle ? `<div class="mb-12"></div>` : ''}
          
          <div class="auth-form-container">
            ${content}
          </div>
          
          <div class="mt-16 pt-8 border-t border-white/10 text-center">
            <p class="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">&copy; 2026 LifePet • Design System v2.0</p>
          </div>
        </div>
      </div>
      
    </div>
  `;

  root.innerHTML = html;
};
