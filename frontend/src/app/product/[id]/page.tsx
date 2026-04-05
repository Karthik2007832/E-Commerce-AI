'use client';
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productApi, interactionApi } from '@/api';
import Navbar from '@/components/layout/Navbar';
import { ShoppingCart, Star, ArrowLeft, Loader2, CheckCircle2, ShieldCheck, Truck, CreditCard } from 'lucide-react';
import { useCartStore, useAuthStore } from '@/store';
import RecommendationSection from '@/components/product/RecommendationSection';

const ProductDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const { addItem } = useCartStore();
  const { user } = useAuthStore();
  const [added, setAdded] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productId = Array.isArray(id) ? id[0] : (id as string);
        const res = await productApi.getProduct(productId);
        setProduct(res.data);
        
        // Log view interaction
        interactionApi.logInteraction({
          userId: user?.id,
          productId: res.data.externalId || (Array.isArray(id) ? id[0] : (id as string)),
          type: 'view'
        });
      } catch (err) {
        console.error('Error fetching product', err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchProduct();
  }, [id, user?.id]);

  const handleAddToCart = () => {
    if (product) {
      const productId = product.externalId || (Array.isArray(id) ? id[0] : (id as string));
      const userId = user?.id || 'guest';
      addItem(userId, { ...product, id: productId, quantity: 1 });
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
      interactionApi.logInteraction({
        userId: user?.id,
        productId: productId,
        type: 'add-to-cart'
      });
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    const productId = product.externalId || id;
    router.push(`/checkout?productId=${productId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
        <div className="flex-1 flex flex-col items-center justify-center space-y-4">
          <h1 className="text-2xl font-bold">Product Not Found</h1>
          <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">Return Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <button 
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors mb-8 group"
        >
          <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to products</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-sm border border-slate-100 dark:border-slate-800 mb-16 h-auto transition-colors">
          {/* Image Section */}
          <div className="flex items-center justify-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 md:p-12 h-[400px] md:h-[500px]">
            <img 
              src={product.image} 
              alt={product.title} 
              className="max-h-full max-w-full object-contain drop-shadow-2xl hover:scale-105 transition-transform"
              onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x600/f8fafc/64748b/png?text=Image+Not+Found' }}
            />
          </div>

          {/* Info Section */}
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase mb-4">
              {product.category}
            </span>
            <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight transition-colors">
              {product.title}
            </h1>

            <div className="flex items-center space-x-4 mb-8">
              <div className="flex items-center text-yellow-500">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-5 w-5 ${i < Math.floor(product.rating.rate) ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              <span className="text-slate-500 dark:text-slate-400 font-medium">
                ({product.rating.count} reviews)
              </span>
            </div>

            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-10 transition-colors">
              {product.description}
            </p>

            <div className="mt-auto space-y-6">
              <div className="flex items-baseline space-x-4">
                <span className="text-5xl font-black text-slate-900 dark:text-white transition-colors">
                  ${product.price}
                </span>
                <span className="text-green-600 dark:text-green-400 font-bold text-sm">
                  Free Delivery Available
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Add to Cart Button */}
                <button 
                  onClick={handleAddToCart}
                  disabled={added}
                  className={`flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold text-base transition-all transform active:scale-95 ${
                    added 
                    ? 'bg-green-600 dark:bg-green-500 text-white cursor-default' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30'
                  }`}
                >
                  {added ? (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="h-5 w-5" />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>

                {/* Secure Checkout Button */}
                <button 
                  onClick={handleBuyNow}
                  className="flex items-center justify-center space-x-3 px-6 py-4 rounded-xl font-bold text-base transition-all transform active:scale-95 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white shadow-xl shadow-slate-900/20"
                >
                  <CreditCard className="h-5 w-5" />
                  <span>Secure Checkout</span>
                </button>
              </div>
            </div>
            
            <div className="space-y-4 pt-10 mt-8 border-t border-slate-100 dark:border-slate-800 transition-colors">
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-medium">1 Year Official Brand Warranty guaranteed</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600 dark:text-slate-400">
                <Truck className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">Express Shipping included (2-3 Days delivery)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Standard Recommendation Engine UI */}
        <RecommendationSection />
      </main>
    </div>
  );
};

export default ProductDetailPage;
