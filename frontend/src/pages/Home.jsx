import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms, getRecommendations, saveRoom as saveRoomApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/SearchBar';
import RoomCard from '../components/RoomCard';
import Loader from '../components/Loader';
import {
  HiLightBulb, HiCurrencyRupee, HiLocationMarker, HiShieldCheck,
  HiClipboardList, HiEye, HiUsers, HiCog, HiSearch, HiChat
} from 'react-icons/hi';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savedRoomIds, setSavedRoomIds] = useState([]);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const { data } = await getRooms({ limit: 6 });
        setFeaturedRooms(data.rooms);
      } catch {
        // fallback
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  useEffect(() => {
    if (user?.savedRooms) {
      setSavedRoomIds(user.savedRooms.map(r => r._id || r));
    }
  }, [user]);

  const handleSearch = (params) => {
    const query = new URLSearchParams(params).toString();
    navigate(`/rooms?${query}`);
  };

  const handleSave = async (roomId) => {
    if (!user) return navigate('/login');
    try {
      const { data } = await saveRoomApi(roomId);
      setSavedRoomIds(data.savedRooms);
    } catch { /* ignore */ }
  };

  const features = [
    { icon: HiLightBulb, title: 'Smart Recommendations', desc: 'AI-powered room suggestions based on your preferences' },
    { icon: HiCurrencyRupee, title: 'Budget Filtering', desc: 'Find rooms within your exact budget range' },
    { icon: HiLocationMarker, title: 'Location-based Search', desc: 'Discover rooms near your workplace or college' },
    { icon: HiSearch, title: 'Amenities Filtering', desc: 'Filter by WiFi, AC, gym, parking and more' },
    { icon: HiShieldCheck, title: 'Verified Landlords', desc: 'Only trustworthy, verified property owners' },
    { icon: HiEye, title: 'Virtual Visit Scheduling', desc: 'Schedule visits before committing' },
    { icon: HiClipboardList, title: 'Secure Agreements', desc: 'Transparent and secure rental process' },
    { icon: HiCog, title: 'Maintenance Support', desc: 'Ongoing support after you move in' },
  ];

  const steps = [
    { num: '01', title: 'Enter Preferences', desc: 'Tell us your budget, location, and lifestyle needs' },
    { num: '02', title: 'Get Personalized Results', desc: 'Our algorithm finds the best matching rooms' },
    { num: '03', title: 'Compare Rooms', desc: 'Side-by-side comparison of shortlisted rooms' },
    { num: '04', title: 'Contact Landlords', desc: 'Directly reach out to verified property owners' },
    { num: '05', title: 'Finalize Booking', desc: 'Book your room and move in hassle-free' },
  ];

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-white rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-white rounded-full"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Predictnest – Find the<br />
              <span className="text-blue-200">Right Room for You</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 leading-relaxed">
              An intelligent room-finding platform that helps you discover the perfect living space
              based on your budget, location, and lifestyle preferences.
            </p>
          </div>
          <SearchBar onSearch={handleSearch} className="max-w-4xl mx-auto" />
          <div className="flex justify-center gap-8 mt-8 text-sm text-blue-200">
            <span>✓ 500+ Verified Listings</span>
            <span className="hidden sm:inline">✓ Trusted Landlords</span>
            <span className="hidden md:inline">✓ Smart Recommendations</span>
          </div>
        </div>
      </section>

      {/* Featured Rooms */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Featured Rooms</h2>
            <p className="text-gray-500 mt-1">Handpicked rooms just for you</p>
          </div>
          <button onClick={() => navigate('/rooms')}
            className="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
            View All →
          </button>
        </div>
        {loading ? <Loader /> : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredRooms.map((room) => (
              <RoomCard key={room._id} room={room} onSave={handleSave}
                isSaved={savedRoomIds.includes(room._id)} />
            ))}
          </div>
        )}
      </section>

      {/* About Section */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Predictnest?</h2>
            <p className="text-gray-500 leading-relaxed">
              Predictnest uses personalized recommendations and smart filtering to simplify your room search.
              Every listing is verified for transparency and reliability.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Personalized Recommendations', desc: 'Rooms matched to your unique requirements', color: 'bg-blue-50 text-blue-600' },
              { title: 'Smart Filtering', desc: 'Advanced filters for precise results', color: 'bg-green-50 text-green-600' },
              { title: 'Verified Listings', desc: 'Every property verified by our team', color: 'bg-purple-50 text-purple-600' },
              { title: 'Transparent Process', desc: 'No hidden fees, clear rental terms', color: 'bg-orange-50 text-orange-600' },
            ].map((item, i) => (
              <div key={i} className="card p-6 text-center hover:-translate-y-1">
                <div className={`w-12 h-12 ${item.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <HiShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Platform Features</h2>
          <p className="text-gray-500">Everything you need for a seamless room-finding experience</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="card p-6 hover:-translate-y-1 group">
              <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-100 transition-colors">
                <f.icon className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500">Five simple steps to your new room</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-primary-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 text-xl font-bold group-hover:scale-110 transition-transform">
                  {s.num}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Dream Room?</h2>
          <p className="text-blue-100 mb-8">Join thousands of happy tenants who found their perfect space on Predictnest.</p>
          <button onClick={() => navigate(user ? '/rooms' : '/register')}
            className="bg-white text-primary-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-50 transition-colors shadow-lg">
            {user ? 'Browse Rooms' : 'Get Started Free'}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
