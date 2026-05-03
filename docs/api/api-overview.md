---
sidebar_position: 1
title: Обзор API
---
# API — Обзор

## Общая информация

- **Базовый URL:** `https://api.minilms.local/v1`
- **Авторизация:** Bearer JWT-токен в заголовке `Authorization`
- **Контроль доступа:** RBAC (роль определяется при авторизации)
- **Формат:** JSON
- **Спецификация:** [openapi.yaml](openapi.yaml) (OpenAPI 3.0.3)

## Таблица эндпоинтов

### Auth

| Метод | Путь | Описание | UC |
|-------|------|----------|----|
| POST | `/auth/login` | Вход в систему | UC-01 |

### Слушатель (Learner)

| Метод | Путь | Описание | UC |
|-------|------|----------|----|
| GET | `/users/me/enrollments` | Список назначенных курсов с прогрессом | UC-07 |
| GET | `/courses/{courseId}/lessons` | Список уроков курса | UC-07 |
| GET | `/lessons/{lessonId}` | Содержимое урока | UC-07 |
| POST | `/lessons/{lessonId}/progress` | Отметить урок пройденным | UC-07 |
| GET | `/tests/{testId}` | Получить тест (вопросы без ответов) | UC-07 |
| POST | `/tests/{testId}/attempts` | Отправить попытку теста | UC-07 |

### Уведомления

| Метод | Путь | Описание | UC |
|-------|------|----------|----|
| GET | `/users/me/notifications` | Лента уведомлений | UC-09 |
| PATCH | `/notifications/{id}/read` | Отметить как прочитанное | UC-09 |

### Автор (Author)

| Метод | Путь | Описание | UC |
|-------|------|----------|----|
| POST | `/courses` | Создать курс (черновик) | UC-02 |
| PUT | `/courses/{courseId}` | Обновить курс | UC-02 |
| POST | `/courses/{courseId}/publish` | Опубликовать курс | UC-05 |
| POST | `/courses/{courseId}/lessons` | Добавить урок | UC-03 |
| PUT | `/lessons/{lessonId}` | Обновить урок | UC-03 |
| DELETE | `/lessons/{lessonId}` | Удалить урок | UC-03 |
| PUT | `/courses/{courseId}/lessons/order` | Изменить порядок уроков | UC-03 |
| PUT | `/tests/{testId}` | Создать/обновить тест | UC-04 |

### Координатор (Coordinator)

| Метод | Путь | Описание | UC |
|-------|------|----------|----|
| GET | `/groups` | Список групп | UC-06 |
| POST | `/assignments` | Назначить курс группе | UC-06 |
| GET | `/reports` | Отчёт по курсу/группе | UC-08 |
| GET | `/reports/summary` | Агрегаты отчёта | UC-08 |

### Файлы

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/files` | Загрузить файл |

## Коды ошибок

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Дедлайн раньше даты старта",
  "details": [
    { "field": "deadline", "issue": "must be after startDate" }
  ]
}
```

Стандартные HTTP-коды: `200` — успех, `201` — создано, `400` — ошибка валидации, `401` — не авторизован, `403` — нет прав, `404` — не найдено, `409` — конфликт.
