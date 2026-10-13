import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router'
import { Loader2 } from 'lucide-react'

function ProtectedAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-global">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedAuth