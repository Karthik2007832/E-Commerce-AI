from fastapi import FastAPI, HTTPException
from recommender import HybridRecommender
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

recommender = HybridRecommender()

class RecommendationRequest(BaseModel):
    user_id: Optional[str] = None
    last_product_id: Optional[int] = None
    top_n: int = 10

@app.on_event("startup")
async def startup_event():
    # Attempt initial data load
    status = recommender.load_data()
    if status:
        print("Model Loaded and Ready.")
    else:
        print("Model Loading Failed (No data found).")

@app.post("/train")
async def train_model():
    status = recommender.load_data()
    if status:
        return {"message": "Model retrained successfully."}
    else:
        raise HTTPException(status_code=500, detail="Retraining failed (No data available).")

@app.get("/recommend/{user_id}")
async def get_recommendations(user_id: str, last_product_id: Optional[int] = None, exclude_ids: Optional[str] = None):
    exclude_list = []
    if exclude_ids and exclude_ids.strip():
        try:
            exclude_list = [int(x) for x in exclude_ids.split(',') if x.strip()]
        except ValueError:
            exclude_list = []
            
    recs = recommender.get_hybrid_recommendations(user_id, last_product_id, exclude_ids=exclude_list)
    return recs

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
