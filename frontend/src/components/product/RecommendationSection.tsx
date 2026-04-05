'use client';
import React, { useEffect, useState } from 'react';
import { mlApi, productApi, interactionApi } from '@/api';
import { useAuthStore } from '@/store';
import ProductCard from './ProductCard';
import { Loader2, Sparkles } from 'lucide-react';

const RecommendationSection = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        
        // 1. Get viewed IDs to exclude them (if user exists)
        let viewedIds: number[] = [];
        if (user?.id) {
          try {
            const viewedRes = await interactionApi.getViewed(user.id);
            viewedIds = viewedRes.data;
          } catch (e) {
            console.warn("Could not fetch viewed history", e);
          }
        }

        // 2. Get rec IDs from ML API with exclusion list
        const response = await mlApi.getRecommendations(user?.id || 'anonymous', viewedIds);
        const recIds = response.data;

        if (recIds && recIds.length > 0) {
          // 3. Fetch full product details for each ID
          const productDetails = await Promise.all(
            recIds.map(async (id: number) => {
              try {
                const res = await productApi.getProduct(id);
                return res.data;
              } catch (e) {
                return null;
              }
            })
          );
          setProducts(productDetails.filter(p => p !== null));
        }
      } catch (err) {
        console.error('Failed to fetch recommendations', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-12 bg-white dark:bg-slate-900 border-y border-slate-100 dark:border-slate-800 my-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-2 mb-8">
          <Sparkles className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Recommended for You
          </h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.externalId} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecommendationSection;
