# MiniLMS — Модель данных (ERD)

Модель спроектирована на основе документа «Хранение данных» и OpenAPI-спецификации проекта. Всего 13 сущностей + 2 промежуточные таблицы для связей M:N.

## Уровень 1. Концептуальная модель

Только сущности и связи, без атрибутов. Промежуточные таблицы (GroupMember, LessonAttachment) здесь не показаны - связи M:N отображаются напрямую.

```Plain Text
@startuml
skinparam linetype ortho
skinparam entity {
  BackgroundColor #FEFECE
  BorderColor #A0A0A0
}
hide methods

entity "Пользователь" as User
entity "Группа" as Group
entity "Курс" as Course
entity "Урок" as Lesson
entity "Вложение" as Attachment
entity "Тест" as Test
entity "Вопрос" as Question
entity "Вариант ответа" as Option
entity "Попытка теста" as Attempt
entity "Ответ в попытке" as AttemptAnswer
entity "Назначение" as Assignment
entity "Прогресс по уроку" as LessonProgress
entity "Уведомление" as Notification

User }o--o{ Group : "состоит в"
User ||--o{ Course : "создаёт (автор)"
Course ||--o{ Lesson : "содержит"
Lesson ||--o| Test : "имеет"
Lesson }o--o{ Attachment : "прикреплено"
Test ||--o{ Question : "содержит"
Question ||--o{ Option : "варианты"
User ||--o{ Attempt : "сдаёт"
Test ||--o{ Attempt : "по тесту"
Attempt ||--o{ AttemptAnswer : "ответы"
Question ||--o{ AttemptAnswer : "на вопрос"
User ||--o{ Assignment : "назначен"
Course ||--o{ Assignment : "на курс"
Group ||--o{ Assignment : "для группы"
User ||--o{ LessonProgress : "проходит"
Lesson ||--o{ LessonProgress : "по уроку"
User ||--o{ Notification : "получает"

@enduml
```

## Уровень 2. Логическая модель

Появились атрибуты с платформонезависимыми типами, PK/FK, промежуточные таблицы GroupMember и LessonAttachment.

```Plain Text
@startuml
skinparam linetype ortho
skinparam entity {
  BackgroundColor #FEFECE
  BorderColor #A0A0A0
}
hide methods

entity User {
  * id : UUID <<PK>>
  --
  * email : string <<unique>>
  * fullName : string
  * passwordHash : string
  * role : enum [learner, author, coordinator, admin]
  * createdAt : datetime
}

entity Group {
  * id : UUID <<PK>>
  --
  * name : string
  memberCount : int
}

entity GroupMember {
  * groupId : UUID <<PK, FK>>
  * userId : UUID <<PK, FK>>
}

entity Course {
  * id : UUID <<PK>>
  --
  * title : string
  description : string
  * status : enum [draft, published]
  * authorId : UUID <<FK>>
  * createdAt : datetime
  * updatedAt : datetime
}

entity Lesson {
  * id : UUID <<PK>>
  --
  * courseId : UUID <<FK>>
  * title : string
  * content : text
  * order : int
  externalLinks : string[]
}

entity Attachment {
  * id : UUID <<PK>>
  --
  * fileName : string
  * url : string
  * sizeBytes : int
  mimeType : string
}

entity LessonAttachment {
  * lessonId : UUID <<PK, FK>>
  * attachmentId : UUID <<PK, FK>>
}

entity Test {
  * id : UUID <<PK>>
  --
  * lessonId : UUID <<FK, unique>>
  * passingScore : int
  maxAttempts : int
}

entity Question {
  * id : UUID <<PK>>
  --
  * testId : UUID <<FK>>
  * type : enum [single_choice, multiple_choice, short_text]
  * text : string
  * points : int
  correctTextAnswer : string
}

entity Option {
  * id : UUID <<PK>>
  --
  * questionId : UUID <<FK>>
  * text : string
  * isCorrect : boolean
}

entity Attempt {
  * id : UUID <<PK>>
  --
  * testId : UUID <<FK>>
  * userId : UUID <<FK>>
  * score : int
  * maxScore : int
  * passed : boolean
  * submittedAt : datetime
}

entity AttemptAnswer {
  * id : UUID <<PK>>
  --
  * attemptId : UUID <<FK>>
  * questionId : UUID <<FK>>
  selectedOptionIds : UUID[]
  textAnswer : string
}

entity Assignment {
  * id : UUID <<PK>>
  --
  * userId : UUID <<FK>>
  * courseId : UUID <<FK>>
  * groupId : UUID <<FK>>
  * status : enum [assigned, in_progress, completed, overdue]
  startDate : date
  deadline : date
}

entity LessonProgress {
  * lessonId : UUID <<PK, FK>>
  * userId : UUID <<PK, FK>>
  --
  * status : enum [not_started, in_progress, completed]
  completedAt : datetime
}

entity Notification {
  * id : UUID <<PK>>
  --
  * userId : UUID <<FK>>
  * type : enum [course_assigned, deadline_soon, overdue]
  * title : string
  message : string
  courseId : UUID <<FK>>
  * read : boolean
  * createdAt : datetime
}

User ||--o{ GroupMember
Group ||--o{ GroupMember

User ||--o{ Course : "authorId"

Course ||--o{ Lesson
Lesson ||--o{ LessonAttachment
Attachment ||--o{ LessonAttachment

Lesson ||--o| Test
Test ||--o{ Question
Question ||--o{ Option

User ||--o{ Attempt
Test ||--o{ Attempt
Attempt ||--o{ AttemptAnswer
Question ||--o{ AttemptAnswer

User ||--o{ Assignment
Course ||--o{ Assignment
Group ||--o{ Assignment

User ||--o{ LessonProgress
Lesson ||--o{ LessonProgress

User ||--o{ Notification

@enduml
```

