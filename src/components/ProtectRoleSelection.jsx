import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router'

function ProtectRoleSelection({ children }) {
    const [shopOwner, setShopOwner] = useState(false)
    const [checkingRole, setCheckingRole] = useState(true)

    const { user, loading, fetchProfile } = useAuth()

    useEffect(() => {
        const getRole = async () => {
            if(!user) return

            const data = await fetchProfile(user.id)

            
            if(data?.role === "shopowner") {
                setShopOwner(true)
            }

            setCheckingRole(false) // ✅ important
        }

        getRole()
    }, [user])

    // ⛔ Wait for auth
    if(loading) return <div>Loading...</div>

    // ⛔ Not logged in
    if(!user) {
        return <Navigate to="/auth/signin" replace />
    }

    // ⛔ Wait for role check
    if(checkingRole) {
        return <div>Checking role...</div>
    }

    // ✅ Redirect if already shop owner
    if(shopOwner) {
        return <Navigate to="/shopDashboard" replace />
    }

    return children
}

export default ProtectRoleSelection