import re

SLUG_PATTERN = re.compile(r"^[a-zA-Z0-9][a-zA-Z0-9-]{2,31}$")
RESERVED_SLUGS = frozenset(
    {"api", "stats", "urls", "health", "docs", "python", "s"}
)


def validate_slug(slug: str) -> str | None:
    """Return error message if invalid, else None."""
    if not SLUG_PATTERN.match(slug):
        return (
            "Alias must be 3-32 characters, start with a letter or digit, "
            "and contain only letters, digits, and hyphens"
        )
    if slug.lower() in RESERVED_SLUGS:
        return f"Alias '{slug}' is reserved"
    return None


def public_slug(short) -> str:
    return short.custom_slug or short.secret_key