## Уровень 3. Физическая модель (PostgreSQL)

Типы PostgreSQL, NOT NULL, DEFAULT, CHECK-ограничения для enum-ов, индексы. Имена таблиц и колонок — в snake_case.

```Plain Text
@startuml
skinparam linetype ortho
skinparam entity {
  BackgroundColor #FEFECE
  BorderColor #A0A0A0
}
hide methods

entity users {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * email : VARCHAR(255) NOT NULL <<unique>>
  * full_name : VARCHAR(255) NOT NULL
  * password_hash : VARCHAR(255) NOT NULL
  * role : VARCHAR(20) NOT NULL CHECK (learner|author|coordinator|admin)
  * created_at : TIMESTAMPTZ NOT NULL DEFAULT now()
  ..indexes..
  idx_users_email : UNIQUE (email)
  idx_users_role : BTREE (role)
}

entity groups {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * name : VARCHAR(255) NOT NULL
  member_count : INTEGER DEFAULT 0
}

entity group_members {
  * group_id : UUID <<PK, FK>> → groups.id ON DELETE CASCADE
  * user_id : UUID <<PK, FK>> → users.id ON DELETE CASCADE
}

entity courses {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * title : VARCHAR(255) NOT NULL
  description : TEXT
  * status : VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (draft|published)
  * author_id : UUID NOT NULL <<FK>> → users.id
  * created_at : TIMESTAMPTZ NOT NULL DEFAULT now()
  * updated_at : TIMESTAMPTZ NOT NULL DEFAULT now()
  ..indexes..
  idx_courses_author : BTREE (author_id)
  idx_courses_status : BTREE (status)
}

entity lessons {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * course_id : UUID NOT NULL <<FK>> → courses.id ON DELETE CASCADE
  * title : VARCHAR(255) NOT NULL
  * content : TEXT NOT NULL
  * sort_order : INTEGER NOT NULL
  external_links : JSONB
  ..indexes..
  idx_lessons_course_order : BTREE (course_id, sort_order)
}

entity attachments {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * file_name : VARCHAR(255) NOT NULL
  * url : VARCHAR(2048) NOT NULL
  * size_bytes : INTEGER NOT NULL
  mime_type : VARCHAR(127)
}

entity lesson_attachments {
  * lesson_id : UUID <<PK, FK>> → lessons.id ON DELETE CASCADE
  * attachment_id : UUID <<PK, FK>> → attachments.id ON DELETE CASCADE
}

entity tests {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * lesson_id : UUID NOT NULL <<FK, unique>> → lessons.id ON DELETE CASCADE
  * passing_score : INTEGER NOT NULL
  max_attempts : INTEGER
  ..indexes..
  idx_tests_lesson : UNIQUE (lesson_id)
}

entity questions {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * test_id : UUID NOT NULL <<FK>> → tests.id ON DELETE CASCADE
  * type : VARCHAR(20) NOT NULL CHECK (single_choice|multiple_choice|short_text)
  * text : TEXT NOT NULL
  * points : INTEGER NOT NULL DEFAULT 1
  correct_text_answer : VARCHAR(500)
  ..indexes..
  idx_questions_test : BTREE (test_id)
}

entity options {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * question_id : UUID NOT NULL <<FK>> → questions.id ON DELETE CASCADE
  * text : VARCHAR(1000) NOT NULL
  * is_correct : BOOLEAN NOT NULL DEFAULT false
  ..indexes..
  idx_options_question : BTREE (question_id)
}

entity attempts {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * test_id : UUID NOT NULL <<FK>> → tests.id
  * user_id : UUID NOT NULL <<FK>> → users.id
  * score : INTEGER NOT NULL
  * max_score : INTEGER NOT NULL
  * passed : BOOLEAN NOT NULL
  * submitted_at : TIMESTAMPTZ NOT NULL DEFAULT now()
  ..indexes..
  idx_attempts_user_test : BTREE (user_id, test_id)
}

entity attempt_answers {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * attempt_id : UUID NOT NULL <<FK>> → attempts.id ON DELETE CASCADE
  * question_id : UUID NOT NULL <<FK>> → questions.id
  selected_option_ids : UUID[]
  text_answer : VARCHAR(1000)
  ..indexes..
  idx_answers_attempt : BTREE (attempt_id)
}

entity assignments {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * user_id : UUID NOT NULL <<FK>> → users.id
  * course_id : UUID NOT NULL <<FK>> → courses.id
  * group_id : UUID NOT NULL <<FK>> → groups.id
  * status : VARCHAR(20) NOT NULL DEFAULT 'assigned' CHECK (assigned|in_progress|completed|overdue)
  start_date : DATE
  deadline : DATE
  ..indexes..
  idx_assignments_user_course : UNIQUE (user_id, course_id)
  idx_assignments_group_status : BTREE (course_id, group_id, status)
}

entity lesson_progress {
  * lesson_id : UUID <<PK, FK>> → lessons.id ON DELETE CASCADE
  * user_id : UUID <<PK, FK>> → users.id
  --
  * status : VARCHAR(20) NOT NULL DEFAULT 'not_started' CHECK (not_started|in_progress|completed)
  completed_at : TIMESTAMPTZ
  ..indexes..
  idx_progress_user : BTREE (user_id)
}

entity notifications {
  * id : UUID <<PK>> DEFAULT gen_random_uuid()
  --
  * user_id : UUID NOT NULL <<FK>> → users.id
  * type : VARCHAR(20) NOT NULL CHECK (course_assigned|deadline_soon|overdue)
  * title : VARCHAR(500) NOT NULL
  message : TEXT
  course_id : UUID <<FK>> → courses.id
  * read : BOOLEAN NOT NULL DEFAULT false
  * created_at : TIMESTAMPTZ NOT NULL DEFAULT now()
  ..indexes..
  idx_notifications_user_read : BTREE (user_id, read)
  idx_notifications_user_date : BTREE (user_id, created_at DESC)
}

users ||--o{ group_members
groups ||--o{ group_members

users ||--o{ courses : "author_id"

courses ||--o{ lessons
lessons ||--o{ lesson_attachments
attachments ||--o{ lesson_attachments

lessons ||--o| tests
tests ||--o{ questions
questions ||--o{ options

users ||--o{ attempts
tests ||--o{ attempts
attempts ||--o{ attempt_answers
questions ||--o{ attempt_answers

users ||--o{ assignments
courses ||--o{ assignments
groups ||--o{ assignments

users ||--o{ lesson_progress
lessons ||--o{ lesson_progress

users ||--o{ notifications

@enduml
```

