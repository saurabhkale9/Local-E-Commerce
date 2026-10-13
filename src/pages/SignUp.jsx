import React from 'react'
import { Link, useNavigate } from 'react-router'
import { ShoppingBag, Mail, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

function SignUp() {
  const { user, handleSignup } = useAuth()
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await handleSignup(data.name, data.email, data.password)
      if(res) {
        setError(res)
      }

    } catch (error) {
      console.log(error)
    }

  }


  return (
    <div className="min-h-screen bg-transparent flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2 pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-all duration-200">
              <ShoppingBag className="w-6 h-6 text-primary" />
            </div>
            <span className="text-2xl font-bold text-textPrimary tracking-tight group-hover:text-primary transition-all duration-200">LokMart</span>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl p-10 shadow-md border border-bgSoft">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-textPrimary mb-2">Create Account</h1>
            <p className="text-textSecondary">Join the local marketplace community</p>
          </div>

          {error && <p className='text-center text-red-600'>{error}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-bold text-textPrimary ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted group-focus-within:text-primary transition-colors">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  onChange={(e) => setData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full pl-11 pr-4 py-4 bg-bgSoft border border-transparent focus:bg-card focus:border-primary rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textPrimary ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  onChange={(e) => setData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-4 bg-bgSoft border border-transparent focus:bg-card focus:border-primary rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-textPrimary ml-1">Password</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  onChange={(e) => setData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Minimum 8 characters"
                  className="w-full pl-11 pr-11 py-4 bg-bgSoft border border-transparent focus:bg-card focus:border-primary rounded-xl outline-none transition-all duration-200 text-textPrimary placeholder:text-textMuted"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-textMuted hover:text-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button className="w-full py-4 bg-primary hover:opacity-90 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group">
              Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-bgSoft text-center">
            <p className="text-textSecondary text-sm">
              Already have an account? {' '}
              <Link to="/auth/signin" className="text-primary font-bold hover:text-accent transition-colors duration-200">
                Sign in here
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-textMuted text-xs px-4">
          By signing up, you agree to receive updates from local shops and accept our <a href="#" className="underline hover:text-textSecondary transition-colors">Privacy Terms</a>.
        </p>
      </div>
    </div>
  )
}

export default SignUp
