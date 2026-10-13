import React, { useEffect, useState } from 'react'
import { ArrowRight, ShoppingBag, MessageCircle, Truck, Zap, ShoppingCart, Apple, Smartphone, Shirt, Home, Pill, LayoutGrid } from 'lucide-react'
import { Link } from 'react-router'
import { useAuth } from '../context/AuthContext'

function LandingPage() {

  const [role, setRole] = useState(null)

  const { user, fetchProfile } = useAuth()


  useEffect(() => {

    const getRole = async () => {
      if (!user) return
      const data = await fetchProfile(user.id);
      if (data) {
        setRole(data.role)
      }
    }
    getRole()

  }, [user, fetchProfile])

  const features = [
    {
      title: "Nearby Shops",
      desc: "Discover trusted sellers right in your neighborhood.",
      icon: <ShoppingBag className="w-6 h-6 text-brand-primary" />,
      color: "bg-orange-50"
    },
    {
      title: "Direct Chat",
      desc: "Talk to sellers directly to get the best deals and info.",
      icon: <MessageCircle className="w-6 h-6 text-brand-primary" />,
      color: "bg-blue-50"
    },
    {
      title: "Fast Delivery",
      desc: "Get your orders delivered from local shops instantly.",
      icon: <Truck className="w-6 h-6 text-brand-primary" />,
      color: "bg-green-50"
    },
    {
      title: "Best Prices",
      desc: "Compare local prices and save more on every purchase.",
      icon: <Zap className="w-6 h-6 text-brand-primary" />,
      color: "bg-purple-50"
    }
  ]

  const categories = [
    { name: "Grocery", icon: <Apple />, color: "bg-green-100 text-green-700" },
    { name: "Electronics", icon: <Smartphone />, color: "bg-blue-100 text-blue-700" },
    { name: "Fashion", icon: <Shirt />, color: "bg-pink-100 text-pink-700" },
    { name: "Home", icon: <Home />, color: "bg-amber-100 text-amber-700" },
    { name: "Pharmacy", icon: <Pill />, color: "bg-red-100 text-red-700" },
    { name: "More", icon: <LayoutGrid />, color: "bg-slate-100 text-slate-700" }
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">

        {/* BACKGROUND IMAGE */}
        <div className="absolute inset-0 z-0">
          <img
            src="/background.jpeg" // 👈 put image in public folder
            alt="background"
            className="w-full h-full object-cover"
          />

          {/* DARK OVERLAY */}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Existing blur effects (optional, keep them) */}
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-150 h-150 bg-brand-primary/10 rounded-full blur-3xl opacity-50 z-10" />
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 w-150 h-150 bg-brand-accent/10 rounded-full blur-3xl opacity-50 z-10" />

        {/* CONTENT */}
        <div className="max-w-6xl mx-auto px-4 relative z-20 text-center">

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium text-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            Live in 20+ Local Districts
          </div>

          <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6">
            Your Local Market, <br />
            Now Online
          </h1>

          <p className="text-xl text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed">
            Connecting you with trusted local shops for faster delivery, better prices, and a more personal shopping experience.
          </p>

          <div className="flex items-center justify-center gap-4">
            {
              (!user || role === "customer") && <Link to="/shopes" className="px-8 py-4 bg-white text-black font-bold rounded-2xl hover:bg-gray-200 transition-all flex items-center gap-2">
                Explore Shops <ArrowRight className="w-5 h-5" />
              </Link>
            }
            {
              role === "admin" && <Link to="/admin" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
                Dashboard
              </Link>
            }


            {
              role !== "admin" && <Link to="/requestshop" className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-2xl hover:bg-white/20 transition-all">
                Start Selling
              </Link>
            }
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">Why choose LokMart?</h2>
            <p className="text-slate-600">The easiest way to shop from your favorite local stores</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="p-8 rounded-3xl glass border-white hover:border-brand-primary/20 transition-all group hover:shadow-xl hover:-translate-y-1">
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Shop by Category</h2>
              <p className="text-slate-600">Everything you need, just a click away</p>
            </div>
            <button className="text-brand-primary font-bold hover:underline hidden md:block">View all categories</button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat, idx) => (
              <button key={idx} className="flex flex-col items-center p-8 rounded-3xl border border-slate-100 hover:border-brand-primary hover:bg-brand-light transition-all group">
                <div className={`w-16 h-16 ${cat.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {React.cloneElement(cat.icon, { className: "w-8 h-8" })}
                </div>
                <span className="font-bold text-slate-900">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-4">
          <div className="relative rounded-[40px] bg-slate-900 overflow-hidden py-16 px-8 md:px-16 text-center lg:text-left flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-primary/20 blur-[120px] rounded-full translate-x-1/2" />

            <div className="relative z-10 lg:max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to bring your shop online?</h2>
              <p className="text-slate-400 text-lg mb-8">Join thousands of local sellers growing their business with LokMart. Zero commission for the first 3 months.</p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link to="/auth/signup" className="px-8 py-4 bg-brand-primary hover:bg-brand-accent text-white font-bold rounded-2xl transition-all hover:scale-105">
                  Start Selling Now
                </Link>
                <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl backdrop-blur-md transition-all">
                  Book a Demo
                </button>
              </div>
            </div>

            <div className="relative z-10 lg:w-1/3">
              <div className="p-8 rounded-3xl glass-dark border-white/10 animate-float text-left">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-brand-primary rounded-full" />
                  <div>
                    <div className="font-bold text-white">Organic Mart</div>
                    <div className="text-xs text-slate-400">Shop Owner Since 2024</div>
                  </div>
                </div>
                <div className="text-slate-300 italic mb-4">"LokMart increased our sales by 40% in just two months. The direct chat feature is a game changer!"</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => <Zap key={i} className="w-4 h-4 fill-brand-primary text-brand-primary" />)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 pt-20 pb-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-brand-primary rounded-lg">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-slate-900 tracking-tight">LokMart</span>
              </div>
              <p className="text-slate-500 leading-relaxed">Connecting local people with local shops. Supporting neighborhood commerce in the digital age.</p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Explore</h4>
              <ul className="space-y-4">
                <li><Link to="/shopes" className="text-slate-500 hover:text-brand-primary transition-colors">Marketplace</Link></li>
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">Popular Shops</a></li>
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">Special Offers</a></li>
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">New Arrivals</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">For Sellers</h4>
              <ul className="space-y-4">
                <li><Link to="/auth/signup" className="text-slate-500 hover:text-brand-primary transition-colors">Become a Seller</Link></li>
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">Seller Dashboard</a></li>
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">Help Center</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-slate-500 hover:text-brand-primary transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 flex flex-col md:row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} LokMart. Crafted for local communities.</p>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-brand-primary transition-colors">Twitter</a>
              <a href="#" className="text-slate-400 hover:text-brand-primary transition-colors">Instagram</a>
              <a href="#" className="text-slate-400 hover:text-brand-primary transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
