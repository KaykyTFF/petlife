import { getCurrentUser } from '../services/authService.js';
import { getMediaUrl } from '../services/apiClient.js';
import { getPets } from '../services/petService.js';
import { getVaccines, getAppointments } from '../services/healthService.js';
import { logoutUser } from '../auth.js';
import { Toast } from '../../components/toast.js';
import { SkeletonProfile } from '../../components/skeleton.js';
import { Logger } from '../utils/logger.js';
import { formatPhoneBR, formatDateBR } from '../utils/formatters.js';
import { showEditProfileModal, showEmailModal, showPasswordModal, showAvatarCropperModal } from '../modals/index.js';

/**
 * Mostra uma mensagem temporária (toast)
 */
const showToast = (message, type = 'success') => {
    const container = document.body;
    const toastHtml = Toast(message, type);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = toastHtml;
    const toastEl = tempDiv.firstElementChild;
    container.appendChild(toastEl);
    
    setTimeout(() => {
        toastEl.classList.add('animate-fade-out');
        setTimeout(() => toastEl.remove(), 500);
    }, 3000);
};



const renderContent = (user, stats) => {
    const initial = (user.first_name || user.username || 'U').charAt(0).toUpperCase();
    const rawAvatar = user.avatar || user.perfil?.avatar;
    const avatarUrl = rawAvatar ? getMediaUrl(rawAvatar) : null;
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username || 'Tutor';
    
    const rawPhone = user.phone || user.perfil?.phone;
    const phone = (rawPhone && rawPhone !== "undefined") ? formatPhoneBR(rawPhone) : 'Não informado';
    
    const rawBirthDate = user.data_nascimento || user.perfil?.data_nascimento;
    const birthDate = (rawBirthDate && rawBirthDate !== "undefined") ? formatDateBR(rawBirthDate) : 'Não informado';
    
    const email = (user.email && user.email !== "undefined") ? user.email : 'E-mail não cadastrado';

    return `
        <div class="max-w-4xl mx-auto space-y-6 pb-12">
          <!-- Page Header -->
          <div class="page-header">
            <div>
              <h1 class="page-title text-3xl font-black text-slate-900 tracking-tight">Meu Perfil</h1>
              <p class="page-subtitle text-slate-500 font-medium mt-1">Gerencie suas informações pessoais e dados da conta.</p>
            </div>
          </div>

          <!-- CARD SUPERIOR: AVATAR E NOME -->
          <div class="card p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-all duration-300 border-slate-100">
            <div class="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <!-- Container do Avatar -->
              <div class="w-24 h-24 rounded-full bg-gradient-to-tr from-[var(--color-primary)] to-[var(--color-accent)] p-0.5 shadow-md flex-shrink-0 relative group cursor-pointer" id="avatar-edit-container">
                <div class="w-full h-full rounded-full bg-white p-1 relative overflow-hidden">
                  <div class="w-full h-full rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-3xl font-black overflow-hidden relative">
                    ${avatarUrl ? `<img src="${avatarUrl}" class="w-full h-full object-cover" alt="Avatar">` : initial}
                    
                    <!-- Sobreposição de Edição -->
                    <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Metadados do Usuário -->
              <div class="space-y-2">
                <h2 class="text-2xl font-black text-slate-900">${fullName}</h2>
                <p class="text-sm font-semibold text-slate-500">${email}</p>
              </div>
            </div>
            
            <button id="open-edit-profile-modal" class="btn-secondary !text-xs !py-2.5 !px-5 rounded-xl shadow-sm hover:!bg-slate-50 hover:!border-slate-300 font-bold shrink-0">
              Editar Perfil
            </button>
          </div>

          <!-- GRADE DE DUAS COLUNAS -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- COLUNA ESQUERDA -->
            <div class="space-y-6">
              <!-- CARD: INFORMAÇÕES PESSOAIS -->
              <div class="card p-6 md:p-8 hover:shadow-md transition-all duration-300 border-slate-100 space-y-6">
                <div class="border-b border-slate-100 pb-3">
                  <h3 class="text-base font-bold text-slate-900">Informações Pessoais</h3>
                </div>
                
                <div class="space-y-5">
                  <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Nome Completo</span>
                    <span class="text-sm font-bold text-slate-700">${fullName}</span>
                  </div>
                  <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Telefone</span>
                    <span class="text-sm font-bold text-slate-700">${phone}</span>
                  </div>

                </div>
              </div>

              <!-- CARD: ACESSO E SEGURANÇA -->
              <div class="card p-6 md:p-8 hover:shadow-md transition-all duration-300 border-slate-100 space-y-6">
                <div class="border-b border-slate-100 pb-3">
                  <h3 class="text-base font-bold text-slate-900">Acesso e Segurança</h3>
                </div>
                
                <div class="space-y-5">
                  <div class="flex items-center justify-between gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-slate-50 transition-all duration-300">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div class="min-w-0 flex-1">
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">E-mail de Acesso</span>
                        <span class="text-xs font-bold text-slate-700 truncate block">${email}</span>
                      </div>
                    </div>
                    <button id="open-email-modal" class="btn-secondary !text-[10px] !py-1.5 !px-3.5 !rounded-lg border-slate-200 hover:border-slate-300 shadow-sm shrink-0 font-bold">
                      Alterar
                    </button>
                  </div>

                  <div class="flex items-center justify-between gap-4 p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:bg-slate-50 transition-all duration-300">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <div>
                        <span class="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Senha da Conta</span>
                        <span class="text-xs font-bold text-slate-700 block">••••••••••••</span>
                      </div>
                    </div>
                    <button id="open-password-modal" class="btn-secondary !text-[10px] !py-1.5 !px-3.5 !rounded-lg border-slate-200 hover:border-slate-300 shadow-sm shrink-0 font-bold">
                      Alterar
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- COLUNA DIREITA -->
            <div class="space-y-6">
              <!-- CARD: ESTATÍSTICAS -->
              <div class="card p-6 md:p-8 hover:shadow-md transition-all duration-300 border-slate-100 space-y-6">
                <div class="border-b border-slate-100 pb-3">
                  <h3 class="text-base font-bold text-slate-900">Estatísticas</h3>
                </div>
                
                <div class="space-y-4">
                  <!-- Stat 1: Pets -->
                  <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all duration-300">
                    <div class="flex items-center gap-3.5">
                      <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-[var(--color-primary)] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div>
                        <span class="text-sm font-bold text-slate-700 block">Pets cadastrados</span>
                        <span class="text-[10px] text-slate-400 font-medium">Animais sob seus cuidados</span>
                      </div>
                    </div>
                    <span class="text-2xl font-black text-[var(--color-primary)] mr-1">${stats.petsCount}</span>
                  </div>

                  <!-- Stat 2: Vacinas -->
                  <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all duration-300">
                    <div class="flex items-center gap-3.5">
                      <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-[var(--color-primary)] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <span class="text-sm font-bold text-slate-700 block">Vacinas registradas</span>
                        <span class="text-[10px] text-slate-400 font-medium">Histórico de imunizações</span>
                      </div>
                    </div>
                    <span class="text-2xl font-black text-[var(--color-primary)] mr-1">${stats.vaccinesCount}</span>
                  </div>

                  <!-- Stat 3: Consultas -->
                  <div class="flex items-center justify-between p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-all duration-300">
                    <div class="flex items-center gap-3.5">
                      <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 text-[var(--color-primary)] flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <span class="text-sm font-bold text-slate-700 block">Consultas realizadas</span>
                        <span class="text-[10px] text-slate-400 font-medium">Consultas médicas concluídas</span>
                      </div>
                    </div>
                    <span class="text-2xl font-black text-[var(--color-primary)] mr-1">${stats.appointmentsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

    `;
};

