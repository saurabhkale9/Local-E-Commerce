import React from 'react'
import { ShoppingBag, Menu, User, ShoppingCart, Search } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'
import { LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { useState } from 'react'

function Navbar() {
  const [role, setRole] = useState(null)

  const { user, handleLogout, fetchProfile } = useAuth()


  useEffect(() => {

    const getRole = async () => {
      if(!user) return
      const data = await fetchProfile(user.id);
      if(data) {
        setRole(data.role)
      }
    }
    getRole()

  }, [user, fetchProfile])

  return (
    <nav className="sticky top-0 z-50 bg-card shadow-md px-4 md:px-8 py-4 transition-all duration-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all duration-200">
            <ShoppingBag className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold text-textPrimary tracking-tight">LokMart</span>
        </Link>


        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button className="p-2.5 text-textSecondary hover:text-primary transition-all duration-200 bg-bgSoft rounded-xl md:hidden">
            <Search className="w-5 h-5" />
          </button>

          {/* base on the user please change the navitems */}
          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              {
                role !== "admin" && <Link to="/requestshop" className="px-6 py-2.5 text-textPrimary hover:text-primary font-medium transition-all duration-200">
                Start Selling
              </Link>
              }

              {role === "admin" && <Link to="/admin" className="px-6 py-2.5 text-textPrimary hover:text-primary font-medium transition-all duration-200">
                Admin
              </Link>}

              {role === "customer" && <Link to="/shopes" className="px-6 py-2.5 text-textPrimary hover:text-primary font-medium transition-all duration-200">
                Shops
              </Link>}

              {role === "customer" && <Link to="/orders" className="px-6 py-2.5 text-textPrimary hover:text-primary font-medium transition-all duration-200">
                Orders
              </Link>}

              {role === "customer" && <Link to="/cartitem" className="px-6 py-2.5 text-textPrimary hover:text-primary font-medium transition-all duration-200">
                Cart
              </Link>}

              <button
                onClick={handleLogout}
                className="px-6 py-2.5 bg-bgSoft text-textPrimary hover:bg-primary hover:text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link to="/auth/signin" className="px-6 py-2.5 text-textPrimary hover:text-primary font-medium transition-all duration-200">
                Login
              </Link>
              <Link
                to="/auth/signup"
                className="px-6 py-2.5 bg-primary text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          )}

          <button className="md:hidden p-2.5 text-textSecondary bg-bgSoft rounded-xl">
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
