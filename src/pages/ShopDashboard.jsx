import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { Trash, Pencil, X } from "lucide-react";
import toast from "react-hot-toast";

export default function ShopDashboard() {
  const { user } = useAuth();

  const [shop, setShop] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Edit state
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", image: null });
  const [editErrors, setEditErrors] = useState({});
  const [editLoading, setEditLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    image: null,
  });

  // 🏪 Fetch shop
  const fetchShop = async () => {
    const { data } = await supabase
      .from("shops")
      .select("*")
      .eq("owner_id", user.id)
      .maybeSingle();

    setShop(data);
  };

  // 📦 Fetch products
  const fetchProducts = async (shopId) => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("shop_id", shopId);

    setProducts(data || []);
  };

  useEffect(() => {
    if(user) fetchShop();
  }, [user]);

  useEffect(() => {
    if(shop) fetchProducts(shop.id);
  }, [shop]);

  // 📤 Upload image
  const uploadImage = async (file) => {
    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("product_images")
      .upload(fileName, file);

    if(error) {
      toast.error("Image upload failed");
      return null;
    }

    const { data } = supabase.storage
      .from("product_images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // ✅ Validation
  const validateForm = () => {
    let newErrors = {};

    // Name Validation
    const nameVal = form.name.trim();
    if (!nameVal) {
      newErrors.name = "Product name is required";
    } else if (nameVal.length < 3) {
      newErrors.name = "Product name must be at least 3 characters long";
    } else if (nameVal.length > 100) {
      newErrors.name = "Product name cannot exceed 100 characters";
    }

    // Price Validation
    const priceVal = form.price.toString().trim();
    if (!priceVal) {
      newErrors.price = "Price is required";
    } else {
      const priceNum = Number(priceVal);
      if (isNaN(priceNum)) {
        newErrors.price = "Price must be a valid number";
      } else if (priceNum < 0) {
        newErrors.price = "Price cannot be negative";
      } else if (priceNum === 0) {
        newErrors.price = "Price must be greater than 0";
      }
    }

    // Description Validation
    const descVal = form.description.trim();
    if (!descVal) {
      newErrors.description = "Description is required";
    } else if (descVal.length < 10) {
      newErrors.description = "Description must be at least 10 characters long";
    } else if (descVal.length > 1000) {
      newErrors.description = "Description cannot exceed 1000 characters";
    }

    // Image Validation (if selected)
    if (form.image) {
      if (!form.image.type.startsWith("image/")) {
        newErrors.image = "Please select a valid image file (JPEG, PNG, etc.)";
      } else if (form.image.size > 5 * 1024 * 1024) {
        newErrors.image = "Image size must be less than 5MB";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ➕ Add product
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if(!validateForm()) {
      toast.error("Please fix the errors");
      return;
    }

    setLoading(true);

    let imageUrl = "";

    if(form.image) {
      imageUrl = await uploadImage(form.image);
    }

    const { error } = await supabase.from("products").insert({
      shop_id: shop.id,
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image_url: imageUrl,
    });

    setLoading(false);

    if(!error) {
      toast.success("Product added 🚀");

      setForm({
        name: "",
        price: "",
        description: "",
        image: null,
      });

      setErrors({});
      fetchProducts(shop.id);
    } else {
      toast.error(error.message);
    }
  };

  // ✏️ Open edit modal
  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditForm({ name: product.name, price: String(product.price), image: null });
    setEditErrors({});
  };

  // ✅ Validate edit form
  const validateEditForm = () => {
    let newErrors = {};

    const nameVal = editForm.name.trim();
    if (!nameVal) {
      newErrors.name = "Product name is required";
    } else if (nameVal.length < 3) {
      newErrors.name = "Product name must be at least 3 characters long";
    } else if (nameVal.length > 100) {
      newErrors.name = "Product name cannot exceed 100 characters";
    }

    const priceVal = editForm.price.toString().trim();
    if (!priceVal) {
      newErrors.price = "Price is required";
    } else {
      const priceNum = Number(priceVal);
      if (isNaN(priceNum)) {
        newErrors.price = "Price must be a valid number";
      } else if (priceNum < 0) {
        newErrors.price = "Price cannot be negative";
      } else if (priceNum === 0) {
        newErrors.price = "Price must be greater than 0";
      }
    }

    if (editForm.image) {
      if (!editForm.image.type.startsWith("image/")) {
        newErrors.image = "Please select a valid image file (JPEG, PNG, etc.)";
      } else if (editForm.image.size > 5 * 1024 * 1024) {
        newErrors.image = "Image size must be less than 5MB";
      }
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 💾 Save edited product
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) {
      toast.error("Please fix the errors");
      return;
    }

    setEditLoading(true);

    let imageUrl = editingProduct.image_url;

    if (editForm.image) {
      // Upload new image
      const newUrl = await uploadImage(editForm.image);
      if (newUrl) {
        // Remove old image from storage
        if (editingProduct.image_url) {
          const parts = editingProduct.image_url.split("/product_images/");
          const oldPath = parts[1];
          if (oldPath) {
            await supabase.storage.from("product_images").remove([oldPath]);
          }
        }
        imageUrl = newUrl;
      }
    }

    const { error } = await supabase
      .from("products")
      .update({
        name: editForm.name.trim(),
        price: Number(editForm.price),
        image_url: imageUrl,
      })
      .eq("id", editingProduct.id);

    setEditLoading(false);

    if (!error) {
      toast.success("Product updated ✅");
      setEditingProduct(null);
      fetchProducts(shop.id);
    } else {
      toast.error(error.message);
    }
  };

  // 🗑 Delete product
  const handleDeleteProduct = async (product) => {
    const confirmDelete = window.confirm("Delete this product?");
    if(!confirmDelete) return;

    let filePath = null;

    if(product.image_url) {
      const parts = product.image_url.split("/product_images/");
      filePath = parts[1];
    }

    if(filePath) {
      const { error: storageError } = await supabase.storage
        .from("product_images")
        .remove([filePath]);

      if(storageError) {
        console.error(storageError.message);
      }
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", product.id);

    if(error) {
      toast.error("Delete failed");
    } else {
      toast.success("Product deleted 🗑");
      fetchProducts(shop.id);
    }
  };

  if(!shop) {
    return (
      <div className="p-6 text-center text-gray-500">
        No shop found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50/70 via-emerald-50/40 to-green-50/70 p-6">
      <div className="max-w-5xl mx-auto">

        {/* 🏪 Header */}
        <div className="mb-8 bg-white/70 backdrop-blur-md border border-green-100/80 p-8 rounded-3xl shadow-sm flex flex-col justify-center relative overflow-hidden animate-fade-in">
          {/* A soft glowing green background sphere */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-green-200/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-emerald-200/30 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10">
            <span className="bg-green-100 text-green-850 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              Shop Owner Dashboard
            </span>
            <h1 className="text-4xl font-extrabold text-green-950 mt-3 tracking-tight">{shop.name}</h1>
            <p className="text-emerald-800/80 text-lg mt-1 flex items-center gap-1">
              📍 {shop.address}
            </p>
          </div>
        </div>

        {/* ➕ Add Product */}
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl border border-green-100 shadow-sm mb-8 animate-fade-in">
          <h2 className="text-xl font-bold text-green-950 mb-6 flex items-center gap-2">
            <span className="p-2 bg-green-100 text-green-700 rounded-xl">➕</span>
            Add New Product
          </h2>

          <form onSubmit={handleAddProduct} className="grid gap-5 md:grid-cols-2">

            {/* Name */}
            <div>
              <input
                placeholder="Product Name"
                className="border border-green-200/80 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 p-3.5 rounded-xl w-full bg-white/70 outline-none transition-all placeholder:text-green-800/40 text-green-950 font-medium"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.name}</p>
              )}
            </div>

            {/* Price */}
            <div>
              <input
                type="text"
                placeholder="Price"
                className="border border-green-200/80 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 p-3.5 rounded-xl w-full bg-white/70 outline-none transition-all placeholder:text-green-800/40 text-green-950 font-medium"
                value={form.price}
                onChange={(e) => {
                  const val = e.target.value;
                  // Strip negative signs and allow only digits and decimal point
                  const sanitized = val.replace(/-/g, "").replace(/[^0-9.]/g, "");
                  // Ensure only one decimal point is allowed
                  const parts = sanitized.split(".");
                  const finalVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : sanitized;
                  setForm({ ...form, price: finalVal });
                }}
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.price}</p>
              )}
            </div>

            {/* Image */}
            <div className="md:col-span-2">
              <input
                type="file"
                accept="image/*"
                className="border border-green-200/80 file:bg-green-50 file:border-0 file:text-green-700 file:font-semibold file:px-4 file:py-2 file:rounded-lg file:mr-4 file:cursor-pointer p-2.5 rounded-xl w-full bg-white/70 outline-none transition-all text-green-800/70 cursor-pointer"
                onChange={(e) =>
                  setForm({ ...form, image: e.target.files[0] || null })
                }
              />
              {errors.image && (
                <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.image}</p>
              )}
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <textarea
                placeholder="Description"
                className="border border-green-200/80 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 p-3.5 rounded-xl w-full bg-white/70 outline-none transition-all placeholder:text-green-800/40 text-green-950 font-medium min-h-[100px]"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1.5 font-medium">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              disabled={loading}
              className="bg-green-600 text-white font-semibold py-3.5 rounded-xl hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/15 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all md:col-span-2 cursor-pointer"
            >
              {loading ? "Adding..." : "Add Product"}
            </button>

          </form>
        </div>

        {/* 📦 Products */}
        <div className="animate-fade-in">
          <h2 className="text-xl font-bold text-green-950 mb-6 flex items-center gap-2">
            <span className="p-2 bg-green-100 text-green-700 rounded-xl">📦</span>
            Products
          </h2>

          {products.length === 0 ? (
            <div className="bg-white/50 border border-green-100 rounded-2xl p-12 text-center text-green-800/60">
              No products yet
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="bg-white/90 group relative rounded-2xl border border-green-50 shadow-sm hover:shadow-md hover:border-green-200/85 transition-all duration-300 overflow-hidden"
                >
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      className="h-40 w-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  )}

                  {/* Edit button */}
                  <button
                    onClick={() => handleOpenEdit(product)}
                    className="absolute top-2 left-2 bg-green-500 hover:bg-green-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md cursor-pointer"
                  >
                    <Pencil size={16} />
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteProduct(product)}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-md cursor-pointer"
                  >
                    <Trash size={16} />
                  </button>

                  <div className="p-4 bg-white">
                    <h3 className="font-bold text-green-950 text-sm line-clamp-1">
                      {product.name}
                    </h3>
                    <p className="text-green-700 font-semibold text-sm mt-1.5">
                      ₹{product.price}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* ✏️ Edit Product Modal */}
      {editingProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backdropFilter: "blur(8px)", backgroundColor: "rgba(0,0,0,0.35)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingProduct(null); }}
        >
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-green-100 w-full max-w-md animate-fade-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-green-50">
              <h2 className="text-lg font-extrabold text-green-950 flex items-center gap-2">
                <span className="p-1.5 bg-green-100 text-green-700 rounded-lg">
                  <Pencil size={16} />
                </span>
                Edit Product
              </h2>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-2 rounded-full hover:bg-green-50 text-green-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateProduct} className="p-6 flex flex-col gap-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-green-800/70 mb-1.5 uppercase tracking-wide">Product Name</label>
                <input
                  placeholder="Product Name"
                  className="border border-green-200/80 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 p-3.5 rounded-xl w-full bg-white outline-none transition-all placeholder:text-green-800/40 text-green-950 font-medium"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                />
                {editErrors.name && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">{editErrors.name}</p>
                )}
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-semibold text-green-800/70 mb-1.5 uppercase tracking-wide">Price (₹)</label>
                <input
                  type="text"
                  placeholder="Price"
                  className="border border-green-200/80 focus:border-green-500 focus:ring-2 focus:ring-green-500/10 p-3.5 rounded-xl w-full bg-white outline-none transition-all placeholder:text-green-800/40 text-green-950 font-medium"
                  value={editForm.price}
                  onChange={(e) => {
                    const val = e.target.value;
                    const sanitized = val.replace(/-/g, "").replace(/[^0-9.]/g, "");
                    const parts = sanitized.split(".");
                    const finalVal = parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : sanitized;
                    setEditForm({ ...editForm, price: finalVal });
                  }}
                />
                {editErrors.price && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">{editErrors.price}</p>
                )}
              </div>

              {/* Image */}
              <div>
                <label className="block text-xs font-semibold text-green-800/70 mb-1.5 uppercase tracking-wide">Replace Image <span className="normal-case text-green-600/60 font-normal">(optional)</span></label>
                {editingProduct.image_url && !editForm.image && (
                  <div className="mb-3 rounded-xl overflow-hidden border border-green-100 h-28">
                    <img src={editingProduct.image_url} className="w-full h-full object-cover" alt="Current" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="border border-green-200/80 file:bg-green-50 file:border-0 file:text-green-700 file:font-semibold file:px-4 file:py-2 file:rounded-lg file:mr-4 file:cursor-pointer p-2.5 rounded-xl w-full bg-white outline-none transition-all text-green-800/70 cursor-pointer"
                  onChange={(e) => setEditForm({ ...editForm, image: e.target.files[0] || null })}
                />
                {editErrors.image && (
                  <p className="text-red-500 text-sm mt-1.5 font-medium">{editErrors.image}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 py-3 rounded-xl border border-green-200 text-green-800 font-semibold hover:bg-green-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex-1 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold hover:shadow-lg hover:shadow-green-600/15 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}