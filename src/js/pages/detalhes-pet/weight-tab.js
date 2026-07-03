/**
 * Módulo responsável pela aba de Controle de Peso do pet
 * Inclui renderização da lista de pesos, cálculo de métricas (ganho/perda)
 * e o gráfico de evolução temporal gerado com Chart.js.
 */
import { getPesos } from '../../services/healthService.js';
import { getPetDetails } from '../../services/petService.js';
import { Logger } from '../../utils/logger.js';
import { safeText, formatDateBR } from './pet-utils.js';
import { getTabSkeleton } from './pet-skeletons.js';
import { renderEmptySection } from './pet-empty-states.js';
import Chart from 'chart.js/auto';

/**
 * Função principal para renderizar a aba de Pesos no DOM
 * @param {HTMLElement} container - Elemento onde a aba será montada
 * @param {number|string} petId - ID do pet atual
 */
export const renderPeso = async (container, petId) => {
  // Exibe skeleton loading enquanto aguarda API
  container.innerHTML = getTabSkeleton();
  try {
      // Faz requisições paralelas: busca o histórico de pesos E os detalhes do pet (para saber a meta)
      const [items, pet] = await Promise.all([
          getPesos(petId),
          getPetDetails(petId)
      ]);
      Logger.info('Detalhes Pet', 'Pesos carregados', items);
      
      // Captura a meta de peso (se o pet possuir)
      const metaPeso = pet?.meta_peso ? parseFloat(pet.meta_peso) : null;
      
      // Cria o bloco de sumário com estatísticas (Atual, Variação, Meta)
      let summaryHtml = '';
      if (items && items.length > 0) {
          // Calcula diferença de peso (peso atual vs peso inicial)
          const currentWeight = parseFloat(items[0].peso);
          const initialWeight = parseFloat(items[items.length - 1].peso);
          const totalDiff = (currentWeight - initialWeight).toFixed(2);

          
          let totalDiffHtml = '';
          if (totalDiff > 0) {
              totalDiffHtml = `<span class="text-sm font-bold text-[var(--color-primary)] bg-blue-50 px-3 py-1 rounded-full">+${totalDiff}kg desde o início</span>`;
          } else if (totalDiff < 0) {
              totalDiffHtml = `<span class="text-sm font-bold text-[var(--color-primary)] bg-blue-50 px-3 py-1 rounded-full">${totalDiff}kg desde o início</span>`;
          } else {
              totalDiffHtml = `<span class="text-sm font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full">Sem alteração total</span>`;
          }

          let metaCardHtml = '';
          if (metaPeso) {
              metaCardHtml = `
                <div class="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-center relative group shadow-sm">
                  <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Meta de Peso</p>
                  <p class="text-2xl font-black text-slate-900">${metaPeso}<span class="text-sm text-slate-500 font-medium ml-1">kg</span></p>
                  <button class="absolute top-3 right-3 p-1.5 text-slate-400 hover:text-[var(--color-primary)] hover:bg-blue-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100" id="btn-meta-peso" title="Editar Meta">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              `;
          } else {
              metaCardHtml = `
                <div class="bg-white p-4 rounded-xl border border-dashed border-slate-200 flex flex-col justify-center relative group shadow-sm cursor-pointer hover:bg-slate-50 transition-colors" id="btn-meta-peso">
                  <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1 pointer-events-none">Meta</p>
                  <div class="mt-1 flex items-center justify-start text-slate-400 group-hover:text-[var(--color-primary)] pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                </div>
              `;
          }

          summaryHtml = `
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div class="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-center shadow-sm">
                <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Peso Atual</p>
                <p class="text-2xl font-black text-slate-900">${currentWeight}<span class="text-sm text-slate-500 font-medium ml-1">kg</span></p>
              </div>
              <div class="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-center shadow-sm">
                <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Peso Inicial</p>
                <p class="text-2xl font-black text-slate-900">${initialWeight}<span class="text-sm text-slate-500 font-medium ml-1">kg</span></p>
              </div>
              ${metaCardHtml}
              <div class="bg-white p-4 rounded-xl border border-slate-200 flex flex-col justify-center items-start shadow-sm">
                <p class="text-xs text-slate-500 font-bold uppercase tracking-wider mb-2">Variação Total</p>
                ${totalDiffHtml}
              </div>
            </div>
            <div class="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-8 relative h-[300px] w-full">
                <canvas id="weightChart"></canvas>
            </div>
          `;
      }
      
      container.innerHTML = `
        <div class="card">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 class="card-title">Controle de Peso</h3>
              <p class="text-xs text-slate-500 font-medium mt-1">Histórico e evolução do peso do seu pet.</p>
            </div>
            <div class="flex gap-2">
                ${(!items || items.length === 0) ? `<button class="btn-secondary !text-xs" id="btn-meta-peso">Definir Meta</button>` : ''}
                <button class="btn-primary !text-xs" id="btn-add-peso">Registrar Peso</button>
            </div>
          </div>
          
          ${!items || items.length === 0 ? renderEmptySection('Nenhum peso registrado', 'btn-add-peso-empty') : `
            ${summaryHtml}
            <h4 class="text-sm font-bold text-slate-900 mb-4 uppercase tracking-wider">Histórico Detalhado</h4>
            <div class="space-y-3">
              ${items.map((p, index) => {
                    const isLatest = index === 0;
                    const dataFormatada = formatDateBR(p.data);
                    const isMetaBatida = p.meta_atingida;
                    
                    let diffHtml = '';
                    if (index < items.length - 1) {
                        const prevWeight = items[index + 1].peso;
                        const diff = (p.peso - prevWeight).toFixed(2);
                        if (diff > 0) {
                            diffHtml = `<span class="text-[10px] font-bold text-[var(--color-primary)] bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg> +${diff}kg</span>`;
                        } else if (diff < 0) {
                            diffHtml = `<span class="text-[10px] font-bold text-[var(--color-primary)] bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg> ${diff}kg</span>`;
                        } else {
                            diffHtml = `<span class="text-[10px] font-bold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">= Manteve</span>`;
                        }
                    }

                  return `
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white rounded-xl border ${isMetaBatida ? 'border-green-300 ring-2 ring-green-100 bg-green-50/30' : 'border-slate-100'} shadow-sm relative group ${isLatest && !isMetaBatida ? 'ring-1 ring-[var(--color-primary)]' : ''}">
                      <div class="flex items-center gap-4">
                        <div class="w-10 h-10 ${isLatest ? 'bg-blue-50 text-[var(--color-primary)]' : 'bg-slate-50 text-slate-400'} ${isMetaBatida ? '!bg-green-100 !text-green-600' : ''} rounded-lg flex items-center justify-center border border-slate-100 flex-shrink-0">
                          ${isMetaBatida ? `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>` : `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>`}
                        </div>
                        <div>
                          <div class="flex items-center gap-2">
                            <p class="text-sm font-black text-slate-900">${p.peso} kg</p>
                            ${diffHtml}
                            ${isMetaBatida ? `<span class="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-200">Meta Atingida!</span>` : ''}
                          </div>
                          <p class="text-[10px] text-slate-500 font-medium uppercase tracking-tight mt-0.5 leading-relaxed">
                            Registrado em: ${dataFormatada} ${p.observacoes ? `· ${p.observacoes}` : ''}
                          </p>
                        </div>
                      </div>
                      <div class="flex items-center gap-3 mt-4 sm:mt-0">
                        <button class="btn-secondary !p-2 !text-red-600 hover:!bg-red-50 !border-red-100 btn-delete-item opacity-0 group-hover:opacity-100 transition-opacity" data-id="${p.id}" data-type="peso" title="Excluir">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                  `;
                  }).join('')}
            </div>
          `}
        </div>
      `;
      
      // Initialize Chart if we have items
      if (items && items.length > 0) {
          const chartItems = [...items].reverse();
          const labels = chartItems.map(item => formatDateBR(item.data).substring(0, 5));
          const dataPoints = chartItems.map(item => item.peso);
          
          const datasets = [{
              label: 'Peso Atual (kg)',
              data: dataPoints,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 3,
              pointBackgroundColor: '#fff',
              pointBorderColor: '#3b82f6',
              pointBorderWidth: 2,
              pointRadius: 5,
              pointHoverRadius: 7,
              fill: true,
              tension: 0.3
          }];
          
          if (metaPeso) {
              const metaPoints = dataPoints.map(() => metaPeso);
              datasets.push({
                  label: 'Meta (kg)',
                  data: metaPoints,
                  borderColor: '#f59e0b', // amber-500
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderDash: [5, 5],
                  pointRadius: 0,
                  pointHoverRadius: 0,
                  fill: false,
                  tension: 0
              });
          }
          
          const ctx = document.getElementById('weightChart');
          if (ctx) {
              new Chart(ctx, {
                  type: 'line',
                  data: {
                      labels: labels,
                      datasets: datasets
                  },
                  options: {
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                          legend: {
                              display: metaPeso ? true : false,
                              position: 'top',
                              align: 'end',
                              labels: { boxWidth: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } }
                          },
                          tooltip: {
                              backgroundColor: '#1e293b',
                              titleFont: { size: 13 },
                              bodyFont: { size: 14, weight: 'bold' },
                              padding: 12,
                              displayColors: true,
                              callbacks: {
                                  label: function(context) {
                                      return context.dataset.label + ': ' + context.parsed.y + ' kg';
                                  }
                              }
                          }
                      },
                      scales: {
                          y: {
                              beginAtZero: false,
                              grid: {
                                  color: '#f1f5f9',
                                  drawBorder: false,
                              },
                              border: { display: false },
                              ticks: {
                                  color: '#64748b',
                                  font: { size: 11, weight: '500' },
                                  padding: 10,
                                  callback: function(value) {
                                      return value + 'kg';
                                  }
                              }
                          },
                          x: {
                              grid: { display: false },
                              border: { display: false },
                              ticks: {
                                  color: '#64748b',
                                  font: { size: 11, weight: '500' },
                                  padding: 10
                              }
                          }
                      }
                  }
              });
          }
      }
      
  } catch (err) {
      console.error(err);
      container.innerHTML = `<div class="text-center py-10 text-red-500">Erro ao carregar histórico de peso.</div>`;
  }
};
