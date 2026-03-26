"""文件下载路由"""
from fastapi import APIRouter, Depends
from fastapi.responses import FileResponse
from api.services.fastapi_code_generator.auth import get_current_user
from api.utils.exporter import EXPORT_DIR
import os

router = APIRouter(prefix="/export", tags=["数据导出"])


@router.get("/download/{file_name}")
async def download_file(file_name: str, current_user=Depends(get_current_user)):
    """下载导出的文件"""
    file_path = os.path.join(EXPORT_DIR, file_name)
    if not os.path.exists(file_path):
        return {"code": "E0001", "message": "文件不存在", "data": None}
    return FileResponse(
        path=file_path,
        filename=file_name,
        media_type='application/octet-stream',
    )
