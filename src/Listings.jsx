import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import HostDialog from './HostDialog';
import ListingHader from './ListingHader';
import Footer from './Footer';
import api from './api';
import { UPLOADS_BASE_URL } from './config.js';

const STATUS_META = {
  published: { label: 'Published', dot: 'bg-green-500' },
  draft: { label: 'Draft', dot: 'bg-gray-400' },
  in_progress: { label: 'In progress', dot: 'bg-orange-400' },
  action_required: { label: 'Action required', dot: 'bg-[#E35C33]' }
};

// Normalize backend flags to a UI status.
const deriveStatus = (listing = {}) => {
  const step = String(listing.current_step || '').toLowerCase();
  const status = String(listing.status || '').toLowerCase();
  if (status === 'action_required') return 'action_required';
  if (step === 'publish' || step === 'finish' || status === 'published') return 'published';
  // treat draft or anything else as in progress per requirement
  if (status === 'draft') return 'in_progress';
  return 'in_progress';
};

const randomWord = () => {
  const words = ['Cozy', 'Charming', 'Stylish', 'Spacious', 'Urban', 'Serene', 'Modern', 'Heritage', 'Premium', 'Sunny', 'Airy', 'Boutique', 'Elegant', 'Tranquil'];
  return words[Math.floor(Math.random() * words.length)];
};

const enhanceTitle = (originalTitle = '') => {
  const cleaned = String(originalTitle).replace(/\b\d{4,6}\b/g, '').replace(/\s{2,}/g, ' ').trim();
  // two random words before and after → total 4 extras
  const prefix = `${randomWord()} ${randomWord()}`;
  const suffix = `${randomWord()} ${randomWord()}`;
  return `${prefix} ${cleaned} ${suffix}`.replace(/\s{2,}/g, ' ').trim();
};

const formatLocation = (city, stateOrProvince, country) => {
  const safe = (v) => String(v || '').replace(/\b\d{4,6}\b/g, '').trim();
  const cityText = safe(city);
  const region = safe(stateOrProvince) || safe(country);
  const countryText = safe(country);
  return [cityText, region || countryText].filter(Boolean).join(', ');
};

