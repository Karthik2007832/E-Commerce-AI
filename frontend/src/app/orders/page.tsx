'use client';
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '@/store';
import { Package, ArrowRight, Calendar, ExternalLink, X, Star, Truck, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { orderApi } from '@/api';

export default function OrdersPage() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Interactive Modal States
  const [trackingOrder, setTrackingOrder] = useState<any>(null);
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [reviewSubmit, setReviewSubmit] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (!user) {
      setLoading(false);
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await orderApi.getOrders();
        setOrders(res.data);
      } catch (err) {
        console.error('Failed fetching orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!mounted || loading) return <div className="min-h-[70vh] flex flex-col justify-center items-center text-slate-500"><Package className="h-10 w-10 animate-bounce mb-4 text-blue-500"/> Loading your orders...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full min-h-[70vh] relative">
      <div className="flex items-center space-x-3 mb-10">
        <Package className="h-8 w-8 text-blue-600" />
        <h1 className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Purchase History
        </h1>
      </div>

      {orders.length === 0 ? (
        <div className="text-center bg-white dark:bg-slate-900 rounded-3xl p-16 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full mb-6">
            <Package className="h-10 w-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No purchases yet</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            When you place an order, it will appear here so you can easily track it.
          </p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-md active:scale-95"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          {orders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800">
                <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-2 sm:space-y-0 text-sm">
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 font-medium uppercase text-xs mb-1">Order Placed</span>
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="block text-slate-500 dark:text-slate-400 font-medium uppercase text-xs mb-1">Total</span>
                    <span className="font-semibold text-slate-900 dark:text-white">${order.total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="mt-4 sm:mt-0 text-sm">
                  <span className="block text-slate-500 dark:text-slate-400 font-medium uppercase text-xs mb-1 sm:text-right">Order ID</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{order.id}</span>
                </div>
              </div>

              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center p-2 shrink-0 border border-slate-100 dark:border-slate-700">
                    <img src={order.item.image} alt={order.item.title} className="max-w-full max-h-full object-contain" onError={(e) => { e.currentTarget.src = 'https://placehold.co/200x200/f8fafc/64748b/png?text=Item' }} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight mb-1">{order.item.title}</h3>
                    <div className="flex items-center text-green-600 dark:text-green-500 text-sm font-semibold mb-3">
                      Package dispatched
                    </div>
                    <button 
                      onClick={() => router.push(`/product/${order.item.id}`)}
                      className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center group delay-75"
                    >
                      <span>Buy it again</span>
                      <ArrowRight className="h-4 w-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 w-full md:w-auto">
                  <button 
                    onClick={() => setTrackingOrder(order)}
                    className="w-full md:w-48 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm text-sm text-center">
                    Track Package
                  </button>
                  <button 
                    onClick={() => { setReviewOrder(order); setReviewSubmit(false); setRating(0); }}
                    className="w-full md:w-48 bg-white hover:bg-slate-50 dark:bg-slate-800 hover:dark:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-600 font-bold py-2.5 px-4 rounded-xl transition-all shadow-sm text-sm text-center">
                    Leave a Review
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tracking Modal */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 dark:border-slate-800">
            <button onClick={() => setTrackingOrder(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"><X className="h-5 w-5" /></button>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Package Tracking</h3>
            <p className="font-semibold text-slate-500 dark:text-slate-400 mb-8 font-mono text-xs">{trackingOrder.id}</p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white"><CheckCircle2 className="h-6 w-6" /></div>
                  <div className="w-1 h-14 bg-green-500 my-1"></div>
                </div>
                <div className="pt-2"><p className="font-bold text-slate-900 dark:text-white text-lg">Order Placed</p><p className="text-sm text-slate-500">We have received your order</p></div>
              </div>
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white animate-pulse"><Truck className="h-6 w-6" /></div>
                  <div className="w-1 h-14 bg-slate-200 dark:bg-slate-800 my-1"></div>
                </div>
                <div className="pt-2"><p className="font-bold text-slate-900 dark:text-white text-lg">Out for Delivery</p><p className="text-sm text-blue-600 font-bold">Arriving today by 9:00 PM</p></div>
              </div>
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600"><Package className="h-6 w-6" /></div>
                </div>
                <div className="pt-2"><p className="font-bold text-slate-400 dark:text-slate-600 text-lg">Delivered</p></div>
              </div>
            </div>
            
            <button onClick={() => setTrackingOrder(null)} className="w-full mt-10 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg active:scale-95">Close Tracking</button>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100 dark:border-slate-800">
            <button onClick={() => setReviewOrder(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2"><X className="h-5 w-5" /></button>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Leave a Review</h3>
            <p className="text-sm text-slate-500 mb-8 truncate">{reviewOrder.item.title}</p>
            
            {reviewSubmit ? (
              <div className="text-center py-6 animate-in slide-in-from-bottom-4 fade-in">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-500"><CheckCircle2 className="h-10 w-10" /></div>
                <h4 className="font-black text-2xl text-slate-900 dark:text-white mb-2">Thank you!</h4>
                <p className="text-slate-500 mb-8 max-w-[250px] mx-auto text-sm leading-relaxed">Your simulated review helps our AI recommendation engine improve.</p>
                <button onClick={() => setReviewOrder(null)} className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-slate-900 py-4 rounded-xl font-bold transition-all shadow-lg active:scale-95">Done</button>
              </div>
            ) : (
              <div>
                <div className="flex justify-center space-x-2 mb-8 cursor-pointer group">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      onClick={() => setRating(star)} 
                      className={`h-10 w-10 transition-colors transform hover:scale-110 active:scale-90 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200 dark:text-slate-700 hover:text-yellow-200'}`} 
                    />
                  ))}
                </div>
                <textarea 
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none mb-6 text-slate-900 dark:text-white transition-all resize-none" 
                  rows={4} 
                  placeholder="What did you think of this product?"
                ></textarea>
                <button 
                  onClick={() => setReviewSubmit(true)} 
                  disabled={rating === 0}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 text-white font-bold py-4 px-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center"
                >
                  Submit Review
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