---

## Обоснование решений

Всё лежит в одной реляционной БД (PostgreSQL). Данных за первый год меньше 200 МБ, сущности сильно связаны через FK, а бизнес-логика требует ACID - атомарное назначение группе (UC-06), неизменяемость попыток (NFR-DATA-02). Документная БД тут не нужна.

Все id - UUID, как в OpenAPI-спецификации. Это позволяет генерировать идентификаторы на клиенте (для идемпотентности, X-Idempotency-Key при сдаче теста).

Связь Lesson → Test сделана как 1:0..1. Тест не обязателен, но если есть - один на урок. FK лежит на стороне Test (lesson_id UNIQUE), а не на Lesson - чтобы не было циклической зависимости.

Вложения привязаны к урокам через промежуточную таблицу lesson_attachments (M:N), потому что один файл теоретически может быть в нескольких уроках. Сами файлы лежат на файловом хранилище, в БД только метаданные.

На assignments стоит UNIQUE(user_id, course_id) - один пользователь не может быть назначен на курс дважды. Это закрывает UC-06 A3.

Enum-ы реализованы через VARCHAR + CHECK, а не CREATE TYPE. Проще при миграциях — добавить значение в CHECK не требует ALTER TYPE.

Индексы подобраны под конкретные запросы: (user_id, read) — для выборки непрочитанных уведомлений, (course_id, group_id, status) — для отчётов UC-08, (user_id, test_id) — для поиска попыток.

Попытки (attempts) неизменяемы по NFR-DATA-02, поэтому FK на tests и users без CASCADE — чтобы нельзя было случайно каскадно удалить результаты.

Поле `order` в lessons переименовано в `sort_order` — order является зарезервированным словом в SQL.



