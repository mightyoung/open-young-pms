"""File upload and download endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, Query
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession

from api.services.fastapi_code_generator.auth import get_current_user
from api.services.fastapi_code_generator.database import get_db
from api.services.fastapi_code_generator.models import User
from schemas import ApiResponse, ErrorCode
from middleware.exception import ApiException
from pydantic import BaseModel, ConfigDict
from services.file_service import file_service


class FileResponseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    filename: str
    original_name: str
    file_path: str
    file_size: Optional[int]
    mime_type: Optional[str]
    thumbnail_path: Optional[str]
    uploader_id: str
    project_id: Optional[str]
    is_deleted: bool


router = APIRouter()


@router.post("/upload", response_model=ApiResponse[FileResponseSchema])
async def upload_file(
    file: UploadFile,
    project_id: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    content = await file.read()
    if len(content) > file_service.MAX_FILE_SIZE:
        raise ApiException.from_error_code(ErrorCode.FILE_TOO_LARGE)
    file_record = await file_service.save_file(
        db, content, file.filename, str(current_user.id), project_id
    )
    return ApiResponse.ok(FileResponseSchema.model_validate(file_record), message="上传成功")


@router.get("/{file_id}", response_model=ApiResponse[FileResponseSchema])
async def get_file(
    file_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file_record = await file_service.get_file(db, file_id)
    if not file_record:
        raise ApiException.from_error_code(ErrorCode.FILE_NOT_FOUND)
    return ApiResponse.ok(FileResponseSchema.model_validate(file_record))


@router.get("/{file_id}/download")
async def download_file(
    file_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    file_record = await file_service.get_file(db, file_id)
    if not file_record or file_record.is_deleted:
        raise ApiException.from_error_code(ErrorCode.FILE_NOT_FOUND)
    return FileResponse(
        path=file_record.file_path,
        filename=file_record.original_name,
        media_type=file_record.mime_type,
    )
