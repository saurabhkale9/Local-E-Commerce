import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Package, Clock, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router";

export default function OrdersPage() {
    const { user } = useAuth();
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;

        const fetchOrders = async () => {
            const { data, error } = await supabase
                .from("orders")
                .select(`
          *,
          order_items (*)
        `)
                .eq("user_id", user.id)
                .order("created_at", { ascending: false });

            if (!error) {
                setOrders(data);
            }
        };

        fetchOrders();
    }, [user]);

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto pb-20">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <Package className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Purchase History</h1>
            </div>

            {orders.length === 0 ? (
                <div className="bg-card rounded-xl p-12 shadow-sm border border-bgSoft text-center flex flex-col items-center justify-center animate-fade-in">
                    <div className="w-20 h-20 bg-bgSoft rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="w-10 h-10 text-textMuted" />
                    </div>
                    <p className="text-xl font-bold text-textPrimary">No orders yet</p>
                    <p className="text-textSecondary mt-2 mb-6">Looks like you haven't shopped globally-locally yet.</p>
                    <button onClick={() => navigate("/shopes")} className="px-6 py-3 bg-bgSoft hover:bg-slate-200 text-textPrimary rounded-xl transition-all font-semibold active:scale-95 shadow-sm">
                        Discover Shops
                    </button>
                </div>
            ) : (
                <div className="space-y-6">
                    {orders.map((order) => (
                        <div
                            key={order.id}
                            className="bg-card shadow-sm border border-bgSoft rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200"
                        >
                            {/* ORDER HEADER */}
                            <div className="bg-bgSoft/50 px-5 py-4 border-b border-bgSoft flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-card border border-bgSoft rounded-lg shadow-sm">
                                        <Package className="w-4 h-4 text-textSecondary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-textPrimary text-sm uppercase tracking-wide">
                                            Order #{order.id.slice(0, 8)}
                                        </p>
                                        <div className="flex items-center text-xs font-medium text-textSecondary gap-1 mt-0.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            {new Date(order.created_at).toLocaleString(undefined, {
                                                month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit"
                                            })}
                                        </div>
                                    </div>
                                </div>
                                <div className="inline-flex max-w-max px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full border border-green-200 uppercase tracking-widest shadow-sm">
                                    {order.status || "Placed"}
                                </div>
                            </div>

                            {/* ITEMS */}
                            <div className="p-5 space-y-4">
                                {order.order_items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center group border-b border-dashed border-bgSoft/80 last:border-0 pb-3 last:pb-0"
                                    >
                                        <div>
                                            <p className="font-bold text-textPrimary">{item.product_name}</p>
                                            <p className="text-xs text-textSecondary font-medium flex items-center gap-1 mt-1">
                                                <span className="w-1 h-1 bg-secondary rounded-full"></span> 
                                                {item.shop_name}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-textPrimary">
                                                ₹{item.product_price}
                                            </p>
                                            <p className="text-xs text-textSecondary font-medium">
                                                Qty: {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* TOTAL */}
                            <div className="bg-bgSoft/30 px-5 py-4 border-t border-bgSoft flex justify-between items-center">
                                <p className="font-semibold text-textSecondary uppercase text-sm tracking-wider">Order Total</p>
                                <p className="text-xl font-extrabold text-primary">₹{order.total_amount}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}