import { renderAppLayout } from '../../layouts/app-layout.js';
import { withLoading, SkeletonNotifications } from '../../components/skeleton.js';
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService.js';
import { getMediaUrl } from '../services/apiClient.js';
import { Logger } from '../utils/logger.js';

/**
 * Ícones por tipo
 */
const ICONS = {
    vaccine: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    deworming: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.691.31a2 2 0 00-1.155 1.815V21h8.56a2 2 0 001.996-1.832l.557-7.14a2 2 0 00-1.022-1.832l-2.387-.477a6 6 0 00-3.86.517l-.691.31a2 2 0 00-1.155 1.815V21', // simplified
    appointment: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
};

const COLORS = {
    atrasado: 'text-red-600 bg-red-50 border-red-100',
    próximo: 'text-amber-600 bg-amber-50 border-amber-100',
    agendado: 'text-blue-600 bg-blue-50 border-blue-100',
    default: 'text-slate-600 bg-slate-50 border-slate-100'
};

/**
 * Renderiza o cartão de notificação individual
 */
const NotificationCard = (n) => {
    const colorClass = COLORS[n.status] || COLORS.default;
    const isRead = n.is_read;
    
    // Formata a data adequadamente
    const date = new Date(n.data + 'T12:00:00');
    const formattedDate = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });

    return `
        <div class="card p-5 flex gap-4 transition-all duration-200 group ${isRead ? 'opacity-75 grayscale-[0.3]' : 'bg-white shadow-sm border-slate-200'}" data-key="${n.chave}">
            <!-- Foto ou Inicial do Pet -->
            <div class="flex-shrink-0">
                <div class="w-12 h-12 rounded-xl overflow-hidden border-2 border-slate-100 shadow-sm bg-slate-50">
                    <img src="${n.pet.foto ? getMediaUrl(n.pet.foto) : 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100&h=100&fit=crop'}" class="w-full h-full object-cover" alt="${n.pet.nome}">
                </div>
            </div>

            <!-- Conteúdo -->
            <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1 gap-2">
                    <h3 class="font-bold text-[var(--color-text)] truncate text-sm sm:text-base">
                        ${n.titulo}
                    </h3>
                    <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colorClass}">
                        ${n.status}
                    </span>
                </div>
                <p class="text-sm text-[var(--color-text-muted)] leading-relaxed">
                    ${n.descricao}
                </p>
                <div class="flex items-center gap-3 mt-3">
                    <span class="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        ${formattedDate}
                    </span>
                    <span class="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        ${n.pet.nome}
                    </span>
                </div>
            </div>

            <!-- Ações -->
            <div class="flex flex-col items-center justify-between gap-2">
                ${!isRead ? `<div class="w-2.5 h-2.5 bg-[#006F93] rounded-full shadow-[0_0_8px_rgba(0,111,147,0.4)] animate-pulse"></div>` : '<div class="w-2.5 h-2.5"></div>'}
                
                ${!isRead ? `
                    <button class="btn-mark-read p-2 text-slate-300 hover:text-[#006F93] hover:bg-slate-50 rounded-lg transition-all" title="Marcar como lida">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </button>
                ` : ''}
            </div>
        </div>
    `;
};

/**
 * Renderiza o conteúdo completo da página
 */
const renderContent = (notifications = []) => {
    if (notifications.length === 0) {
        return `
            <div class="max-w-3xl mx-auto">
                <div class="page-header !mb-12">
                    <div>
                        <h1 class="page-title">Notificações</h1>
                        <p class="page-subtitle">Avisos e lembretes importantes para seus pets.</p>
                    </div>
                </div>

                <div class="empty-state py-20 bg-white border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center text-center px-6">
                    <div class="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                    </div>
                    <h3 class="text-xl font-bold text-slate-900 mb-2">Tudo em dia por aqui!</h3>
                    <p class="text-slate-500 max-w-sm mx-auto">Não encontramos nenhuma notificação no momento. Seus pets estão muito bem cuidados!</p>
                </div>
            </div>
        `;
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return `
        <div class="max-w-3xl mx-auto pb-12">
            <div class="page-header !mb-10">
                <div>
                    <h1 class="page-title">Notificações</h1>
                    <p class="page-subtitle">Você tem ${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}.</p>
                </div>
                ${unreadCount > 0 ? `
                    <button id="btn-mark-all-read" class="text-sm font-bold text-[#006F93] hover:text-[#005B78] flex items-center gap-1.5 px-4 py-2 bg-[#006F93]/5 rounded-xl transition-all">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Marcar todas como lidas
                    </button>
                ` : ''}
            </div>

            <div class="space-y-4">
                ${notifications.map(n => NotificationCard(n)).join('')}
            </div>
        </div>
    `;
};

/**
 * Inicializa a página
 */
const init = async () => {
    renderAppLayout({
        title: 'Notificações',
        content: '<div id="notifications-content"></div>'
    });

    try {
        Logger.info('Notificações', 'Carregando lista de notificações...');
        const notifications = await getNotifications();
        Logger.info('Notificações', 'Notificações recebidas', { count: notifications.length });
        
        const render = () => renderContent(notifications);
        
        withLoading('notifications-content', SkeletonNotifications, render, 600);

        // Anexa ouvintes de eventos
        setTimeout(() => {
            const container = document.getElementById('notifications-content');
            if (!container) return;

            // Marca como lida
            container.addEventListener('click', async (e) => {
                const btn = e.target.closest('.btn-mark-read');
                if (btn) {
                    const card = btn.closest('.card');
                    const key = card.dataset.key;
                    
                    try {
                        await markNotificationAsRead(key);
                        // Atualiza a interface otimisticamente
                        card.classList.add('opacity-75', 'grayscale-[0.3]');
                        btn.remove();
                        const dot = card.querySelector('.w-2.5.h-2.5');
                        if (dot) dot.classList.remove('bg-[#006F93]', 'animate-pulse');
                        
                        // Dispara evento para atualizar o contador do cabeçalho
                        window.dispatchEvent(new CustomEvent('notifications-updated'));
                        Logger.success('Notificações', 'Notificação marcada como lida', { key });
                    } catch (err) {
                        Logger.error('Notificações', 'Erro ao marcar como lida', err);
                        console.error("Error marking as read:", err);
                    }
                }
            });

            // Marca todas como lidas
            const markAllBtn = document.getElementById('btn-mark-all-read');
            if (markAllBtn) {
                markAllBtn.addEventListener('click', async () => {
                    try {
                        await markAllNotificationsAsRead();
                        // Renderiza novamente
                        const updated = await getNotifications();
                        container.innerHTML = renderContent(updated);
                        window.dispatchEvent(new CustomEvent('notifications-updated'));
                    } catch (err) {
                        console.error("Error marking all read:", err);
                    }
                });
            }
        }, 1000);

    } catch (error) {
        console.error("Error loading notifications:", error);
    }
};

init();
