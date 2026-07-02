import { Modal } from '../../components/modal.js';

/**
 * Gerenciador central de modais.
 * Responsável por criar e manipular o container global de modais,
 * bem como abrir e fechar instâncias específicas.
 */
export const ModalManager = {
    /**
     * Obtém ou cria o container global para os modais no DOM.
     * @returns {HTMLElement} O elemento do container de modais.
     */
    getContainer() {
        let container = document.getElementById('global-modal-container');
        // se o container mestre não existe, cria ele injetando direto no body
        if (!container) {
            container = document.createElement('div');
            container.id = 'global-modal-container';
            document.body.appendChild(container);

            // Observador para travar o scroll da página enquanto houver modais abertos
            const observer = new MutationObserver(() => {
                if (container.childElementCount > 0) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            });
            observer.observe(container, { childList: true });
        }
        return container;
    },

    /**
     * Abre um modal com um ID, título e conteúdo específicos.
     * @param {string} id - O ID do modal.
     * @param {string} title - O título do modal.
     * @param {string} content - O conteúdo HTML interno do modal.
     * @returns {Object} Um objeto contendo o container e a instância do modal aberto.
     */
    open(id, title, content) {
        const container = this.getContainer();
        
        // Remove modal existente com mesmo id se houver
        const existingModal = document.getElementById(id);
        if (existingModal) existingModal.remove();

        // Injeta usando insertAdjacentHTML para empilhar modais em vez de sobrescrever
        container.insertAdjacentHTML('beforeend', Modal({ id, title, content }));
        
        const modal = document.getElementById(id);
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        
        return { container, modal };
    },

    /**
     * Fecha um modal específico pelo seu ID.
     * @param {string} id - O ID do modal a ser fechado.
     */
    close(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.remove();
        }
    }
};
