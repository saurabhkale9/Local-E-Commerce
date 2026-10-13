import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

function ProtectAdmin({ children }) {
    const { user, loading, fetchProfile } = useAuth();
    const [verifying, setVerifying] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (!loading) {
                if (!user) {
                    setVerifying(false);
                    return;
                }

                try {
                    const data = await fetchProfile(user.id);
                    if (data && data.role === "admin") {
                        setIsAdmin(true);
                    } else {
                        navigate("/", { replace: true });
                    }
                } catch (error) {
                    console.error("Admin verification failed:", error);
                    navigate("/", { replace: true });
                } finally {
                    setVerifying(false);
                }
            }
        };

        checkAdminStatus();
    }, [user, loading, fetchProfile, navigate]);

    if (loading || verifying) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-global">
                <div className="relative">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <ShieldAlert className="w-5 h-5 text-primary/50" />
                    </div>
                </div>
                <p className="mt-4 text-textSecondary font-medium animate-pulse">Verifying administrative access...</p>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/auth/signin" replace />;
    }

    if (!isAdmin) {
        return null; // Will be handled by the navigate in useEffect
    }

    return children;
}

export default ProtectAdmin;
