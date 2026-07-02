/**
 * Geradores de HTML de estado vazio para a página de Detalhes do Pet
 */

export const renderPetNotFound = (container) => {
  container.innerHTML = `
    <div class="empty-state">
      <div class="w-16 h-16 bg-[#F4F7F8] text-[#64748B] rounded-full flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 class="text-xl font-bold text-[#0F172A]">Pet não encontrado</h2>
      <p class="text-[#64748B] mt-2 mb-6">Não conseguimos localizar as informações deste pet.</p>
      <a href="/pages/meus-pets/index.html" class="btn-primary">Voltar para Meus Pets</a>
    </div>
  `;
};

export const renderEmptySection = (text, btnId) => `
  <div class="p-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
    <div class="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 border border-slate-100">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
    </div>
    <p class="text-sm text-slate-500 font-medium">${text}</p>
  </div>
`;
