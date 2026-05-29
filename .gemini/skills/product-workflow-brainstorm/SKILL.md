1. Feature Objective (Objetivo Geral)
  Criar um sistema de gestão de saúde pet (LifePet) centralizado onde o
  tutor possa cadastrar seus animais e monitorar proativamente os
  eventos de saúde (vacinas, vermífugos e consultas), garantindo que
  nada passe da data.

  2. User Flow (Fluxo do Usuário)
   1. Onboarding/Home Vazia: O usuário abre o app e vê uma mensagem
      acolhedora incentivando o cadastro do seu primeiro pet.
   2. Cadastro do Pet: Preenche o formulário (nome, espécie, raça, data
      de nascimento).
   3. Visão Geral (Dashboard): Vê a lista de pets cadastrados. Ao lado
      ou no topo, um painel de alertas mostra ações urgentes ("Vacina
      da Bella atrasada!").
   4. Detalhes do Pet: Clica em um pet e entra no seu perfil.
   5. Ação de Saúde: Adiciona uma nova vacina ou vermífugo, definindo a
      data de aplicação e se há uma data de retorno/próxima dose.
   6. Acompanhamento: Verifica o calendário para ver as próximas
      consultas ou recebe um aviso visual (badge/notificação) sobre o
      status dos cuidados (Atrasado, Próximo, Concluído).

  3. Required Screens (Telas Necessárias)
  A aplicação será estruturada (mesmo sendo JS puro, podemos usar
  navegação em abas ou Single Page Application simplificada) nas
  seguintes "telas" ou visões:

   1. Dashboard / Home: Resumo geral com lista de pets, widgets de
      status (saúde em dia, atenção) e atalho para o calendário.
   2. Perfil do Pet: View detalhada de um único animal (Foto/Avatar,
      Dados Básicos).
   3. Aba: Histórico de Cuidados (Timeline): Lista de vacinas,
      vermífugos e consultas já realizadas e as agendadas.
   4. Formulários (Modais ou Telas Dedicadas): 
      - Adicionar/Editar Pet
      - Adicionar/Editar Evento de Saúde (Vacina, Vermífugo, Consulta)
   5. Visão de Calendário: Visão mensal ou em formato de lista (agenda)
      focada nas datas de retorno.

  4. Required Components (Componentes Reutilizáveis)
  Aplicando frontend-ui-engineering e organizing-project-files:

   - Card de Pet: Exibe avatar, nome, e um "Health Badge" (Verde = Ok,
     Vermelho = Atraso).
   - Health Event Item (Timeline): Ícone (Seringa para vacina, Pílula
     para vermífugo, Estetoscópio para consulta), Nome do evento, Data,
     e Status Badge.
   - Status Badges: Atrasado (Vermelho), Próximo 7 dias (Amarelo),
     Concluído (Verde).
   - Alert Banner: Usado no topo do dashboard para notificações
     urgentes.
   - Botão de Ação (FAB ou Primary): Padrão consistente para adicionar
     registros.
   - Empty State Card: Ilustração ou ícone sutil com texto incentivando
     a ação (ex: "Nenhum histórico de vacinas ainda").

  5. Data Model (Modelo de Dados)
  Como não teremos backend neste momento (trabalho de faculdade),
  simularemos o banco usando localStorage.

  Entidade: Pet
   - id: string (UUID)
   - name: string
   - species: string (Cachorro, Gato, etc)
   - breed: string
   - birthDate: date

  Entidade: HealthEvent (Cobre vacinas, consultas, vermífugos)
   - id: string (UUID)
   - petId: string (Relacionamento: A qual pet se refere?)
   - type: enum ('vaccine', 'vermifuge', 'appointment')
   - title: string (Ex: "V10", "Drontal", "Consulta de Rotina")
   - date: date (Data do acontecimento)
   - returnDate: date | null (Data envolvida: para quando é o retorno?)
   - status: enum ('completed', 'upcoming', 'overdue') -> Calculado
     dinamicamente no JS comparando returnDate com a data atual.

  6. Empty States (Estados Vazios)
   - Dashboard sem pets: "Bem-vindo ao LifePet! Vamos começar a cuidar
     do seu melhor amigo. [Cadastrar meu primeiro Pet]".
   - Perfil do Pet sem histórico: "O histórico de [Nome do Pet] está
     vazio. Adicione a primeira vacina ou consulta para mantermos tudo
     organizado."
   - Calendário sem eventos: "Nenhum cuidado programado para este mês.
     Relaxa e aproveite o tempo com seus pets!"

  7. Error States (Estados de Erro)
   - Formulário sem campos obrigatórios: "Por favor, preencha o nome e
     a data do evento."
   - Data de retorno anterior à data de aplicação: "A data de retorno
     deve ser no futuro."

  8. Responsive Behavior (Comportamento Responsivo)
   - Mobile (Prioridade): Navegação por Bottom Tab Bar ou Menu
     Hambúrguer. Listas ocupam 100% da largura. Modais abrem como
     Bottom Sheets ou tela cheia.
   - Tablet/Desktop: Grid layout. Lista de pets em sidebar à esquerda,
     Perfil e Timeline ocupando o conteúdo principal. Modais
     centralizados com overlay.

  9. Implementation Steps (Fases de Implementação)
   1. Design System & Boilerplate: Configurar HTML base, CSS Reset e
      design tokens via Tailwind.
   2. Camada de Dados (JS): Criar as funções de localStorage para
      Salvar, Ler, Atualizar e Deletar (CRUD) Pets e Eventos. Funções
      utilitárias de cálculo de datas (isOverdue()).
   3. UI - Home e Pets: Montar a tela inicial, o componente de card de
      pet e o modal de cadastro. Ligar a UI com a camada de dados.
   4. UI - Perfil e Histórico: Montar a tela interna do pet. Criar o
      formulário de Evento de Saúde. Listar eventos na timeline.
   5. Inteligência - Status e Alertas: Implementar a lógica que colore
      os badges e gera os banners de alerta no topo do Dashboard.
   6. Visão Global: Implementar a tela de Calendário/Agenda
      consolidando todos os pets.

  10. QA Checklist (Garantia de Qualidade)
   - [ ] O cálculo de dias de atraso está correto considerando viradas
     de mês?
   - [ ] As notificações visuais atualizam imediatamente após cadastrar
     um novo evento com data no passado?
   - [ ] O fluxo funciona perfeitamente apenas com teclado
     (Acessibilidade)?
   - [ ] As cores dos status (Vermelho/Verde) possuem contraste
     suficiente no modo claro e escuro?
   - [ ] A tela não quebra se o nome do pet ou da vacina for muito
     longo?

  ---

  Respondendo às "LifePet Specific Guidance":
  Ao planejar o componente de Formulário de Evento, o usuário será
  forçado a responder pela interface:
   1. A qual pet isto se refere? (Se adicionado pelo Dashboard, terá um
      dropdown. Se pelo perfil, é automático).
   2. Qual data está envolvida? (Data atual/passada da ação + Data
      futura do retorno).
   3. Está atrasado, próximo ou concluído? (O sistema infere sozinho
      comparando a data de retorno com new Date()).
  Se o planejamento for aprovado, o próximo passo é estruturarmos a
  arquitetura física dos arquivos (HTML/CSS/JS) no diretório temporário
  para iniciarmos o código. Como deseja prosseguir?