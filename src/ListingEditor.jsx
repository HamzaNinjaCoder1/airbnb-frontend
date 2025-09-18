import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import api from './api';
import { UPLOADS_BASE_URL } from './config';

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

  useEffect(() => {
    if (initial) return;
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        // Fallback endpoint used elsewhere returns grouped arrays; find by id
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
    // Ensure five tiles
    while (srcs.length < 5) {
      srcs.push('https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2070&q=80');
    }
    return srcs.slice(0, 5);
  }, [listing]);

  const goTo = (path) => {
    const qs = new URLSearchParams();
    if (hostId) qs.set('hostId', hostId);
    if (listingId) qs.set('listingId', listingId);
    qs.set('editMode', 'true');
    qs.set('returnUrl', `/listings/${hostId}`);
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
          <button onClick={() => navigate(`/listings/${hostId}`)} className="text-sm text-gray-700 hover:text-gray-900 font-medium">Back to listings</button>
        </div>

        {loading && (
          <div className="text-gray-600">Loading listing...</div>
        )}

        {!loading && (
          <>
            {/* Image gallery */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-8">
              <div className="col-span-2 row-span-2 h-[220px] sm:h-[280px] lg:h-[360px]">
                <img src={images[0]} alt="Primary" className="w-full h-full object-cover rounded-xl" onClick={() => goTo('/aboutplace/photos')} />
              </div>
              {images.slice(1).map((src, idx) => (
                <div key={idx} className="h-[120px] sm:h-[140px] lg:h-[174px]">
                  <img src={src} alt="Gallery" className="w-full h-full object-cover rounded-xl" onClick={() => goTo('/aboutplace/photos')} />
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic info</h2>
                <InfoRow label="Title" value={title} onEdit={() => goTo('/aboutplace/title')} />
                <InfoRow label="Price per night" value={price ? `$${Number(price).toFixed(0)}` : ''} onEdit={() => goTo('/pricing-weekday')} />
                <InfoRow label="Location" value={address} onEdit={() => goTo('/aboutplace/location')} />
                <InfoRow label="Description" value={listing?.description} onEdit={() => goTo('/aboutplace/description')} />
                <InfoRow label="Amenities" value={(listing?.amenities || []).join(', ')} onEdit={() => goTo('/aboutplace/amenities')} />
                <InfoRow label="Highlights" value={(listing?.highlights || []).join(', ')} onEdit={() => goTo('/aboutplace/highlights')} />
                <InfoRow label="Basics" value={(listing?.basics || []).join(', ')} onEdit={() => goTo('/aboutplace/basics')} />
                <InfoRow label="Standout" value={(listing?.standout || []).join(', ')} onEdit={() => goTo('/aboutplace/standout')} />
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-6 h-fit">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
                <div className="space-y-3">
                  <button onClick={() => goTo('/aboutplace/photos')} className="w-full px-4 py-2 bg-gray-900 text-white rounded-xl hover:bg-gray-800">Manage photos</button>
                  <button onClick={() => goTo('/pricing-weekday')} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">Edit price</button>
                  <button onClick={() => goTo('/aboutplace/location')} className="w-full px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50">Edit location</button>
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


