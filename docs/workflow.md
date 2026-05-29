# Workflow de Desenvolvimento

## 1. Criação de Novas Páginas
1. Criar pasta em `pages/nome-da-pagina/`.
2. Criar `index.html` dentro da pasta.
3. Adicionar a entrada no `vite.config.js` na seção `rollupOptions.input`.
4. Criar script específico em `src/js/pages/nome-da-pagina.js`.

## 2. Componentes
Componentes devem ser criados como funções JS que retornam strings HTML ou manipulam o DOM, localizados em `src/components/`.

## 3. Estilos
Utilizar classes do Tailwind diretamente no HTML sempre que possível. Estilos complexos ou reutilizáveis podem ser definidos em `src/css/components.css` usando `@apply`.

## 4. Dados
Utilizar o `src/data/mock-data.js` para simular retornos de API durante o desenvolvimento.
