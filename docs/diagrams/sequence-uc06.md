# Sequence-диаграмма — UC-06: Назначение курса группе

## Диаграмма

```plantuml
@startuml
title MiniLMS — Sequence Diagram
UC-06: Создание группы и назначение курса группе с дедлайном

autonumber

actor "Координатор" as Coordinator
boundary "Web UI" as UI
control "Backend API" as API
database "DB" as DB
control "Сервис уведомлений" as Notify
actor "Слушатель" as Learner

== Загрузка формы назначения ==

Coordinator -> UI: Открыть форму назначения курса
activate UI
UI -> API: GET /courses, /groups
activate API
API -> DB: Получить опубликованные курсы и группы
activate DB
DB --> API: Курсы и группы
deactivate DB
API --> UI: Данные для формы
deactivate API
UI --> Coordinator: Показать форму назначения
deactivate UI

== Назначение курса ==

Coordinator -> UI: Выбрать курс, группу,\nуказать дату старта, дедлайн\nи подтвердить
activate UI
UI -> API: POST /assignments\n(courseId, groupId, startDate, deadline)
activate API

API -> DB: Проверить существование курса и группы
activate DB
DB --> API: OK
deactivate DB

API -> DB: Получить участников группы
activate DB
DB --> API: Список userId
deactivate DB

loop Для каждого участника группы
    API -> DB: Проверить дубликат назначения
    activate DB
    DB --> API: Не найден
    deactivate DB

    API -> DB: Создать assignment\n(userId, courseId, groupId, deadline)
    activate DB
    DB --> API: OK
    deactivate DB

    API -> Notify: Создать уведомление о назначении
    activate Notify
    Notify -> DB: Сохранить уведомление
    activate DB
    DB --> Notify: OK
    deactivate DB
    Notify ->> Learner: Уведомление в системе\n"Вам назначен курс"
    deactivate Notify
end

note right of API
    Если часть назначений уже существовала,
    API возвращает информацию:
    "N назначений создано,
     M уже существовало"
end note

API --> UI: Назначение выполнено успешно
UI --> Coordinator: Показать статус\n"Курс назначен"

deactivate API
deactivate UI
@enduml
```

## Ключевые моменты

- **Идемпотентность:** повторное назначение не создаёт дубликат — пропускает существующие.
- **Уведомления:** создаются в рамках цикла для каждого участника.
- **Валидация:** проверяется существование курса, группы и то, что курс опубликован.
- **Дедлайн:** валидируется на бэкенде (не раньше даты старта).
