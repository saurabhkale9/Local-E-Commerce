import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Trash, ShoppingCart, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";

export default function CartPage() {
    const { user } = useAuth();
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const navigate = useNavigate();

    const fetchCart = async () => {
        const { data, error } = await supabase
            .from("cart")
            .select("*")
            .eq("user_id", user.id);

        if (!error) {
            setCartItems(data);

            const sum = data.reduce((acc, item) => {
                return acc + item.product_price * (item.quantity || 1);
            }, 0);

            setTotal(sum);
        }
    };

    useEffect(() => {
        if (!user) return;
        fetchCart();
    }, [user]);

    // ❌ Remove
    const removeFromCart = async (itemId) => {
        await supabase.from("cart").delete().eq("id", itemId);
        fetchCart();
    };

    // ➕ Increase Quantity
    const increaseQty = async (item) => {
        await supabase
            .from("cart")
            .update({ quantity: (item.quantity || 1) + 1 })
            .eq("id", item.id);

        fetchCart();
    };

    // ➖ Decrease Quantity
    const decreaseQty = async (item) => {
        if ((item.quantity || 1) <= 1) return;

        await supabase
            .from("cart")
            .update({ quantity: item.quantity - 1 })
            .eq("id", item.id);

        fetchCart();
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto pb-32">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <ShoppingCart className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Your Cart</h1>
            </div>

            {cartItems.length === 0 ? (
                <div className="bg-card rounded-xl p-12 shadow-sm border border-bgSoft text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-bgSoft rounded-full flex items-center justify-center mb-4">
                        <ShoppingBag className="w-10 h-10 text-textMuted" />
                    </div>
                    <p className="text-xl font-bold text-textPrimary">Your cart is empty</p>
                    <p className="text-textSecondary mt-2 mb-6">Looks like you haven't added any local products yet.</p>
                    <button onClick={() => navigate("/shopes")} className="px-6 py-3 bg-primary text-white font-medium rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200">
                        Start Shopping
                    </button>
                </div>
            ) : (
                <div className="relative">
                    {/* ITEMS */}
                    <div className="space-y-4">
                        {cartItems.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-center bg-card shadow-sm border border-bgSoft p-4 rounded-xl hover:shadow-md transition-shadow duration-200"
                            >
                                <div className="flex flex-1 items-center gap-4">
                                    <div className="w-20 h-20 shrink-0 bg-bgSoft rounded-lg overflow-hidden flex items-center justify-center">
                                        {item.product_image ? (
                                            <img
                                                src={item.product_image}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <ShoppingBag className="w-6 h-6 text-textMuted" />
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <p className="font-bold text-lg text-textPrimary line-clamp-1">{item.product_name}</p>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                                            <p className="text-xs font-semibold text-textSecondary uppercase tracking-wider">
                                                {item.shop_name}
                                            </p>
                                        </div>

                                        {/* QUANTITY CONTROLS */}
                                        <div className="flex items-center gap-1 mt-3">
                                            <button
                                                onClick={() => decreaseQty(item)}
                                                className="p-1 px-2.5 bg-bgSoft hover:bg-slate-200 text-textPrimary rounded-lg transition-colors active:scale-95 flex items-center justify-center"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            <span className="w-8 text-center font-bold text-textPrimary">{item.quantity || 1}</span>

                                            <button
                                                onClick={() => increaseQty(item)}
                                                className="p-1 px-2.5 bg-bgSoft hover:bg-slate-200 text-textPrimary rounded-lg transition-colors active:scale-95 flex items-center justify-center"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end pr-2 md:pr-6">
                                    <p className="font-extrabold text-xl text-textPrimary">
                                        ₹{item.product_price * (item.quantity || 1)}
                                    </p>
                                </div>

                                <button
                                    onClick={() => removeFromCart(item.id)}
                                    className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                                    title="Remove Item"
                                >
                                    <Trash className="w-5 h-5" />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* BOTTOM BAR */}
                    <div className="fixed bottom-0 left-0 w-full bg-card/95 backdrop-blur-md border-t border-bgSoft p-4 md:py-5 shadow-[0_-4px_25px_-5px_rgba(0,0,0,0.05)] z-40">
                        <div className="max-w-5xl mx-auto flex justify-between items-center px-2">
                            <div>
                                <p className="text-sm font-semibold text-textSecondary uppercase tracking-wider mb-1">Total Amount</p>
                                <p className="text-2xl font-extrabold text-primary">
                                    ₹{total}
                                </p>
                            </div>

                            <button
                                onClick={() => navigate("/checkout")}
                                className="bg-primary text-white px-8 py-3.5 rounded-xl font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all duration-200 flex items-center gap-2"
                            >
                                Secure Checkout <ArrowRight className="w-5 h-5 hidden sm:block" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}