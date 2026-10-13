import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router";
import { Store, MapPin, Phone, ArrowRight, Clock, XCircle, Store as StoreIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

export default function RequestSeller() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);

  const [form, setForm] = useState({
    shop_name: "",
    address: "",
    phone: "",
  });

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
    if (value.length <= 10) {
      setForm({ ...form, phone: value });
    }
  };

  // fetch request
  const fetchRequest = async () => {
    const { data } = await supabase
      .from("seller_requests")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    setRequest(data || null);
  };

  useEffect(() => {
    if (user) fetchRequest();
  }, [user]);

  // redirect when approved
  useEffect(() => {
    if (request?.status === "approved") {
      navigate("/shopDashboard");
    }
  }, [request]);

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (request) {
      console.log("the request already exists");
      return;
    }

    if (form.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    const { error } = await supabase.from("seller_requests").insert({
      user_id: user.id,
      ...form,
    });
    console.log(error);

    if (!error) {
      fetchRequest();
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 bg-transparent py-10">
      <div className="bg-card p-10 rounded-xl shadow-md border border-bgSoft w-full max-w-md relative overflow-hidden">
        
        {/* Subtle Decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="text-center mb-8 relative z-10">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <StoreIcon className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-textPrimary tracking-tight">
            Partner With Us
          </h2>
          <p className="text-textSecondary mt-2">
            Bring your local shop online and reach more customers in your neighborhood.
          </p>
        </div>

        {/* 📝 FORM */}
        {!request && (
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="space-y-2">
              <label className="text-sm font-bold text-textPrimary ml-1">Shop Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted group-focus-within:text-primary transition-colors">
                  <Store className="w-5 h-5" />
                </div>
                <input
                  placeholder="e.g. Fresh Bakery"
                  className="w-full pl-11 pr-4 py-4 bg-bgSoft border border-transparent focus:bg-card focus:border-primary rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted"
                  onChange={(e) => setForm({ ...form, shop_name: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textPrimary ml-1">Shop Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted group-focus-within:text-primary transition-colors">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  placeholder="Street / Locality"
                  className="w-full pl-11 pr-4 py-4 bg-bgSoft border border-transparent focus:bg-card focus:border-primary rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted"
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textPrimary ml-1">Phone Number</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted group-focus-within:text-primary transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  placeholder="Enter 10-digit number"
                  value={form.phone}
                  className="w-full pl-11 pr-4 py-4 bg-bgSoft border border-transparent focus:bg-card focus:border-primary rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted"
                  onChange={handlePhoneChange}
                  maxLength="10"
                  required
                />
              </div>
            </div>

            <button className="w-full py-4 mt-2 bg-primary hover:opacity-90 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group">
              Submit Request <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        )}

        {/* ⏳ PENDING */}
        {request?.status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl relative z-10 animate-fade-in">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-amber-800 font-bold text-lg">
                Request Pending Review
              </p>
              <p className="text-amber-700/80 text-sm mt-1 mb-4">
                Our team is currently verifying your details. This usually takes 24-48 hours.
              </p>
            </div>

            <div className="bg-white/60 p-4 rounded-lg flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm border-b border-amber-100 pb-2">
                <span className="text-amber-900/60 font-semibold">Shop</span>
                <span className="text-amber-900 font-bold">{request.shop_name}</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-amber-100 pb-2">
                <span className="text-amber-900/60 font-semibold">Address</span>
                <span className="text-amber-900 font-bold truncate max-w-[60%] text-right">{request.address}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-amber-900/60 font-semibold">Phone</span>
                <span className="text-amber-900 font-bold">{request.phone}</span>
              </div>
            </div>
          </div>
        )}

        {/* ❌ REJECTED */}
        {request?.status === "rejected" && (
          <div className="bg-red-50 border border-red-200 p-6 rounded-xl relative z-10 animate-fade-in text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-red-800 font-bold text-lg">
              Registration Declined
            </p>
            <p className="text-red-700/80 text-sm mt-2">
              {request.rejection_reason || "Unfortunately, we could not verify your shop details at this time. Please contact support or try again later."}
            </p>
            
            <button 
              onClick={() => setRequest(null)} 
              className="mt-6 px-6 py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-colors w-full"
            >
              Submit New Request
            </button>
          </div>
        )}

      </div>
    </div>
  );
}