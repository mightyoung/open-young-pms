"""文件上传路由"""

from fastapi import APIRouter, File, HTTPException, UploadFile

from api.response import ApiResponse
from api.services.file_service import save_multiple

router = APIRouter(prefix="/upload", tags=["文件上传"])


@router.post("/images")
async def upload_images(files: list[UploadFile] = File(...)):
    """上传多张图片（最多9张），返回文件 URL 列表"""
    if len(files) > 9:
        raise HTTPException(status_code=400, detail="最多上传9张图片")
    results = await save_multiple(files, "photos")
    return ApiResponse.ok(results)
