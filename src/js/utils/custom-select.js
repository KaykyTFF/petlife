/**
 * Inicializador de Dropdown Select Customizado e Animado.
 * Substitui os elementos HTML select nativos por dropdowns estilizados.
 */
export const initCustomSelects = () => {
  const selects = document.querySelectorAll('select:not(.custom-select-initialized)');
  
  selects.forEach(select => {
    // Marca como inicializado
    select.classList.add('custom-select-initialized');
    
    // Oculta o select nativo mas permite foco/validação (acessibilidade)
    select.style.position = 'absolute';
    select.style.opacity = '0';
    select.style.pointerEvents = 'none';
    select.style.height = '0';
    select.style.width = '100%';
    select.style.zIndex = '-1';
    
    // Cria o wrapper (container)
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';
    
    // Cria o HTML do botão gatilho (trigger)
    const isDisabled = select.disabled;
    const triggerClass = `custom-select-trigger ${isDisabled ? 'disabled' : ''}`;
    
    // Cria os elementos base do wrapper: botão gatilho e container de opções
    wrapper.innerHTML = `
      <button type="button" class="${triggerClass}" ${isDisabled ? 'disabled' : ''}>
        <span></span>
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div class="custom-select-options"></div>
    `;
    
    select.parentNode.insertBefore(wrapper, select.nextSibling);
    
    const triggerBtn = wrapper.querySelector('.custom-select-trigger');
    const optionsMenu = wrapper.querySelector('.custom-select-options');
    const triggerSpan = triggerBtn.querySelector('span');
    
    // Função auxiliar para reconstruir a lista de opções dinamicamente
    const rebuildOptions = () => {
      const options = Array.from(select.options);
      const selectedOption = select.options[select.selectedIndex];
      const placeholderText = selectedOption ? selectedOption.text : 'Selecione...';
      const hasSelection = selectedOption && selectedOption.value !== "";
      
      triggerSpan.innerText = placeholderText;
      triggerSpan.className = hasSelection ? 'text-slate-900' : 'text-slate-400';
      
      optionsMenu.innerHTML = options.map((opt, idx) => {
        if (opt.disabled) return '';
        const isSelected = idx === select.selectedIndex;
        return `
          <div class="custom-select-option ${isSelected ? 'selected' : ''}" data-value="${opt.value}" data-index="${idx}">
            <span>${opt.text}</span>
            <svg class="check-icon h-4 w-4 text-[#006F93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        `;
      }).join('');
      
      const optionItems = optionsMenu.querySelectorAll('.custom-select-option');
      optionItems.forEach(item => {
        item.addEventListener('click', (e) => {
          e.stopPropagation();
          const value = item.dataset.value;
          const index = parseInt(item.dataset.index, 10);
          
          // Atualiza o select original
          select.selectedIndex = index;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          
          // Atualiza o texto do gatilho
          triggerSpan.innerText = item.querySelector('span').innerText;
          triggerSpan.className = 'text-slate-900';
          
          // Atualiza a classe selecionada (selected)
          optionItems.forEach(opt => opt.classList.remove('selected'));
          item.classList.add('selected');
          
          // Fecha o menu
          optionsMenu.classList.remove('open');
          triggerBtn.classList.remove('open');
        });
      });
    };
    
    // Reconstrói a lista de opções inicialmente
    rebuildOptions();
    
    // Alterna a abertura do menu
    triggerBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (select.disabled) return;
      
      // Fecha qualquer outro select customizado aberto
      document.querySelectorAll('.custom-select-options.open').forEach(menu => {
        if (menu !== optionsMenu) {
          menu.classList.remove('open');
          menu.previousElementSibling.classList.remove('open');
        }
      });
      
      const isOpen = optionsMenu.classList.contains('open');
      if (isOpen) {
        optionsMenu.classList.remove('open');
        triggerBtn.classList.remove('open');
      } else {
        optionsMenu.classList.add('open');
        triggerBtn.classList.add('open');
      }
    });
    
    // Observa o select original para mudanças no estado de desabilitado ou nas opções (childList)
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
          const isSelectDisabled = select.disabled;
          if (isSelectDisabled) {
            triggerBtn.classList.add('disabled');
            triggerBtn.disabled = true;
          } else {
            triggerBtn.classList.remove('disabled');
            triggerBtn.disabled = false;
          }
        } else if (mutation.type === 'childList') {
          rebuildOptions();
        }
      }
    });
    observer.observe(select, { attributes: true, attributeFilter: ['disabled'], childList: true });
    
    // Observa o select original para mudanças de valor (se alterado programaticamente ou externamente)
    select.addEventListener('change', () => {
      const idx = select.selectedIndex;
      const opt = select.options[idx];
      if (opt) {
        triggerSpan.innerText = opt.text;
        triggerSpan.className = opt.value !== "" ? 'text-slate-900' : 'text-slate-400';
        
        const optionItems = optionsMenu.querySelectorAll('.custom-select-option');
        optionItems.forEach(item => {
          const itemIdx = parseInt(item.dataset.index, 10);
          if (itemIdx === idx) {
            item.classList.add('selected');
          } else {
            item.classList.remove('selected');
          }
        });
      }
    });
  });
  
  // Fecha o menu ao clicar fora do componente
  document.addEventListener('click', () => {
    document.querySelectorAll('.custom-select-options.open').forEach(menu => {
      menu.classList.remove('open');
      menu.previousElementSibling.classList.remove('open');
    });
  });
};
