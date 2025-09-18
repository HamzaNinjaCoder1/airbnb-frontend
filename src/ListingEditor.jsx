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
  const [stayTypeInput, setStayTypeInput] = useState('');
  const [maxGuestsInput, setMaxGuestsInput] = useState('');
  const [bedroomsInput, setBedroomsInput] = useState('');
  const [bedsInput, setBedsInput] = useState('');
  const [bathsInput, setBathsInput] = useState('');
  const [mapUrlInput, setMapUrlInput] = useState('');
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
    setStayTypeInput(String(listing.stay_type || listing.type || 'Home'));
    setMaxGuestsInput(String(listing.max_guests ?? listing.guests ?? 1));
    setBedroomsInput(String(listing.bedrooms ?? 1));
    setBedsInput(String(listing.beds ?? 1));
    setBathsInput(String(listing.baths ?? 1));
    setMapUrlInput(String(listing.map_url || listing.map || ''));
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="text-gray-700"><path d="M12 12c2.761 0 5-2.239 5-5S14.761 2 12 2 7 4.239 7 7s2.239 5 5 5zm0 2c-3.866 0-7 2.239-7 5v1h14v-1c0-2.761-3.134-5-7-5z"/></svg>
                  Basic info
                </h2>
                <div className="py-3 border-b border-gray-100">
                  <label className="block text-sm text-gray-500 mb-1">Title</label>
                  <div className="flex items-center gap-3">
                    <input value={titleInput} onChange={(e) => setTitleInput(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    <button disabled={!titleInput.trim()} title={!titleInput.trim() ? 'Title cannot be empty' : ''} onClick={() => saveFields({ title: titleInput }, 'title')} className={`px-4 py-2 rounded-lg border ${savingKey==='title' ? 'opacity-60' : 'hover:bg-gray-50'} ${!titleInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}>{savingKey==='title' ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
                <div className="py-3 border-b border-gray-100">
                  <label className="block text-sm text-gray-500 mb-1">Price per night</label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <input value={priceInput} onChange={(e)=>setPriceInput(e.target.value.replace(/[^0-9]/g,''))} className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <button disabled={!priceInput || Number(priceInput) <= 0} title={!priceInput || Number(priceInput) <= 0 ? 'Enter a valid price' : ''} onClick={() => saveFields({ price_per_night: Number(priceInput||0) }, 'price')} className={`px-4 py-2 rounded-lg border ${savingKey==='price' ? 'opacity-60' : 'hover:bg-gray-50'} ${(!priceInput || Number(priceInput)<=0) ? 'opacity-50 cursor-not-allowed' : ''}`}>{savingKey==='price' ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
                <div className="py-3 border-b border-gray-100">
                  <label className="block text-sm text-gray-500 mb-1">Stay type</label>
                  <div className="flex items-center gap-3">
                    <input value={stayTypeInput} onChange={(e)=>setStayTypeInput(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    <button disabled={!stayTypeInput.trim()} title={!stayTypeInput.trim() ? 'Stay type is required' : ''} onClick={() => saveFields({ stay_type: stayTypeInput }, 'stay_type')} className={`px-4 py-2 rounded-lg border ${savingKey==='stay_type' ? 'opacity-60' : 'hover:bg-gray-50'} ${!stayTypeInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}>{savingKey==='stay_type' ? 'Saving...' : 'Save'}</button>
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
                    <button disabled={!cityInput.trim() || !countryInput.trim()} title={!cityInput.trim() || !countryInput.trim() ? 'City and Country are required' : ''} onClick={() => saveFields({ address: addressInput, city: cityInput, state: stateInput, province: provinceInput, country: countryInput }, 'location')} className={`px-4 py-2 rounded-lg border ${savingKey==='location' ? 'opacity-60' : 'hover:bg-gray-50'} ${(!cityInput.trim() || !countryInput.trim()) ? 'opacity-50 cursor-not-allowed' : ''}`}>{savingKey==='location' ? 'Saving...' : 'Save location'}</button>
                  </div>
                </div>
                <div className="py-3 border-b border-gray-100">
                  <label className="block text-sm text-gray-500 mb-1">Map URL</label>
                  <div className="flex items-center gap-3">
                    <input value={mapUrlInput} onChange={(e)=>setMapUrlInput(e.target.value)} placeholder="https://maps.google.com/..." className="flex-1 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    <button disabled={!mapUrlInput.trim()} title={!mapUrlInput.trim() ? 'Map URL is required' : ''} onClick={() => saveFields({ map_url: mapUrlInput }, 'map_url')} className={`px-4 py-2 rounded-lg border ${savingKey==='map_url' ? 'opacity-60' : 'hover:bg-gray-50'} ${!mapUrlInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}>{savingKey==='map_url' ? 'Saving...' : 'Save'}</button>
                  </div>
                </div>
                <div className="py-3 border-b border-gray-100">
                  <label className="block text-sm text-gray-500 mb-1">Description</label>
                  <textarea value={descriptionInput} onChange={(e)=>setDescriptionInput(e.target.value)} rows={4} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300"></textarea>
                  <div className="mt-3">
                    <button disabled={!descriptionInput.trim()} title={!descriptionInput.trim() ? 'Description cannot be empty' : ''} onClick={() => saveFields({ description: descriptionInput }, 'description')} className={`px-4 py-2 rounded-lg border ${savingKey==='description' ? 'opacity-60' : 'hover:bg-gray-50'} ${!descriptionInput.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}>{savingKey==='description' ? 'Saving...' : 'Save description'}</button>
                  </div>
                </div>
                <div className="py-3">
                  <label className="block text-sm text-gray-500 mb-2">Capacity and rooms</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Max guests</div>
                      <input value={maxGuestsInput} onChange={(e)=>setMaxGuestsInput(e.target.value.replace(/[^0-9]/g,''))} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Bedrooms</div>
                      <input value={bedroomsInput} onChange={(e)=>setBedroomsInput(e.target.value.replace(/[^0-9]/g,''))} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Beds</div>
                      <input value={bedsInput} onChange={(e)=>setBedsInput(e.target.value.replace(/[^0-9]/g,''))} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Baths</div>
                      <input value={bathsInput} onChange={(e)=>setBathsInput(e.target.value.replace(/[^0-9]/g,''))} className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-gray-300" />
                    </div>
                  </div>
                  <div className="mt-3">
                    <button disabled={![maxGuestsInput, bedroomsInput, bedsInput, bathsInput].every(v => String(v).trim() && Number(v) >= 0)} title={!![maxGuestsInput, bedroomsInput, bedsInput, bathsInput].every(v => String(v).trim() && Number(v) >= 0) ? 'Enter valid numbers' : ''} onClick={() => saveFields({ max_guests: Number(maxGuestsInput||0), bedrooms: Number(bedroomsInput||0), beds: Number(bedsInput||0), baths: Number(bathsInput||0) }, 'capacity')} className={`px-4 py-2 rounded-lg border ${savingKey==='capacity' ? 'opacity-60' : 'hover:bg-gray-50'} ${![maxGuestsInput, bedroomsInput, bedsInput, bathsInput].every(v => String(v).trim() && Number(v) >= 0) ? 'opacity-50 cursor-not-allowed' : ''}`}>{savingKey==='capacity' ? 'Saving...' : 'Save capacity'}</button>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-3">
                  <div className="h-[220px] sm:h-[260px] lg:h-[320px] relative group rounded-xl overflow-hidden">
                    <img src={images[0]} alt="Primary" className="w-full h-full object-cover" />
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
                  {images.slice(1).map((src, idx) => (
                    <div key={idx} className="h-[110px] sm:h-[120px] lg:h-[140px] relative group rounded-xl overflow-hidden">
                      <img src={src} alt={`Gallery ${idx+2}`} className="w-full h-full object-cover" />
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