import { registerUser, redirectIfAuthenticated, checkEmailExists } from '../auth.js';
import { setupPasswordToggles } from '../utils/password-toggle.js';

/**
 * Formata uma string para a máscara de telefone brasileira
 * @param {string} value - O valor de entrada
 * @returns {string} Telefone formatado
 */
export const formatPhoneBR = (value) => {
    if (!value) return "";

    // Get only digits
    const digits = getOnlyDigits(value).substring(0, 11);
    const len = digits.length;

    if (len === 0) return "";

    if (len <= 2) {
        return `(${digits}`;
    } else if (len <= 6) {
        return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    } else if (len <= 10) {
        return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
    } else {
        return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
    }
};

/**
 * Remove todos os caracteres que não são dígitos
 * @param {string} value - O valor de entrada
 * @returns {string} Apenas os dígitos
 */
export const getOnlyDigits = (value) => {
    return value.replace(/\D/g, "");
};

document.addEventListener('DOMContentLoaded', () => {
    // Verifica se já está autenticado
    redirectIfAuthenticated();

    // Inicializa a alternância de visibilidade da senha
    setupPasswordToggles();

    const registerForm = document.getElementById('register-form');
    const errorMessage = document.getElementById('error-message');

    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const emailError = document.getElementById('email-error');

    let isEmailValid = true;

    // Máscara de telefone
    if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            e.target.value = formatPhoneBR(e.target.value);
        });
    }

    // Cor do placeholder para o input de data
    const dateInput = document.getElementById('data_nascimento');
    if (dateInput) {
        const updateDateColor = () => {
            dateInput.style.color = dateInput.value ? '' : '#94a3b8';
        };
        updateDateColor();
        dateInput.addEventListener('change', updateDateColor);
    }

    // Verificação de e-mail ao perder o foco
    if (emailInput) {
        emailInput.addEventListener('blur', async () => {
            const email = emailInput.value.trim();

            if (!email) {
                emailError.classList.remove('is-visible');
                isEmailValid = true;
                return;
            }

            // Regex básica de validação de e-mail
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                emailError.innerText = "Digite um e-mail válido.";
                emailError.classList.add('is-visible');
                isEmailValid = false;
                return;
            }

            try {
                const result = await checkEmailExists(email);
                if (result.success && result.exists) {
                    emailError.innerText = "Este e-mail já está cadastrado.";
                    emailError.classList.add('is-visible');
                    isEmailValid = false;
                } else {
                    emailError.classList.remove('is-visible');
                    isEmailValid = true;
                }
            } catch (error) {
                console.error("Erro ao verificar e-mail:", error);
            }
        });

        // Limpa o erro enquanto digita
        emailInput.addEventListener('input', () => {
            if (emailError.classList.contains('is-visible')) {
                emailError.classList.remove('is-visible');
                isEmailValid = true;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('email').value.trim();

            // Revalida o e-mail ao enviar
            if (email) {
                try {
                    const result = await checkEmailExists(email);
                    if (result.success && result.exists) {
                        emailError.innerText = "Este e-mail já está cadastrado.";
                        emailError.classList.add('is-visible');
                        isEmailValid = false;
                    } else {
                        isEmailValid = true;
                    }
                } catch (error) {
                    console.error("Erro ao validar e-mail no submit:", error);
                }
            }

            // Verifica se o e-mail já foi marcado como inválido
            if (!isEmailValid) {
                document.getElementById('email').focus();
                return;
            }

            const first_name = document.getElementById('first_name').value.trim();
            const last_name = document.getElementById('last_name').value.trim();
            const phone = getOnlyDigits(document.getElementById('phone').value);
            const data_nascimento = document.getElementById('data_nascimento').value;
            const password = document.getElementById('password').value;
            const password_confirm = document.getElementById('password_confirm').value;

            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerText;

            if (!first_name) {
                errorMessage.innerText = 'O nome é obrigatório.';
                errorMessage.classList.remove('hidden');
                return;
            }

            if (!last_name) {
                errorMessage.innerText = 'O sobrenome é obrigatório.';
                errorMessage.classList.remove('hidden');
                return;
            }

            if (password !== password_confirm) {
                errorMessage.innerText = 'As senhas não coincidem.';
                errorMessage.classList.remove('hidden');
                return;
            }

            try {
                submitBtn.disabled = true;
                submitBtn.innerText = 'CRIANDO CONTA...';
                errorMessage.classList.add('hidden');

                const result = await registerUser({
                    first_name,
                    last_name,
                    email,
                    phone,
                    data_nascimento,
                    password,
                    password_confirm
                });

                if (result.success) {
                    window.location.href = '/pages/dashboard/index.html';
                } else {
                    errorMessage.innerText = result.error;
                    errorMessage.classList.remove('hidden');
                }
            } catch (error) {
                errorMessage.innerText = 'Ocorreu um erro inesperado.';
                errorMessage.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerText = originalText;
            }
        });
    }
});
