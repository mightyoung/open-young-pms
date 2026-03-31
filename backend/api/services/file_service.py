"""文件上传服务 — 支持本地存储和 MinIO"""
import io
import uuid
from datetime import datetime
from pathlib import Path

from fastapi import HTTPException, UploadFile
from PIL import Image

UPLOAD_DIR = Path("./uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
MAX_IMAGE_SIZE = 10 * 1024 * 1024  # 10MB
THUMBNAIL_SIZE = (200, 200)


async def save_upload(file: UploadFile, subfolder: str = "photos") -> dict:
    """保存上传文件，返回 {url, thumbnail_url, size, filename}"""
    if file.size and file.size > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="文件大小超过10MB限制")

    content_type = file.content_type or "application/octet-stream"
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=400, detail="不支持的图片格式")

    ext = file.filename.split(".")[-1] if file.filename else "jpg"
    timestamp = datetime.utcnow()
    file_id = f"{timestamp.strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}"
    filename = f"{file_id}.{ext}"

    month_folder = timestamp.strftime("%Y%m")
    folder = UPLOAD_DIR / subfolder / month_folder
    folder.mkdir(parents=True, exist_ok=True)

    # 读取并保存原图
    content = await file.read()
    file_path = folder / filename
    with open(file_path, "wb") as f:
        f.write(content)

    # 生成缩略图
    thumb_filename = f"{file_id}_thumb.{ext}"
    thumb_path = folder / thumb_filename
    try:
        img = Image.open(io.BytesIO(content))
        img.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)
        img.save(thumb_path, quality=80)
    except Exception:
        thumb_path = file_path  # 缩略图失败时使用原图

    return {
        "url": f"/uploads/{subfolder}/{month_folder}/{filename}",
        "thumbnail_url": f"/uploads/{subfolder}/{month_folder}/{thumb_filename}",
        "size": len(content),
        "filename": filename,
    }


async def save_multiple(files: list[UploadFile], subfolder: str = "photos") -> list[dict]:
    """批量保存文件"""
    results = []
    for f in files:
        try:
            r = await save_upload(f, subfolder)
            results.append(r)
        except Exception as e:
            print(f"Upload failed for {f.filename}: {e}")
    return results
