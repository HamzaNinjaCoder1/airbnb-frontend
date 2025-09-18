import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from './AuthContext';
import api from './api';
import { UPLOADS_BASE_URL } from './config';

const EditableField = ({ label, value, onChange, type = 'text' }) => {
  return (
    <div className="space-y-1">
      <div className="text-sm text-gray-600">{label}</div>
      {type === 'textarea' ? (
        <textarea
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
          rows={4}
        />
      ) : (
        <input
          value={value ?? ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-black"
          type={type}
        />
      )}
    </div>
  );
};

const ListingDetail = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const hostIdFromQs = searchParams.get('hostId') || user?.id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [images, setImages] = useState([]);

  const price = useMemo(() => Number(data?.price_per_night || 0), [data]);

  const getImageUrl = (img) => {
    if (!img) return '';
    if (typeof img === 'string') return img.startsWith('http') ? img : `${UPLOADS_BASE_URL}${img}`;
    return '';
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // There is no explicit get-by-id endpoint referenced in code; backend save-exit supports listingId.
        // Use a listings-by-host endpoint then pick by id as fallback.
        // Prefer dedicated endpoint if available: /api/data/listings/by-id?listingId=...
        try {
          const resById = await api.get(`/api/data/listings/by-id?listingId=${listingId}`);
          if (resById?.data?.success && resById.data?.data) {
            const d = resById.data.data;
            setData(d);
            setImages(Array.isArray(d.images) ? d.images : []);
            setLoading(false);
            return;
          }
        } catch (_) {}

        const hostId = hostIdFromQs || user?.id;
        const res = await api.get(`/api/data/listings/HostListingImages?hostId=${hostId}`);
        const list = res?.data?.data || [];
        const found = list.find((l) => String(l.id || l.listing_id) === String(listingId));
        if (!found) throw new Error('Listing not found');
        setData(found);
        setImages(Array.isArray(found.images) ? found.images : []);
      } catch (e) {
        setError(e?.message || 'Failed to load listing');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [listingId]);

  const updateListing = async (payload) => {
    if (!hostIdFromQs) return;
    await api.patch(`/api/data/listings/save-exit?hostId=${hostIdFromQs}&listingId=${listingId}`, payload);
  };

  const handleSave = async () => {
    if (!data) return;
    setSaving(true);
    try {
      const payload = {
        title: data.title,
        price_per_night: Number(data.price_per_night || 0),
        city: data.city,
        country: data.country,
        state: data.state,
        province: data.province,
        address: data.address,
        description: data.description,
      };
      await updateListing(payload);
    } catch (e) {
      setError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleReplaceImage = async (index, file) => {
    if (!file || !hostIdFromQs) return;
    // Upload using same endpoint as Photosupload.jsx
    const form = new FormData();
    form.append('images', file);
    await api.post(`/api/data/upload-images?hostId=${hostIdFromQs}&listingId=${listingId}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    // After upload, refresh details
    try {
      const resById = await api.get(`/api/data/listings/by-id?listingId=${listingId}`);
      if (resById?.data?.success && resById.data?.data) {
        const d = resById.data.data;
        setData(d);
        setImages(Array.isArray(d.images) ? d.images : []);
        return;
      }
    } catch (_) {}
    // Fallback refresh via host list
    const res = await api.get(`/api/data/listings/HostListingImages?hostId=${hostIdFromQs}`);
    const list = res?.data?.data || [];
    const found = list.find((l) => String(l.id || l.listing_id) === String(listingId));
    if (found) {
      setData(found);
      setImages(Array.isArray(found.images) ? found.images : []);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <button onClick={() => navigate(hostIdFromQs ? `/listings/${hostIdFromQs}` : '/listings')} className="px-3 py-2 rounded-lg border hover:bg-gray-50">Back</button>
        <div className="text-lg font-semibold">Listing details</div>
        <button onClick={handleSave} disabled={saving} className={`px-4 py-2 rounded-lg ${saving ? 'bg-black/30 text-white/70' : 'bg-black text-white hover:bg-gray-900'}`}>{saving ? 'Saving...' : 'Save changes'}</button>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto px-6 mt-4">
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Images grid: show first 5 slots editable */}
          <div>
            <div className="text-base font-medium mb-2">Photos</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 5 }).map((_, i) => {
                const img = images[i];
                return (
                  <div key={i} className="relative group rounded-xl overflow-hidden bg-gray-100 h-40">
                    {img ? (
                      <img src={getImageUrl(img)} className="w-full h-full object-cover"/>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
                    )}
                    <label className="absolute bottom-2 right-2 px-3 py-1 text-xs bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer">Replace
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleReplaceImage(i, e.target.files[0])} />
                    </label>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <EditableField label="Title" value={data?.title} onChange={(v) => setData((d) => ({ ...d, title: v }))} />
            <EditableField label="Description" value={data?.description} onChange={(v) => setData((d) => ({ ...d, description: v }))} type="textarea" />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="border rounded-xl p-4 space-y-4">
            <div className="text-base font-medium">Pricing</div>
            <EditableField label="Price per night" value={String(price)} onChange={(v) => setData((d) => ({ ...d, price_per_night: v.replace(/[^0-9]/g, '') }))} />
          </div>

          <div className="border rounded-xl p-4 space-y-4">
            <div className="text-base font-medium">Location</div>
            <EditableField label="Address" value={data?.address} onChange={(v) => setData((d) => ({ ...d, address: v }))} />
            <EditableField label="City" value={data?.city} onChange={(v) => setData((d) => ({ ...d, city: v }))} />
            <EditableField label="State/Province" value={data?.state || data?.province} onChange={(v) => setData((d) => ({ ...d, state: v, province: v }))} />
            <EditableField label="Country" value={data?.country} onChange={(v) => setData((d) => ({ ...d, country: v }))} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;