---
sidebar_position: 2
title: Use-case
---
# Use Case — Диаграмма прецедентов

## Диаграмма

```plantuml
@startuml
left to right direction
skinparam packageStyle rectangle

actor "Пользователь" as User
actor "Слушатель" as Learner
actor "Автор" as Author
actor "Координатор" as Coordinator
actor "Админ" as Admin
actor "Система" as System

User <|-- Learner
User <|-- Author
User <|-- Coordinator
Coordinator <|-- Admin

rectangle "MiniLMS" {
  usecase "UC-01\nВойти в систему" as UC01
  usecase "UC-02\nСоздать курс" as UC02
  usecase "UC-03\nДобавить урок\nв курс" as UC03
  usecase "UC-04\nСоздать тест\nк уроку" as UC04
  usecase "UC-05\nОпубликовать курс" as UC05
  usecase "UC-06\nНазначить курс\nгруппе" as UC06
  usecase "UC-07\nПройти урок\nи тест" as UC07
  usecase "UC-08\nПросмотреть отчёт\nпо курсу/группе" as UC08
  usecase "UC-09\nУведомления\nо назначении\nи дедлайнах" as UC09
  usecase "Увидеть результат\nтеста" as UC_TestResult
  usecase "Установить\nдедлайн" as UC_Deadline
  usecase "Просмотреть\nсвой прогресс" as UC_Progress
}

User --> UC01
Learner --> UC07
Learner --> UC_Progress
Author --> UC02
Author --> UC03
Author --> UC05
Author --> UC08
Coordinator --> UC06
Coordinator --> UC08
System --> UC09

UC07 ..> UC_TestResult : <<include>>
UC06 ..> UC09 : <<include>>
UC_Deadline ..> UC06 : <<extend>>
UC04 ..> UC03 : <<extend>>
UC_Progress ..> UC07 : <<extend>>
@enduml
```

## Описание связей

| Связь | Тип | Пояснение |
|-------|-----|-----------|
| UC-07 → Результат теста | include | Прохождение теста всегда показывает результат |
| UC-06 → UC-09 | include | Назначение курса всегда создаёт уведомление |
| Дедлайн → UC-06 | extend | Установка дедлайна — опциональная часть назначения |
| UC-04 → UC-03 | extend | Тест добавляется к уроку (не обязательно) |
| Прогресс → UC-07 | extend | Просмотр прогресса — опциональная часть прохождения |
