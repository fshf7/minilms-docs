---
sidebar_position: 4
title: Асинхронное взаимодействие
---
# MiniLMS — Асинхронное взаимодействие

## Что переводим на асинхронку

Рассылка уведомлений при назначении курса группе (связка UC-06 и UC-09).

В текущей архитектуре координатор нажимает «Назначить курс», и Backend API в рамках того же запроса `POST /assignments` синхронно дёргает Сервис уведомлений - тот пишет уведомления в БД и доставляет их слушателям. Это видно на sequence-диаграмме проекта: API → Notify → DB → Learner - всё в одной цепочке.

Проблема в том, что если в группе, скажем, 50 человек, серверу нужно прямо в ответ на запрос координатора создать 50 записей. Координатору при этом не нужно ждать, пока дойдёт последнее уведомление — ему важно знать, что назначение сохранилось.

Решение: после сохранения назначений в БД Backend API кладёт событие в очередь RabbitMQ и сразу отвечает координатору 201. Сервис уведомлений вычитывает событие из очереди в фоне и создаёт уведомления уже без спешки.

Через тот же механизм пойдут ещё два события, которые по UC-09 генерируются фоновой задачей:

- напоминание за N дней до дедлайна (тип уведомления `deadline_soon`)

- сообщение о просрочке (тип `overdue`)

## Почему RabbitMQ

Нагрузка в MiniLMS — порядка 30 000 уведомлений в год, это ~80 в день. RabbitMQ спокойно держит 4–10 тысяч сообщений в секунду, так что запас огромный.

Kafka здесь избыточна: она про миллионы сообщений и сложное администрирование, а у нас MVP для компаний на 10–300 человек. NATS хорош, но больше заточен под Go-экосистему, а у нас стандартный стек (REST + JSON + PostgreSQL) — RabbitMQ имеет клиентские библиотеки под любой язык. gRPC-стримы создали бы жёсткую связь между сервисами, а мы как раз хотим их развязать. WebSocket — это про доставку на клиент, а не про межсервисное взаимодействие.

Порядок доставки не важен — уведомления независимы. Сообщения маленькие (JSON, 200–500 байт). Настроил один раз — работает.

Гарантия доставки — at-least-once. RabbitMQ повторяет отправку, пока консьюмер не подтвердит получение. Дубли защищены полем `eventId` в каждом сообщении — Сервис уведомлений проверяет, обрабатывал ли он этот ID, и если да, пропускает. Это напрямую закрывает требование из FR UC-09 E1: «система не должна создавать дубликаты».

## Схема

```Plain Text
Координатор
    │
    ▼
 Web UI ──► Backend API                     Сервис уведомлений
              │                                    │
              │ 1. POST /assignments               │
              │    → сохранить назначения в БД      │
              │    → вернуть 201                    │
              │                                    │
              │ 2. Publish в RabbitMQ               │
              ▼                                    │
         ┌──────────┐                              │
         │ RabbitMQ │──── lms.events ────────────►  │
         │          │     notifications.q           │
         └──────────┘                              │
                                                   ▼
                                          3. Вычитать событие
                                          4. Создать уведомления
                                          5. Сохранить в БД
```

## Контракт (AsyncAPI 3.0)

Формат обмена — JSON, потому что весь остальной API проекта на JSON (см. OpenAPI-спецификацию). Описание через AsyncAPI, как требуется для JSON-обмена по условию задания.

