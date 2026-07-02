import { loginUser, redirectIfAuthenticated } from '../auth.js';
import { setupPasswordToggles } from '../utils/password-toggle.js';

/**
 * Inicializa a página de login, configurações de redirecionamento e alternância de senha.
 */
document.addEventListener('DOMContentLoaded', () => {
    // Verifica se já está autenticado
    redirectIfAuthenticated();
    
    // Inicializa a alternância de visibilidade da senha
    setupPasswordToggles();

    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;
            
            try {
                submitBtn.disabled = true;
                submitBtn.innerText = 'ENTRANDO...';
                errorMessage.classList.remove('is-visible');

                const result = await loginUser(email, password);

                if (result.success) {
                    window.location.href = '/pages/dashboard/index.html';
                } else {
                    errorMessage.innerText = result.error;
                    errorMessage.classList.add('is-visible');
                }
            } catch (error) {
                errorMessage.innerText = 'Ocorreu um erro inesperado.';
                errorMessage.classList.add('is-visible');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
    }
});
