import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchRooms, getRooms, saveRoom as saveRoomApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import SearchBar from '../components/SearchBar';
import Loader from '../components/Loader';
import { HiAdjustments } from 'react-icons/hi';

const Rooms = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [savedRoomIds, setSavedRoomIds] = useState([]);
  const [filters, setFilters] = useState({
    roomType: '',
    furnishing: '',
    sortBy: 'newest',
  });

  useEffect(() => {
    if (user?.savedRooms) {
      setSavedRoomIds(user.savedRooms.map(r => r._id || r));
    }
  }, [user]);

  useEffect(() => {
    fetchRooms();
  }, [searchParams, page, filters]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const location = searchParams.get('location') || '';
      const budget = searchParams.get('budget') || '';
      const amenities = searchParams.get('amenities') || '';

      let data;
      if (location || budget || amenities) {
        const res = await searchRooms({
          location, budget, amenities,
          roomType: filters.roomType,
          furnishing: filters.furnishing,
          page, limit: 12,
        });
        data = res.data;
      } else {
        const res = await getRooms({ page, limit: 12 });
        data = res.data;
      }

      let sorted = [...data.rooms];
      if (filters.sortBy === 'price-low') sorted.sort((a, b) => a.price - b.price);
      else if (filters.sortBy === 'price-high') sorted.sort((a, b) => b.price - a.price);
      else if (filters.sortBy === 'rating') sorted.sort((a, b) => b.averageRating - a.averageRating);

      setRooms(sorted);
      setTotalPages(data.totalPages);
    } catch {
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (params) => {
    setPage(1);
    const sp = new URLSearchParams();
    if (params.location) sp.set('location', params.location);
    if (params.budget) sp.set('budget', params.budget);
    if (params.amenities) sp.set('amenities', params.amenities);
    setSearchParams(sp);
  };

  const handleSave = async (roomId) => {
    if (!user) return;
    try {
      const { data } = await saveRoomApi(roomId);
      setSavedRoomIds(data.savedRooms);
    } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Rooms</h1>
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <HiAdjustments className="w-5 h-5 text-gray-400" />
          <select value={filters.roomType} onChange={(e) => setFilters({ ...filters, roomType: e.target.value })}
            className="input-field !w-auto !py-2 text-sm">
            <option value="">All Types</option>
            <option value="single">Single</option>
            <option value="double">Double</option>
            <option value="shared">Shared</option>
            <option value="studio">Studio</option>
            <option value="apartment">Apartment</option>
          </select>
          <select value={filters.furnishing} onChange={(e) => setFilters({ ...filters, furnishing: e.target.value })}
            className="input-field !w-auto !py-2 text-sm">
            <option value="">All Furnishing</option>
            <option value="furnished">Furnished</option>
            <option value="semi-furnished">Semi-Furnished</option>
            <option value="unfurnished">Unfurnished</option>
          </select>
          <select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
            className="input-field !w-auto !py-2 text-sm">
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>

        {/* Results */}
        {loading ? <Loader /> : rooms.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No rooms found</h3>
            <p className="text-gray-500">Try adjusting your filters or search criteria</p>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-500 mb-4">{rooms.length} rooms found</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rooms.map((room) => (
                <RoomCard key={room._id} room={room} onSave={handleSave}
                  isSaved={savedRoomIds.includes(room._id)} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button key={i} onClick={() => setPage(i + 1)}
                    className={`w-10 h-10 rounded-xl font-medium transition-colors
                      ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Rooms;
