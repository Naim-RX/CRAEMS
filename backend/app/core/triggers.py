import logging
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine

logger = logging.getLogger("craems.triggers")

TRIGGER_DEFINITIONS = [
    # ── 1. ROOM BOOKINGS TRIGGERS ──────────────────────────────────────────
    """
    DROP TRIGGER IF EXISTS trg_room_bookings_insert;
    """,
    """
    CREATE TRIGGER trg_room_bookings_insert
    AFTER INSERT ON room_bookings
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NEW.user_id,
            CONCAT('CREATE_BOOKING_', NEW.status),
            'RoomBooking',
            NEW.id,
            JSON_OBJECT(
                'booking_reference', NEW.booking_reference,
                'room_id', NEW.room_id,
                'title', NEW.title,
                'purpose', NEW.purpose,
                'start_time', DATE_FORMAT(NEW.start_time, '%Y-%m-%d %H:%i:%s'),
                'end_time', DATE_FORMAT(NEW.end_time, '%Y-%m-%d %H:%i:%s'),
                'status', NEW.status,
                'attendees_count', NEW.attendees_count
            ),
            NOW()
        );
    END;
    """,
    """
    DROP TRIGGER IF EXISTS trg_room_bookings_update;
    """,
    """
    CREATE TRIGGER trg_room_bookings_update
    AFTER UPDATE ON room_bookings
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NEW.user_id,
            CASE
                WHEN OLD.status != NEW.status THEN CONCAT('BOOKING_STATUS_', NEW.status)
                ELSE 'UPDATE_BOOKING'
            END,
            'RoomBooking',
            NEW.id,
            JSON_OBJECT(
                'booking_reference', NEW.booking_reference,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'old_title', OLD.title,
                'new_title', NEW.title,
                'start_time', DATE_FORMAT(NEW.start_time, '%Y-%m-%d %H:%i:%s'),
                'end_time', DATE_FORMAT(NEW.end_time, '%Y-%m-%d %H:%i:%s')
            ),
            NOW()
        );
    END;
    """,
    """
    DROP TRIGGER IF EXISTS trg_room_bookings_delete;
    """,
    """
    CREATE TRIGGER trg_room_bookings_delete
    AFTER DELETE ON room_bookings
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            OLD.user_id,
            'DELETE_BOOKING',
            'RoomBooking',
            OLD.id,
            JSON_OBJECT(
                'booking_reference', OLD.booking_reference,
                'room_id', OLD.room_id,
                'title', OLD.title,
                'status', OLD.status
            ),
            NOW()
        );
    END;
    """,

    # ── 2. EQUIPMENT RESERVATIONS TRIGGERS ─────────────────────────────────
    """
    DROP TRIGGER IF EXISTS trg_equipment_reservations_insert;
    """,
    """
    CREATE TRIGGER trg_equipment_reservations_insert
    AFTER INSERT ON equipment_reservations
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NEW.user_id,
            CONCAT('RESERVE_EQUIPMENT_', NEW.status),
            'EquipmentReservation',
            NEW.id,
            JSON_OBJECT(
                'equipment_id', NEW.equipment_id,
                'status', NEW.status,
                'start_time', DATE_FORMAT(NEW.start_time, '%Y-%m-%d %H:%i:%s'),
                'expected_return_time', DATE_FORMAT(NEW.expected_return_time, '%Y-%m-%d %H:%i:%s')
            ),
            NOW()
        );
    END;
    """,
    """
    DROP TRIGGER IF EXISTS trg_equipment_reservations_update;
    """,
    """
    CREATE TRIGGER trg_equipment_reservations_update
    AFTER UPDATE ON equipment_reservations
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NEW.user_id,
            CASE
                WHEN OLD.status != NEW.status THEN CONCAT('EQUIPMENT_RESERVATION_', NEW.status)
                ELSE 'UPDATE_EQUIPMENT_RESERVATION'
            END,
            'EquipmentReservation',
            NEW.id,
            JSON_OBJECT(
                'equipment_id', NEW.equipment_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'actual_return_time', IFNULL(DATE_FORMAT(NEW.actual_return_time, '%Y-%m-%d %H:%i:%s'), NULL)
            ),
            NOW()
        );
    END;
    """,
    """
    DROP TRIGGER IF EXISTS trg_equipment_reservations_delete;
    """,
    """
    CREATE TRIGGER trg_equipment_reservations_delete
    AFTER DELETE ON equipment_reservations
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            OLD.user_id,
            'DELETE_EQUIPMENT_RESERVATION',
            'EquipmentReservation',
            OLD.id,
            JSON_OBJECT(
                'equipment_id', OLD.equipment_id,
                'status', OLD.status
            ),
            NOW()
        );
    END;
    """,

    # ── 3. EVENTS TRIGGERS ────────────────────────────────────────────────
    """
    DROP TRIGGER IF EXISTS trg_events_insert;
    """,
    """
    CREATE TRIGGER trg_events_insert
    AFTER INSERT ON events
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NEW.organizer_id,
            CONCAT('CREATE_EVENT_', NEW.status),
            'Event',
            NEW.id,
            JSON_OBJECT(
                'title', NEW.title,
                'status', NEW.status,
                'room_id', NEW.room_id,
                'max_seats', NEW.max_seats,
                'event_mode', NEW.event_mode,
                'is_published', NEW.is_published,
                'start_time', DATE_FORMAT(NEW.start_time, '%Y-%m-%d %H:%i:%s')
            ),
            NOW()
        );
    END;
    """,
    """
    DROP TRIGGER IF EXISTS trg_events_update;
    """,
    """
    CREATE TRIGGER trg_events_update
    AFTER UPDATE ON events
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NEW.organizer_id,
            CASE
                WHEN OLD.status != NEW.status THEN CONCAT('EVENT_STATUS_', NEW.status)
                WHEN OLD.is_deleted = 0 AND NEW.is_deleted = 1 THEN 'SOFT_DELETE_EVENT'
                ELSE 'UPDATE_EVENT'
            END,
            'Event',
            NEW.id,
            JSON_OBJECT(
                'title', NEW.title,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'old_is_published', OLD.is_published,
                'new_is_published', NEW.is_published,
                'is_deleted', NEW.is_deleted
            ),
            NOW()
        );
    END;
    """,
    """
    DROP TRIGGER IF EXISTS trg_events_delete;
    """,
    """
    CREATE TRIGGER trg_events_delete
    AFTER DELETE ON events
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            OLD.organizer_id,
            'HARD_DELETE_EVENT',
            'Event',
            OLD.id,
            JSON_OBJECT(
                'title', OLD.title,
                'status', OLD.status
            ),
            NOW()
        );
    END;
    """,

    # ── 4. EQUIPMENT ITEMS TRIGGERS ────────────────────────────────────────
    """
    DROP TRIGGER IF EXISTS trg_equipment_insert;
    """,
    """
    CREATE TRIGGER trg_equipment_insert
    AFTER INSERT ON equipment
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NULL,
            'ADD_EQUIPMENT_INVENTORY',
            'Equipment',
            NEW.id,
            JSON_OBJECT(
                'serial_number', NEW.serial_number,
                'name', NEW.name,
                'category_id', NEW.category_id,
                'condition', NEW.condition,
                'is_available', NEW.is_available
            ),
            NOW()
        );
    END;
    """,
    """
    DROP TRIGGER IF EXISTS trg_equipment_update;
    """,
    """
    CREATE TRIGGER trg_equipment_update
    AFTER UPDATE ON equipment
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NULL,
            CASE
                WHEN OLD.condition != NEW.condition THEN CONCAT('EQUIPMENT_CONDITION_', NEW.condition)
                WHEN OLD.is_available != NEW.is_available THEN CONCAT('EQUIPMENT_AVAILABILITY_', IF(NEW.is_available, 'ONLINE', 'OFFLINE'))
                ELSE 'UPDATE_EQUIPMENT'
            END,
            'Equipment',
            NEW.id,
            JSON_OBJECT(
                'serial_number', NEW.serial_number,
                'name', NEW.name,
                'old_condition', OLD.condition,
                'new_condition', NEW.condition,
                'old_is_available', OLD.is_available,
                'new_is_available', NEW.is_available
            ),
            NOW()
        );
    END;
    """,

    # ── 5. ROOMS TRIGGERS ──────────────────────────────────────────────────
    """
    DROP TRIGGER IF EXISTS trg_rooms_insert;
    """,
    """
    CREATE TRIGGER trg_rooms_insert
    AFTER INSERT ON rooms
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NULL,
            'CREATE_ROOM_FACILITY',
            'Room',
            NEW.id,
            JSON_OBJECT(
                'room_number', NEW.room_number,
                'building_id', NEW.building_id,
                'capacity', NEW.capacity,
                'is_active', NEW.is_active,
                'is_maintenance', NEW.is_maintenance
            ),
            NOW()
        );
    END;
    """,
    """
    DROP TRIGGER IF EXISTS trg_rooms_update;
    """,
    """
    CREATE TRIGGER trg_rooms_update
    AFTER UPDATE ON rooms
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NULL,
            CASE
                WHEN OLD.is_maintenance != NEW.is_maintenance THEN IF(NEW.is_maintenance, 'ROOM_MAINTENANCE_ENABLED', 'ROOM_MAINTENANCE_CLEARED')
                WHEN OLD.is_active != NEW.is_active THEN IF(NEW.is_active, 'ROOM_ACTIVATED', 'ROOM_DEACTIVATED')
                ELSE 'UPDATE_ROOM_FACILITY'
            END,
            'Room',
            NEW.id,
            JSON_OBJECT(
                'room_number', NEW.room_number,
                'old_capacity', OLD.capacity,
                'new_capacity', NEW.capacity,
                'old_is_maintenance', OLD.is_maintenance,
                'new_is_maintenance', NEW.is_maintenance,
                'old_is_active', OLD.is_active,
                'new_is_active', NEW.is_active
            ),
            NOW()
        );
    END;
    """,

    # ── 6. USERS TRIGGERS ──────────────────────────────────────────────────
    """
    DROP TRIGGER IF EXISTS trg_users_insert;
    """,
    """
    CREATE TRIGGER trg_users_insert
    AFTER INSERT ON users
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NEW.id,
            'USER_REGISTERED',
            'User',
            NEW.id,
            JSON_OBJECT(
                'full_name', NEW.full_name,
                'email', NEW.email,
                'role_id', NEW.role_id,
                'department_id', NEW.department_id,
                'is_active', NEW.is_active
            ),
            NOW()
        );
    END;
    """,
    """
    DROP TRIGGER IF EXISTS trg_users_update;
    """,
    """
    CREATE TRIGGER trg_users_update
    AFTER UPDATE ON users
    FOR EACH ROW
    BEGIN
        INSERT INTO audit_logs (user_id, action, entity_name, entity_id, changes, timestamp)
        VALUES (
            NEW.id,
            CASE
                WHEN OLD.is_active != NEW.is_active THEN IF(NEW.is_active, 'USER_ACCOUNT_ACTIVATED', 'USER_ACCOUNT_SUSPENDED')
                WHEN OLD.role_id != NEW.role_id THEN 'USER_ROLE_CHANGED'
                ELSE 'UPDATE_USER_PROFILE'
            END,
            'User',
            NEW.id,
            JSON_OBJECT(
                'full_name', NEW.full_name,
                'email', NEW.email,
                'old_role_id', OLD.role_id,
                'new_role_id', NEW.role_id,
                'old_is_active', OLD.is_active,
                'new_is_active', NEW.is_active
            ),
            NOW()
        );
    END;
    """
]

async def install_database_triggers(engine: AsyncEngine):
    """
    Executes database trigger installation scripts for automated auditing.
    Skips DELETE triggers as per requirements.
    """
    logger.info("Installing MySQL audit triggers (excluding DELETE)...")
    async with engine.begin() as conn:
        for stmt in TRIGGER_DEFINITIONS:
            cleaned = stmt.strip()
            if not cleaned:
                continue
            # Exclude DELETE triggers
            if "AFTER DELETE" in cleaned.upper():
                continue
            try:
                await conn.execute(text(cleaned))
            except Exception as exc:
                logger.warning(f"Trigger creation note (statement: {cleaned[:40]}...): {exc}")
    logger.info("MySQL audit triggers initialized successfully.")
