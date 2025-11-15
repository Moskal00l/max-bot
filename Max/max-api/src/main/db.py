import os
from datetime import datetime, timezone

import ydb


driver = ydb.Driver(
    endpoint = os.getenv("YDB_ENDPOINT"),
    database = os.getenv("YDB_DATABASE"),
    credentials = ydb.iam.MetadataUrlCredentials(),
)

try:
    driver.wait(fail_fast=True, timeout=5)
except Exception as e:
    print("Ошибка подключения к YDB", e)

pool = ydb.SessionPool(driver)

# Создание события
def insert_event(event, user_id):
    def _prepare_datetime(value: datetime) -> int:
        """YDB Datetime parameters expect Unix seconds, convert Python datetime."""
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        else:
            value = value.astimezone(timezone.utc)
        return int(value.timestamp())

    def insertit(session):
        query = """
        DECLARE $user_id AS Uint64;
        DECLARE $title AS Utf8;
        DECLARE $description AS Utf8;
        DECLARE $location AS Utf8;
        DECLARE $datetime AS Datetime;
        DECLARE $link AS Utf8;
        INSERT INTO events (id, user_id, title, description, location, datetime, link) VALUES (RandomUuid($user_id), $user_id, $title, $description, $location, $datetime, $link);
        """
        prepare_query = session.prepare(query)
        session.transaction().execute(
            prepare_query,
            {
                "$user_id": user_id,
                "$title": event["title"],
                "$description": event["description"],
                "$location": event["location"],
                "$datetime": int(event["datetime"].timestamp()),
                "$link": event["link"],
            },
            commit_tx=True,
        )

    pool.retry_operation_sync(insertit)


# Список событий
def select_events(user_id):
    def selectit(session):
        query = """
        DECLARE $user_id AS Uint64;
        SELECT CAST(id as Utf8) as id, title, description, location, CAST(datetime as Timestamp) as timestamp, CAST(datetime as Utf8) as datetime, link, CAST('creator' as Utf8) as role, 1 as status
        FROM events
        WHERE user_id = $user_id
        UNION
        SELECT CAST(e.id as Utf8) as id, title, description, location, CAST(datetime as Timestamp) as timestamp, CAST(datetime as Utf8) as datetime, link, role, status
        FROM events e INNER JOIN users u ON e.id = u.event_id
        WHERE u.user_id = $user_id
        ORDER BY datetime;
        """
        prepare_query = session.prepare(query)
        return session.transaction().execute(
            prepare_query, {"$user_id": user_id}, commit_tx=True
        )

    result_set = pool.retry_operation_sync(selectit)
    return result_set[0].rows


# Информация о событии
def select_event(event_id, user_id):
    def selectit(session):
        query = """
        DECLARE $event_id AS Uuid;
        DECLARE $user_id AS Uint64;
        SELECT CAST(e.id as Utf8) as id, e.user_id as creator, title, description, location, CAST(datetime as Utf8) as datetime, link
        FROM events e
        WHERE e.id = $event_id;
        """
        prepare_query = session.prepare(query)
        return session.transaction().execute(
            prepare_query, {"$event_id": event_id, "$user_id": user_id}, commit_tx=True
        )

    result_set = pool.retry_operation_sync(selectit)
    if len(result_set[0].rows) == 0:
        return None
    return result_set[0].rows[0]


# Информация о роли пользователя в событии
def select_event_user(event_id, user_id):
    def selectit(session):
        query = """
        DECLARE $event_id AS Uuid;
        DECLARE $user_id AS Uint64;
        SELECT user_id, first_name, last_name, avatar, role, status
        FROM users
        WHERE event_id = $event_id AND user_id = $user_id;
        """
        prepare_query = session.prepare(query)
        return session.transaction().execute(
            prepare_query, {"$event_id": event_id, "$user_id": user_id}, commit_tx=True
        )

    result_set = pool.retry_operation_sync(selectit)
    if len(result_set[0].rows) == 0:
        return None
    return result_set[0].rows[0]


