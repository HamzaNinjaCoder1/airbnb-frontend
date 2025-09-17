'use client';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Slider from 'react-slick';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useAuth } from './AuthContext';

function Cards() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [headings, setHeadings] = useState({});
  const [headingsLoading, setHeadingsLoading] = useState(true);

  // Wishlist modal state
  const [wishlistModalOpen, setWishlistModalOpen] = useState(false);
  const [wishlistStep, setWishlistStep] = useState('preview'); // 'preview' | 'create'
  const [selectedListing, setSelectedListing] = useState(null);
  const [wishlistName, setWishlistName] = useState('');
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistError, setWishlistError] = useState('');
  const [savedIds, setSavedIds] = useState(new Set());
  const [listingIdToWishlistId, setListingIdToWishlistId] = useState(new Map());

  const getHeadings = async () => {
    try {
      setHeadingsLoading(true);
      const response = await axios.get('http://localhost:5000/api/data/headings/grouped');

      if (response.data && Array.isArray(response.data)) {
        const cityHeadings = {};
        response.data.forEach(item => {
          if (item.city && item.headings && item.headings.length > 0) {
            cityHeadings[item.city] = item.headings[0];
          }
        });
        setHeadings(cityHeadings);
      }
    } catch (error) {
      console.error('Error fetching headings:', error);
    } finally {
      setHeadingsLoading(false);
    }
  };

  const getProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = 'http://localhost:5000/api/data/listing';
      const response = await axios.get(url);

      if (response.data && typeof response.data === "object") {
        setGroupedProducts(response.data);
      } else {
        setGroupedProducts({});
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getHeadings();
    getProducts();
  }, []);

  // Prefetch user's wishlist to paint hearts
  useEffect(() => {
    (async () => {
      try {
        if (!isAuthenticated || !user) return;
        const res = await axios.get(`http://localhost:5000/api/data/wishlist/${user.id}`, { withCredentials: true });
        const data = res.data?.data || [];
        const ids = new Set(data.map((i) => i.listing_id));
        const map = new Map(data.map((i) => [i.listing_id, i.id]));
        setSavedIds(ids);
        setListingIdToWishlistId(map);
      } catch (_) {}
    })();
  }, [isAuthenticated, user]);

  // Ensure hooks order remains consistent across renders
  const orderedCities = React.useMemo(() => {
    const cities = Object.keys(groupedProducts || {});
    return cities.slice().sort((a, b) => {
      const aIsLahore = String(a).toLowerCase() === 'lahore';
      const bIsLahore = String(b).toLowerCase() === 'lahore';
      if (aIsLahore && !bIsLahore) return -1;
      if (!aIsLahore && bIsLahore) return 1;
      return 0;
    });
  }, [groupedProducts]);

  const headingPatterns = React.useMemo(() => [
    (city) => `Popular homes in ${city}`,
    (city) => `Available in ${city} next weekend`,
    (city) => `Beautiful homes in ${city}`,
    (city) => `Top rated stays in ${city}`,
    (city) => `Affordable rentals in ${city}`,
    (city) => `Explore amazing homes in ${city}`,
  ], []);

  const hashString = (str) => {
    let h = 0;
    for (let i = 0; i < str.length; i++) {
      h = (h * 31 + str.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
  };

  const computedHeadingByCity = React.useMemo(() => {
    const mapping = {};
    const cities = Object.keys(groupedProducts || {});
    cities.forEach((city) => {
      const fromApi = headings[city];
      if (fromApi) {
        mapping[city] = fromApi;
      } else {
        const idx = hashString(city) % headingPatterns.length;
        mapping[city] = headingPatterns[idx](city);
      }
    });
    return mapping;
  }, [groupedProducts, headings, headingPatterns]);

  if (loading || headingsLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-32">
        <p className="text-red-500">Error loading products. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col py-2 px-4 sm:px-6 md:px-8 mt-6 overflow-x-hidden mb-8">
      {orderedCities.map((city) => {
        const products = groupedProducts[city];
        const filteredProducts = Array.isArray(products)
          ? products.filter((p) => {
              const status = String(p?.status || '').toLowerCase();
              const step = String(p?.current_step || p?.step || p?.stage || '').toLowerCase();
              // Only hide newly-added listings that are draft/in_progress.
              // Keep legacy/static items that have no status/step so city headings remain unaffected.
              if (status) return status === 'published';
              if (step) return step === 'publish' || step === 'finish' || step === 'published';
              return true;
            })
          : [];
        const dynamicHeading = computedHeadingByCity[city];

        return (
          <div key={city} className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center flex-wrap gap-1">
                <Link to={`/explore/${encodeURIComponent(city)}`} className="text-base sm:text-lg md:text-xl font-semibold cursor-pointer leading-tight break-words hover:underline">
                  {dynamicHeading}
                </Link>
                <div className="flex items-center flex-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                    role="presentation"
                    focusable="false"
                    className="w-3 h-3 sm:w-[14px] sm:h-[14px] text-black ml-1"
                  >
                    <path
                      fill="none"
                      stroke="black"
                      strokeWidth="5.33333"
                      d="m12 4 11.3 11.3a1 1 0 0 1 0 1.4L12 28"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {filteredProducts.length > 0 && (
            <Slider
              dots={false}
              infinite={false}
              slidesToShow={6}
              slidesToScroll={2}
              arrows={true}
              swipeToSlide={true}
              touchThreshold={12}
              lazyLoad="ondemand"
              responsive={[
                { breakpoint: 1536, settings: { slidesToShow: 6, slidesToScroll: 2 } },
                { breakpoint: 1280, settings: { slidesToShow: 5, slidesToScroll: 2 } },
                { breakpoint: 1024, settings: { slidesToShow: 4, slidesToScroll: 2 } },
                { breakpoint: 768, settings: { slidesToShow: 2, slidesToScroll: 2, arrows: false, dots: true } },
                { breakpoint: 640, settings: { slidesToShow: 2, slidesToScroll: 2, arrows: false, dots: true } },
                { breakpoint: 480, settings: { slidesToShow: 2, slidesToScroll: 2, arrows: false, dots: true } },
              ]}
            >
              {filteredProducts.map((product) => {
                const baseUploads = 'http://localhost:5000/uploads/';
                let imageSrc = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2070&q=80";
                const first = Array.isArray(product?.images) ? product.images[0] : null;
                if (first) {
                  if (typeof first === 'string') {
                    imageSrc = `${baseUploads}${first}`;
                  } else if (typeof first === 'object') {
                    const objUrl = first.image_url || first.imageUrl || first.url || first.path;
                    imageSrc = objUrl ? (/^https?:\/\//.test(objUrl) ? objUrl : `${baseUploads}${objUrl}`) : imageSrc;
                  }
                } else if (product?.image_url || product?.image) {
                  const fallback = product.image_url || product.image;
                  imageSrc = /^https?:\/\//.test(fallback) ? fallback : `${baseUploads}${fallback}`;
                }

                const numericRating = Number(product?.rating ?? product?.reviews_rating ?? 0);
                const idNum = parseInt(String(product?.id || 0), 10) || 0;
                const isGuestFavorite = (numericRating >= 4.8) || (idNum % 3 === 0);

                return (
                  <Link
                    to={`/products/${product.id}`}
                    state={{ listing: product }}
                    key={product.id}
                    className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-black/20 rounded-3xl"
                  >
                    <div className="relative p-2 -ml-2 sm:ml-0 cursor-pointer">
                      <img
                        src={imageSrc}
                        alt={product.title}
                        className="w-full h-[180px] sm:h-[190px] md:h-[190px] lg:h-[200px] xl:h-[200px] object-cover rounded-3xl"
                      />
                      {isGuestFavorite && (
                        <div className="absolute top-5 left-4 bg-gray-100 h-6 w-24 rounded-full z-10 text-gray-900 text-xs font-semibold flex justify-center items-center px-2 py-3">
                          Guest favorite
                        </div>
                      )}
                      <div className="absolute top-5 right-5">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 32 32"
                          aria-hidden="true"
                          role="presentation"
                          focusable="false"
                          className="w-6 h-6 text-white cursor-pointer hover:scale-110 transition-transform"
                          style={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.5))" }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!isAuthenticated) {
                              navigate('/auth', { replace: true });
                              return;
                            }
                            // Toggle behavior: if saved -> remove; else open modal to add
                            if (savedIds.has(product.id)) {
                              const wishlistId = listingIdToWishlistId.get(product.id);
                              if (!wishlistId) return;
                              (async () => {
                                try {
                                  await axios.delete(`http://localhost:5000/api/data/wishlist/remove/${wishlistId}`, { withCredentials: true });
                                  setSavedIds((prev) => {
                                    const n = new Set(prev);
                                    n.delete(product.id);
                                    return n;
                                  });
                                  setListingIdToWishlistId((prev) => {
                                    const m = new Map(prev);
                                    m.delete(product.id);
                                    return m;
                                  });
                                } catch (_) {}
                              })();
                            } else {
                              setSelectedListing({ id: product.id, title: product.title, imageSrc });
                              setWishlistName('');
                              setWishlistError('');
                              setWishlistStep('preview');
                              setWishlistModalOpen(true);
                            }
                          }}
                        >
                          <path
                            d="M16 28c7-4.73 14-10 14-17a6.98 6.98 0 0 0-7-7c-1.8 0-3.58.68-4.95 2.05L16 8.1l-2.05-2.05a6.98 6.98 0 0 0-9.9 0A6.98 6.98 0 0 0 2 11c0 7 7 12.27 14 17z"
                            fill={savedIds.has(product.id) ? "#FF385C" : "rgba(0, 0, 0, 0.5)"}
                            stroke="white"
                            strokeWidth="2"
                          />
                        </svg>
                      </div>
                      <div className="mt-2">
                        <div className="text-gray-800 text-sm font-semibold line-clamp-1">{product.title}</div>
                        <div className="text-gray-500 text-[12px] font-semibold">
                          ${Number(product.price_per_night).toFixed() || Number(product.price).toFixed(2) || '150'} for 2 nights
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </Slider>
            )}
          </div>
        );
      })}

      {/* Wishlist Modal via portal to cover whole viewport regardless of parents */}
      {wishlistModalOpen && selectedListing && ReactDOM.createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setWishlistModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl w-[94vw] sm:w-[90vw] max-w-xl shadow-2xl mx-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-center">
              <h3 className="text-base font-semibold">{wishlistStep === 'preview' ? 'Save to wishlist' : 'Create wishlist'}</h3>
              <button
                className="absolute right-3 top-3 p-2 hover:bg-gray-100 rounded-full"
                onClick={() => setWishlistModalOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {wishlistStep === 'preview' && (
              <div className="px-6 py-5">
                <div className="flex items-center gap-4">
                  <img src={selectedListing.imageSrc} alt={selectedListing.title} className="w-24 h-20 sm:w-28 sm:h-24 object-cover rounded-2xl" />
                  <div>
                    <div className="text-sm font-semibold">{selectedListing.title}</div>
                    <div className="text-xs text-gray-500">Ready to save this place</div>
                  </div>
                </div>
                <div className="mt-6">
                  <button
                    className="w-full h-12 rounded-xl bg-black text-white font-semibold hover:bg-gray-900"
                    onClick={() => setWishlistStep('create')}
                  >
                    Create new wishlist
                  </button>
                  <div className="mt-3">
                    <select className="w-full border rounded-xl h-11 px-3 text-sm">
                      <option value="favorites">My Favorites</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {wishlistStep === 'create' && (
              <div className="px-6 py-5">
                <div className="mb-4">
                  <input
                    value={wishlistName}
                    onChange={(e) => setWishlistName(e.target.value.slice(0,50))}
                    placeholder="Name"
                    className="w-full border rounded-xl px-4 h-12 outline-none focus:ring-2 focus:ring-black/20 text-sm"
                    maxLength={50}
                  />
                  <div className="text-xs text-gray-500 mt-1">{wishlistName.length}/50 characters</div>
                </div>
                {wishlistError && <div className="text-sm text-red-600 mb-3">{wishlistError}</div>}
                <div className="flex items-center justify-between">
                  <button
                    className="h-10 px-4 rounded-lg hover:bg-gray-100"
                    onClick={() => setWishlistStep('preview')}
                  >
                    Cancel
                  </button>
                  <button
                    disabled={wishlistLoading}
                    className={`h-10 px-5 rounded-lg text-white font-semibold ${wishlistLoading ? 'bg-gray-400' : 'bg-black hover:bg-gray-900'}`}
                    onClick={async () => {
                      try {
                        setWishlistError('');
                        setWishlistLoading(true);
                        if (!isAuthenticated) {
                          navigate('/auth', { replace: true });
                          return;
                        }
                        const res = await axios.post('http://localhost:5000/api/data/wishlist/add', {
                          user_id: user?.id,
                          listing_id: selectedListing.id,
                        }, { withCredentials: true });
                        setWishlistLoading(false);
                        setWishlistModalOpen(false);
                        setSavedIds((prev) => new Set(prev).add(selectedListing.id));
                        if (res?.data?.data?.id) {
                          setListingIdToWishlistId((prev) => {
                            const m = new Map(prev);
                            m.set(selectedListing.id, res.data.data.id);
                            return m;
                          });
                        }
                        navigate('/wishlist');
                      } catch (err) {
                        setWishlistLoading(false);
                        setWishlistError(err?.response?.data?.message || 'Failed to create wishlist');
                      }
                    }}
                  >
                    {wishlistLoading ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>, document.body)
      }
    </div>
  );
}

export default Cards;