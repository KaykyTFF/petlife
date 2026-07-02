/**
 * Utilitários para manipulação e verificação de datas.
 */
export const DateUtils = {
    /**
     * Retorna o nome do mês a partir de uma data.
     * @param {Date} date - O objeto Date.
     * @returns {string} O nome do mês.
     */
    getMonthName(date) {
        const months = [
            'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
            'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
        ];
        return months[date.getMonth()];
    },

    /**
     * Obtém o número de dias em um mês específico.
     * @param {number} year - O ano.
     * @param {number} month - O mês (0-11).
     * @returns {number} O número de dias.
     */
    getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    },

    /**
     * Obtém o dia da semana do primeiro dia do mês.
     * @param {number} year - O ano.
     * @param {number} month - O mês (0-11).
     * @returns {number} O dia da semana (0-6).
     */
    getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    },

    /**
     * Verifica se a data corresponde a hoje.
     * @param {Date} date - A data a ser verificada.
     * @returns {boolean} Verdadeiro se for hoje.
     */
    isToday(date) {
        const today = new Date();
        // quebra o timestamp pra checar se o dia, mês e ano batem com hoje
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    },
    
    /**
     * Verifica se duas datas caem no mesmo dia.
     * @param {Date} d1 - A primeira data.
     * @param {Date} d2 - A segunda data.
     * @returns {boolean} Verdadeiro se caírem no mesmo dia.
     */
    isSameDay(d1, d2) {
        if (!d1 || !d2) return false;
        return d1.getDate() === d2.getDate() &&
               d1.getMonth() === d2.getMonth() &&
               d1.getFullYear() === d2.getFullYear();
    },

    /**
     * Verifica se uma data já passou (está atrasada em relação a hoje).
     * @param {Date} date - A data a ser verificada.
     * @returns {boolean} Verdadeiro se a data for anterior a hoje.
     */
    isOverdue(date) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date < today;
    },

    /**
     * Verifica se uma data está próxima de acontecer (ex: nos próximos X dias).
     * @param {Date} date - A data a ser verificada.
     * @param {number} [days=7] - O número de dias no futuro.
     * @returns {boolean} Verdadeiro se a data estiver no intervalo próximo.
     */
    isUpcoming(date, days = 7) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + days);
        return date >= today && date <= nextWeek;
    }
};
