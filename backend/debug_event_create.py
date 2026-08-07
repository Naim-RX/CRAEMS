from fastapi.testclient import TestClient
from app.main import app
from app.core.database import AsyncSessionLocal
import asyncio

from sqlalchemy import select
from app.models.user import User

async def get_admin_id():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User.id).where(User.email == 'admin@craems.edu').limit(1))
        row = result.first()
        return row[0] if row else None

admin_id = asyncio.run(get_admin_id())
print('admin_id', admin_id)

payload = {
    'title': 'Test Event 500 Debug',
    'description': 'A test event payload to reproduce server error.',
    'category_id': 1,
    'department_id': 1,
    'room_id': None,
    'start_time': '2026-09-01T10:00:00',
    'end_time': '2026-09-01T12:00:00',
    'registration_deadline': '2026-08-31T23:59:00',
    'max_seats': 100,
    'event_mode': 'ONLINE',
    'price_type': 'FREE',
    'price_amount': 0.0,
    'cover_image': None,
    'is_public': True
}

with TestClient(app) as client:
    resp = client.post(f'/api/v1/events?organizer_id={admin_id}', json=payload)
    print('status', resp.status_code)
    try:
        print('json', resp.json())
    except Exception as exc:
        print('json parse error', exc)
        print('text', resp.text)
