import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from './api';
import { UPLOADS_BASE_URL } from './config';
import { useAuth } from './AuthContext';

const InfoRow = ({ label, value, onEdit }) => (
  <div className="flex items-start justify-between py-3 border-b border-gray-100">
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-gray-900 font-medium break-words">{value || '—'}</div>
    </div>
    {onEdit && (
      <button onClick={onEdit} className="text-sm text-blue-600 hover:text-blue-700 font-medium">Edit</button>
    )}
  </div>
);

const ListingEditor = () => {
  const { hostId, listingId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const initial = location.state?.listing || null;
  const [listing, setListing] = useState(initial);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const effectiveHostId = hostId || user?.id;

  // Inline editable fields
  const [titleInput, setTitleInput] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [stateInput, setStateInput] = useState('');
  const [provinceInput, setProvinceInput] = useState('');
  const [countryInput, setCountryInput] = useState('');
  const [descriptionInput, setDescriptionInput] = useState('');
  const [savingKey, setSavingKey] = useState('');

  useEffect(() => {
    if (initial) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/data/listing', { signal: controller.signal });
        const grouped = res.data || {};
        let found = null;
        Object.values(grouped).forEach((arr) => {
          if (Array.isArray(arr)) {
            const m = arr.find((p) => String(p?.id) === String(listingId) || String(p?.listing_id) === String(listingId));
            if (m && !found) found = m;
          }
        });
        if (found) setListing(found);
      } catch (_) {
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, [initial, listingId]);

  // Initialize form fields from listing
  useEffect(() => {
    if (!listing) return;
    setTitleInput(String(listing.title || ''));
    const p = listing.price_per_night || listing.price;
    setPriceInput(p != null ? String(Math.round(Number(p) || 0)) : '');
    setAddressInput(String(listing.address || ''));
    setCityInput(String(listing.city || ''));
    setStateInput(String(listing.state || ''));
    setProvinceInput(String(listing.province || ''));
    setCountryInput(String(listing.country || ''));
    setDescriptionInput(String(listing.description || ''));
  }, [listing]);

  const refreshListing = async () => {
    try {
      const res = await api.get('/api/data/listing');
      const grouped = res.data || {};
      let found = null;
      Object.values(grouped).forEach((arr) => {
        if (Array.isArray(arr)) {
          const m = arr.find((p) => String(p?.id) === String(listingId) || String(p?.listing_id) === String(listingId));
          if (m && !found) found = m;
        }
      });
      if (found) setListing(found);
    } catch (_) {}
  };

  const saveFields = async (payload, key) => {
    if (!effectiveHostId || !listingId) return;
    try {
      setSavingKey(key || '');
      await api.patch(`/api/data/listings/save-exit?hostId=${effectiveHostId}&listingId=${listingId}`, payload);
      await refreshListing();
    } catch (e) {
      console.error('Save failed', e);
    } finally {
      setSavingKey('');
    }
  };

  const images = useMemo(() => {
    const srcs = [];
    const imgs = listing?.images || [];
    if (Array.isArray(imgs)) {
      for (const img of imgs) {
        if (!img) continue;
        if (typeof img === 'string') {
          srcs.push(/^https?:\/\//.test(img) ? img : `${UPLOADS_BASE_URL}${img}`);
        } else if (typeof img === 'object') {
          const u = img.image_url || img.imageUrl || img.url || img.path;
          if (u) srcs.push(/^https?:\/\//.test(u) ? u : `${UPLOADS_BASE_URL}${u}`);
        }
        if (srcs.length >= 5) break;
      }
    }
    while (srcs.length < 5) {
      srcs.push('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2070&q=80');
    }
    return srcs.slice(0, 5);
  }, [listing]);

  const goTo = (path) => {
    const qs = new URLSearchParams();
    if (effectiveHostId) qs.set('hostId', effectiveHostId);
    if (listingId) qs.set('listingId', listingId);
    qs.set('editMode', 'true');
    qs.set('returnUrl', `/listings/${effectiveHostId}`);
    navigate(`${path}?${qs.toString()}`);
  };

  const title = listing?.title || 'Listing';
  const price = listing?.price_per_night || listing?.price;
  const address = [listing?.address, listing?.city, listing?.state || listing?.province, listing?.country]
    .filter(Boolean)
    .join(', ');

  return (
    <>
      <Header />
      <div className="min-h-screen bg-white pt-24 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Edit listing</h1>
            <div className="text-sm text-gray-600">ID #{listingId}</div>
          </div>
          <button onClick={() => navigate(`/listings/${effectiveHostId}`)} className="text-sm text-gray-700 hover:text-gray-900 font-medium">Back to listings</button>
        </div>

        {loading && (
          <div className="text-gray-600">Loading listing...</div>
        )}

        {!loading && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
              <div className="col-span-2 row-span-2 h-[220px] sm:h-[280px] lg:h-[360px] relative group">
                <img src={images[0]} alt="Primary" className="w-full h-full object-cover rounded-xl" />
                <label className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                    const files = Array.from(e.target.files || []);
                    if (!files.length || !effectiveHostId) return;
                    const form = new FormData();
                    form.append('images', files[0]);
                    try { await api.post(`/api/data/upload-images?hostId=${effectiveHostId}&listingId=${listingId}`, form); await refreshListing(); } catch (err) { console.error(err); }
                  }} />
                  <span className="px-3 py-1.5 bg-white/90 border border-gray-300 rounded-lg text-sm cursor-pointer">Change photo</span>
                </label>
              </div>
              {images.slice(1).map((src, idx) => (
                <div key={idx} className="h-[120px] sm:h-[140px] lg:h-[174px] relative group">
                  <img src={src} alt="Gallery" className="w-full h-full object-cover rounded-xl" />
                  <label className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length || !effectiveHostId) return;
                      const form = new FormData();
                      form.append('images', files[0]);
                      try { await api.post(`/api/data/upload-images?hostId=${effectiveHostId}&listingId=${listingId}`, form); await refreshListing(); } catch (err) { console.error(err); }
                    }} />
                    <span className="px-2 py-1 bg-white/90 border border-gray-300 rounded text-xs cursor-pointer">Change</span>
                  </label>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic info</h2>
                <div className="py-3 border-b border-gray-100">
                  <label className="block text-sm text-gray-500 mb-1">Title</label>
                  <div className="flex items-center gap-3">
                    <input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    <button onClick={() => saveFields({ title: titleInput }, 'title')} className={`px-4 py-2 rounded-lg border ${savingKey==='title' ? 'opacity-60' : 'hover:bg-gray-50'}`}>{savingKey==='title' ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
                <div className="py-3 border-b border-gray-100">
                  <label className="block text-sm text-gray-500 mb-1">Price per night</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input value={priceInput} onChange={(e)=>setPriceInput(e.target.value.replace(/[^0-9]/g,''))} className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <button onClick={() => saveFields({ price_per_night: Number(priceInput||0) }, 'price')} className={`px-4 py-2 rounded-lg border ${savingKey==='price' ? 'opacity-60' : 'hover:bg-gray-50'}`}>{savingKey==='price' ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
                <div className="py-3 border-b border-gray-100">
                  <label className="block text-sm text-gray-500 mb-2">Location</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input value={addressInput} onChange={(e)=>setAddressInput(e.target.value)} placeholder="Address" className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    <input value={cityInput} onChange={(e)=>setCityInput(e.target.value)} placeholder="City" className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    <input value={stateInput} onChange={(e)=>setStateInput(e.target.value)} placeholder="State" className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    <input value={provinceInput} onChange={(e)=>setProvinceInput(e.target.value)} placeholder="Province" className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    <input value={countryInput} onChange={(e)=>setCountryInput(e.target.value)} placeholder="Country" className="border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                  </div>
                  <div className="mt-3">
                    <button onClick={() => saveFields({ address: addressInput, city: cityInput, state: stateInput, province: provinceInput, country: countryInput }, 'location')} className={`px-4 py-2 rounded-lg border ${savingKey==='location' ? 'opacity-60' : 'hover:bg-gray-50'}`}>{savingKey==='location' ? 'Saving...' : 'Save location'}</button>
                  </div>
                </div>
                <div className="py-3 border-b border-gray-100">
                  <label className="block text-sm text-gray-500 mb-1">Description</label>
                  <textarea value={descriptionInput} onChange={(e)=>setDescriptionInput(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"></textarea>
                  <div className="mt-3">
                    <button onClick={() => saveFields({ description: descriptionInput }, 'description')} className={`px-4 py-2 rounded-lg border ${savingKey==='description' ? 'opacity-60' : 'hover:bg-gray-50'}`}>{savingKey==='description' ? 'Saving...' : 'Save description'}</button>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 h-fit">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Photos</h2>
                <div className="space-y-3">
                  <label className="w-full flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800 cursor-pointer">
                    <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      if (!files.length || !effectiveHostId) return;
                      const form = new FormData();
                      form.append('images', files[0]);
                      try { await api.post(`/api/data/upload-images?hostId=${effectiveHostId}&listingId=${listingId}`, form); await refreshListing(); } catch (err) { console.error(err); }
                    }} />
                    <span>Upload photo</span>
                  </label>
                  <div className="text-xs text-gray-500">Upload replaces or adds a photo. Changes appear above.</div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default ListingEditor;