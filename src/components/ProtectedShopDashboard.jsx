import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router";

function ProtectedShopDashboard({ children }) {
  const [shopOwner, setShopOwner] = useState(false);
  const [checkingRole, setCheckingRole] = useState(true);

  const { user, fetchProfile, loading } = useAuth();

  useEffect(() => {
    const getRole = async () => {
      if(!user) return;

      const data = await fetchProfile(user.id);

      if(data?.role === "shopowner") {
        setShopOwner(true);
      }

      setCheckingRole(false); // ✅ important
    };

    getRole();
  }, [user]);

  // ⛔ Wait for auth
  if(loading) return <div className="h-96 flex justify-center items-center w-full">Loading...</div>;

  // ⛔ Not logged in
  if(!user) {
    return <Navigate to="/auth/signin" replace />;
  }

  // ⛔ Wait for role check
  if(checkingRole) {
    return <div>Checking access...</div>;
  }

  // ⛔ Not shop owner
  if(!shopOwner) {
    return <Navigate to="/" replace />;
  }

  // ✅ Allowed
  return children;
}

export default ProtectedShopDashboard;