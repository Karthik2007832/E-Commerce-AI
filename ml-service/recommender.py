import pandas as pd
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/ecommerce-ai")
client = MongoClient(MONGO_URI)
db = client.get_database()

class HybridRecommender:
    def __init__(self):
        self.products_df = None
        self.interactions_df = None
        self.tfidf_matrix = None
        self.user_item_matrix = None
        self.product_indices = None

    def load_data(self):
        try:
            products = list(db.products.find({}, {"_id": 0}))
            interactions = list(db.interactions.find({}, {"_id": 0}))
            
            if not products:
                print("No products in DB. Using Mock Data.")
                self.products_df = pd.DataFrame([
                    {"externalId": 1, "title": "Premium AI Performance Laptop", "description": "Ultimate power", "category": "Electronics"},
                    {"externalId": 2, "title": "Smart Watch Series X", "description": "Track your health", "category": "Electronics"},
                    {"externalId": 3, "title": "Wireless Headphones", "description": "Immersive sound", "category": "Electronics"},
                    {"externalId": 4, "title": "Slim Fit Cotton Shirt", "description": "Fashionable shirt", "category": "Fashion"},
                    {"externalId": 5, "title": "Modern Leather Boots", "description": "Durable shoes", "category": "Fashion"},
                    {"externalId": 6, "title": "Gold Plated Necklace", "description": "Minimalist jewelry", "category": "Jewelry"},
                    {"externalId": 16, "title": "Smart Coffee Maker", "description": "Kitchen tech", "category": "Home & Kitchen"},
                    {"externalId": 19, "title": "Running Shoes", "description": "Athletic footwear", "category": "Sports"}
                ])
                # Mock TF-IDF
                tfidf = TfidfVectorizer(stop_words='english')
                self.tfidf_matrix = tfidf.fit_transform(self.products_df['title'] + " " + self.products_df['description'])
                self.product_indices = pd.Series(self.products_df.index, index=self.products_df['externalId'])
                return True
                
            self.products_df = pd.DataFrame(products)
            self.interactions_df = pd.DataFrame(interactions) if interactions else pd.DataFrame(columns=['userId', 'productId', 'type'])
            # ... rest of your logic ...
            return True
        except Exception as e:
            print(f"Error loading data from MongoDB: {e}. Switching to Mock.")
            self.products_df = pd.DataFrame([
                {"externalId": 1, "title": "Premium AI Laptop", "description": "High performance", "category": "Electronics"},
                {"externalId": 4, "title": "Slim Fit Shirt", "description": "Fashionable shirt", "category": "Fashion"}
            ])
            tfidf = TfidfVectorizer(stop_words='english')
            self.tfidf_matrix = tfidf.fit_transform(self.products_df['title'] + " " + self.products_df['description'])
            self.product_indices = pd.Series(self.products_df.index, index=self.products_df['externalId'])
            return True

    def get_content_recommendations(self, product_id, top_n=10):
        if product_id not in self.product_indices:
            return []
        idx = self.product_indices[product_id]
        sim_scores = list(enumerate(cosine_similarity(self.tfidf_matrix[idx], self.tfidf_matrix)[0]))
        sim_scores = sorted(sim_scores, key=lambda x: x[1], reverse=True)
        sim_scores = sim_scores[1:top_n+1]
        product_indices = [i[0] for i in sim_scores]
        return self.products_df.iloc[product_indices]['externalId'].tolist()

    def get_collaborative_recommendations(self, user_id, top_n=10):
        if self.user_item_matrix is None or user_id not in self.user_item_matrix.index:
            return []
        
        user_sim = cosine_similarity(self.user_item_matrix)
        user_sim_df = pd.DataFrame(user_sim, index=self.user_item_matrix.index, columns=self.user_item_matrix.index)
        
        similar_users = user_sim_df[user_id].sort_values(ascending=False)[1:6].index
        recommended_products = self.user_item_matrix.loc[similar_users].mean().sort_values(ascending=False).index.tolist()
        
        # Filter products user already interacted with
        interacted_products = self.interactions_df[self.interactions_df['userId'] == user_id]['productId'].tolist()
        recommendations = [p for p in recommended_products if p not in interacted_products]
        
        return recommendations[:top_n]

    def get_hybrid_recommendations(self, user_id, last_product_id=None, top_n=10, exclude_ids=None):
        if exclude_ids is None:
            exclude_ids = []
            
        collab_recs = self.get_collaborative_recommendations(user_id, top_n=30)
        content_recs = self.get_content_recommendations(last_product_id, top_n=30) if last_product_id else []
        
        # Combine and deduplicate
        combined = list(dict.fromkeys(collab_recs + content_recs))
        
        # Filter excluded IDs (viewed/purchased)
        combined = [p for p in combined if p not in exclude_ids]
            
        # If not enough hybrid, fallback to random (for variety)
        if len(combined) < top_n:
            all_ids = self.products_df['externalId'].tolist()
            fallback = [p for p in all_ids if p not in combined and (not exclude_ids or p not in exclude_ids)]
            np.random.shuffle(fallback)
            combined += fallback[:top_n - len(combined)]

        # Shuffling Jitter: shuffle the top 20 results and take top_n
        top_pool = combined[:20]
        np.random.shuffle(top_pool)
        
        final_recs = top_pool[:top_n]
        return final_recs
