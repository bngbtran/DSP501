from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.api import router as rest_router
from api.websocket import router as ws_router

app = FastAPI(title="ADPIS Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(rest_router)
app.include_router(ws_router)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
