/**
 * Lógica pra alternar a visibilidade da senha (o icone de olhinho)
 */

const EYE_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
</svg>
`;

const EYE_OFF_ICON = `
<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
  <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
  <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
  <line x1="2" y1="2" x2="22" y2="22"/>
</svg>
`;

/**
 * Varre o DOM procurando quem tem a classe de toggle pra injetar os eventos
 */
export const setupPasswordToggles = () => {
  const toggles = document.querySelectorAll('.password-toggle');

  toggles.forEach(toggle => {
    // Só anexa se não estiver anexado ainda
    if (toggle.dataset.initialized) return;

    const container = toggle.closest('.password-field');
    if (!container) return;

    const input = container.querySelector('input');
    if (!input) return;

    // Define o ícone inicial
    toggle.innerHTML = EYE_ICON;
    toggle.setAttribute('aria-label', 'Mostrar senha');

    toggle.addEventListener('click', () => {
      const isPassword = input.type === 'password';

      // se é password joga pra text, senão volta pra password
      input.type = isPassword ? 'text' : 'password';

      // troca o SVG e a label de acessibilidade
      toggle.innerHTML = isPassword ? EYE_OFF_ICON : EYE_ICON;
      toggle.setAttribute('aria-label', isPassword ? 'Ocultar senha' : 'Mostrar senha');

      // mantém o foco no input pro usuário não ter que clicar de novo
      input.focus();
    });

    toggle.dataset.initialized = 'true';
  });
};
