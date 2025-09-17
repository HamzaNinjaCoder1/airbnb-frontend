import React, { useEffect, useState } from 'react'
import api from './api'
import { Link, useNavigate } from 'react-router-dom'
import SecondHeader from './SecondHeader'
import { useAuth } from './AuthContext'

function WishlistPage() {
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { replace: true })
      return
    }
    (async () => {
      try {
        setLoading(true)
        const res = await api.get(`/api/data/wishlist/${user.id}`, { withCredentials: true })
        setItems(res.data?.data || [])
      } catch (err) {
        setError(err?.response?.data?.message || 'Failed to load wishlist')
      } finally {
        setLoading(false)
      }
    })()
  }, [isAuthenticated, user])

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-white">
      <SecondHeader />
      <div className="mt-28"></div>
      <div className="max-w-6xl mx-auto px-4 mt-6 sm:mt-10">
        <h1 className="text-2xl font-semibold mb-6">Your wishlists</h1>
        {loading ? (
          <div className="py-16 text-center">Loading...</div>
        ) : error ? (
          <div className="py-16 text-center text-red-600">{error}</div>
        ) : items.length === 0 ? (
          <div className="py-16 text-center text-gray-600">No wishlist items</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => {
              const listing = it.listing
              const img = Array.isArray(listing?.images) && listing.images.length > 0 ? listing.images[0] : null
              const imageSrc = img ? (/^https?:\/\//.test(img) ? img : `https://dynamic-tranquility-production.up.railway.app/uploads/${img}`) : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=2070&q=80'
              return (
                <div key={it.id} className="group rounded-2xl overflow-hidden border hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <Link to={`/products/${listing?.id || it.listing_id}`}>
                      <img src={imageSrc} alt={listing?.title || 'Listing'} className="w-full h-48 sm:h-56 object-cover" />
                    </Link>
                    <button
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-2 shadow"
                      onClick={async () => {
                        try {
                          await api.delete(`/api/data/wishlist/remove/${it.id}`, { withCredentials: true })
                          setItems(prev => prev.filter(x => x.id !== it.id))
                        } catch (err) {}
                      }}
                      aria-label="Remove from wishlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 text-gray-700"><path d="M6 7h12M9 7v10m6-10v10M4 7h16l-1 13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 7Zm3-3h10l1 3H6l1-3Z" fill="none" stroke="currentColor" strokeWidth="1.5"/></svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="font-semibold line-clamp-1">{listing?.title || 'Listing'}</div>
                    <div className="text-xs text-gray-500 mt-1">Added on {new Date(it.created_at).toLocaleDateString()}</div>
                    {listing?.city && (
                      <div className="text-sm text-gray-600 mt-1">{listing.city}{listing.country ? `, ${listing.country}` : ''}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export default WishlistPage


