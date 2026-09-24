import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import productService from '../services/productService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ShoppingCart, Package, Sparkles, Filter, Search } from 'lucide-react';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productService.getAllProducts();
        if (res.success) {
          setProducts(res.data || []);
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        // Fallback default product if API returned empty
        setProducts([
          {
            _id: 'default-equine-mix',
            name: 'ASHVA Equine Nutrition Mix (10kg)',
            description: 'Natural daily nutritional supplement scientifically formulated to improve stamina, digestion, immunity, and coat health for working & performance horses.',
            retailPrice: 1500,
            bulkPrice: 1200,
            image: '/images/enquine.png',
            stock: 150,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleBuyNowClick = (productId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/order/${productId}` } });
    } else {
      navigate(`/order/${productId}`);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="page-wrapper">
      <Header />

      <div className="products-hero-banner">
        <div className="products-banner-container">
          <span className="banner-tag">DAILY EQUINE SUPPLEMENTS</span>
          <h1>Products Catalog</h1>
          <p>Scientific daily nutrition mixes engineered for high endurance, digestion, and coat health.</p>

          <div className="search-bar-wrapper">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search products or ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <main className="products-main-container">
        <div className="catalog-header">
          <h2>Available Nutrition Formulations ({filteredProducts.length})</h2>
          <div className="bulk-perk-badge">
            <Sparkles size={16} />
            <span>Automatic Bulk Wholesale Discount on 5+ Bags</span>
          </div>
        </div>

        {loading ? (
          <div className="products-skeleton-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="product-skeleton-card">
                <div className="skeleton-img-box" />
                <div className="skeleton-line title" />
                <div className="skeleton-line desc" />
                <div className="skeleton-line price" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-catalog-card">
            <Package size={48} className="empty-icon" />
            <h3>No Products Found</h3>
            <p>No supplements matched your search criteria.</p>
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <div key={product._id} className="product-catalog-card">
                
                <div className="product-img-frame">
                  <img
                    src={product.image || '/images/enquine.png'}
                    alt={product.name}
                    className="product-card-img"
                  />
                  <span className="in-stock-tag">In Stock</span>
                </div>

                <div className="product-card-body">
                  <h3 className="product-title">{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  <div className="pricing-stack">
                    <div className="price-row">
                      <span className="price-lbl">Retail Price:</span>
                      <span className="retail-price-val">₹{product.retailPrice}</span>
                    </div>
                    <div className="price-row bulk">
                      <span className="price-lbl">Bulk Tier (5+ Bags):</span>
                      <span className="bulk-price-val">₹{product.bulkPrice} / bag</span>
                    </div>
                  </div>

                  <button
                    className="btn-configure-order"
                    onClick={() => handleBuyNowClick(product._id)}
                  >
                    <ShoppingCart size={18} />
                    Buy Now / Configure Order
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Products;
