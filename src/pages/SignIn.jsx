import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'


function SignIn() {

  const { user, handleLogin } = useAuth()
  const [error, setError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [data, setData] = useState({
    email: "",
    password: "",
  })


  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const res = await handleLogin(data.email, data.password)
      if(res) {
        setError(res)
      }

      // navigate("/")

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


        {/* Card */}
        <div className="bg-card rounded-xl p-10 shadow-md border border-bgSoft">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-textPrimary mb-2">Welcome Back</h1>
            <p className="text-textSecondary">Simplify your local shopping experience</p>
          </div>

          {error && <p className='text-center text-red-600'>{error}</p>}

          <form className="space-y-6" onSubmit={handleSubmit}>
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
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-textMuted group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  onChange={(e) => setData(prev => ({ ...prev, password: e.target.value }))}
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

            <button type='submit' className="w-full py-4 bg-primary hover:opacity-90 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group">
              Sign In <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-bgSoft text-center">
            <p className="text-textSecondary text-sm">
              Don't have an account? {' '}
              <Link to="/auth/signup" className="text-primary font-bold hover:text-accent transition-colors duration-200">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-8 text-center text-textMuted text-xs">
          By continuing, you agree to LokMart's <br className="sm:hidden" />
          <a href="#" className="underline hover:text-textSecondary transition-colors">Terms of Service</a> and <a href="#" className="underline hover:text-textSecondary transition-colors">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}

export default SignIn
