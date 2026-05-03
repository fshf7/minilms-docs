# UI / Wireframes

## Экраны системы

| Экран | Роль | Роут | Описание |
|-------|------|------|----------|
| Мои курсы | Слушатель | `/my-courses` | Список назначенных курсов с прогрессом |
| Просмотр курса | Слушатель | `/courses/:id` | Программа курса, список уроков |
| Прохождение теста | Слушатель | `/tests/:id` | Вопросы, ответы, отправка |
| Редактор курса | Автор | `/courses/:id/edit` | Создание/редактирование курса и уроков |
| Назначение курса | Координатор | `/assignments/new` | Выбор курса, группы, дедлайна |
| Отчёт по курсу | Координатор | `/reports` | Статусы участников, агрегаты |

## Привязка экранов к эндпоинтам

### Мои курсы (Слушатель)

```
GET /users/me/enrollments?page=1&size=20
```

Показывает: название курса, прогресс (3/5 уроков), статус, дедлайн.

### Просмотр курса (Слушатель)

```
GET /courses/{courseId}/lessons
GET /lessons/{lessonId}
POST /lessons/{lessonId}/progress
```

### Прохождение теста (Слушатель)

```
GET /tests/{testId}
POST /tests/{testId}/attempts
```

### Редактор курса (Автор)

```
POST /courses
PUT /courses/{courseId}
POST /courses/{courseId}/lessons
PUT /lessons/{lessonId}
POST /courses/{courseId}/publish
```

### Назначение курса (Координатор)

```
GET /courses  (опубликованные)
GET /groups
POST /assignments
```

### Отчёт (Координатор)

```
GET /reports?courseId=X&groupId=Y&page=1&size=50
GET /reports/summary?courseId=X&groupId=Y
```

> Интерактивные макеты (wireframes) в формате React JSX хранятся в отдельном файле `MiniLMS_Wireframes.jsx`.
