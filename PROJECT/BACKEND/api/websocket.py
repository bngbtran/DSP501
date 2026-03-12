from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import numpy as np

from audio.realtime_eq import RealtimeFFTEQ

router = APIRouter()

SAMPLE_RATE = 44100
CHUNK_SIZE = 512
MAX_DB = 12.0


def clamp_db(x: float) -> float:
    return max(-MAX_DB, min(MAX_DB, x))


@router.websocket("/ws/realtime-eq")
async def realtime_eq(websocket: WebSocket):

    await websocket.accept()

    eq = RealtimeFFTEQ(sr=SAMPLE_RATE)

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "gains":
                incoming = data.get("gains", {})
                eq.set_gains(incoming)

                await websocket.send_json({"type": "ack", "message": "gains updated"})

            elif msg_type == "audio":
                audio = data.get("audio")
                if audio is None:
                    continue

                x = np.asarray(audio, dtype=np.float32)

                if x.ndim != 1:
                    continue

                if len(x) != CHUNK_SIZE:
                    continue

                y = eq.process(x)

                await websocket.send_json({"type": "audio", "audio": y.tolist()})

            else:
                await websocket.send_json(
                    {"type": "error", "message": "unknown message type"}
                )

    except WebSocketDisconnect:
        try:
            eq.log_snapshot()
        except Exception as e:
            print("⚠️ Snapshot log error:", e)

    except Exception as e:
        try:
            eq.log_snapshot()
        except Exception:
            pass

        await websocket.close()
