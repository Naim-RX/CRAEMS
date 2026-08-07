import httpx

client = httpx.Client()
res = client.get('http://127.0.0.1:8001/api/v1/events')
print('status', res.status_code)
print('text', res.text[:5000])
print('json type', type(res.json()).__name__)
print('count', len(res.json()) if isinstance(res.json(), list) else 'not list')