# Список участников события
def select_event_users(event_id, user_id):
    def selectit(session):
        query = """
        DECLARE $event_id AS Uuid;
        SELECT user_id, first_name, last_name, avatar, role, status
        FROM users
        WHERE event_id = $event_id;
        """
        prepare_query = session.prepare(query)
        return session.transaction().execute(
            prepare_query, {"$event_id": event_id}, commit_tx=True
        )

    result_set = pool.retry_operation_sync(selectit)
    return result_set[0].rows


# Удаление события
def delete_event(event_id, user_id):
    def deleteit(session):
        query = """
        DECLARE $event_id AS Uuid;
        DECLARE $user_id AS Uint64;
        DELETE FROM users WHERE event_id = $event_id;
        DELETE FROM events WHERE id = $event_id AND user_id = $user_id;
        """
        prepare_query = session.prepare(query)
        return session.transaction().execute(
            prepare_query, {"$event_id": event_id, "$user_id": user_id}, commit_tx=True
        )

    pool.retry_operation_sync(deleteit)


# Информация о событии из бота
def select_bot_event(event_id):
    def selectit(session):
        query = """
        DECLARE $event_id AS Uuid;
        SELECT CAST(e.id as Utf8) as id, e.user_id as creator, title, description, location, CAST(datetime as Utf8) as datetime, link
        FROM events e
        WHERE e.id = $event_id;
        """
        prepare_query = session.prepare(query)
        return session.transaction().execute(
            prepare_query, {"$event_id": event_id}, commit_tx=True
        )

    result_set = pool.retry_operation_sync(selectit)
    if len(result_set[0].rows) == 0:
        return None
    return result_set[0].rows[0]


# Регистрация на событие
def insert_bot_user(event_id, user):
    def insertit(session):
        query = """
        DECLARE $event_id AS Uuid;
        DECLARE $user_id AS Uint64;
        DECLARE $first_name AS Utf8;
        DECLARE $last_name AS Utf8;
        DECLARE $avatar AS Utf8;
        UPSERT INTO users (event_id, user_id, first_name, last_name, avatar) 
        VALUES ($event_id, $user_id, $first_name, $last_name, $avatar);
        """
        prepare_query = session.prepare(query)
        session.transaction().execute(
            prepare_query,
            {
                "$event_id": event_id,
                "$user_id": int(user["user_id"]),
                "$first_name": user["first_name"],
                "$last_name": user["last_name"],
                "$avatar": user["avatar"],
            },
            commit_tx=True,
        )
    
    pool.retry_operation_sync(insertit)


# Изменение роли пользователя
def update_user_role(event_id, data):
    def updateit(session):
        query = """
        DECLARE $event_id AS Uuid;
        DECLARE $user_id AS Uint64;
        DECLARE $role AS Utf8;
        UPDATE users SET role = $role
        WHERE event_id = $event_id AND user_id = $user_id; 
        """
        prepare_query = session.prepare(query)
        session.transaction().execute(
            prepare_query,
            {
                "$event_id": event_id,
                "$user_id": int(data["user_id"]),
                "$role": data["role"],
            },
            commit_tx=True,
        )
    
    pool.retry_operation_sync(updateit)


# Проверка регистрации на событие
def check_register(data):
    print(data)
    def updateit(session):
        query = """
        DECLARE $event_id AS Uuid;
        DECLARE $user_id AS Uint64;
        UPDATE users SET status = 1 
        WHERE event_id = $event_id AND user_id = $user_id
        RETURNING user_id, first_name, last_name, avatar, status, role;
        """
        prepare_query = session.prepare(query)
        return session.transaction().execute(
            prepare_query,
            {
                "$event_id": data["event_id"],
                "$user_id": int(data["user_id"]),
            },
            commit_tx=True,
        )

    result_set = pool.retry_operation_sync(updateit)
    if len(result_set[0].rows) == 0:
        return None
    return result_set[0].rows[0]


# Отменить регистрацию на событие
def delete_user(event_id, user_id):
    def deleteit(session):
        query = """
        DECLARE $event_id AS Uuid;
        DECLARE $user_id AS Uint64;
        DELETE FROM users WHERE event_id = $event_id AND user_id = $user_id AND status = 0;
        """
        prepare_query = session.prepare(query)
        return session.transaction().execute(
            prepare_query, {"$event_id": event_id, "$user_id": user_id}, commit_tx=True
        )

    pool.retry_operation_sync(deleteit)