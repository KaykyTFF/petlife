import { renderAppLayout } from '../../layouts/app-layout.js';
import { withLoading, SkeletonSettings } from '../../components/skeleton.js';
import { getUserSettings, updateUserSettings } from '../services/profileService.js';
import { logoutUser } from '../auth.js';
import { Toast } from '../../components/toast.js';
import { showDeleteAccountModal } from '../modals/index.js';

/**
 * Auxiliar para mostrar mensagens de notificação (toast)
 */
const showToast = (message, type = 'success') => {
  const toastHtml = Toast(message, type);
  const div = document.createElement('div');
  div.innerHTML = toastHtml;
  const toastElement = div.firstElementChild;
  document.body.appendChild(toastElement);
  
  setTimeout(() => {
    toastElement.classList.add('animate-fade-out');
    setTimeout(() => toastElement.remove(), 500);
  }, 3000);
};

/**
 * Função principal de renderização para a página de Configurações
 */
const renderContent = (settings = {}) => `
    <div class="max-w-4xl mx-auto pb-12">
        <div class="page-header !mb-10">
            <div>
                <h1 class="page-title">Configurações</h1>
                <p class="page-subtitle text-lg">Ajuste suas preferências de notificações e interface.</p>
            </div>
        </div>

        <div class="space-y-8 mt-8">
            <!-- Notificações -->
            <section class="card !p-8">
                <div class="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--color-input-border)]">
                    <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-[var(--color-primary)]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
                        </svg>
                    </div>
                    <h3 class="card-title text-lg font-bold">Notificações</h3>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <!-- E-mail -->
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <p class="text-base font-bold text-[var(--color-text)]">Notificações por E-mail</p>
                            <p class="text-sm text-[var(--color-text-muted)] mt-1">Receba alertas importantes na sua caixa de entrada.</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                            <input type="checkbox" id="email_notifications" class="sr-only peer" ${settings.email_notifications ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                        </label>
                    </div>

                    <!-- Vacinas -->
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <p class="text-base font-bold text-[var(--color-text)]">Alertas de Vacinas</p>
                            <p class="text-sm text-[var(--color-text-muted)] mt-1">Lembretes quando as vacinas estiverem próximas.</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                            <input type="checkbox" id="vaccine_notifications" class="sr-only peer" ${settings.vaccine_notifications ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                        </label>
                    </div>

                    <!-- Consultas -->
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <p class="text-base font-bold text-[var(--color-text)]">Alertas de Consultas</p>
                            <p class="text-sm text-[var(--color-text-muted)] mt-1">Lembretes para consultas veterinárias agendadas.</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                            <input type="checkbox" id="appointment_notifications" class="sr-only peer" ${settings.appointment_notifications ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                        </label>
                    </div>

                    <!-- Vermífugo -->
                    <div class="flex items-start justify-between gap-4">
                        <div>
                            <p class="text-base font-bold text-[var(--color-text)]">Alertas de Vermífugo</p>
                            <p class="text-sm text-[var(--color-text-muted)] mt-1">Lembretes para doses de vermífugo e antipulgas.</p>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                            <input type="checkbox" id="deworming_notifications" class="sr-only peer" ${settings.deworming_notifications ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[var(--color-primary)] rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-primary)]"></div>
                        </label>
                    </div>
                </div>

                <div class="mt-10 pt-8 border-t border-[var(--color-input-border)]">
                    <div class="max-w-md">
                        <label for="reminder_lead_time" class="block text-base font-bold text-[var(--color-text)] mb-2">Lembrete com antecedência</label>
                        <p class="text-sm text-[var(--color-text-muted)] mb-4">Escolha quantos dias antes você deseja ser notificado.</p>
                        <select id="reminder_lead_time" class="form-select w-full !rounded-xl !h-12">
                            <option value="1" ${settings.reminder_lead_time == 1 ? 'selected' : ''}>1 dia antes</option>
                            <option value="3" ${settings.reminder_lead_time == 3 ? 'selected' : ''}>3 dias antes</option>
                            <option value="7" ${settings.reminder_lead_time == 7 ? 'selected' : ''}>7 dias antes</option>
                        </select>
                    </div>
                </div>
            </section>



            <!-- Conta e Segurança -->
            <section class="card !p-8">
                <div class="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--color-input-border)]">
                    <div class="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/>
                        </svg>
                    </div>
                    <h3 class="card-title text-lg font-bold text-slate-800">Sair da Conta</h3>
                </div>
                
                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p class="text-base font-bold text-[var(--color-text)]">Encerrar Sessão</p>
                        <p class="text-sm text-[var(--color-text-muted)] mt-1">Sair da sua conta neste dispositivo.</p>
                    </div>
                    <button id="btn-logout" class="btn btn-secondary !bg-slate-50 !text-slate-700 hover:!bg-slate-100 !border-slate-200 !rounded-xl !h-12 px-8 font-bold transition-all">
                        Sair agora
                    </button>
                </div>
            </section>

            <!-- Zona de Perigo -->
            <section class="card !p-8 !border-red-200">
                <div class="flex items-center gap-3 mb-8 pb-4 border-b border-red-100">
                    <div class="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-600">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>
                        </svg>
                    </div>
                    <h3 class="card-title text-lg font-bold text-red-600">Zona de Perigo</h3>
                </div>

                <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <p class="text-base font-bold text-[var(--color-text)]">Excluir Conta Permanentemente</p>
                        <p class="text-sm text-red-500 mt-1">Esta ação apagará todos os seus dados e pets. Não pode ser desfeita.</p>
                    </div>
                    <button id="btn-delete-account" class="btn btn-primary !bg-red-600 hover:!bg-red-700 !border-red-600 !rounded-xl !h-12 px-8 font-bold transition-all">
                        Excluir Conta
                    </button>
                </div>
            </section>
        </div>
    </div>
`;

/**
 * Inicializa a página
 */
const init = async () => {
    renderAppLayout({
        title: 'Configurações',
        content: '<div id="settings-content"></div>'
    });

    try {
        // Carrega Configurações da API
        const settings = await getUserSettings();
        
        const render = () => renderContent(settings);
        
        withLoading('settings-content', SkeletonSettings, render, 500);

        // Aguarda o conteúdo ser renderizado e então anexa os ouvintes de eventos
        setTimeout(() => {
            const container = document.getElementById('settings-content');
            if (!container) return;

            // Lida com a mudança de switches e seletores
            const inputs = container.querySelectorAll('input[type="checkbox"], select');
            inputs.forEach(input => {
                input.addEventListener('change', async (e) => {
                    const id = e.target.id;
                    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
                    
                    try {
                        await updateUserSettings({ [id]: value });
                        showToast('Preferência salva com sucesso!', 'success');
                        
                        // Aplica o tema se alterado
                        if (id === 'theme') {
                            document.documentElement.setAttribute('data-theme', value);
                        }
                    } catch (error) {
                        showToast('Erro ao salvar preferência.', 'danger');
                        // Reverte a interface em caso de erro (opcional)
                    }
                });
            });

            // Lida com o encerramento da sessão (Logout)
            const logoutBtn = document.getElementById('btn-logout');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    logoutUser();
                });
            }

            // Lida com a exclusão da conta
            const deleteAccountBtn = document.getElementById('btn-delete-account');
            if (deleteAccountBtn) {
                deleteAccountBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    showDeleteAccountModal();
                });
            }
        }, 1000); // Wait for withLoading delay + transition

    } catch (error) {
        console.error("Error loading settings:", error);
        showToast('Erro ao carregar configurações.', 'danger');
    }
};

// Start
init();
