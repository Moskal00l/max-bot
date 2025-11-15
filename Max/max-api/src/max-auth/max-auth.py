import os
from urllib.parse import unquote
import hmac, hashlib

# log = {}

BOT_TOKEN = os.getenv('BOT_TOKEN')

def is_valid(data: str) -> bool:
    decode_url = unquote(data)
    list_decode_url = decode_url.split('&')
    dict_decode_url = dict()
    for i in list_decode_url:
        key, value = i.split('=', 1)
        dict_decode_url[key] = value
    hash_user = dict_decode_url.pop('hash')
    list_keys = sorted(list(dict_decode_url.keys()))
    list_auth_date = []
    for key in list_keys:
        list_auth_date.append(f'{key}={dict_decode_url[key]}')
    auth_date = '\n'.join(list_auth_date)
    secret_key = hmac.new(b'WebAppData', bytes(BOT_TOKEN, 'utf-8'), hashlib.sha256).digest()
    hash_data = hmac.new(secret_key, bytes(auth_date, 'utf-8'), hashlib.sha256).hexdigest()
    return hash_data == hash_user
    

# def is_ddos(user, test):
#     global log
#     if user in log and log[user] == test:
#         print("BAN")
#         return True
#     else:
#         log[user] = test
#     return False

def handler(event, context):
    print(event)
    headers = event['headers']
    data = headers['Authorization'][7:]
    print(data)
    status = is_valid(data = data)
    print(status)
    if status:
        return {
        'isAuthorized': True,
        }
    else:
        return {
        'isAuthorized': False,
        }
