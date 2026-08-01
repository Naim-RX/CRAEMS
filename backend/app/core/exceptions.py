from fastapi import HTTPException, status

class EntityNotFoundException(HTTPException):
    def __init__(self, entity_name: str, entity_id: str):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{entity_name} with ID '{entity_id}' was not found."
        )

class BookingConflictException(HTTPException):
    def __init__(self, message: str = "The selected room/time slot has a scheduling conflict."):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail=message
        )

class PermissionDeniedException(HTTPException):
    def __init__(self, message: str = "You do not have permission to perform this action."):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=message
        )

class InvalidCredentialsException(HTTPException):
    def __init__(self, message: str = "Invalid email or password."):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            headers={"WWW-Authenticate": "Bearer"},
        )
