import sys
from pathlib import Path

from sqlalchemy import text

from .database import engine

MIGRATIONS_DIR = Path(__file__).resolve().parent.parent / "db" / "migrations"


def _split_statements(sql: str) -> list[str]:
    statements: list[str] = []
    for part in sql.split(";"):
        statement = part.strip()
        if statement:
            statements.append(statement)
    return statements


def _ensure_migrations_table(conn) -> None:
    bootstrap = MIGRATIONS_DIR / "000_schema_migrations.sql"
    if not bootstrap.exists():
        return
    for statement in _split_statements(bootstrap.read_text()):
        conn.execute(text(statement))
    conn.commit()


def _applied_versions(conn) -> set[str]:
    rows = conn.execute(text("SELECT version FROM schema_migrations"))
    return {row[0] for row in rows}


def run_migrations() -> None:
    if not MIGRATIONS_DIR.exists():
        print("No migrations directory found, skipping.", file=sys.stderr)
        return

    with engine.connect() as conn:
        _ensure_migrations_table(conn)
        applied = _applied_versions(conn)

        for path in sorted(MIGRATIONS_DIR.glob("*.sql")):
            version = path.stem
            if version in applied:
                continue

            print(f"Applying migration: {version}", file=sys.stderr)
            for statement in _split_statements(path.read_text()):
                conn.execute(text(statement))
            conn.execute(
                text("INSERT INTO schema_migrations (version) VALUES (:v)"),
                {"v": version},
            )
            conn.commit()
            print(f"Applied migration: {version}", file=sys.stderr)


if __name__ == "__main__":
    run_migrations()
