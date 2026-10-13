import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router';

function ProtectPages({ children }) {
    const { user } = useAuth()
    if(!user) {
        return <Navigate to="/auth/signin" replace />;
    }
    return (
        children
    )
}

export default ProtectPages
