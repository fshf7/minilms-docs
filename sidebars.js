const sidebars = {
  tutorialSidebar: [
    'intro',
    {
      type: 'category',
      label: '📋 Требования',
      items: [
        'requirements/concept',
        'requirements/functional',
        'requirements/non-functional',
        'requirements/stakeholders',
      ],
    },
    {
      type: 'category',
      label: '🏗️ Архитектура',
      items: [
        'architecture/overview',
        'architecture/data-storage',
        'architecture/erd',
        'architecture/async-interactions',
        'architecture/platformization',
      ],
    },
    {
      type: 'category',
      label: '🗄️ Модель данных',
      items: [
        'data/erd',
      ],
    },
    {
      type: 'category',
      label: '🖥️ UI / Wireframes',
      items: [
        'ui/wireframes',
      ],
    },
    {
      type: 'category',
      label: '🔌 API',
      items: [
        'api/api-overview',
      ],
    },
    {
      type: 'category',
      label: '📊 Диаграммы',
      items: [
        'diagrams/sequence-uc06',
        'diagrams/use-case',
      ],
    },
    {
      type: 'category',
      label: '📝 Шаблоны',
      items: [
        'templates/adr-template',
        'templates/algorithm-description',
        'templates/algorithm-template',
        'templates/architecture-overview',
        'templates/deployment-template',
        'templates/rfc-template',
      ],
    },
  ],
};

export default sidebars;