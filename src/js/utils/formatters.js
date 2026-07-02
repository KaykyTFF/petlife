/**
 * Formata o número pra celular do Brasil, injetando os parênteses e o traço
 * Ex: (11) 98765-4321
 * @param {string} value - O número de telefone não formatado.
 * @returns {string} O número formatado.
 */
export const formatPhoneBR = (value) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "").substring(0, 11);
    const len = digits.length;
    if (len === 0) return "";
    if (len <= 2) return `(${digits}`;
    if (len <= 6) return `(${digits.substring(0, 2)}) ${digits.substring(2)}`;
    if (len <= 10) return `(${digits.substring(0, 2)}) ${digits.substring(2, 6)}-${digits.substring(6)}`;
    return `(${digits.substring(0, 2)}) ${digits.substring(2, 7)}-${digits.substring(7)}`;
};

/**
 * Inverte a data americana do banco (YYYY-MM-DD) pra BR (DD/MM/YYYY)
 * @param {string} dateString - A data no formato YYYY-MM-DD.
 * @returns {string} A data no formato DD/MM/YYYY.
 */
export const formatDateBR = (dateString) => {
    if (!dateString) return "Não informado";
    try {
        const [year, month, day] = dateString.split('-');
        if (!year || !month || !day) return "Não informado";
        return `${day}/${month}/${year}`;
    } catch (e) {
        return "Não informado";
    }
};

/**
 * Esconde pedaço do texto com asterisco (ex: email do usuário) por privacidade
 * @param {string} email - O email completo.
 * @returns {string} O email mascarado.
 */
export const maskEmail = (email) => {
    if (!email || !email.includes('@')) return email;
    const [name, domain] = email.split('@');
    if (name.length <= 2) return email;
    return `${name.substring(0, 2)}***@${domain}`;
};
