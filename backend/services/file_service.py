"""File storage service — save files and generate thumbnails."""

import uuid
from pathlib import Path
from typing import Optional

from PIL import Image
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from models.file import File


class FileService:
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf"}
    MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
    THUMBNAIL_SIZE = (200, 200)

    def __init__(self, upload_dir: str = None):
        self.upload_dir = Path(upload_dir or "uploads")
        self.thumb_dir = self.upload_dir / "thumbnails"
        self.thumb_dir.mkdir(parents=True, exist_ok=True)

    async def save_file(
        self,
        db: AsyncSession,
        file_data: bytes,
        filename: str,
        uploader_id: str,
        project_id: Optional[str] = None,
    ) -> File:
        ext = Path(filename).suffix.lower()
        if ext not in self.ALLOWED_EXTENSIONS:
            ext = ".bin"

        file_id = str(uuid.uuid4())
        stored_name = f"{file_id}{ext}"
        file_path = self.upload_dir / stored_name

        with open(file_path, "wb") as f:
            f.write(file_data)

        thumbnail_path = (
            self._generate_thumbnail(file_path, file_id) if ext in {".jpg", ".jpeg", ".png", ".gif"} else None
        )

        file_record = File(
            id=file_id,
            filename=stored_name,
            original_name=filename,
            file_path=str(file_path),
            file_size=len(file_data),
            mime_type=self._mime_type(ext),
            thumbnail_path=thumbnail_path,
            uploader_id=uploader_id,
            project_id=project_id,
        )
        db.add(file_record)
        await db.commit()
        await db.refresh(file_record)
        return file_record

    def _generate_thumbnail(self, file_path: Path, file_id: str) -> Optional[str]:
        try:
            with Image.open(file_path) as img:
                img.thumbnail(self.THUMBNAIL_SIZE)
                thumb_path = self.thumb_dir / f"{file_id}_thumb.jpg"
                img.convert("RGB").save(thumb_path, "JPEG", quality=85)
            return str(thumb_path)
        except Exception:
            return None

    def _mime_type(self, ext: str) -> str:
        mapping = {
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".gif": "image/gif",
            ".pdf": "application/pdf",
        }
        return mapping.get(ext, "application/octet-stream")

    async def get_file(self, db: AsyncSession, file_id: str) -> Optional[File]:
        result = await db.execute(select(File).where(File.id == file_id))
        return result.scalar_one_or_none()


file_service = FileService()
