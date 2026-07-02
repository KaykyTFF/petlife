import { Logger } from './logger.js';

/**
 * Inicializa o monitoramento global de erros para capturar exceções não tratadas e promises rejeitadas.
 */
export function initErrorLogger() {
    if (!Logger.isDebugEnabled()) return;

    window.onerror = function (message, source, lineno, colno, error) {
        const page = document.title;
        const route = window.location.pathname;
        
        Logger.error('Window Global', error?.name || 'Error', {
            page,
            route,
            message: message,
            file: source,
            line: lineno,
            column: colno,
            stack: error?.stack || 'No stack trace available'
        });

        // Retorna false pra gente não matar o erro no console original do navegador
        return false;
    };

    window.onunhandledrejection = function (event) {
        const page = document.title;
        const route = window.location.pathname;
        
        Logger.error('Promise Rejection', event.reason?.name || 'UnhandledRejection', {
            page,
            route,
            message: event.reason?.message || String(event.reason),
            stack: event.reason?.stack || 'No stack trace available'
        });
    };
    
    Logger.info('Error Logger', 'Global error tracking initialized.');
}
