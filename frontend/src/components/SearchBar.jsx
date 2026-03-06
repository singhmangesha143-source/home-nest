import { useState } from 'react';
import { HiSearch, HiLocationMarker, HiCurrencyRupee } from 'react-icons/hi';

const SearchBar = ({ onSearch, className = '' }) => {
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [amenities, setAmenities] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ location, budget, amenities });
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-2xl shadow-xl p-3 ${className}`}>
      <div className="flex flex-col md:flex-row gap-3">
        {/* Location */}
        <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3">
          <HiLocationMarker className="text-primary-500 w-5 h-5 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="City or location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Budget */}
        <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3">
          <HiCurrencyRupee className="text-primary-500 w-5 h-5 mr-3 flex-shrink-0" />
          <input
            type="number"
            placeholder="Max budget"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Amenities */}
        <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3">
          <HiSearch className="text-primary-500 w-5 h-5 mr-3 flex-shrink-0" />
          <input
            type="text"
            placeholder="Amenities (WiFi, AC...)"
            value={amenities}
            onChange={(e) => setAmenities(e.target.value)}
            className="w-full bg-transparent focus:outline-none text-gray-700 placeholder-gray-400"
          />
        </div>

        {/* Search button */}
        <button type="submit"
          className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg">
          <HiSearch className="w-5 h-5" />
          <span>Search</span>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
