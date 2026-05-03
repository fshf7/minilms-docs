Слушатель

`/login`→`/courses`(Успешный вход)

`/courses`→`/courses/:courseId`(Клик по карточке курса)

`/courses/:courseId`→`/courses/:courseId/lessons/:lessonId/test`(Клик «Начать тест»)

`/courses/:courseId/lessons/:lessonId/test`→`/courses/:courseId`(Тест отправлен — показ результата)

`/courses`→`/notifications`(Клик по колокольчику)

`/notifications`→`/courses/:courseId`(Клик по уведомлению)



Автор

`/login`→`/author/courses`(Успешный вход)

`/author/courses`→`/author/courses/new`(Кнопка «Создать курс»)

`/author/courses/new`→`/author/courses/:courseId/edit`(Курс создан — редактор)

`/author/courses/:courseId/edit`→`/author/courses`(Публикация курса)

`/author/courses`→`/author/reports`(Клик «Отчёты по моим курсам»)



Координатор

`/login`→`/coordinator/dashboard`(Успешный вход)

`/coordinator/dashboard`→`/coordinator/assignments/new`(Кнопка «Назначить курс»)

`/coordinator/assignments/new`→`/coordinator/reports`(Успешное назначение)

`/coordinator/dashboard`→`/coordinator/reports`(Клик «Отчёты»)

`/coordinator/dashboard`→`/coordinator/groups`(Управление группами)



### Источники данных (endpoints)

|Экран|Элемент/Действие|Метод|Endpoint|Описание|
|-|-|-|-|-|
|Мои курсы|Список курсов|GET|`/users/me/enrollments`|Назначенные курсы с прогрессом|
|Мои курсы|Счётчик уведомлений|GET|`/notifications?unread=true`|Количество непрочитанных|
|Прохождение курса|Программа курса|GET|`/courses/:courseId`|Курс, уроки, прогресс|
|Прохождение курса|Контент урока|GET|`/courses/:courseId/lessons/:lessonId`|Текст, вложения, ссылки|
|Прохождение курса|Кнопка «Пройден»|POST|`/courses/:courseId/lessons/:lessonId/complete`|Отметить урок пройденным|
|Прохождение теста|Вопросы теста|GET|`/tests/:testId`|Вопросы, варианты, maxAttempts, attemptsLeft|
|Прохождение теста|Кнопка «Отправить»|POST|`/tests/:testId/attempts`|Отправка ответов + X-Idempotency-Key|
|Редактор курса|Данные курса|GET|`/author/courses/:courseId`|Курс + уроки + тесты|
|Редактор курса|Сохранить курс|PUT|`/author/courses/:courseId`|Обновить название, описание|
|Редактор курса|Добавить урок|POST|`/author/courses/:courseId/lessons`|Создать новый урок|
|Редактор курса|Редактировать урок (✎)|PUT|`/author/lessons/:lessonId`|Обновить контент, порядок, вложения|
|Редактор курса|Удалить урок (✕)|DELETE|`/author/lessons/:lessonId`|Удалить урок из курса|
|Редактор курса|Добавить тест|POST|`/author/lessons/:lessonId/tests`|Создать тест к уроку|
|Редактор курса|Опубликовать|POST|`/author/courses/:courseId/publish`|Сменить статус на «Опубликован»|
|Редактор курса|Загрузка файла|POST|`/files/upload`|Загрузить вложение (multipart/form-data)|
|Назначение курса|Список курсов|GET|`/courses?status=published`|Опубликованные курсы|
|Назначение курса|Список групп|GET|`/groups`|Группы координатора|
|Назначение курса|Кнопка «Назначить»|POST|`/assignments`|courseId, groupId, startDate, deadline|
|Отчёт|Таблица прогресса|GET|`/reports?courseId=X&groupId=Y&page=1&size=50`|Статусы пользователей + пагинация|
|Отчёт|Агрегаты|GET|`/reports/summary?courseId=X&groupId=Y`|Начали / завершили / просрочили|
|Отчёт|Фильтр по статусу|GET|`/reports?courseId=X&groupId=Y&status=overdue`|Фильтрация по статусу|

> Интерактивные макеты (wireframes) хранятся в интераутивной доске по ссылке [https://unidraw.io/app/board/6657e9b3c0bf111200c3?allow_guest=true](https://unidraw.io/app/board/6657e9b3c0bf111200c3?allow_guest=true).