const setupProfileEvents = (user) => {
    // 1. Modal Editar Perfil
    const openEditBtn = document.getElementById('open-edit-profile-modal');
    if (openEditBtn) {
        openEditBtn.addEventListener('click', () => {
            showEditProfileModal(user, () => {
                initProfile();
            });
        });
    }

    // Ouvinte de Upload de Avatar
    const avatarContainer = document.getElementById('avatar-edit-container');
    if (avatarContainer) {
        avatarContainer.addEventListener('click', () => {
            showAvatarCropperModal(null, () => {
                // Atualiza o perfil após salvar o avatar
                initProfile();
            });
        });
    }

    // 2. Lida com o Modal de E-mail
    const openEmailBtn = document.getElementById('open-email-modal');
    if (openEmailBtn) {
        openEmailBtn.addEventListener('click', () => {
            showEmailModal();
        });
    }

    // 3. Lida com o Modal de Senha
    const openPasswordBtn = document.getElementById('open-password-modal');
    if (openPasswordBtn) {
        openPasswordBtn.addEventListener('click', () => {
            showPasswordModal();
        });
    }
};

export const initProfile = async () => {
    const root = document.getElementById('profile-content');
    if (!root) return;

    // Mostra o skeleton se for o primeiro carregamento
    if (root.innerHTML === "" || root.querySelector('.skeleton-card')) {
        root.innerHTML = SkeletonProfile();
    }
    
    Logger.info('Perfil', 'Carregando dados do usuário...');

    try {
        const [user, petsData, vaccinesData, appointmentsData] = await Promise.all([
            getCurrentUser(),
            getPets(),
            getVaccines(),
            getAppointments()
        ]);
        
        if (!user) {
            throw new Error("Usuário não encontrado.");
        }

        console.log("DEBUG - User object loaded in profile page:", user);
        localStorage.setItem('user', JSON.stringify(user));

        // Analisa a quantidade de Pets
        let pets = [];
        if (Array.isArray(petsData)) {
            pets = petsData;
        } else if (petsData && Array.isArray(petsData.results)) {
            pets = petsData.results;
        }
        
        // Parse Vaccines count
        let vaccines = [];
        if (Array.isArray(vaccinesData)) {
            vaccines = vaccinesData;
        } else if (vaccinesData && Array.isArray(vaccinesData.results)) {
            vaccines = vaccinesData.results;
        }

        // Parse Appointments count
        let appointments = [];
        if (Array.isArray(appointmentsData)) {
            appointments = appointmentsData;
        } else if (appointmentsData && Array.isArray(appointmentsData.results)) {
            appointments = appointmentsData.results;
        }
        
        const completedAppointments = appointments.filter(a => 
            ['concluido', 'realizado', 'completed'].includes(a.status?.toLowerCase())
        );

        const stats = {
            petsCount: pets.length,
            vaccinesCount: vaccines.length,
            appointmentsCount: completedAppointments.length
        };

        Logger.info('Perfil', 'Dados do usuário recebidos', { userId: user.id });

        // Renderiza o conteúdo
        root.innerHTML = renderContent(user, stats);
        setupProfileEvents(user);
        root.classList.add('animate-fade-in');

    } catch (err) {
        Logger.error('Perfil', 'Falha ao carregar perfil', err);
        console.error('Failed to load profile:', err);
        root.innerHTML = `
            <div class="empty-state max-w-lg mx-auto mt-10">
                <div class="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-slate-800">Erro ao carregar perfil</h3>
                <p class="text-slate-500 text-sm mt-1">Sua sessão pode ter expirado ou há um erro de conexão.</p>
                <button onclick="window.location.reload()" class="btn-primary mt-6">Tentar novamente</button>
            </div>
        `;
    }
};
