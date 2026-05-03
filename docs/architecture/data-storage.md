# Хранение данных — MiniLMS

## Сущности системы

| Сущность | Ключевые атрибуты | Объём (год) |
|----------|-------------------|-------------|
| User | id, email, fullName, passwordHash, role, createdAt | ~1 000 записей, < 1 МБ |
| Group, GroupMember | id, name; связь M:N с пользователями | десятки групп |
| Course | id, title, description, status (draft/published), authorId | ~100 курсов |
| Lesson | id, courseId, title, content, order, externalLinks | ~1 000 уроков, < 10 МБ |
| Attachment | id, fileName, url, sizeBytes, mimeType | метаданные в БД, файлы — отдельно |
| Test | id, lessonId (unique), passingScore, maxAttempts | ~300 тестов |
| Question, Option | type (single/multiple/short_text), text, points, isCorrect | ~2 000 вопросов |
| Attempt, AttemptAnswer | score, passed, submittedAt; selectedOptionIds, textAnswer | ~120 000 попыток/год, < 100 МБ |
| Assignment | userId, courseId, groupId, status, deadline | ~10 000 назначений |
| LessonProgress | userId, lessonId, status, completedAt | ~100 000 записей |
| Notification | userId, type, message, read, createdAt | ~30 000/год, < 5 МБ |

## Выбор технологий

### Реляционная БД — PostgreSQL

**Почему:** данных за первый год < 200 МБ; сущности сильно связаны через FK; бизнес-логика требует ACID (атомарное назначение группе, неизменяемость попыток).

**Почему не MongoDB:** контент урока — это одно текстовое поле внутри структурированной записи. Хранить уроки в документной БД ради одного поля — потерять целостность связей.

### Файловое хранилище — отдельно от БД

**Почему:** бинарные файлы не участвуют в SQL-запросах, раздувают бэкапы. На MVP — директория + nginx. При масштабировании — Object Storage (S3/MinIO).

### Уведомления — в той же БД

**Почему:** на масштабе MVP (~30 000/год) отдельное хранилище — избыточно. Одна таблица `notifications` с индексом по `(userId, read)`.

### Отчёты — OLTP, не OLAP

На масштабе MVP (группа до 50 чел.) — обычные SQL-запросы с индексами:
- `(courseId, groupId, status)` на `assignments`
- `(userId, testId)` на `attempts`

## Ключевые решения

- Все `id` — UUID (для идемпотентности: `X-Idempotency-Key` при сдаче теста)
- Связь Lesson → Test: 1:0..1, FK на стороне Test (`lesson_id UNIQUE`)
- Вложения: M:N через `lesson_attachments`
- `UNIQUE(user_id, course_id)` на `assignments` — нельзя назначить дважды
- Enum-ы через `VARCHAR + CHECK` (проще при миграциях)
- Попытки без `ON DELETE CASCADE` (неизменяемы по NFR-DATA-02)
