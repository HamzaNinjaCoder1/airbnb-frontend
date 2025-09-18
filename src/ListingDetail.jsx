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
        const hostId = hostIdFromQs || user?.id;
        // 1) Find listing meta (including city) for this host
        const resMeta = await api.get(`/api/data/listings/HostListingImages?hostId=${hostId}`);
        const list = resMeta?.data?.data || [];
        const foundMeta = list.find((l) => String(l.id || l.listing_id) === String(listingId));
        if (!foundMeta) throw new Error('Listing not found');

        // 2) Load full listing data by city and filter by id
        const city = foundMeta.city;
        if (city) {
          const resCity = await api.get(`/api/data/listing/city/${encodeURIComponent(city)}`);
          const cityListings = Array.isArray(resCity?.data) ? resCity.data : [];
          const full = cityListings.find((it) => String(it.id) === String(foundMeta.listing_id || foundMeta.id));
          if (full) {
            // backend returns images as objects in relations, map to strings
            const imgs = Array.isArray(full.images) ? full.images.map((im) => im.image_url || im) : [];
            setData({ ...full });
            setImages(imgs);
            return;
          }
        }
        // 3) Fallback to meta only
        setData(foundMeta);
        setImages(Array.isArray(foundMeta.images) ? foundMeta.images : []);
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
    const oldFilename = images[index];
    if (oldFilename) {
      try {
        const form = new FormData();
        form.append('image', file);
        await api.post(
          `/api/data/listing-image/replace?hostId=${Number(hostIdFromQs)}&listingId=${Number(listingId)}&oldFilename=${encodeURIComponent(oldFilename)}`,
          form
        );
      } catch (err) {
        const detail = err?.response?.data?.message || err?.message || 'Failed to replace image';
        setError(detail);
        return;
      }
    } else {
      // Add image
      try {
        const form = new FormData();
        form.append('images', file);
        await api.post(`/api/data/upload-images?hostId=${Number(hostIdFromQs)}&listingId=${Number(listingId)}`, form);
      } catch (err) {
        // Fallback to single-file endpoint
        try {
          const single = new FormData();
          single.append('image', file);
          await api.post(`/api/data/upload-image?hostId=${Number(hostIdFromQs)}&listingId=${Number(listingId)}`, single);
        } catch (err2) {
          const detail = err2?.response?.data?.message || err?.response?.data?.message || err2?.message || err?.message || 'Upload failed';
          setError(detail);
          return;
        }
      }
    }
    // After upload, refresh via host list (and city for full details)
    const resMeta = await api.get(`/api/data/listings/HostListingImages?hostId=${hostIdFromQs}`);
    const list = resMeta?.data?.data || [];
    const foundMeta = list.find((l) => String(l.id || l.listing_id) === String(listingId));
    const latestImages = Array.isArray(foundMeta?.images) ? foundMeta.images : [];
    // Try to identify newly added filename(s)
    const added = latestImages.find((img) => !images.includes(img));
    if (added) {
      const next = [...images];
      if (index < next.length) next[index] = added; else next.push(added);
      setImages(next);
    } else {
      setImages(latestImages);
    }
    if (foundMeta?.city) {
      const resCity = await api.get(`/api/data/listing/city/${encodeURIComponent(foundMeta.city)}`);
      const cityListings = Array.isArray(resCity?.data) ? resCity.data : [];
      const full = cityListings.find((it) => String(it.id) === String(foundMeta.listing_id || foundMeta.id));
      if (full) setData({ ...full });
    }
  };

  const handleDeleteImage = async (filename) => {
    if (!filename || !hostIdFromQs) return;
    try {
      await api.delete(`/api/data/listing-image?hostId=${Number(hostIdFromQs)}&listingId=${Number(listingId)}&filename=${encodeURIComponent(filename)}`);
      // Refresh images
      const resMeta = await api.get(`/api/data/listings/HostListingImages?hostId=${hostIdFromQs}`);
      const list = resMeta?.data?.data || [];
      const foundMeta = list.find((l) => String(l.id || l.listing_id) === String(listingId));
      setImages(Array.isArray(foundMeta?.images) ? foundMeta.images : []);
    } catch (err) {
      const detail = err?.response?.data?.message || err?.message || 'Failed to delete image';
      setError(detail);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white/70 backdrop-blur">
        <button onClick={() => navigate(hostIdFromQs ? `/listings/${hostIdFromQs}` : '/listings')} className="px-3 py-2 rounded-lg border hover:bg-gray-50">Back</button>
        <div className="flex items-center gap-3">
          <div className="text-lg font-semibold truncate max-w-[16rem]">{data?.title || 'Listing details'}</div>
          <div className="text-sm text-gray-600">${Number(data?.price_per_night || 0)}</div>
        </div>
        <button onClick={handleSave} disabled={saving} className={`px-4 py-2 rounded-lg ${saving ? 'bg-black/30 text-white/70' : 'bg-black text-white hover:bg-gray-900'}`}>{saving ? 'Saving...' : 'Save changes'}</button>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto px-6 mt-4">
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="text-base font-medium mb-2">Photos</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {Array.from({ length: 5 }).map((_, i) => {
                const img = images[i];
                return (
                  <div key={i} className="relative group rounded-xl overflow-hidden bg-gray-100 h-40">
                    {img ? (
                      <>
                        <img src={getImageUrl(img)} className="w-full h-full object-cover"/>
                        <button
                          onClick={() => handleDeleteImage(img)}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100"
                          title="Delete photo"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">No image</div>
                    )}
                    <label className="absolute bottom-2 right-2 px-3 py-1 text-xs bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer">Replace
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleReplaceImage(i, e.target.files[0])} />
                    </label>
                  </div>
                );
              })}
              <div className="relative group rounded-xl overflow-hidden bg-gray-50 border border-dashed border-gray-300 h-40 flex items-center justify-center">
                <label className="px-4 py-2 rounded-lg bg-black text-white hover:bg-gray-900 cursor-pointer text-sm">Add photo
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleReplaceImage(images.length, e.target.files[0])} />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <EditableField label="Title" value={data?.title} onChange={(v) => setData((d) => ({ ...d, title: v }))} />
            <EditableField label="Description" value={data?.description} onChange={(v) => setData((d) => ({ ...d, description: v }))} type="textarea" />
          </div>
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="border rounded-xl p-4 space-y-4">
            <div className="text-base font-medium">Pricing</div>
            <EditableField label="Price per night" value={String(price)} onChange={(v) => setData((d) => ({ ...d, price_per_night: v.replace(/[^0-9]/g, '') }))} />
            <div className="text-sm text-gray-600">Shown to guests: ${price}</div>
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