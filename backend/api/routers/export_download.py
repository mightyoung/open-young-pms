"""文件下载路由"""

import os
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from api.services.fastapi_code_generator.auth import get_current_user
from api.utils.exporter import EXPORT_DIR

router = APIRouter(prefix="/export", tags=["数据导出"])


@router.get("/download/{file_name}")
async def download_file(file_name: str, current_user=Depends(get_current_user)):
    """下载导出的文件. file_name must be a local filename within EXPORT_DIR."""
    # Reject any path component to prevent directory traversal attacks
    if os.path.dirname(file_name):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file name")
    file_path = os.path.join(EXPORT_DIR, file_name)
    # Resolve symlinks and verify the file is still within EXPORT_DIR
    real_path = os.path.realpath(file_path)
    if not real_path.startswith(os.path.realpath(EXPORT_DIR) + os.sep):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file name")
    if not os.path.exists(real_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="文件不存在")
    return FileResponse(
        path=real_path,
        filename=file_name,
        media_type="application/octet-stream",
    )
