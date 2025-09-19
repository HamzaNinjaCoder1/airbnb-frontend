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

  const fullAddress = useMemo(() => {
    const parts = [data?.address, data?.city, data?.country].filter(Boolean);
    return parts.join(', ');
  }, [data]);

  const mapSrc = useMemo(() => {
    const query = encodeURIComponent(fullAddress || data?.city || '');
    return `https://www.google.com/maps?q=${query}&output=embed`;
  }, [fullAddress, data]);

  const getImageUrl = (img) => {
    if (!img) return '';
    const url = typeof img === 'object' ? (img.image_url || '') : img;
    if (!url) return '';
    return url.startsWith('http') ? url : `${UPLOADS_BASE_URL}${url}`;
  };

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        const hostId = hostIdFromQs || user?.id;
        const resMeta = await api.get(`/api/data/listings/HostListingImages?hostId=${hostId}`);
        const list = resMeta?.data?.data || [];
        const foundMeta = list.find((l) => String(l.id || l.listing_id) === String(listingId));
        if (!foundMeta) throw new Error('Listing not found');
        const city = foundMeta.city;
        if (city) {
          const resCity = await api.get(`/api/data/listing/city/${encodeURIComponent(city)}`);
          const cityListings = Array.isArray(resCity?.data) ? resCity.data : [];
          const full = cityListings.find((it) => String(it.id) === String(foundMeta.listing_id || foundMeta.id));
          if (full) {
            const imgs = Array.isArray(full.images) ? full.images : [];
            setData({ ...full });
            setImages(imgs);
            return;
          }
        }
        setData(foundMeta);
        const fallbackImgs = Array.isArray(foundMeta.images)
          ? foundMeta.images.map((im) => (typeof im === 'string' ? { image_url: im } : im))
          : [];
        setImages(fallbackImgs);
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
    if (!file) return;
    const current = images?.[index];
    const imageId = current?.id || current?.image_id;

    if (!imageId) {
      await handleAddPhoto(file);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.put(
        `/api/data/listings/${listingId}/images/${imageId}/replace`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const updatedListing = res?.data?.listing;
      if (updatedListing && Array.isArray(updatedListing.images)) {
        const updatedImage = updatedListing.images.find((im) => String(im.id) === String(imageId));
        if (updatedImage) {
          const next = [...images];
          next[index] = updatedImage;
          setImages(next);
        } else {
          setImages(updatedListing.images);
        }
        setData((d) => ({ ...(d || {}), ...updatedListing }));
      }
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) setError('Image not found');
      else if (status === 500) setError('Failed to replace image');
      else setError(err?.message || 'Failed to replace image');
    }
  };

  const handleAddPhoto = async (file) => {
    if (!file || !hostIdFromQs) return;
    try {
      const form = new FormData();
      form.append('images', file);
      await api.post(`/api/data/upload-images?hostId=${hostIdFromQs}&listingId=${listingId}`, form);

      const hostRes = await api.get(`/api/data/listings/HostListingImages?hostId=${hostIdFromQs}`);
      const list = hostRes?.data?.data || [];
      const foundMeta = list.find((l) => String(l.id || l.listing_id) === String(listingId));
      if (foundMeta?.city) {
        const resCity = await api.get(`/api/data/listing/city/${encodeURIComponent(foundMeta.city)}`);
        const cityListings = Array.isArray(resCity?.data) ? resCity.data : [];
        const full = cityListings.find((it) => String(it.id) === String(foundMeta.listing_id || foundMeta.id));
        if (full) {
          setData({ ...full });
          setImages(Array.isArray(full.images) ? full.images : []);
          return;
        }
      }

      const latestImages = Array.isArray(foundMeta?.images)
        ? foundMeta.images.map((im) => (typeof im === 'string' ? { image_url: im } : im))
        : [];
      setImages(latestImages);
    } catch (err) {
      setError(err?.message || 'Failed to upload image');
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b bg-white/70 backdrop-blur">
        <button onClick={() => navigate(hostIdFromQs ? `/listings/${hostIdFromQs}` : '/listings')} className="px-3 py-2 rounded-lg border hover:bg-gray-50">Back</button>
        <div />
        <button onClick={handleSave} disabled={saving} className={`px-4 py-2 rounded-lg ${saving ? 'bg-black/30 text-white/70' : 'bg-black text-white hover:bg-gray-900'}`}>{saving ? 'Saving...' : 'Save changes'}</button>
      </div>

      {error && (
        <div className="max-w-5xl mx-auto px-6 mt-4">
          <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="space-y-1">
            <div className="text-2xl font-semibold tracking-tight">{data?.title || 'Listing details'}</div>
            <div className="text-sm text-gray-500">{fullAddress || 'No address provided'}</div>
          </div>

          {Array.isArray(images) && images.filter(Boolean).length > 0 && (
            <div>
              <div className="text-base font-medium mb-2">Photos</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {images.filter(Boolean).map((img, i) => (
                  <div key={i} className="relative group rounded-xl overflow-hidden bg-gray-100 h-48 md:h-56">
                    <img src={getImageUrl(img)} className="w-full h-full object-cover"/>
                    <label className="absolute bottom-2 right-2 px-3 py-1 text-xs bg-black text-white rounded-lg opacity-0 group-hover:opacity-100 cursor-pointer">Replace
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleReplaceImage(i, e.target.files[0])} />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <EditableField label="Title" value={data?.title} onChange={(v) => setData((d) => ({ ...d, title: v }))} />
            <EditableField label="Description" value={data?.description} onChange={(v) => setData((d) => ({ ...d, description: v }))} type="textarea" />
          </div>

          <div className="border rounded-xl p-4">
            <div className="text-base font-medium mb-3">Map</div>
            <div className="rounded-lg overflow-hidden border">
              <iframe
                title="Listing location map"
                src={mapSrc}
                className="w-full h-72"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 space-y-6">
            <div className="border rounded-xl p-4 space-y-4">
            <div className="text-base font-medium">Pricing</div>
            <EditableField label="Price per night" value={String(price)} onChange={(v) => setData((d) => ({ ...d, price_per_night: v.replace(/[^0-9]/g, '') }))} />
            <div className="text-sm text-gray-600">Shown to guests: ${price}</div>
            </div>

            <div className="border rounded-xl p-4 space-y-4">
            <div className="text-base font-medium">Location</div>
            <EditableField label="Address" value={data?.address} onChange={(v) => setData((d) => ({ ...d, address: v }))} />
            <EditableField label="City" value={data?.city} onChange={(v) => setData((d) => ({ ...d, city: v }))} />
            <EditableField label="Country" value={data?.country} onChange={(v) => setData((d) => ({ ...d, country: v }))} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;