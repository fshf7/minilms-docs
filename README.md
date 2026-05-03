# MiniLMS — Техническая документация

Техническая документация платформы мини-курсов и тестов **MiniLMS**.

## О проекте

MiniLMS — веб-система, где можно быстро собрать короткий курс (уроки + тесты), назначить его группе людей и видеть прогресс/результаты в одном месте.

## Структура документации

```
docs/
├── requirements/
│   ├── concept.md                    # Концепция продукта
│   ├── functional-requirements.md    # Функциональные требования (Use Cases)
│   └── nonfunctional-requirements.md # Нефункциональные требования
├── architecture/
│   ├── data-storage.md               # Выбор технологий хранения данных
│   └── erd.md                        # Модель данных (ERD)
├── api/
│   └── openapi.yaml                  # OpenAPI-спецификация REST API
├── diagrams/
│   └── sequence-diagrams.md          # Sequence-диаграммы (PlantUML)
templates/
├── architecture-overview.md          # Шаблон: обзор архитектуры
├── adr-template.md                   # Шаблон: Architecture Decision Record
└── algorithm-description.md          # Шаблон: описание алгоритма
```

## Стек документации

| Слой | Инструмент |
|------|------------|
| Формат | Markdown |
| Редактор | VS Code |
| Версионирование | Git + GitHub |
| API-документация | OpenAPI 3.0 (YAML) |
| Диаграммы | PlantUML |

## Как работать с документацией

1. Клонировать репозиторий: `git clone <url>`
2. Открыть в VS Code
3. Вносить изменения → коммитить → пушить
4. API-спецификацию можно просмотреть через [Swagger Editor](https://editor.swagger.io/)
