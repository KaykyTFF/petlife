import { redirectIfAuthenticated } from '../js/auth.js';

/**
 * Layout de Autenticação
 * @param {Object} options - Opções do layout.
 * @param {string} options.title - Título da página.
 * @param {string} options.subtitle - Subtítulo da página.
 * @param {string} options.content - HTML do conteúdo do formulário.
 * @param {string} [options.panelClass=''] - Classes adicionais para o painel do formulário.
 */
export const renderAuthLayout = ({ title, subtitle, content, panelClass = '' }) => {
  // Verificar Autenticação (redireciona se já logado)
  redirectIfAuthenticated();

  const root = document.getElementById('app') || document.body;
  
  const html = `
    <div class="auth-wrapper">
      
      <!-- Painel Esquerdo: Demonstração da Marca -->
      <div class="w-full md:w-[60%] flex-shrink-0 min-h-[40vh] md:min-h-full login-brand-panel">
        <div class="flex flex-col items-center text-center max-w-lg">
          <img src="/assets/logos/lifepet-logo.svg" alt="Logo LifePet" class="w-64 md:w-80 lg:w-[460px] h-auto object-contain transition-all duration-700 hover:scale-105 drop-shadow-2xl">
          <div class="mt-12 hidden md:block">
            <h2 class="text-3xl font-black text-[#006F93] tracking-tighter leading-tight mb-4">LifePet Care OS</h2>
            <p class="text-lg text-slate-500 font-medium">A tecnologia que aproxima você da saúde do seu melhor amigo.</p>
          </div>
        </div>
      </div>

      <!-- Painel Direito: Área de Foco -->
      <div class="w-full md:w-[40%] flex-1 login-form-panel ${panelClass}">
        <div class="w-full max-w-sm mx-auto flex flex-col min-h-full">
          <div class="flex-1 flex flex-col justify-center">
            ${title ? `<h1 class="text-3xl lg:text-4xl font-black mb-2 tracking-tighter text-white uppercase">${title}</h1>` : ''}
            ${subtitle ? `<p class="text-[var(--color-accent)] text-lg mb-10 font-bold leading-tight opacity-90">${subtitle}</p>` : ''}
            ${title && !subtitle ? `<div class="mb-8"></div>` : ''}
            
            <div class="auth-form-container">
              ${content}
            </div>
          </div>
          
          <div class="mt-10 pt-8 border-t border-white/10 text-center pb-8">
            <p class="text-xs font-bold text-white/40 uppercase tracking-[0.2em]">&copy; 2026 LifePet</p>
          </div>
        </div>
      </div>
      
    </div>
  `;

  root.innerHTML = html;
};
