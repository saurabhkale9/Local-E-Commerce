import React from 'react'
import {Outlet} from 'react-router'
import Navbar from '../components/Navbar'
import { useAuth } from '../context/AuthContext'

function Landinglayout() {
    const {  loading } = useAuth()
    if(loading) return <div className="min-h-screen bg-global flex items-center justify-center text-textSecondary font-medium">Loading...</div>
    return (
        <div className="min-h-screen bg-global text-textPrimary">
            <Navbar />
            <Outlet />
        </div>
    )
}

export default Landinglayout
