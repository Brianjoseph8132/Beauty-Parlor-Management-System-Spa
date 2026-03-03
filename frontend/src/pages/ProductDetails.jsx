import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft,Package,DollarSign,User,FileText,TrendingUp,AlertTriangle,Edit2,ShoppingCart} from "lucide-react";
import { useContext, useState, useEffect } from "react";
import { ProductContext } from "../context/ProductContext";

const ProductDetails = () => {
  const { id } = useParams();
  
  const navigate = useNavigate();

  const { fetchProductById } = useContext(ProductContext);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
      const loadProduct = async () => {
      try {
        const data = await fetchProductById(id);
        setProduct(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [id]);



  if (loading) {
    return <div>Loading...</div>;
  }

  if (!product) {
    return <div>Product not found</div>;
  }

  
  
  // Get stock status
  const getStockStatus = () => {
    if (product.quantity === 0) return { text: "Out of Stock", color: "text-red-500", bg: "bg-red-500/20", border: "border-red-500/30" };
    if (product.quantity <= product.min_stock_level) return { text: "Low Stock", color: "text-yellow-500", bg: "bg-yellow-500/20", border: "border-yellow-500/30" };
    return { text: "In Stock", color: "text-green-500", bg: "bg-green-500/20", border: "border-green-500/30" };
  };

  const stockStatus = getStockStatus();
  const totalValue =(product.price_per_each || 0) * (product.quantity || 0);


  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-[#EFD09E] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <motion.button
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#272727] hover:text-[#D4AA7D] transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Products</span>
        </motion.button>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Left Column - Product Image */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl p-6 shadow-lg"
          >
            <div className="aspect-square rounded-2xl overflow-hidden bg-[#EFD09E]/30 flex items-center justify-center">
              {product.product_image ? (
                <img
                  src={product.product_image}
                  alt={product.product_name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className="flex items-center justify-center" style={{ display: product.product_image ? 'none' : 'flex' }}>
                <Package className="w-32 h-32 text-[#D4AA7D]" />
              </div>
            </div>

            {/* Stock Status Badge */}
            <div className="mt-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border ${stockStatus.bg} ${stockStatus.color} ${stockStatus.border}`}>
                {product.quantity === 0 ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <Package className="w-4 h-4" />
                )}
                {stockStatus.text}
              </div>
            </div>
          </motion.div>

          {/* Right Column - Product Info */}
          <motion.div
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Header Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              

              {/* Price */}
              <div className="flex items-center gap-2 mb-6">
                <DollarSign className="w-6 h-6 text-[#D4AA7D]" />
                <span className="text-4xl font-bold text-[#D4AA7D]">
                  KSH{product.price_per_each?.toFixed(2) || "0.00"}
                </span>
                <span className="text-[#272727]/60">per unit</span>
              </div>

              {/* Description */}
              <div className="border-t border-[#D4AA7D]/20 pt-4">
                <div className="flex items-start gap-2 mb-2">
                  <FileText className="w-5 h-5 text-[#D4AA7D] flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold text-[#272727] mb-2">Description</h3>
                    <p className="text-[#272727]/70 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#D4AA7D]/20 rounded-xl flex items-center justify-center">
                  <User className="w-5 h-5 text-[#D4AA7D]" />
                </div>
                <div>
                  <p className="text-sm text-[#272727]/60">Supplier</p>
                  <p className="font-semibold text-[#272727] text-lg">
                    {product.supplier_name}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Statistics Cards */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {/* Current Stock */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#D4AA7D]/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-[#D4AA7D]" />
              </div>
              <ShoppingCart className="w-5 h-5 text-[#D4AA7D]" />
            </div>
            <h3 className="text-3xl font-bold text-[#272727] mb-1">
              {product.quantity}
            </h3>
            <p className="text-sm text-[#272727]/60">Current Stock</p>
          </div>

          {/* Minimum Stock */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#272727] mb-1">
              {product.min_stock_level}
            </h3>
            <p className="text-sm text-[#272727]/60">Minimum Stock Level</p>
          </div>

          {/* Total Value */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-[#272727] mb-1">
              KSH{totalValue.toFixed(2)}
            </h3>
            <p className="text-sm text-[#272727]/60">Total Stock Value</p>
          </div>

          {/* Stock Difference */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${product.quantity > product.min_stock_level ? 'bg-green-500/20' : 'bg-red-500/20'} rounded-xl flex items-center justify-center`}>
                <Package className={`w-6 h-6 ${product.quantity > product.min_stock_level ? 'text-green-500' : 'text-red-500'}`} />
              </div>
            </div>
            <h3 className={`text-3xl font-bold mb-1 ${product.quantity > product.min_stock_level ? 'text-green-500' : 'text-red-500'}`}>
              {product.quantity > product.min_stock_level ? '+' : ''}{product.quantity - product.min_stock_level}
            </h3>
            <p className="text-sm text-[#272727]/60">Above/Below Min. Stock</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetails;