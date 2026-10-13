import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";
import { CreditCard, Calendar, Lock, ShieldCheck, CheckCircle2, Smartphone, IndianRupee, MapPin, Phone } from "lucide-react";

export default function CheckoutPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Payment Method State
    const [paymentMethod, setPaymentMethod] = useState("phonepe"); // "phonepe" or "card"

    // Shipping Info State
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [isProfilePresent, setIsProfilePresent] = useState(false);
    const [editMode, setEditMode] = useState(false);

    // Card Fields State
    const [cardNumber, setCardNumber] = useState("");
    const [expiry, setExpiry] = useState("");
    const [cvv, setCvv] = useState("");

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
        if (value.length <= 10) {
            setPhone(value);
        }
    };

    // Format card number: digits only, max 16, displayed as XXXX XXXX XXXX XXXX
    const handleCardNumberChange = (e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
        const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ");
        setCardNumber(formatted);
    };

    // Format expiry: auto-insert slash, restrict to MM/YY
    const handleExpiryChange = (e) => {
        let value = e.target.value.replace(/\D/g, "").slice(0, 4);
        if (value.length >= 3) {
            value = value.slice(0, 2) + "/" + value.slice(2);
        }
        setExpiry(value);
    };

    // CVV: digits only, max 4 (Amex uses 4, others use 3)
    const handleCvvChange = (e) => {
        const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
        setCvv(digits);
    };

    // 👤 Fetch Profile (for pre-filling phone and address)
    useEffect(() => {
        if (!user) return;

        const fetchProfile = async () => {
            const { data, error } = await supabase
                .from("profiles")
                .select("mobile_number, address")
                .eq("id", user.id)
                .maybeSingle();

            if (error) {
                console.error("Error fetching profile:", error);
                return;
            }

            if (data) {
                setPhone(data.mobile_number || "");
                setAddress(data.address || "");
                if (data.mobile_number && data.address) {
                    setIsProfilePresent(true);
                }
            }
        };

        fetchProfile();
    }, [user]);

    // 📦 Fetch Cart
    useEffect(() => {
        if (!user) return;

        const fetchCart = async () => {
            const { data, error } = await supabase
                .from("cart")
                .select("*")
                .eq("user_id", user.id);

            if (error) {
                console.error(error);
                return;
            }

            if (!data) return;

            setCartItems(data);

            const sum = data.reduce(
                (acc, item) =>
                    acc + item.product_price * (item.quantity || 1),
                0
            );

            setTotal(sum);
        };

        fetchCart();
    }, [user]);

    // 💳 Handle Payment + Order Creation
    const handlePayment = async () => {
        if (!cartItems.length) return;

        // 📱 Validation
        if (phone.length !== 10) {
            toast.error("Please enter a valid 10-digit mobile number");
            return;
        }

        if (!address.trim()) {
            toast.error("Please enter your delivery address");
            return;
        }

        // 💳 Card Validation
        if (paymentMethod === "card") {
            const rawCard = cardNumber.replace(/\s/g, "");
            if (rawCard.length !== 16) {
                toast.error("Please enter a valid 16-digit card number");
                return;
            }

            // Expiry format & past-date check
            const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
            if (!expiryRegex.test(expiry)) {
                toast.error("Please enter a valid expiry date (MM/YY)");
                return;
            }
            const [mm, yy] = expiry.split("/").map(Number);
            const now = new Date();
            const currentYear = now.getFullYear() % 100;  // 2-digit year
            const currentMonth = now.getMonth() + 1;       // 1-indexed
            if (yy < currentYear || (yy === currentYear && mm < currentMonth)) {
                toast.error("Card has expired. Please use a valid card");
                return;
            }

            if (cvv.length < 3) {
                toast.error("Please enter a valid CVV");
                return;
            }
        }

        setLoading(true);

        // 0. Update Profile with Mobile and Address
        const { error: profileUpdateError } = await supabase
            .from("profiles")
            .update({
                mobile_number: phone,
                address: address
            })
            .eq("id", user.id);

        if (profileUpdateError) {
            console.error("Profile update error:", profileUpdateError);
            // We continue even if profile update fails, but maybe show a warning?
        }

        // 1. Create Order
        const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .insert([
                {
                    user_id: user.id,
                    total_amount: total,
                    status: "placed",
                },
            ])
            .select()
            .single();

        if (orderError) {
            console.error("Order error:", orderError);
            setLoading(false);
            return;
        }

        // 2. Insert Order Items
        const items = cartItems.map((item) => ({
            order_id: orderData.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_price: item.product_price,
            quantity: item.quantity || 1,
            shop_name: item.shop_name,
        }));

        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(items);

        if (itemsError) {
            console.error("Items error:", itemsError);
            setLoading(false);
            return;
        }

        // 3. Clear Cart
        await supabase
            .from("cart")
            .delete()
            .eq("user_id", user.id);

        // 4. Show Success
        // Simulate a slight delay for "UPI Processing"
        setTimeout(() => {
            setSuccess(true);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
            
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <ShieldCheck className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight">Secure Checkout</h1>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                {/* BILL */}
                <div className="bg-card rounded-xl p-6 shadow-sm border border-bgSoft h-fit">
                    <h2 className="text-xl font-bold text-textPrimary mb-4 pb-4 border-b border-bgSoft">Order Summary</h2>
                    <div className="space-y-4 mb-6">
                        {cartItems.map((item) => (
                            <div key={item.id} className="flex justify-between items-center group">
                                <div className="flex-1 pr-4">
                                    <p className="font-semibold text-textPrimary line-clamp-1">{item.product_name}</p>
                                    <p className="text-sm text-textSecondary">{item.shop_name} &times; {item.quantity || 1}</p>
                                </div>
                                <p className="font-bold text-textPrimary">
                                    ₹{item.product_price * (item.quantity || 1)}
                                </p>
                            </div>
                        ))}
                    </div>

                    <div className="border-t border-bgSoft pt-4 mt-6">
                        <div className="flex justify-between items-center mb-2 text-textSecondary">
                            <p>Subtotal</p>
                            <p className="font-medium text-textPrimary">₹{total}</p>
                        </div>
                        <div className="flex justify-between items-center mb-2 text-textSecondary">
                            <p>Delivery Fee (Local)</p>
                            <p className="font-medium text-primary">Free</p>
                        </div>
                        <div className="flex justify-between items-center pt-3 mt-3 border-t border-dashed border-bgSoft">
                            <p className="font-extrabold text-textPrimary text-lg">Total Amount</p>
                            <p className="font-extrabold text-primary text-2xl">₹{total}</p>
                        </div>
                    </div>
                </div>

                {/* PAYMENT SECTION */}
                <div>
                    {!success ? (
                        <div className="bg-card p-6 md:p-8 rounded-xl shadow-md border border-bgSoft">
                            <h2 className="text-xl font-bold text-textPrimary mb-6 flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-textMuted" /> Payment Method
                            </h2>

                            {/* Method Selector */}
                            <div className="flex items-center gap-3 mb-6 bg-bgSoft/50 p-1.5 rounded-xl border border-bgSoft">
                                <button
                                    onClick={() => setPaymentMethod("phonepe")}
                                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                        paymentMethod === "phonepe" ? "bg-card shadow-sm text-[#5f259f]" : "text-textSecondary hover:text-textPrimary"
                                    }`}
                                >
                                    <Smartphone className="w-4 h-4" /> PhonePe UPI
                                </button>
                                <button
                                    onClick={() => setPaymentMethod("card")}
                                    className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                                        paymentMethod === "card" ? "bg-card shadow-sm text-primary" : "text-textSecondary hover:text-textPrimary"
                                    }`}
                                >
                                    <CreditCard className="w-4 h-4" /> Credit Card
                                </button>
                            </div>

                            <form onSubmit={e => { e.preventDefault(); handlePayment(); }} className="space-y-6">
                                
                                {/* Shipping Details */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-primary" /> Delivery Details
                                        </h3>
                                        {isProfilePresent && !editMode && (
                                            <button 
                                                type="button"
                                                onClick={() => setEditMode(true)}
                                                className="text-xs font-bold text-primary hover:underline transition-all"
                                            >
                                                Change
                                            </button>
                                        )}
                                    </div>
                                    
                                    {isProfilePresent && !editMode ? (
                                        <div className="bg-bgSoft/50 p-4 rounded-xl border border-bgSoft space-y-3 animate-fade-in">
                                            <div className="flex items-start gap-3">
                                                <MapPin className="w-4 h-4 text-textMuted mt-0.5" />
                                                <p className="text-sm text-textPrimary font-medium leading-relaxed">
                                                    {address}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <Phone className="w-4 h-4 text-textMuted" />
                                                <p className="text-sm text-textPrimary font-bold">
                                                    +91 {phone}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-fade-in">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-textSecondary ml-1">Mobile Number</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted">
                                                        <Phone className="w-4 h-4" />
                                                    </div>
                                                    <input
                                                        type="tel"
                                                        placeholder="Enter 10-digit mobile number"
                                                        value={phone}
                                                        onChange={handlePhoneChange}
                                                        maxLength="10"
                                                        className="w-full pl-11 pr-4 py-3 bg-bgSoft border border-transparent focus:bg-card focus:border-primary rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted"
                                                        required
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-textSecondary ml-1">Delivery Address</label>
                                                <div className="relative">
                                                    <div className="absolute top-3 left-4 text-textMuted">
                                                        <MapPin className="w-4 h-4" />
                                                    </div>
                                                    <textarea
                                                        placeholder="Enter your full address with landmark"
                                                        value={address}
                                                        onChange={(e) => setAddress(e.target.value)}
                                                        rows="3"
                                                        className="w-full pl-11 pr-4 py-3 bg-bgSoft border border-transparent focus:bg-card focus:border-primary rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted resize-none"
                                                        required
                                                    ></textarea>
                                                </div>
                                            </div>
                                            
                                            {isProfilePresent && editMode && (
                                                <button 
                                                    type="button"
                                                    onClick={() => setEditMode(false)}
                                                    className="w-full py-2 text-xs font-bold text-textSecondary bg-bgSoft/50 rounded-lg hover:bg-bgSoft transition-all"
                                                >
                                                    Cancel Editing
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-bgSoft pt-4">
                                    <h3 className="text-sm font-bold text-textPrimary uppercase tracking-wider flex items-center gap-2 mb-4">
                                        <CreditCard className="w-4 h-4 text-primary" /> Payment Method
                                    </h3>
                                </div>
                                
                                {paymentMethod === "phonepe" && (
                                    <div className="animate-fade-in">
                                        <div className="bg-[#5f259f]/5 border border-[#5f259f]/20 rounded-xl p-5 mb-4 text-center">
                                            <div className="bg-[#5f259f] w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 shadow-md">
                                                <span className="text-white font-extrabold text-xl tracking-tighter">पे</span>
                                            </div>
                                            <p className="font-bold text-[#5f259f] text-lg mb-1">Pay with PhonePe</p>
                                            <p className="text-sm text-textSecondary mb-4">Enter your UPI ID to receive a payment request on your PhonePe app.</p>
                                            
                                            <div className="relative text-left">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted">
                                                    <Smartphone className="w-5 h-5" />
                                                </div>
                                                <input
                                                    placeholder="yourname@ybl"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-bgSoft border border-transparent focus:bg-card focus:border-[#5f259f] rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted font-mono"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {paymentMethod === "card" && (
                                    <div className="animate-fade-in space-y-4">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-bold text-textPrimary ml-1">Card Number</label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted">
                                                    <CreditCard className="w-5 h-5" />
                                                </div>
                                                <input
                                                    placeholder="XXXX XXXX XXXX XXXX"
                                                    value={cardNumber}
                                                    onChange={handleCardNumberChange}
                                                    maxLength="19"
                                                    inputMode="numeric"
                                                    className="w-full pl-11 pr-4 py-3.5 bg-bgSoft border border-transparent focus:bg-card focus:border-primary rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted font-mono tracking-widest"
                                                    required
                                                />
                                            </div>
                                            {cardNumber.replace(/\s/g, "").length > 0 && cardNumber.replace(/\s/g, "").length < 16 && (
                                                <p className="text-xs text-red-500 ml-1 mt-1">{16 - cardNumber.replace(/\s/g, "").length} more digits needed</p>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-textPrimary ml-1">Expiry</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted">
                                                        <Calendar className="w-5 h-5" />
                                                    </div>
                                                    <input
                                                        placeholder="MM/YY"
                                                        value={expiry}
                                                        onChange={handleExpiryChange}
                                                        maxLength="5"
                                                        inputMode="numeric"
                                                        className="w-full pl-11 pr-4 py-3.5 bg-bgSoft border border-transparent focus:bg-card focus:border-primary rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted font-mono"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-sm font-bold text-textPrimary ml-1">CVV</label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted">
                                                        <Lock className="w-5 h-5" />
                                                    </div>
                                                    <input
                                                        placeholder="123"
                                                        type="password"
                                                        value={cvv}
                                                        onChange={handleCvvChange}
                                                        maxLength="4"
                                                        inputMode="numeric"
                                                        className="w-full pl-11 pr-4 py-3.5 bg-bgSoft border border-transparent focus:bg-card focus:border-primary rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted font-mono"
                                                        required
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading || cartItems.length === 0}
                                    className={`w-full mt-6 text-white font-bold py-4 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 ${
                                        paymentMethod === "phonepe" ? "bg-[#5f259f] hover:bg-[#4a1c7d]" : "bg-primary hover:opacity-90"
                                    }`}
                                >
                                    {loading ? (
                                        "Processing Request..."
                                    ) : (
                                        <>
                                            Pay <span className="tracking-wide ml-1">₹{total}</span> securely
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="bg-card p-10 text-center rounded-xl shadow-md border border-primary/20 flex flex-col items-center justify-center h-full animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <CheckCircle2 className="w-10 h-10 text-green-600" />
                            </div>
                            <h2 className="text-green-700 text-2xl font-bold mb-2">
                                Payment Successful!
                            </h2>
                            <p className="text-textSecondary mb-8 text-center max-w-xs mx-auto">
                                Your order has been placed securely and sent to the local sellers.
                            </p>

                            <button
                                onClick={() => navigate("/orders")}
                                className="w-full bg-bgSoft hover:bg-slate-200 text-textPrimary font-bold py-3.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                View Order Status
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}