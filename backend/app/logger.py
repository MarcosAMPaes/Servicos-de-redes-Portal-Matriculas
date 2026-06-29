import asyncio
import json
import os
import socket
import time
import urllib.error
import urllib.request
from typing import Any

LOKI_URL = os.getenv("LOKI_URL", "http://loki:3100").rstrip("/")
LOKI_ENABLED = os.getenv("LOKI_ENABLED", "true").lower() in {"1", "true", "yes", "on"}
LOKI_TIMEOUT = float(os.getenv("LOKI_TIMEOUT", "1.5"))
SERVICE_NAME = os.getenv("LOKI_SERVICE_NAME", "fastapi")
INSTANCE_NAME = os.getenv("HOSTNAME", socket.gethostname())


def _timestamp_ns() -> str:
    return str(time.time_ns())


def send_loki_log(
    event: str,
    message: str,
    level: str = "info",
    retries: int = 0,
    retry_delay: float = 0.5,
    **fields: Any,
) -> None:
    if not LOKI_ENABLED:
        return

    line = {
        "event": event,
        "level": level,
        "message": message,
        "service": SERVICE_NAME,
        "instance": INSTANCE_NAME,
        **fields,
    }
    payload = {
        "streams": [
            {
                "stream": {
                    "service": SERVICE_NAME,
                    "event": event,
                    "level": level,
                },
                "values": [[_timestamp_ns(), json.dumps(line, ensure_ascii=False)]],
            }
        ]
    }

    request = urllib.request.Request(
        f"{LOKI_URL}/loki/api/v1/push",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    for attempt in range(retries + 1):
        try:
            with urllib.request.urlopen(request, timeout=LOKI_TIMEOUT) as response:
                response.read()
            return
        except (OSError, urllib.error.URLError, urllib.error.HTTPError, TimeoutError):
            if attempt >= retries:
                return
            time.sleep(retry_delay)


async def send_loki_log_async(
    event: str,
    message: str,
    level: str = "info",
    retries: int = 0,
    retry_delay: float = 0.5,
    **fields: Any,
) -> None:
    await asyncio.to_thread(
        send_loki_log,
        event,
        message,
        level,
        retries,
        retry_delay,
        **fields,
    )
