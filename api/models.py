from datetime import datetime

from pydantic import BaseModel
from sqlalchemy import DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base


class Url(BaseModel):
    url: str


class Short(Base):
    __tablename__ = "shorts"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    secret_key: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    original_url: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
