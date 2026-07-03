/**
 * Lógica de gerenciamento de abas
 */
import { renderResumo } from './pet-summary.js';
import { renderVacinas } from './vaccines-tab.js';
import { renderVermifugo } from './deworming-tab.js';
import { renderConsultas } from './appointments-tab.js';
import { renderHistorico } from './history-tab.js';
import { renderPeso } from './weight-tab.js';
import { renderMedicamentos } from './medicamentos-tab.js';

export const renderTabContent = (tab, petId) => {
  const content = document.getElementById('tab-content');
  if (!content) return;
  
  switch(tab) {
    case 'resumo': renderResumo(content, petId); break;
    case 'vacinas': renderVacinas(content, petId); break;
    case 'vermifugo': renderVermifugo(content, petId); break;
    case 'consultas': renderConsultas(content, petId); break;
    case 'peso': renderPeso(content, petId); break;
    case 'medicamentos': renderMedicamentos(content, petId); break;
    case 'historico': renderHistorico(content, petId); break;
  }
};

export const initTabs = (petId) => {
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'resumo';

  const tabs = document.querySelectorAll('.tab-btn');
  let activeTabSet = false;

  tabs.forEach(tab => {
    if (tab.dataset.tab === initialTab) {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeTabSet = true;
    }
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      renderTabContent(tab.dataset.tab, petId);
    });
  });

  // Aba padrão
  renderTabContent(activeTabSet ? initialTab : 'resumo', petId);
};
