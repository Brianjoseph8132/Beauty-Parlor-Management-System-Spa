import { motion, AnimatePresence } from "framer-motion";
import { useContext, useState } from "react";
import { Plus, Edit2, Trash2, X, Search, Filter,Package,DollarSign,AlertTriangle,Camera,TrendingDown,ShoppingCart,Box} from "lucide-react";
import { ProductContext } from "../context/ProductContext";
import { Link } from "react-router-dom";

const ProductManagement = () => {
  const { inventory,createProduct, deleteProduct, updateProduct, restockProduct, stockOutProduct } = useContext(ProductContext);
  const products = inventory?.products || [];


  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState(null);
  const productsPerPage = 5;

  const [formData, setFormData] = useState({
    product_name: "",
    price_per_each: "",
    quantity: "",
    supplier_name: "",
    description: "",
    min_stock_level: "",
    product_image: "https://via.placeholder.com/400x300?text=Product+Image"
  });

  const [stockOperation, setStockOperation] = useState("restock"); // "restock" or "stock-out"
  const [stockQuantity, setStockQuantity] = useState("");

  const stockOptions = ["All", "In Stock", "Low Stock", "Out of Stock"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProductImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Store the actual file for upload
      setProductImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddProduct = async () => {
    try {
      // Call the createProduct function from context
      await createProduct(
        formData.product_name,
        parseFloat(formData.price_per_each),
        formData.supplier_name,
        formData.description,
        parseInt(formData.min_stock_level) || 5,
        productImageFile
      );
   
      setIsAddModalOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setFormData({
      product_name: product.product_name,
      price_per_each: product.price_per_each.toString(),
      quantity: product.quantity.toString(),
      supplier_name: product.supplier_name,
      description: product.description,
      min_stock_level: product.min_stock_level.toString(),
      product_image: product.product_image
    });
    setProductImagePreview(product.product_image);
    setStockOperation("restock");
    setStockQuantity("");
    setIsEditModalOpen(true);
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      // Update basic product info with CORRECT parameter order matching context
      await updateProduct(
        formData.product_name,           // product_name
        parseFloat(formData.price_per_each), // price_per_each
        formData.supplier_name,          // supplier_name
        formData.description,            // description
        parseInt(formData.min_stock_level), // min_stock_level
        productImageFile,                // imageFile
        selectedProduct.id               // product_id
      );

      // Then handle stock operations separately using dedicated endpoints
      if (stockQuantity && parseInt(stockQuantity) > 0) {
        if (stockOperation === "restock") {
          await restockProduct(selectedProduct.id, parseInt(stockQuantity));
        } else if (stockOperation === "stock-out") {
          await stockOutProduct(selectedProduct.id, parseInt(stockQuantity));
        }
      }

      setIsEditModalOpen(false);
      setSelectedProduct(null);
      resetForm();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };


  const handleDeleteClick = (product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteProduct = async () => {
    if (!selectedProduct) return;

    try {
      await deleteProduct(selectedProduct.id);
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };


  const resetForm = () => {
    setFormData({
      product_name: "",
      price_per_each: "",
      quantity: "",
      supplier_name: "",
      description: "",
      min_stock_level: "",
      product_image: "https://via.placeholder.com/400x300?text=Product+Image"
    });
    setProductImagePreview(null);
    setProductImageFile(null);
    setStockOperation("restock");
    setStockQuantity("");
  };

  // Get stock status
  const getStockStatus = (product) => {
    if (product.quantity === 0) return "Out of Stock";
    if (product.is_low_stock) return "Low Stock";
    return "In Stock";
  };


  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const stockStatus = getStockStatus(product);
    const matchesStock =
      stockFilter === "All" || stockStatus === stockFilter;

    return matchesSearch && matchesStock;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);

  const handleStockFilterChange = (filter) => {
    setStockFilter(filter);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate statistics
  const totalProducts = inventory.total_products;
  const totalValue = inventory.total_inventory_value;
  const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= p.min_stock_level).length;
  const outOfStockItems = products.filter(p => p.quantity === 0).length;

  const getStockColor = (product) => {
    const status = getStockStatus(product);
    switch (status) {
      case "In Stock":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Low Stock":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Out of Stock":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "";
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen bg-[#EFD09E] py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-[#272727] mb-2">
              Product <span className="text-[#D4AA7D]">Inventory</span>
            </h1>
            <p className="text-lg text-[#272727]/70">
              Manage your beauty products and supplies
            </p>
          </div>
          <motion.button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 bg-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-[#272727] hover:text-[#EFD09E] transition shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="w-5 h-5" />
            Add Product
          </motion.button>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {/* Total Products */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#D4AA7D]/20 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-[#D4AA7D]" />
              </div>
              <Box className="w-5 h-5 text-[#D4AA7D]" />
            </div>
            <h3 className="text-3xl font-bold text-[#272727] mb-1">
              {totalProducts}
            </h3>
            <p className="text-sm text-[#272727]/60">Total Products</p>
          </div>

          {/* Total Inventory Value */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
              <ShoppingCart className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-[#272727] mb-1">
              KSH {totalValue.toFixed(2)}
            </h3>
            <p className="text-sm text-[#272727]/60">Inventory Value</p>
          </div>

          {/* Low Stock Items */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-yellow-500" />
              </div>
              <TrendingDown className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-3xl font-bold text-[#272727] mb-1">
              {lowStockItems}
            </h3>
            <p className="text-sm text-[#272727]/60">Low Stock Items</p>
          </div>

          {/* Out of Stock */}
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
                <X className="w-6 h-6 text-red-500" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-[#272727] mb-1">
              {outOfStockItems}
            </h3>
            <p className="text-sm text-[#272727]/60">Out of Stock</p>
          </div>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl p-6 shadow-lg mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#272727]/50" />
              <input
                type="text"
                placeholder="Search by product name or supplier..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-12 pr-4 py-3 bg-[#EFD09E]/30 border border-[#D4AA7D]/30 rounded-xl text-[#272727] placeholder-[#272727]/50 focus:outline-none focus:border-[#D4AA7D] transition"
              />
            </div>

            {/* Stock Filter */}
            <div className="flex items-center gap-3 flex-wrap">
              <Filter className="w-5 h-5 text-[#272727]/70 flex-shrink-0" />
              {stockOptions.map((option) => (
                <motion.button
                  key={option}
                  onClick={() => handleStockFilterChange(option)}
                  className={`px-4 py-2 rounded-lg font-medium text-sm transition ${
                    stockFilter === option
                      ? "bg-[#D4AA7D] text-[#272727]"
                      : "bg-[#EFD09E]/50 text-[#272727] hover:bg-[#EFD09E]"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {option}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Products Table */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#D4AA7D] text-[#272727]">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Product</th>
                  <th className="px-6 py-4 text-left font-semibold">Price</th>
                  <th className="px-6 py-4 text-center font-semibold">Quantity</th>
                  <th className="px-6 py-4 text-left font-semibold">Supplier</th>
                  <th className="px-6 py-4 text-center font-semibold">Status</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentProducts.length > 0 ? (
                  currentProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-[#D4AA7D]/20 hover:bg-[#EFD09E]/30 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-[#D4AA7D] rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <Link
                              to={`/product-details/${product.id}`}
                            >
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
                              <Package
                                className="w-8 h-8 text-[#272727]"
                                style={{
                                  display: product.product_image ? "none" : "block",
                                }}
                              />
                            </Link>
                          </div>
                          <div>
                            <p className="font-semibold text-[#272727]">
                              {product.product_name}
                            </p>
                            <p className="text-sm text-[#272727]/60">
                              Min. Stock: {product.min_stock_level}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#272727]">
                          KSH {product.price_per_each.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className="px-3 py-1 bg-[#D4AA7D]/20 text-[#272727] rounded-lg font-semibold">
                            {product.quantity}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-[#272727]">{product.supplier_name}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStockColor(product)}`}>
                            {getStockStatus(product)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <motion.button
                            onClick={() => handleEditClick(product)}
                            className="p-2 bg-[#D4AA7D]/20 text-[#D4AA7D] rounded-lg hover:bg-[#D4AA7D] hover:text-[#272727] transition"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </motion.button>
                          <motion.button
                            onClick={() => handleDeleteClick(product)}
                            className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-[#272727]/60">
                      No products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredProducts.length > productsPerPage && (
            <div className="flex items-center justify-center gap-2 p-6 border-t border-[#D4AA7D]/20">
              {/* Previous Button */}
              <motion.button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-[#D4AA7D]/30 bg-white text-[#272727] hover:bg-[#D4AA7D]/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
              >
                <span className="text-lg">‹</span>
                <span className="hidden sm:inline text-sm">Previous</span>
              </motion.button>

              {/* Page Numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => {
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <motion.button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`px-4 py-2 rounded-lg font-medium transition ${
                        currentPage === pageNumber
                          ? "bg-[#D4AA7D] text-white shadow-lg"
                          : "bg-white border border-[#D4AA7D]/30 text-[#272727] hover:bg-[#D4AA7D]/20"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {pageNumber}
                    </motion.button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} className="text-[#272727]/50">...</span>;
                }
                return null;
              })}

              {/* Next Button */}
              <motion.button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-4 py-2 rounded-lg border border-[#D4AA7D]/30 bg-white text-[#272727] hover:bg-[#D4AA7D]/20 transition disabled:opacity-30 disabled:cursor-not-allowed"
                whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
                whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
              >
                <span className="hidden sm:inline text-sm">Next</span>
                <span className="text-lg">›</span>
              </motion.button>
            </div>
          )}

          {/* Page Info */}
          {filteredProducts.length > 0 && (
            <div className="px-6 pb-4 text-center text-sm text-[#272727]/60">
              Showing {indexOfFirstProduct + 1}-{Math.min(indexOfLastProduct, filteredProducts.length)} of {filteredProducts.length} products
            </div>
          )}
        </motion.div>
      </div>

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {(isAddModalOpen || isEditModalOpen) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#272727]/95 backdrop-blur-md rounded-3xl p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#D4AA7D]/30"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-[#EFD09E]">
                  {isAddModalOpen ? "Add New Product" : "Edit Product"}
                </h2>
                <button
                  onClick={() => {
                    isAddModalOpen ? setIsAddModalOpen(false) : setIsEditModalOpen(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-[#EFD09E]/20 rounded-lg transition"
                >
                  <X className="w-6 h-6 text-[#EFD09E]" />
                </button>
              </div>

              <form
                className="space-y-6"
                onSubmit={(e) => {
                  e.preventDefault();
                  isAddModalOpen ? handleAddProduct() : handleUpdateProduct();
                }}
              >
                {/* Product Image */}
                <div className="flex flex-col items-center">
                  <div className="relative w-48 h-48 mb-4">
                    <img
                      src={productImagePreview || formData.product_image}
                      alt="Product Preview"
                      className="w-full h-full rounded-2xl object-cover border-4 border-[#D4AA7D]"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/400x300?text=Product+Image";
                      }}
                    />
                    <label
                      htmlFor="productImage"
                      className="absolute bottom-0 right-0 p-2 bg-[#D4AA7D] rounded-full cursor-pointer hover:bg-[#EFD09E] transition"
                    >
                      <Camera className="w-5 h-5 text-[#272727]" />
                    </label>
                    <input
                      type="file"
                      id="productImage"
                      accept="image/*"
                      onChange={handleProductImageChange}
                      className="hidden"
                    />
                  </div>
                  <p className="text-sm text-[#EFD09E]/70">Click camera to upload product image</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Name */}
                  <div>
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Product Name
                    </label>
                    <input
                      type="text"
                      name="product_name"
                      value={formData.product_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                      placeholder="e.g., Premium Hair Serum"
                    />
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Price (KSH)
                    </label>
                    <input
                      type="number"
                      name="price_per_each"
                      value={formData.price_per_each}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                      placeholder="450.00"
                    />
                  </div>

                  {/* Current Stock - Only show in Edit Mode */}
                  {isEditModalOpen && (
                    <div>
                      <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                        Current Stock
                      </label>
                      <div className="w-full px-4 py-3 bg-[#EFD09E]/5 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E]">
                        <span className="font-semibold">{formData.quantity} units</span>
                      </div>
                    </div>
                  )}

                  {/* Minimum Stock Level */}
                  <div>
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Minimum Stock Level
                    </label>
                    <input
                      type="number"
                      name="min_stock_level"
                      value={formData.min_stock_level}
                      onChange={handleInputChange}
                      required
                      min="0"
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                      placeholder="10"
                    />
                  </div>

                  {/* Supplier Name */}
                  <div className="md:col-span-2">
                    <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                      Supplier Name
                    </label>
                    <input
                      type="text"
                      name="supplier_name"
                      value={formData.supplier_name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                      placeholder="e.g., Beauty Supplies Ltd"
                    />
                  </div>
                </div>

                {/* Stock Operation Section - Only show in Edit Mode */}
                {isEditModalOpen && (
                  <div className="space-y-4">
                    <div className="border-t border-[#D4AA7D]/30 pt-6">
                      <h3 className="text-xl font-bold text-[#EFD09E] mb-4">
                        Stock Management
                      </h3>
                      
                      {/* Stock Operation Toggle */}
                      <div className="mb-4">
                        <label className="block text-[#EFD09E] mb-3 font-medium text-sm">
                          Operation Type
                        </label>
                        <div className="flex gap-4">
                          <button
                            type="button"
                            onClick={() => setStockOperation("restock")}
                            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                              stockOperation === "restock"
                                ? "bg-green-500 text-white"
                                : "bg-[#EFD09E]/10 text-[#EFD09E] border border-[#D4AA7D]/30"
                            }`}
                          >
                            Restocking
                          </button>
                          <button
                            type="button"
                            onClick={() => setStockOperation("stock-out")}
                            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
                              stockOperation === "stock-out"
                                ? "bg-red-500 text-white"
                                : "bg-[#EFD09E]/10 text-[#EFD09E] border border-[#D4AA7D]/30"
                            }`}
                          >
                            Stocking Out
                          </button>
                        </div>
                      </div>

                      {/* Quantity Input */}
                      <div>
                        <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                          Quantity
                        </label>
                        <input
                          type="number"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(e.target.value)}
                          min="0"
                          className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition"
                          placeholder={stockOperation === "restock" ? "Enter quantity to add" : "Enter quantity to remove"}
                        />
                        
                        {/* Preview of new stock */}
                        {stockQuantity && parseInt(stockQuantity) > 0 && (
                          <div className="mt-3 p-3 bg-[#D4AA7D]/20 rounded-xl border border-[#D4AA7D]/30">
                            <p className="text-sm text-[#EFD09E]/70">
                              Current Stock: <span className="font-semibold text-[#EFD09E]">{formData.quantity}</span>
                            </p>
                            <p className="text-sm text-[#EFD09E]/70 mt-1">
                              {stockOperation === "restock" ? "+" : "-"} {stockQuantity} units
                            </p>
                            <p className="text-sm font-bold text-[#D4AA7D] mt-2">
                              New Stock: {stockOperation === "restock" 
                                ? parseInt(formData.quantity) + parseInt(stockQuantity)
                                : Math.max(0, parseInt(formData.quantity) - parseInt(stockQuantity))
                              } units
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <label className="block text-[#EFD09E] mb-2 font-medium text-sm">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 bg-[#EFD09E]/10 border border-[#D4AA7D]/30 rounded-xl text-[#EFD09E] placeholder-[#EFD09E]/40 focus:outline-none focus:border-[#D4AA7D] transition resize-none"
                    placeholder="Enter product description..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <motion.button
                    type="submit"
                    className="flex-1 bg-[#D4AA7D] text-[#272727] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E] transition"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {isAddModalOpen ? "Add Product" : "Update Product"}
                  </motion.button>
                  <motion.button
                    type="button"
                    onClick={() => {
                      isAddModalOpen ? setIsAddModalOpen(false) : setIsEditModalOpen(false);
                      resetForm();
                    }}
                    className="flex-1 bg-[#EFD09E]/10 text-[#EFD09E] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E]/20 transition border border-[#D4AA7D]/30"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#272727]/95 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-[#D4AA7D]/30"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-500" />
                </div>
                <h2 className="text-2xl font-bold text-[#EFD09E] mb-2">Delete Product</h2>
                <p className="text-[#EFD09E]/70">
                  Are you sure you want to delete "{selectedProduct?.product_name}"? This action cannot be undone.
                </p>
              </div>

              <div className="flex gap-4">
                <motion.button
                  onClick={handleDeleteProduct}
                  className="flex-1 bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Delete
                </motion.button>
                <motion.button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 bg-[#EFD09E]/10 text-[#EFD09E] px-6 py-3 rounded-xl font-semibold hover:bg-[#EFD09E]/20 transition border border-[#D4AA7D]/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductManagement;