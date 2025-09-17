import './App.css'
import { useState } from 'react'
import { HeaderWithContent, ContentWrapper } from './Header'
import Cards from './Cards'
import CityExplore from './CityExplore'
import Footer from './Footer'
import ProductsDetails from './ProductsDetails'
import Photos from './Photos'
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import SecondHeader from './SecondHeader'
import Reserve from './reserve'
import ThirdHeader from './thirdHeader'
import Newfooter from './Newfooter'
import { enUS } from "date-fns/locale";
import HostPage from './HostPage'
import HostOnboarding from './HostOnboarding'
import { AuthProvider } from './AuthContext'
import AboutPlaceWithHost from './AboutPlaceWithHost'
import AboutPlaceTypeWithHost from './AboutPlaceTypeWithHost'
import PrivacyTypeWithHost from './PrivacyTypeWithHost'
import LocationWithHost from './LocationWithHost'
import BasicsWithHost from './BasicsWithHost'
import StandOutWithHost from './StandOutWithHost'
import AmenitiesWithHost from './AmenitiesWithHost'
import PhotosWithHost from './photosWithHost'
import TitleWithHost from './TitleWithHost'
import HighlightsStep from './highlights'
import DescriptionWithHost from './DescriptionWithHost'
import FinalWithHost from './FinalWithHost'
import BookingSettings from './bookingSettings'
import GuestWelcome from './GuestWelcome'
import PricingWeekday from './PricingWeekday'
import PricingWeekend from './PricingWeekend'
import Discounts from './Discounts'
import FinalDetails from './FinalDetails'
import Listings from './Listings'
import AuthPage from './AuthPage'
import Messages from './Messages'
import WishlistPage from './WishlistPage'

function App() {
  if("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        console.log("Service worker registered", registration);
      } catch (error) {
        console.error("Service worker registration failed", error);
      }
    });
  } 
  const [selectedDates, setSelectedDates] = useState(null);
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={
            <HeaderWithContent>
              <ContentWrapper className="mt-6">
                <Cards/>
              </ContentWrapper>
              <div className="-mt-6"><Footer /></div>
            </HeaderWithContent>
          } />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/host" element={<HostPage />} />
          <Route path="/host-onboarding" element={<HostOnboarding />} />
          <Route path="/aboutplace" element={<AboutPlaceWithHost />} />
          <Route path="/aboutplace/type" element={<AboutPlaceTypeWithHost />} />
          <Route path="/aboutplace/privacy" element={<PrivacyTypeWithHost />} />
          <Route path="/aboutplace/location" element={<LocationWithHost />} />
          <Route path="/aboutplace/basics" element={<BasicsWithHost />} />
          <Route path="/aboutplace/standout" element={<StandOutWithHost />} />
          <Route path="/aboutplace/amenities" element={<AmenitiesWithHost />} />
          <Route path="/aboutplace/photos" element={<PhotosWithHost />} />
          <Route path="/aboutplace/title" element={<TitleWithHost />} />
          <Route path="/aboutplace/highlights" element={<HighlightsStep />} />
          <Route path="/aboutplace/description" element={<DescriptionWithHost />} />
          <Route path="/aboutplace/final" element={<FinalWithHost />} />
          <Route path="/booking-settings" element={<BookingSettings />} />
          <Route path="/guest-welcome" element={<GuestWelcome />} />
          <Route path="/pricing-weekday" element={<PricingWeekday />} />
          <Route path="/pricing-weekend" element={<PricingWeekend />} />
          <Route path="/discounts" element={<Discounts />} />
          <Route path="/final-details" element={<FinalDetails />} />
          <Route path="/listings/:hostId" element={<Listings />} />
          <Route path="/listings" element={<Listings />} />
          <Route path="/explore/:city" element={
            <HeaderWithContent>
              <ContentWrapper className="mt-6">
                <CityExplore />
              </ContentWrapper>
              <div className="-mt-6"><Footer /></div>
            </HeaderWithContent>
          } />
          <Route path="/messages" element={<Messages />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/products/:id" element={
            <>
              <SecondHeader />
              <ProductsDetails setSelectedDates={setSelectedDates} />
              <Footer />
            </>
          } />
          <Route path="/products/:id/photos" element={
            <>
              <Photos />
            </>
          } />
          <Route path="/products/:id/reserve" element={
            <>
              <ThirdHeader />
              <Reserve selectedDates={setSelectedDates} setSelectedDates={setSelectedDates} />
              <Newfooter/>
            </>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}
export default App