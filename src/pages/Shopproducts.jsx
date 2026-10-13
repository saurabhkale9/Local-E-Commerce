import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [toast, setToast] = useState({
    show: false,
    message: "",
  });
  const { user } = useAuth()
  const navigate = useNavigate()


  const addToCart = async (product) => {

    if (!user) {
      navigate("/auth/signin");
      return;
    }
    if (!product) return;


    const { data, error } = await supabase.from("cart").insert([
      {
        user_id: user.id,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        product_image: product.image_url,
        shop_name: product.shop_name,
        quantity: 1,
      },
    ]);

    if (!error) {
      setToast({
        show: true,
        message: "Added to cart 🛒",
      });

      // auto hide after 2s
      setTimeout(() => {
        setToast({ show: false, message: "" });
      }, 2000);
    }
  };

  // Fetch all products
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          shops (
            name,
            address
          )
        `);
          
      if (error) {
        console.error(error);
        return;
      }

      // Flatten the data to include shop_name from joined shops table
      const flattened = data.map(p => ({
        ...p,
        shop_name: p.shops?.name || "Unknown Shop",
        shop_address: p.shops?.address || "",
      }));
      
      

      setProducts(flattened);
      setFiltered(flattened);
    };

    fetchProducts();
  }, []);



  // Search handler
  const handleSearch = (value) => {
    setSearch(value);

    if (!value.trim()) {
      setFiltered(products);
      setSuggestions([]);
      return;
    }

    const lower = value.toLowerCase();

    // Find all shop names/addresses that match the query
    const matchingShopNames = new Set(
      products
        .filter(
          (p) =>
            p.shop_name?.toLowerCase().includes(lower) ||
            p.shop_address?.toLowerCase().includes(lower)
        )
        .map((p) => p.shop_name)
    );

    // Include ALL products from matched shops + products matched by name
    const results = products.filter(
      (p) =>
        matchingShopNames.has(p.shop_name) ||
        p.name?.toLowerCase().includes(lower)
    );

    setFiltered(results);

    // Build typed suggestions: shops → locations → products
    const shopSuggestions = [];
    const locationSuggestions = [];
    const productSuggestions = [];
    const seenShops = new Set();
    const seenLocations = new Set();

    for (const p of products) {
      if (p.shop_name?.toLowerCase().includes(lower) && !seenShops.has(p.shop_name)) {
        seenShops.add(p.shop_name);
        shopSuggestions.push({
          type: "shop",
          label: p.shop_name,
          sublabel: p.shop_address,
          shop_name: p.shop_name,
        });
      }
      if (p.shop_address?.toLowerCase().includes(lower) && !seenLocations.has(p.shop_address)) {
        seenLocations.add(p.shop_address);
        locationSuggestions.push({
          type: "location",
          label: p.shop_address,
          sublabel: `${products.filter(x => x.shop_address === p.shop_address).length} shop(s) nearby`,
          address: p.shop_address,
        });
      }
      if (p.name?.toLowerCase().includes(lower)) {
        productSuggestions.push({
          type: "product",
          label: p.name,
          sublabel: p.shop_name,
          product: p,
        });
      }
    }

    setSuggestions(
      [...shopSuggestions, ...locationSuggestions, ...productSuggestions].slice(0, 7)
    );
  };

  // Select suggestion — shows ALL products from a shop/location, or just the one product
  const handleSelectSuggestion = (item) => {
    setSearch(item.label);
    setSuggestions([]);

    if (item.type === "shop") {
      setFiltered(products.filter((p) => p.shop_name === item.shop_name));
    } else if (item.type === "location") {
      setFiltered(products.filter((p) => p.shop_address === item.address));
    } else {
      // product — show only that product
      setFiltered([item.product]);
    }
  };

  // Group products by shop name
  const groupedProducts = filtered.reduce((acc, product) => {
    const shopName = product.shop_name || "Other Shops";
    if (!acc[shopName]) {
      acc[shopName] = [];
    }
    acc[shopName].push(product);
    return acc;
  }, {});

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-textPrimary tracking-tight mb-2">Explore Local Shops</h1>
        <p className="text-textSecondary">Find the best products from your neighborhood.</p>
      </div>

      {/* SEARCH BAR */}
      <div className="relative w-full max-w-3xl mb-12">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg className="w-5 h-5 text-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
        <input
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search products, shops or location..."
          className="w-full pl-12 pr-4 py-4 bg-bgSoft border-2 border-transparent focus:border-primary rounded-xl focus:outline-none transition-all duration-200 text-textPrimary font-medium placeholder:text-textMuted shadow-sm"
        />

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="absolute w-full bg-card border border-bgSoft mt-2 rounded-xl shadow-lg z-20 overflow-hidden">
            {suggestions.map((item, idx) => (
              <div
                key={`${item.type}-${idx}`}
                onClick={() => handleSelectSuggestion(item)}
                className="p-4 hover:bg-bgSoft cursor-pointer border-b border-bgSoft last:border-0 transition-all duration-200 flex items-start gap-3"
              >
                {/* Type icon */}
                <div className="mt-0.5 shrink-0">
                  {item.type === "shop" && (
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" points="9 22 9 12 15 12 15 22" /></svg>
                  )}
                  {item.type === "location" && (
                    <svg className="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  )}
                  {item.type === "product" && (
                    <svg className="w-4 h-4 text-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-textPrimary truncate">{item.label}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full shrink-0 ${
                      item.type === "shop"
                        ? "bg-primary/10 text-primary"
                        : item.type === "location"
                        ? "bg-secondary/10 text-secondary"
                        : "bg-bgSoft text-textMuted"
                    }`}>
                      {item.type}
                    </span>
                  </div>
                  {item.sublabel && (
                    <p className="text-xs text-textMuted truncate mt-0.5">{item.sublabel}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRODUCTS BY SHOP */}
      <div className="space-y-12">
        {Object.keys(groupedProducts).length > 0 ? (
          Object.entries(groupedProducts).map(([shopName, shopProducts]) => (
            <div key={shopName} className="space-y-6">
              {/* Shop Title Header */}
              <div className="relative pt-4">
                <div className="flex items-baseline gap-3 flex-wrap">
                  <h2 className="text-4xl font-black text-textPrimary tracking-tighter uppercase">
                    {shopName}
                  </h2>
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <p className="text-sm font-bold text-textSecondary uppercase tracking-widest ml-auto">
                    {shopProducts.length} Items Available
                  </p>
                </div>
                {shopProducts[0]?.shop_address && (
                  <p className="text-sm text-textMuted flex items-center gap-1 mt-1">
                    <svg className="w-4 h-4 shrink-0 text-primary/60" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {shopProducts[0].shop_address}
                  </p>
                )}
                <div className="w-full h-px bg-gradient-to-r from-primary/50 via-bgSoft to-transparent mt-2"></div>
              </div>

              {/* Product Grid for this Shop */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {shopProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-card rounded-xl p-4 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 group flex flex-col"
                  >
                    <div className="h-40 bg-bgSoft rounded-xl mb-4 flex items-center justify-center overflow-hidden relative">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <span className="text-textMuted font-medium">No Image</span>
                      )}
                    </div>

                    <div className="flex flex-col flex-1">
                      <h3 className="font-bold text-lg text-textPrimary line-clamp-1 mb-1">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-1.5 mb-4">
                        <span className="w-2 h-2 rounded-full bg-secondary"></span>
                        <p className="text-xs text-textSecondary font-medium">
                          {product.is_available ? "Available" : "Not Availabe"}
                        </p>
                      </div>

                      <div className="mt-auto flex items-center justify-between">
                        <p className="font-extrabold text-textPrimary text-xl">
                          ₹{product.price}
                        </p>
                      </div>
                      
                      <button
                        onClick={() => addToCart(product)}
                        className="mt-4 w-full bg-primary text-white font-medium py-2.5 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 0a2 2 0 100 4 2 2 0 000-4z"></path></svg>
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-bgSoft rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-textMuted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-textPrimary">No shops found nearby</h3>
            <p className="text-textSecondary mt-2">We couldn't find any products perfectly matching your search.</p>
          </div>
        )}
      </div>
      {toast.show && (
        <div className="fixed bottom-5 right-5 bg-card text-textPrimary px-6 py-3 rounded-xl shadow-lg border border-bgSoft animate-fade-in flex items-center gap-3 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          {toast.message}
        </div>
      )}
    </div>
  );
}