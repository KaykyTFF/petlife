/**
 * Utilitário para logging de eventos, erros e depuração.
 */
export class Logger {
    /**
     * Verifica se o modo de depuração está ativado.
     * @returns {boolean} Verdadeiro se ativado.
     */
    static isDebugEnabled() {
        return import.meta.env.VITE_DEBUG === 'true';
    }

    /**
     * Obtém o armazenamento de logs da sessão atual.
     * @returns {Array} A lista de logs.
     */
    static getStorage() {
        if (!window.__LIFEPET_DEBUG__) {
            window.__LIFEPET_DEBUG__ = [];
        }
        return window.__LIFEPET_DEBUG__;
    }

    /**
     * Adiciona uma nova entrada no log.
     * @param {string} type - O tipo do log (INFO, WARN, ERROR, etc).
     * @param {string} title - O título ou ação.
     * @param {object} details - Detalhes adicionais.
     */
    static addEntry(type, title, details) {
        if (!this.isDebugEnabled()) return;
        
        const storage = this.getStorage();
        const entry = {
            timestamp: new Date().toISOString(),
            type,
            title,
            details
        };
        
        storage.unshift(entry);
        
        // se passar de 100 logs na memória, dá um pop no mais antigo pra não estourar a RAM do browser
        if (storage.length > 100) {
            storage.pop();
        }
    }

    /**
     * Registra uma informação.
     * @param {string} context - O contexto do log.
     * @param {string} message - A mensagem.
     * @param {object} [details={}] - Detalhes adicionais.
     */
    static info(context, message, details = {}) {
        if (!this.isDebugEnabled()) return;
        console.info(`[INFO] [${context}]`, message, details);
        this.addEntry('INFO', `${context} - ${message}`, details);
    }

    /**
     * Registra um aviso.
     * @param {string} context - O contexto do log.
     * @param {string} message - A mensagem.
     * @param {object} [details={}] - Detalhes adicionais.
     */
    static warn(context, message, details = {}) {
        if (!this.isDebugEnabled()) return;
        console.warn(`[WARN] [${context}]`, message, details);
        this.addEntry('WARNING', `${context} - ${message}`, details);
    }

    /**
     * Registra um erro.
     * @param {string} context - O contexto do log.
     * @param {string} message - A mensagem.
     * @param {object} [details={}] - Detalhes adicionais.
     */
    static error(context, message, details = {}) {
        if (!this.isDebugEnabled()) return;
        console.error(`[ERROR] [${context}]`, message, details);
        this.addEntry('ERROR', `${context} - ${message}`, details);
    }

    /**
     * Registra um sucesso.
     * @param {string} context - O contexto do log.
     * @param {string} message - A mensagem.
     * @param {object} [details={}] - Detalhes adicionais.
     */
    static success(context, message, details = {}) {
        if (!this.isDebugEnabled()) return;
        console.log(`[SUCCESS] [${context}]`, message, details);
        this.addEntry('SUCCESS', `${context} - ${message}`, details);
    }

    /**
     * Registra uma chamada de API.
     * @param {string} method - O método HTTP.
     * @param {string} endpoint - A URL/Endpoint.
     * @param {any} payload - Os dados enviados.
     * @param {number} status - O status de resposta HTTP.
     * @param {number} duration - A duração em milissegundos.
     * @param {any} responseBody - O corpo da resposta.
     */
    static api(method, endpoint, payload, status, duration, responseBody) {
        if (!this.isDebugEnabled()) return;
        const details = {
            method, endpoint, payload, status, duration, response: responseBody
        };
        console.log(`[API] ${method} ${endpoint} - ${status} (${duration}ms)`);
        
        const type = status >= 400 ? 'ERROR' : 'API';
        this.addEntry(type, `${method} ${endpoint}`, details);
    }

    /**
     * Registra uma ação de autenticação.
     * @param {string} action - A ação (ex: Login, Logout).
     * @param {object} [extras={}] - Dados adicionais.
     */
    static auth(action, extras = {}) {
        if (!this.isDebugEnabled()) return;
        console.log(`[AUTH] ${action}`, extras);
        this.addEntry('AUTH', action, extras);
    }

    /**
     * Exporta os logs armazenados para um arquivo JSON.
     */
    static exportLogs() {
        const data = JSON.stringify(this.getStorage(), null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `debug-report-${new Date().getTime()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    /**
     * Limpa os logs em memória.
     */
    static clearLogs() {
        window.__LIFEPET_DEBUG__ = [];
    }
}
