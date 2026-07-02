/**
 * Verificação do Código de Redefinição de Senha - SEM ALERTAS
 */
import { verifyPasswordResetCode, confirmPasswordReset, requestPasswordReset } from '../services/authService.js';

console.log('Confirm code script loaded');

document.addEventListener('DOMContentLoaded', () => {
  const email = sessionStorage.getItem('reset_email');
  if (!email) {
    window.location.href = '/pages/recuperar-senha/index.html';
    return;
  }

  const codeInputs = document.querySelectorAll('input[maxlength="1"]');
  const validateBtn = document.querySelector('button');
  const resendBtn = document.querySelector('a[href="#"]');
  const form = document.querySelector('form');
  let cooldownTimer = null;
  
  // Foca automaticamente no próximo input
  codeInputs.forEach((input, index) => {
    input.addEventListener('input', (e) => {
      if (e.target.value.length === 1 && index < codeInputs.length - 1) {
        codeInputs[index + 1].focus();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        codeInputs[index - 1].focus();
      }
    });
  });

  const getCode = () => Array.from(codeInputs).map(i => i.value).join('');

  const showError = (msg) => {
    const errorSlot = document.querySelector('.login-error-slot') || createErrorSlot();
    const errorMsg = errorSlot.querySelector('.login-error-message');
    
    const messageText = Array.isArray(msg) ? msg.join(' ') : msg;
    
    errorMsg.textContent = messageText;
    errorMsg.classList.add('is-visible');
    
    setTimeout(() => {
      errorMsg.classList.remove('is-visible');
    }, 5000);
  };

  const createErrorSlot = () => {
    const slot = document.createElement('div');
    slot.className = 'login-error-slot';
    slot.innerHTML = '<span class="login-error-message"></span>';
    form.appendChild(slot);
    return slot;
  };

  // Lógica de tempo de espera (cooldown)
  const startCooldown = (seconds) => {
    if (cooldownTimer) clearInterval(cooldownTimer);
    
    const until = Date.now() + (seconds * 1000);
    sessionStorage.setItem('reset_code_cooldown_until', until);
    
    updateCooldownUI();
  };

  const updateCooldownUI = () => {
    if (cooldownTimer) clearInterval(cooldownTimer);
    
    const until = sessionStorage.getItem('reset_code_cooldown_until');
    if (!until) return;

    cooldownTimer = setInterval(() => {
      const now = Date.now();
      const remaining = Math.ceil((until - now) / 1000);

      if (remaining <= 0) {
        clearInterval(cooldownTimer);
        resendBtn.textContent = 'Reenviar agora';
        resendBtn.classList.remove('opacity-50', 'pointer-events-none');
        sessionStorage.removeItem('reset_code_cooldown_until');
      } else {
        resendBtn.textContent = `Reenviar código em ${remaining}s`;
        resendBtn.classList.add('opacity-50', 'pointer-events-none');
      }
    }, 1000);
  };

  // Verificação Inicial do Tempo de Espera
  updateCooldownUI();

  if (validateBtn) {
    validateBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      const code = getCode();
      
      if (code.length !== 6) {
        showError('Por favor, digite o código de 6 dígitos.');
        return;
      }

      validateBtn.disabled = true;
      validateBtn.textContent = 'VALIDANDO...';

      const { data, error } = await verifyPasswordResetCode(email, code);

      if (error) {
        showError(error.detail || 'Código inválido ou expirado.');
        validateBtn.disabled = false;
        validateBtn.textContent = 'CONFIRMAR';
      } else {
        showNewPasswordForm(code);
      }
    });
  }

  if (resendBtn) {
    resendBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      
      if (resendBtn.classList.contains('pointer-events-none')) return;

      resendBtn.textContent = 'REENVIANDO...';
      const { data, error } = await requestPasswordReset(email);
      
      if (!error) {
        resendBtn.textContent = 'REENVIADO!';
        const wait = data.wait_seconds || 60;
        setTimeout(() => startCooldown(wait), 1000);
      } else {
        const wait = error.wait_seconds;
        if (wait) {
          showError(error.detail);
          startCooldown(wait);
        } else {
          resendBtn.textContent = 'ERRO AO REENVIAR';
          setTimeout(() => {
            resendBtn.textContent = 'Reenviar agora';
          }, 3000);
        }
      }
    });
  }

  function showNewPasswordForm(code) {
    const titleEl = document.querySelector('h1');
    const subtitleEl = document.querySelector('p.text-\\[var\\(--color-accent\\)\\]');
    
    if (titleEl) titleEl.textContent = 'NOVA SENHA';
    if (subtitleEl) subtitleEl.textContent = 'Agora, defina sua nova senha de acesso.';

    const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
    const eyeClosed = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

    form.innerHTML = `
      <div class="space-y-6 w-full fade-in">
        <div class="form-group">
          <label class="form-label">Nova Senha</label>
          <div class="password-field">
            <input type="password" id="new_password" placeholder="••••••••" class="input-field" required minlength="8">
            <button type="button" class="password-toggle" data-target="new_password">
              ${eyeOpen}
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Confirmar Nova Senha</label>
          <div class="password-field">
            <input type="password" id="new_password_confirm" placeholder="••••••••" class="input-field" required minlength="8">
            <button type="button" class="password-toggle" data-target="new_password_confirm">
              ${eyeOpen}
            </button>
          </div>
        </div>

        <div class="login-error-slot">
          <span class="login-error-message"></span>
        </div>

        <button type="submit" class="btn-primary w-full py-4 text-lg shadow-lg shadow-black/20 mt-4 uppercase tracking-widest">
          ALTERAR SENHA
        </button>
      </div>
    `;

    form.querySelectorAll('.password-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const input = document.getElementById(targetId);
        
        if (input.type === 'password') {
          input.type = 'text';
          btn.innerHTML = eyeClosed;
        } else {
          input.type = 'password';
          btn.innerHTML = eyeOpen;
        }
      });
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPassword = document.getElementById('new_password').value;
      const newPasswordConfirm = document.getElementById('new_password_confirm').value;
      const submitBtn = form.querySelector('button[type="submit"]');

      if (!newPassword || newPassword.length < 8) {
        showError('A senha deve ter pelo menos 8 caracteres.');
        return;
      }

      if (newPassword !== newPasswordConfirm) {
        showError('As senhas não coincidem.');
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'ALTERANDO...';

      const { error } = await confirmPasswordReset(email, code, newPassword, newPasswordConfirm);

      if (error) {
        showError(error.detail || 'Erro ao redefinir senha.');
        submitBtn.disabled = false;
        submitBtn.textContent = 'ALTERAR SENHA';
      } else {
        submitBtn.textContent = 'SENHA ALTERADA!';
        submitBtn.classList.remove('btn-primary');
        submitBtn.style.backgroundColor = 'var(--color-success)';
        
        sessionStorage.removeItem('reset_email');
        sessionStorage.removeItem('reset_code_cooldown_until');
        
        setTimeout(() => {
          window.location.href = '/pages/login/index.html';
        }, 1500);
      }
    });
  }
});
