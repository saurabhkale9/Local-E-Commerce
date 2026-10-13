import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { 
  Users, 
  Store, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  LayoutDashboard,
  Filter,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("seller_requests")
        .select(`
          *,
          profiles (name, email)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      toast.error("Failed to fetch requests");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.profiles?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.shop_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterStatus === "all" || req.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const approveRequest = async (request) => {
    const userId = request.user_id;
    const toastId = toast.loading("Approving request...");

    try {
      // 1. Check if shop already exists
      const { data: existingShop } = await supabase
        .from("shops")
        .select("*")
        .eq("owner_id", userId)
        .maybeSingle();

      // 2. Create shop ONLY if not exists
      if (!existingShop) {
        const { error: shopError } = await supabase
          .from("shops")
          .insert({
            owner_id: userId,
            name: request.shop_name,
            address: request.address,
            phone: request.phone,
          });

        if (shopError) throw shopError;
      }

      // 3. Update role (ALWAYS RUN)
      const { error: roleError } = await supabase
        .from("profiles")
        .update({ role: "shopowner" })
        .eq("id", userId);

      if (roleError) throw roleError;

      // 4. Update request status
      const { error: requestError } = await supabase
        .from("seller_requests")
        .update({ status: "approved" })
        .eq("id", request.id);

      if (requestError) throw requestError;

      toast.success("Seller request approved!", { id: toastId });
      fetchRequests();
    } catch (error) {
      toast.error(error.message || "Approval failed", { id: toastId });
    }
  };

  const handleReject = async (id) => {
    const reason = prompt("Enter rejection reason");
    if (!reason) return;

    const toastId = toast.loading("Rejecting request...");
    try {
      const { error } = await supabase
        .from("seller_requests")
        .update({
          status: "rejected",
          rejection_reason: reason,
        })
        .eq("id", id);

      if (error) throw error;

      toast.success("Request rejected", { id: toastId });
      fetchRequests();
    } catch (error) {
      toast.error(error.message || "Rejection failed", { id: toastId });
    }
  };

  return (
    <div className="min-h-screen bg-global pb-12">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-md border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl font-bold text-textPrimary tracking-tight">Admin Console</h1>
            </div>
            <div className="text-sm font-medium text-textSecondary bg-bgSoft px-3 py-1 rounded-full">
              System Dashboard
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-textPrimary">Seller Management</h2>
          <p className="text-textSecondary mt-1">Review and manage merchant registration requests.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard title="Total Requests" value={stats.total} icon={<Users />} color="blue" />
          <StatCard title="Pending Review" value={stats.pending} icon={<Clock />} color="amber" />
          <StatCard title="Approved Shops" value={stats.approved} icon={<CheckCircle2 />} color="emerald" />
          <StatCard title="Rejected Requests" value={stats.rejected} icon={<XCircle />} color="rose" />
        </div>

        {/* Controls */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
            <input 
              type="text" 
              placeholder="Search by name, email or shop..."
              className="w-full pl-10 pr-4 py-2.5 bg-bgSoft border-none rounded-xl focus:ring-2 focus:ring-primary/20 transition-all text-sm outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <Filter className="w-4 h-4 text-textSecondary mr-1 shrink-0" />
            {['all', 'pending', 'approved', 'rejected'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all whitespace-nowrap
                  ${filterStatus === status 
                    ? 'bg-textPrimary text-white shadow-md' 
                    : 'bg-bgSoft text-textSecondary hover:bg-gray-200'}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Requests List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border shadow-sm">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 text-textSecondary font-medium">Fetching applications...</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-20 bg-white rounded-3xl border shadow-sm"
              >
                <div className="mx-auto w-16 h-16 bg-bgSoft rounded-full flex items-center justify-center mb-4">
                  <LayoutDashboard className="w-8 h-8 text-textMuted" />
                </div>
                <h3 className="text-lg font-semibold text-textPrimary">No requests found</h3>
                <p className="text-textSecondary">Try adjusting your filters or search query.</p>
              </motion.div>
            ) : (
              filteredRequests.map((req, idx) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  key={req.id}
                  className="bg-white overflow-hidden rounded-2xl border shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="p-1 flex flex-col md:flex-row">
                  
                    
                    <div className="flex-1 p-5 md:p-6 flex flex-col lg:flex-row gap-6">
                      {/* Left: Applicant Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-textMuted block mb-1">Applicant</span>
                            <h3 className="text-lg font-bold text-textPrimary">{req.profiles?.name || 'Unknown User'}</h3>
                            <div className="flex items-center gap-2 mt-1 text-sm text-textSecondary">
                              <Mail className="w-3.5 h-3.5" />
                              {req.profiles?.email}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                            ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : ''}
                            ${req.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : ''}
                            ${req.status === 'rejected' ? 'bg-rose-100 text-rose-700' : ''}
                          `}>
                            {req.status}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Shop Details */}
                      <div className="flex-[1.5] border-t lg:border-t-0 lg:border-x px-0 lg:px-6 py-4 lg:py-0">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-textMuted block mb-2">Shop Details</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-bgSoft rounded-lg group-hover:bg-primary/10 transition-colors">
                              <Store className="w-4 h-4 text-textSecondary group-hover:text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] text-textMuted uppercase font-bold">Store Name</p>
                              <p className="text-sm font-semibold text-textPrimary">{req.shop_name}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-bgSoft rounded-lg group-hover:bg-primary/10 transition-colors">
                              <Phone className="w-4 h-4 text-textSecondary group-hover:text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] text-textMuted uppercase font-bold">Contact</p>
                              <p className="text-sm font-semibold text-textPrimary">{req.phone}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 sm:col-span-2">
                            <div className="p-2 bg-bgSoft rounded-lg group-hover:bg-primary/10 transition-colors shrink-0">
                              <MapPin className="w-4 h-4 text-textSecondary group-hover:text-primary" />
                            </div>
                            <div>
                              <p className="text-[10px] text-textMuted uppercase font-bold">Address</p>
                              <p className="text-sm font-medium text-textPrimary line-clamp-1">{req.address}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex-1 flex flex-col justify-center gap-3 border-t lg:border-t-0 pt-4 lg:pt-0">
                        {req.status === "pending" ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              onClick={() => approveRequest(req)}
                              className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm shadow-emerald-200"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="flex items-center justify-center gap-2 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 py-2.5 rounded-xl font-bold text-sm transition-all"
                            >
                              <XCircle className="w-4 h-4" />
                              Reject
                            </button>
                          </div>
                        ) : req.status === "rejected" ? (
                          <div className="bg-rose-50 p-3 rounded-xl border border-rose-100">
                            <p className="text-[10px] text-rose-400 font-bold uppercase mb-1">Rejection Reason</p>
                            <p className="text-xs text-rose-700 italic">"{req.rejection_reason || 'No reason provided'}"</p>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2 text-emerald-600 bg-emerald-50 py-3 rounded-xl border border-emerald-100">
                            <ShieldCheck className="w-5 h-5" />
                            <span className="text-sm font-bold">Verified Seller</span>
                          </div>
                        )}
                        <p className="text-[10px] text-textMuted text-right">
                          Submitted {new Date(req.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };

  return (
    <div className={`p-6 rounded-3xl bg-white border shadow-sm transition-all hover:shadow-md group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-textSecondary text-sm font-medium">{title}</p>
          <h4 className="text-3xl font-black text-textPrimary mt-2">{value}</h4>
        </div>
        <div className={`p-3 rounded-2xl transition-transform group-hover:scale-110 ${colors[color]}`}>
          {typeof icon === 'object' ? { ...icon, props: { ...icon.props, className: "w-6 h-6" } } : icon}
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-textMuted uppercase tracking-wider">
        Updated just now <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}