const ListingCard = ({ image, title, city, state, province, country, status, onClick, onDelete }) => {
  // Helper function to get the first image URL
  const getImageUrl = (imageData) => {
    if (!imageData) return null;
    
    // If it's already a full URL, return as is
    if (typeof imageData === 'string' && imageData.startsWith('http')) {
      return imageData;
    }
    
    // If it's a filename, construct the full URL
    if (typeof imageData === 'string') {
      return `${UPLOADS_BASE_URL}${imageData}`;
    }
    
    // If it's an array, get the first image
    if (Array.isArray(imageData) && imageData.length > 0) {
      const firstImage = imageData[0];
      if (typeof firstImage === 'string') {
        return firstImage.startsWith('http') ? firstImage : `${UPLOADS_BASE_URL}${firstImage}`;
      }
    }
    
    return null;
  };

  const imageUrl = getImageUrl(image);
  
  return (
    <div className="flex flex-col cursor-pointer" onClick={onClick}>
      <div className="relative rounded-xl bg-gray-200 h-[300px] md:h-[360px] w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title || 'Listing image'}
            className="w-full h-full object-cover"
            onError={(e) => {
              console.log('Image failed to load:', imageUrl);
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={`w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 ${imageUrl ? 'hidden' : 'flex'}`}
        >
          {imageUrl ? 'Image failed to load' : 'No Image'}
        </div>
        <span className="absolute left-3 top-3 text-xs bg-white px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full inline-block ${STATUS_META[status]?.dot || STATUS_META.in_progress.dot}`} />
          {STATUS_META[status]?.label || STATUS_META.in_progress.label}
        </span>
        {/* Action buttons (delete only) */}
        <div className="absolute right-3 top-3 flex gap-2">
          <button
            onClick={onDelete}
            className="w-8 h-8 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-sm transition-all duration-200 hover:shadow-md"
            title="Delete listing"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-red-500 hover:text-red-600"
            >
              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-900 font-medium">{enhanceTitle(title)}</div>
      <div className="text-sm text-gray-600">{formatLocation(city, state || province, country)}</div>
    </div>
  );
};

const Listings = () => {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);
  const [items, setItems] = useState([]);
  const [showHostDialog, setShowHostDialog] = useState(false);
  const [selectedHostType, setSelectedHostType] = useState(null);
  const [grid, setGrid] = useState(true);
  const { hostId: hostIdFromParams } = useParams();
  const [searchParams] = useSearchParams();
  
  // Delete functionality states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  

  const stepToPath = (step) => {
    const s = String(step || '').toLowerCase().replace(/\s+/g, '').replace(/_/g, '').replace(/-/g, '');
    const map = {
      aboutplace: '/aboutplace',
      aboutplacetype: '/aboutplace/type',
      privacy: '/aboutplace/privacy',
      privacytype: '/aboutplace/privacy',
      privacytyp: '/aboutplace/privacy',
      location: '/aboutplace/location',
      basics: '/aboutplace/basics',
      standout: '/aboutplace/standout',
      amenities: '/aboutplace/amenities',
      photos: '/aboutplace/photos',
      photosupload: '/aboutplace/photos',
      title: '/aboutplace/title',
      highlights: '/aboutplace/highlights',
      description: '/aboutplace/description',
      final: '/aboutplace/final',
      bookingsettings: '/booking-settings',
      guestwelcome: '/guest-welcome',
      pricingweekday: '/pricing-weekday',
      pricingweekend: '/pricing-weekend',
      discounts: '/discounts',
      finaldetails: '/final-details',
      publish: '/',
      finish: '/'
    };
    return map[s] || '/aboutplace';
  };

  const navigateToListing = (l) => {
    const hostId = l.host_id || l.hostId || hostIdFromParams || searchParams.get('hostId');
    const listingId = l.id || l.listing_id || l.listingId;
    if (!listingId) return;
    navigate(`/listings/${hostId || 'me'}/${listingId}`, { state: { listing: l } });
  };

  // Delete functionality
  const handleDeleteClick = (e, listing) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    setListingToDelete(listing);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!listingToDelete) return;
    
    setIsDeleting(true);
    try {
      const hostId = listingToDelete.host_id || hostIdFromParams || searchParams.get('hostId') || 1;
      const listingId = listingToDelete.id || listingToDelete.listing_id;
      
      const response = await api.delete(`/api/data/listings/deletelisting?listingId=${listingId}&hostId=${hostId}`);
      
      if (response.status === 200) {
        setItems(prevItems => prevItems.filter(item => 
          (item.id || item.listing_id) !== listingId
        ));
        setShowDeleteDialog(false);
        setListingToDelete(null);
      }
    } catch (error) {
      console.error('Error deleting listing:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setListingToDelete(null);
  };

  // Removed edit modal and actions per requirement

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);

    const fetchListings = async () => {
      try {
        const hostId = hostIdFromParams || searchParams.get('hostId') || 1;
        const res = await api.get(`/api/data/listings/HostListingImages?hostId=${hostId}`);
        
        console.log('Listings API Response:', res.data);
        
        if (res.data.success) {
          console.log('Listings data:', res.data.data);
          setItems(res.data.data);
        } else {
          console.log('API returned success: false');
          setItems([]);
        }
      } catch (err) {
        console.error("Error fetching listings:", err);
        setItems([]);
      }
    };

    fetchListings();

    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <ListingHader />
      <div className="min-h-screen bg-white pt-20">
        <div className="flex items-center justify-between px-8 py-6">
        <h1 className="text-3xl font-semibold text-gray-900">Your listings</h1>
        <div className="flex items-center gap-3">
          <button title="Grid view" onClick={() => setGrid(true)} className={`w-10 h-10 rounded-full flex items-center justify-center transition ${grid ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`}>
            {/* Grid icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="3" width="7" height="7" rx="1"/>
              <rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/>
              <rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          </button>
          <button title="List view" onClick={() => setGrid(false)} className={`w-10 h-10 rounded-full flex items-center justify-center transition ${!grid ? 'bg-gray-200' : 'bg-gray-100 hover:bg-gray-200'}`}>
            {/* List icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 6h16M4 12h16M4 18h10"/>
            </svg>
          </button>
          <button title="Add listing" onClick={() => setShowHostDialog(true)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
            {/* Plus icon */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>

      <div className={`px-6 md:px-8 transition-opacity duration-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">No listings found</div>
            <div className="text-gray-400 text-sm">Create your first listing to get started</div>
          </div>
        ) : grid ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.map((l) => {
              const uiStatus = deriveStatus(l);
              console.log('Listing data for grid:', l);
              return (
              <ListingCard 
                key={l.listing_id}
                image={l.images} 
                title={l.title}
                city={l.city}
                country={l.country}
                state={l.state}
                province={l.province}
                status={uiStatus}
                onClick={() => navigateToListing(l)}
                onDelete={(e) => handleDeleteClick(e, l)}
              />
            );})}
          </div>
        ) : (
          <div className="border rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="grid grid-cols-12 px-6 py-4 text-sm md:text-base font-medium text-gray-600 bg-white/50">
              <div className="col-span-5">Listing</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Location</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1">Actions</div>
            </div>
            <div className="divide-y">
              {items.map((l) => {
                const uiStatus = deriveStatus(l);
                return (
                <div key={l.listing_id} className="grid grid-cols-12 items-center px-6 py-5 bg-white cursor-pointer" onClick={() => navigateToListing(l)}>
                  {/* Listing column */}
                  <div className="col-span-5 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-xl bg-gray-200 overflow-hidden flex items-center justify-center">
                      {l.images && l.images.length > 0 ? (
                        <img
                          src={l.images[0].startsWith('http') ? l.images[0] : `${UPLOADS_BASE_URL}${l.images[0]}`}
                          alt={l.title || 'Listing image'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.log('List view image failed to load:', l.images[0]);
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div 
                        className={`w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-600 ${l.images && l.images.length > 0 ? 'hidden' : 'flex'}`}
                      >
                        {l.images && l.images.length > 0 ? 'Failed' : 'No Img'}
                      </div>
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-sm font-medium text-gray-900">{enhanceTitle(l.title)}</div>
                    </div>
                  </div>
                  {/* Type */}
                  <div className="col-span-2 text-sm text-gray-800">{l.type || 'Home'}</div>
                  {/* Location */}
                  <div className="col-span-2 text-sm text-gray-800 truncate">{formatLocation(l.city, l.state || l.province, l.country)}</div>
                  {/* Status */}
                  <div className="col-span-2">
                    <span className="inline-flex items-center gap-2 text-sm text-gray-900">
                      <span className={`w-2 h-2 rounded-full ${STATUS_META[uiStatus]?.dot || STATUS_META.in_progress.dot}`} />
                      {(STATUS_META[uiStatus]?.label) || 'In progress'}
                    </span>
                  </div>
                  <div className="col-span-1 flex justify-center gap-2">
                    <button
                      onClick={(e) => handleDeleteClick(e, l)}
                      className="w-8 h-8 bg-red-50 hover:bg-red-100 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md"
                      title="Delete listing"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-red-500 hover:text-red-600"
                      >
                        <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
                      </svg>
                    </button>
                  </div>
                </div>
              );})}
            </div>
          </div>
        )}
      </div>

        {/* Edit Dialog removed */}

        <HostDialog
          showHostDialog={showHostDialog}
          setShowHostDialog={setShowHostDialog}
          selectedHostType={selectedHostType}
          setSelectedHostType={setSelectedHostType}
        />

        {/* Delete Confirmation Dialog */}
        {showDeleteDialog && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[500px] max-w-[95%] shadow-xl">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-500"
                  >
                    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Delete listing</h2>
                  <p className="text-sm text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete this listing?
                </p>
                {listingToDelete && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="font-medium text-gray-900">{enhanceTitle(listingToDelete.title)}</p>
                    <p className="text-sm text-gray-600">{formatLocation(listingToDelete.city, listingToDelete.state || listingToDelete.province, listingToDelete.country)}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  onClick={handleDeleteCancel}
                  disabled={isDeleting}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    'Delete listing'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Listings;

