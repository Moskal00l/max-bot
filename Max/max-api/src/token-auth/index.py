import os

# log = {}

BOT_TOKEN = os.getenv('BOT_TOKEN')

def is_valid(data: str) -> bool:
    return data == BOT_TOKEN
    
def handler(event, context):
    print(event)
    headers = event['headers']
    data = headers['Authorization'][7:]
    status = is_valid(data = data)
    if status:
        return {
        'isAuthorized': True,
        }
    else:
        return {
        'isAuthorized': False,
        }
