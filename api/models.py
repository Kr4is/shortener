from datetime import date, datetime

from pydantic import BaseModel
from sqlalchemy import BigInteger, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from .database import Base
from .slug import public_slug


class UrlCreate(BaseModel):
    url: str
    alias: str | None = None


class Short(Base):
    __tablename__ = "shorts"

    id: Mapped[str] = mapped_column(String(16), primary_key=True)
    secret_key: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    original_url: Mapped[str] = mapped_column(Text, nullable=False)
    custom_slug: Mapped[str | None] = mapped_column(
        String(32), unique=True, nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    click_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    last_clicked_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True
    )


class ClickEvent(Base):
    __tablename__ = "click_events"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    secret_key: Mapped[str] = mapped_column(
        String(32), ForeignKey("shorts.secret_key", ondelete="CASCADE"), nullable=False
    )
    clicked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class ShortStats(BaseModel):
    secret_key: str
    original_url: str
    custom_slug: str | None
    public_slug: str
    click_count: int
    created_at: datetime
    last_clicked_at: datetime | None

    @classmethod
    def from_short(cls, short: Short) -> "ShortStats":
        return cls(
            secret_key=short.secret_key,
            original_url=short.original_url,
            custom_slug=short.custom_slug,
            public_slug=public_slug(short),
            click_count=short.click_count,
            created_at=short.created_at,
            last_clicked_at=short.last_clicked_at,
        )


class TopLink(BaseModel):
    secret_key: str
    original_url: str
    click_count: int
    public_slug: str = ""


class DailyClicks(BaseModel):
    date: date
    clicks: int


class StatsSummary(BaseModel):
    total_links: int
    total_clicks: int
    clicks_today: int
    top_link: TopLink | None


class StatsResponse(BaseModel):
    summary: StatsSummary
    daily_clicks: list[DailyClicks]
    top_links: list[TopLink]


class UrlCreateResponse(BaseModel):
    public_slug: str
