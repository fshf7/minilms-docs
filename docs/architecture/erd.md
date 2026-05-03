# Модель данных (ERD) — MiniLMS

13 сущностей + 2 промежуточные таблицы для связей M:N.

## Концептуальная модель

Только сущности и связи, без атрибутов.

```plantuml
@startuml
skinparam linetype ortho
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
User ||--o{ Course : "создаёт"
Course ||--o{ Lesson : "содержит"
Lesson ||--o| Test : "имеет"
Lesson }o--o{ Attachment : "прикреплено"
Test ||--o{ Question : "содержит"
Question ||--o{ Option : "варианты"
User ||--o{ Attempt : "сдаёт"
Test ||--o{ Attempt : "по тесту"
Attempt ||--o{ AttemptAnswer : "ответы"
User ||--o{ Assignment : "назначен"
Course ||--o{ Assignment : "на курс"
Group ||--o{ Assignment : "для группы"
User ||--o{ LessonProgress : "проходит"
Lesson ||--o{ LessonProgress : "по уроку"
User ||--o{ Notification : "получает"
@enduml
```

## Логическая модель (ключевые сущности)

```plantuml
@startuml
entity User {
  * id : UUID <<PK>>
  --
  * email : string <<unique>>
  * fullName : string
  * passwordHash : string
  * role : enum [learner, author, coordinator, admin]
  * createdAt : datetime
}

entity Course {
  * id : UUID <<PK>>
  --
  * title : string
  description : string
  * status : enum [draft, published]
  * authorId : UUID <<FK>> → User
  * createdAt : datetime
  * updatedAt : datetime
}

entity Lesson {
  * id : UUID <<PK>>
  --
  * courseId : UUID <<FK>> → Course
  * title : string
  * content : text
  * order : int
  externalLinks : string[]
}

entity Test {
  * id : UUID <<PK>>
  --
  * lessonId : UUID <<FK, unique>> → Lesson
  * passingScore : int
  maxAttempts : int
}

entity Question {
  * id : UUID <<PK>>
  --
  * testId : UUID <<FK>> → Test
  * type : enum [single_choice, multiple_choice, short_text]
  * text : string
  * points : int
  correctTextAnswer : string
}

entity Attempt {
  * id : UUID <<PK>>
  --
  * testId : UUID <<FK>> → Test
  * userId : UUID <<FK>> → User
  * score : int
  * maxScore : int
  * passed : bool
  * submittedAt : datetime
}

entity Assignment {
  * id : UUID <<PK>>
  --
  * userId : UUID <<FK>> → User
  * courseId : UUID <<FK>> → Course
  * groupId : UUID <<FK>> → Group
  * status : enum [assigned, in_progress, completed, overdue]
  deadline : date
  <<unique(userId, courseId)>>
}
@enduml
```

## Обоснование решений

- **PostgreSQL** — данных < 200 МБ/год, связи через FK, нужен ACID
- **UUID** — для идемпотентности (генерация ID на клиенте)
- **Lesson → Test: 1:0..1** — FK на стороне Test, чтобы избежать циклической зависимости
- **Вложения: M:N** через `lesson_attachments` (один файл может быть в нескольких уроках)
- **Enum через VARCHAR + CHECK** — проще при миграциях
- **Попытки без CASCADE** — неизменяемы по NFR-DATA-02