```YAML
asyncapi: 3.0.0

info:
  title: MiniLMS Notification Events
  version: 1.0.0
  description: |
    Контракт асинхронного взаимодействия между Backend API и Сервисом уведомлений.
    Backend публикует события → RabbitMQ → Сервис уведомлений создаёт записи в БД.

servers:
  production:
    host: rabbitmq.minilms.local:5672
    protocol: amqp
    description: RabbitMQ

channels:
  assignmentCreated:
    address: lms.events.assignment.created
    messages:
      AssignmentCreatedMessage:
        $ref: '#/components/messages/AssignmentCreated'
    bindings:
      amqp:
        is: routingKey
        exchange:
          name: lms.events
          type: topic
          durable: true
        queue:
          name: notifications.assignment-created
          durable: true

  deadlineApproaching:
    address: lms.events.deadline.approaching
    messages:
      DeadlineApproachingMessage:
        $ref: '#/components/messages/DeadlineApproaching'
    bindings:
      amqp:
        is: routingKey
        exchange:
          name: lms.events
          type: topic
          durable: true
        queue:
          name: notifications.deadline-approaching
          durable: true

  assignmentOverdue:
    address: lms.events.assignment.overdue
    messages:
      AssignmentOverdueMessage:
        $ref: '#/components/messages/AssignmentOverdue'
    bindings:
      amqp:
        is: routingKey
        exchange:
          name: lms.events
          type: topic
          durable: true
        queue:
          name: notifications.assignment-overdue
          durable: true

operations:
  publishAssignmentCreated:
    action: send
    channel:
      $ref: '#/channels/assignmentCreated'
    summary: |
      Backend API публикует после успешного POST /assignments.
      Одно событие на группу — Сервис уведомлений разворачивает
      userIds в отдельные записи Notification.

  consumeAssignmentCreated:
    action: receive
    channel:
      $ref: '#/channels/assignmentCreated'
    summary: Сервис уведомлений создаёт уведомления типа course_assigned

  publishDeadlineApproaching:
    action: send
    channel:
      $ref: '#/channels/deadlineApproaching'
    summary: Фоновая задача кладёт событие за N дней до дедлайна

  consumeDeadlineApproaching:
    action: receive
    channel:
      $ref: '#/channels/deadlineApproaching'
    summary: Сервис уведомлений создаёт уведомления типа deadline_soon

  publishAssignmentOverdue:
    action: send
    channel:
      $ref: '#/channels/assignmentOverdue'
    summary: Фоновая задача кладёт событие при наступлении дедлайна

  consumeAssignmentOverdue:
    action: receive
    channel:
      $ref: '#/channels/assignmentOverdue'
    summary: Сервис уведомлений создаёт уведомления типа overdue

components:
  messages:
    AssignmentCreated:
      name: AssignmentCreated
      contentType: application/json
      payload:
        type: object
        required: [eventId, eventType, timestamp, data]
        properties:
          eventId:
            type: string
            format: uuid
            description: Ключ идемпотентности (защита от дублей, FR UC-09 E1)
          eventType:
            type: string
            const: assignment.created
          timestamp:
            type: string
            format: date-time
          data:
            type: object
            required: [courseId, courseName, groupId, userIds, deadline]
            properties:
              courseId:
                type: string
                format: uuid
              courseName:
                type: string
                description: Для формирования текста уведомления
                examples: ["Онбординг новых сотрудников"]
              groupId:
                type: string
                format: uuid
              userIds:
                type: array
                items:
                  type: string
                  format: uuid
                description: Участники группы на момент назначения
              startDate:
                type: string
                format: date
                nullable: true
              deadline:
                type: string
                format: date
                nullable: true
                examples: ["2026-05-15"]
              assignedBy:
                type: string
                format: uuid
                description: ID координатора

    DeadlineApproaching:
      name: DeadlineApproaching
      contentType: application/json
      payload:
        type: object
        required: [eventId, eventType, timestamp, data]
        properties:
          eventId:
            type: string
            format: uuid
          eventType:
            type: string
            const: deadline.approaching
          timestamp:
            type: string
            format: date-time
          data:
            type: object
            required: [courseId, courseName, userIds, deadline, daysLeft]
            properties:
              courseId:
                type: string
                format: uuid
              courseName:
                type: string
              userIds:
                type: array
                items:
                  type: string
                  format: uuid
                description: Только те, кто ещё не завершил курс
              deadline:
                type: string
                format: date
              daysLeft:
                type: integer
                description: Дней до дедлайна
                examples: [3]

    AssignmentOverdue:
      name: AssignmentOverdue
      contentType: application/json
      payload:
        type: object
        required: [eventId, eventType, timestamp, data]
        properties:
          eventId:
            type: string
            format: uuid
          eventType:
            type: string
            const: assignment.overdue
          timestamp:
            type: string
            format: date-time
          data:
            type: object
            required: [courseId, courseName, userIds, deadline]
            properties:
              courseId:
                type: string
                format: uuid
              courseName:
                type: string
              userIds:
                type: array
                items:
                  type: string
                  format: uuid
                description: Не завершившие курс к дедлайну
              deadline:
                type: string
                format: date
```

## Что это даёт

Координатор получает ответ быстро — API не ждёт, пока все уведомления создадутся. Если Сервис уведомлений упал, сообщения лежат в очереди и обработаются после восстановления — ничего не потеряется. А если завтра захотим добавить email-рассылку, достаточно подписать нового консьюмера на тот же exchange, не трогая код API.

