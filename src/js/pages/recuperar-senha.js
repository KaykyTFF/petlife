/**
 * Fluxo de Recuperação de Senha - SEM ALERTAS
 */
import { requestPasswordReset } from '../services/authService.js';

console.log('Recovery flow script loaded');

document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form');
  const emailInput = document.querySelector('input[type="email"]');
  const submitBtn = document.querySelector('button');
  const errorMsg = document.querySelector('.form-error-message');

  if (!form) return;

  const showError = (msg) => {
    if (!errorMsg) return;
    errorMsg.textContent = msg;
    errorMsg.classList.add('is-visible');
    
    // Oculta automaticamente após 5 segundos
    setTimeout(() => {
      errorMsg.classList.remove('is-visible');
    }, 5000);
  };

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = emailInput.value.trim();
    
    // Validação no frontend
    if (!email) {
      showError('Digite seu e-mail.');
      return;
    }

    if (!validateEmail(email)) {
      showError('Digite um e-mail válido.');
      return;
    }

    // Estado de carregamento
    submitBtn.disabled = true;
    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = 'ENVIANDO...';

    // Limpa erros anteriores
    errorMsg.classList.remove('is-visible');

    const { data, error } = await requestPasswordReset(email);

    if (error) {
      showError(error.detail || 'Erro ao solicitar recuperação.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    } else {
      if (data && data.exists) {
        // Inicializa o tempo de espera (cooldown) para reenvio
        const until = Date.now() + ((data.wait_seconds || 60) * 1000);
        sessionStorage.setItem('reset_code_cooldown_until', until);

        // Armazena o e-mail para a próxima etapa
        sessionStorage.setItem('reset_email', email);
        window.location.href = '/pages/confirmar-codigo/index.html';
      } else {

        // ERRO: Mostra erro na mesma linha
        showError('E-mail não cadastrado.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });

  // Garante que cliques no botão disparem o envio do formulário
  if (submitBtn) {
    submitBtn.addEventListener('click', (e) => {
      if (submitBtn.type !== 'submit') {
        e.preventDefault();
        form.dispatchEvent(new Event('submit'));
      }
    });
  }
});
