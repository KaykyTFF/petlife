/**
 * Lógica de renderização da aba de resumo
 */
import { getVaccines, getDeworming, getAppointments, getHealthHistory, getMedicamentos, getPesos } from '../../services/healthService.js';
import { formatDateBR, parseLocalDate } from './pet-utils.js';
import { getResumoSkeleton } from './pet-skeletons.js';
import { StatusBadge } from '../../../components/status-badge.js';

/**
 * Busca dados da API e renderiza o esqueleto e o conteúdo da aba "Resumo" do Pet.
 * Consolida a próxima vacina, próximo vermífugo, e próximas consultas.
 * 
 * @param {HTMLElement} container - O elemento DOM onde o resumo será injetado.
 * @param {string|number} petId - O identificador único do pet no banco de dados.
 */
export const renderResumo = async (container, petId) => {
  container.innerHTML = getResumoSkeleton();
  
  try {
      const [vRes, dRes, aRes, hRes, mRes, pRes] = await Promise.all([
          getVaccines(petId),
          getDeworming(petId),
          getAppointments(petId),
          getHealthHistory(petId),
          getMedicamentos(petId),
          getPesos(petId)
      ]);

      let historyItems = [];
      
      if (hRes) {
          historyItems.push(...hRes.map(h => ({ ...h, badgeType: 'Registro' })));
      }
      if (mRes) {
          historyItems.push(...mRes.map(m => ({
              descricao: `Medicamento registrado: ${m.nome}`,
              data: m.data_inicio,
              badgeType: 'Medicamento',
              typeCode: 'med'
          })));
      }
      if (pRes) {
          historyItems.push(...pRes.map(p => ({
              descricao: `Pesagem registrada: ${p.peso} kg`,
              data: p.data,
              badgeType: 'Peso',
              typeCode: 'peso'
          })));
      }

      // Ordena por data decrescente
      historyItems.sort((a, b) => new Date(b.data || 0) - new Date(a.data || 0));

      const history = historyItems.slice(0, 5);
      const vaccines = vRes || [];
      const deworming = dRes || [];
      const appointments = aRes || [];
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextVaccine = vaccines
        .filter(v => v.proxima_data && !v.concluido)
        .filter(v => parseLocalDate(v.proxima_data) >= today)
        .sort((a, b) => parseLocalDate(a.proxima_data) - parseLocalDate(b.proxima_data))[0];

      const nextDeworming = deworming
        .filter(d => d.proxima_data && !d.concluido)
        .filter(d => parseLocalDate(d.proxima_data) >= today)
        .sort((a, b) => parseLocalDate(a.proxima_data) - parseLocalDate(b.proxima_data))[0];

      const nextAppointment = appointments
        .filter(a => {
            const date = parseLocalDate(a.data);
            const status = (a.status || "").toLowerCase();
            const excludedStatus = ["completed", "realizado", "concluido", "cancelled", "cancelado"];
            return date && !excludedStatus.includes(status) && date >= today;
        })
        .sort((a, b) => {
            const dateA = parseLocalDate(a.data);
            const dateB = parseLocalDate(b.data);
            if (dateA - dateB !== 0) return dateA - dateB;
            return String(a.hora || "").localeCompare(String(b.hora || ""));
        })[0];

      const vDate = nextVaccine ? formatDateBR(nextVaccine.proxima_data) : null;
      const dDate = nextDeworming ? formatDateBR(nextDeworming.proxima_data) : null;
      const aDate = nextAppointment ? formatDateBR(nextAppointment.data) : null;

      container.innerHTML = `
        <div class="space-y-6">
          <div class="card p-5">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="flex flex-col">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Próxima Vacina</p>
                <div class="flex flex-col">
                    <p class="text-sm font-bold text-slate-900">${nextVaccine ? nextVaccine.nome : 'Nenhuma vacina'}</p>
                    ${vDate ? `<p class="text-[10px] text-primary font-bold mt-0.5">${vDate}</p>` : ''}
                </div>
              </div>
              <div class="flex flex-col md:border-l md:border-slate-100 md:pl-6">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Próximo Vermífugo</p>
                <div class="flex flex-col">
                    <p class="text-sm font-bold text-slate-900">${nextDeworming ? nextDeworming.nome_produto : 'Nenhum vermífugo'}</p>
                    ${dDate ? `<p class="text-[10px] text-primary font-bold mt-0.5">${dDate}</p>` : ''}
                </div>
              </div>
              <div class="flex flex-col md:border-l md:border-slate-100 md:pl-6">
                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Próxima Consulta</p>
                <div class="flex flex-col">
                    <p class="text-sm font-bold text-slate-900">${nextAppointment ? nextAppointment.motivo : 'Nenhuma consulta'}</p>
                    ${aDate ? `<p class="text-[10px] text-primary font-bold mt-0.5">${aDate}</p>` : ''}
                </div>
              </div>
            </div>
          </div>

          <div class="card">
            <div class="flex items-center justify-between mb-6">
              <h3 class="card-title">Atividades Recentes</h3>
              <button class="text-xs font-bold text-primary hover:underline" id="view-all-history">Ver tudo</button>
            </div>
            <div class="space-y-4">
              ${history.length > 0 ? history.map(h => `
                <div class="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors border border-transparent hover:border-slate-100">
                  <div class="flex items-center gap-3">
                    <div class="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p class="text-sm font-bold text-slate-900">${h.descricao || h.description}</p>
                      <p class="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-0.5">${formatDateBR(h.data) || h.data}</p>
                    </div>
                  </div>
                  ${StatusBadge(h.badgeType || 'Registro', h.typeCode === 'med' ? 'warning' : (h.typeCode === 'peso' ? 'success' : 'info'))}
                </div>
              `).join('') : '<div class="text-center py-8 text-slate-400 text-sm">Nenhuma atividade recente encontrada.</div>'}
            </div>
          </div>
        </div>
      `;
      document.getElementById('view-all-history')?.addEventListener('click', () => {
        const tab = document.querySelector('[data-tab="historico"]');
        if (tab) tab.click();
      });
  } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="text-center py-10 text-red-500">Erro ao carregar resumo.</div>`;
  }
};
