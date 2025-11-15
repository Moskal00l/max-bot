export async function requestGet(url, token) {
    let result;

    const res = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) throw new ErrorEvent('Ошибка запроса');
    const data = await res.json();

    return data;
}


export async function requestPost(url, token, user_id, first_name, last_name, avatar) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id,
        first_name,
        last_name,
        avatar
      })
    });

    if (!response.ok) {
      throw new Error(`Ошибка HTTP: ${response.status}`);
    }

    const data = await response.json();
    console.log('Ответ сервера на POST:', data);

    return response.ok;  
  } catch (error) {
    console.error('Ошибка при отправке:', error);
    return false;  
  }
}
