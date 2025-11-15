from mangum import Mangum
from fastapi import FastAPI, Header, status, Depends
from fastapi.responses import JSONResponse, Response
from fastapi.exceptions import HTTPException
from urllib.parse import unquote
import json
import logging
from logging import Formatter
from models import Event, User, CheckData, RoleData
import db
import uuid

class JsonFormatter(Formatter):
    EXTRA_KEYS = ["user_id", "cloud_id"]

    def __init__(self):
        super(JsonFormatter,self).__init__()

    def format(self, record):
        json_record = {}
        json_record["message"] = record.getMessage()
        json_record["level"] = str.replace(str.replace(record.levelname, "WARNING", "WARN"), "CRITICAL", "FATAL")
        if hasattr(self, "EXTRA_KEYS"):
            for key in self.EXTRA_KEYS:
                if val := record.__dict__.get(key, None):
                    json_record[key] = val
        
        return json.dumps(json_record)
    
logHandler = logging.StreamHandler()
logHandler.setFormatter(JsonFormatter())

logger = logging.getLogger("EventLogger")
logger.propagate = False
logger.addHandler(logHandler)
logger.setLevel(logging.DEBUG)
        

app = FastAPI()

def get_user_id(
    authorization: str = Header(default="Bearer"),
) -> str:
    token = authorization.split(" ")[1]

    decode_url = unquote(token)
    list_decode_url = decode_url.split('&')
    dict_decode_url = dict()
    for i in list_decode_url:
        key, value = i.split('=', 1)
        dict_decode_url[key] = value
    user_data = dict_decode_url['user'][1:-1].split(',')
    user_data_dict = dict()
    for i in user_data:
        key, value = i.split(':', 1)
        user_data_dict[key[1:-1]] = value
    return int(user_data_dict['id'])


# Получение списка событий
@app.get("/events", status_code=status.HTTP_200_OK)
def get_events(user_id: int = Depends(get_user_id)):
    try:
        events = db.select_events(user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    return JSONResponse(status_code=status.HTTP_200_OK, content={"events": events})
    

# Получение информации о событии
@app.get("/events/{event}", status_code=status.HTTP_200_OK)
def get_event(event, user_id: int = Depends(get_user_id)):
    try:
        event_id = uuid.UUID(event)
        event_data = db.select_event(event_id, user_id)
        if event_data['creator'] == user_id:
            event_data["role"] = "creator"
        else:
            user_data = db.select_event_user(event_id, user_id)
            event_data["status"] = user_data["status"]
            if user_data:
                event_data["role"] = user_data["role"]
            else:
                event_data["role"] = "guest"
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    return JSONResponse(status_code=status.HTTP_200_OK, content={"event": event_data})


# Получение списка участников
@app.get("/events/{event}/users", status_code=status.HTTP_200_OK)
def get_event(event, user_id: int = Depends(get_user_id)):
    try:
        event_id = uuid.UUID(event)
        users = db.select_event_users(event_id, user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    return JSONResponse(status_code=status.HTTP_200_OK, content={"users": users})
    
# Создание события
@app.post("/events", status_code=status.HTTP_201_CREATED)
def create_event(event: Event, user_id: int = Depends(get_user_id)):
    try:
        event_object = event.model_dump()
        print(event_object)
        db.insert_event(event_object, user_id)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"user_id": user_id}
    )


# Удаление события
@app.delete("/events/{event}", status_code=status.HTTP_200_OK)
def delete_event(event, user_id: int = Depends(get_user_id)):
    try:
        event_id = uuid.UUID(event)
        db.delete_event(event_id, user_id)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "Ok"})


# Получение информации о событии из бота
@app.get("/bot/events/{event}", status_code=status.HTTP_200_OK)
def get_bot_event(event):
    try:
        event_id = uuid.UUID(event)
        event_data = db.select_bot_event(event_id)
    except ValueError:
        return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_CONTENT, content={"message": "event_id error"})
    except Exception as e:
        print("Database error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    return JSONResponse(status_code=status.HTTP_200_OK, content={"event": event_data})


# Регистрация на событие
@app.post("/bot/events/{event}", status_code=status.HTTP_201_CREATED)
def register(event, user: User):
    try:
        print(user)
        event_id = uuid.UUID(event)
        user_object = user.model_dump()
        print(user_object)
        db.insert_bot_user(event_id, user_object)
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return JSONResponse(
        status_code=status.HTTP_201_CREATED,
        content={"message": "Ok"}
    )


# Изменение роли пользователя
@app.post("/events/{event}/role", status_code=status.HTTP_200_OK)
def set_role(event, data: RoleData):
    try:
        event_id = uuid.UUID(event)
        data_object = data.model_dump()
        db.update_user_role(event_id, data_object)
    except Exception as e:
        print(str(e))
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return JSONResponse(
        status_code=status.HTTP_200_OK,
        content={"message": "Ok"}
    )


# Проверка регистрации на событие
@app.post("/check", status_code=status.HTTP_200_OK)
def check_register(scanData: CheckData, user_id: int = Depends(get_user_id)):
    try:
        print(scanData)
        data = scanData.model_dump()
        print(data)
        data["event_id"] = uuid.UUID(data["event_id"])
        user = db.check_register(data)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    if user:
        return JSONResponse(
            status_code=status.HTTP_200_OK,
            content={"user": user}
        )
    return Response(status_code=status.HTTP_403_FORBIDDEN)


# Отмена регистрации на событие
@app.delete("/events/{event}/unregister", status_code=status.HTTP_200_OK)
def unregister(event, user_id: int = Depends(get_user_id)):
    try:
        event_id = uuid.UUID(event)
        db.delete_user(event_id, user_id)
    except Exception as e:
        print(str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "Ok"})

handler = Mangum(app)
