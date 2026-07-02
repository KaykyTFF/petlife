/**
 * Pega os erros crus da API e mastiga num objeto bonitinho pro front entender
 * @param {any} errorResponse - A resposta de erro da API.
 * @returns {object} Um objeto formatado com os detalhes do erro.
 */
export const extractErrors = (errorResponse) => {
    if (!errorResponse) return {};
    
    if (typeof errorResponse === 'string') {
        return { detail: errorResponse };
    }
    
    // se vier no padrão do Django Rest Framework (detail)
    if (errorResponse.detail) {
        return { detail: errorResponse.detail };
    }

    if (errorResponse.error && typeof errorResponse.error === 'object') {
        return errorResponse.error;
    }

    return errorResponse;
};

/**
 * Valida o formato básico do email usando regex pra evitar string lixo
 * @param {string} email - O email a ser validado.
 * @returns {boolean} Verdadeiro se for válido.
 */
export const isValidEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

/**
 * Checa se a senha é forte (mínimo de 8 chars, 1 letra e 1 número)
 * @param {string} password - A senha a ser validada.
 * @returns {boolean} Verdadeiro se a senha for forte.
 */
export const isStrongPassword = (password) => {
    if (!password || password.length < 8) return false;
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    return hasLetter && hasNumber;
};
