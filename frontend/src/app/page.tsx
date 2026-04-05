'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Hero from '@/components/layout/Hero';
import ProductCard from '@/components/product/ProductCard';
import RecommendationSection from '@/components/product/RecommendationSection';
import { productApi } from '@/api';
import { Loader2 } from 'lucide-react';

function HomeContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const observerTarget = React.useRef<HTMLDivElement>(null);

  // Reset when query changes
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
  }, [query]);

  const fetchProducts = async (pageNum: number, isInitial: boolean = false) => {
    try {
      if (isInitial) setLoading(true);
      else setLoadingMore(true);
      
      const res = await productApi.getProducts(query, pageNum, 20);
      const newProducts = res.data.products;
      
      setProducts(prev => isInitial ? newProducts : [...prev, ...newProducts]);
      setHasMore(res.data.hasMore);
    } catch (err) {
      console.error('Error fetching products', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial fetch and fetch on page change
  useEffect(() => {
    fetchProducts(page, page === 1);
  }, [page, query]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Hero />
      
      {/* Dynamic Recommendation Engine section */}
      <RecommendationSection />

      <main id="trending-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col space-y-2 mb-10">
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Explore <span className="text-blue-600">All Products</span>
          </h2>
          <p className="text-slate-500 max-w-lg">
            {query ? `Search results for "${query}"` : "Discover our premium collection with 200+ new items."}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => (
            <ProductCard key={`${product.externalId}-${index}`} product={product} />
          ))}
        </div>

        {/* Skeleton loaders for initial and load more */}
        {(loading || loadingMore) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 rounded-xl bg-slate-200 dark:bg-slate-800 animate-pulse shadow-sm"></div>
            ))}
          </div>
        )}
        
        {products.length === 0 && !loading && (
          <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800">
            <p className="text-slate-500 font-medium">No products found for this search.</p>
          </div>
        )}

        {/* Intersection Anchor */}
        <div ref={observerTarget} className="h-10 mt-10"></div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
