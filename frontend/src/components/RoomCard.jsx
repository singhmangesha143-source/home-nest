import { Link } from 'react-router-dom';
import { HiHeart, HiLocationMarker, HiStar } from 'react-icons/hi';

const RoomCard = ({ room, onSave, isSaved }) => {
  const fallbackImg = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop';

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative overflow-hidden h-52">
        <img
          src={room.images?.[0] || fallbackImg}
          alt={room.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
          onError={(e) => { e.target.src = fallbackImg; }}
        />
        {onSave && (
          <button onClick={() => onSave(room._id)}
            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-colors">
            <HiHeart className={`w-5 h-5 ${isSaved ? 'text-red-500 fill-current' : 'text-gray-400'}`} />
          </button>
        )}
        {room.roomType && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full capitalize">
            {room.roomType}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{room.title}</h3>
          {room.averageRating > 0 && (
            <div className="flex items-center space-x-1 text-sm">
              <HiStar className="text-yellow-400 w-4 h-4" />
              <span className="font-medium">{room.averageRating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="flex items-center text-gray-500 text-sm mb-3">
          <HiLocationMarker className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{room.location?.address}, {room.location?.city}</span>
        </div>

        {/* Amenities */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {room.amenities?.slice(0, 3).map((a, i) => (
            <span key={i} className="px-2 py-0.5 bg-blue-50 text-primary-700 text-xs rounded-full font-medium">{a}</span>
          ))}
          {room.amenities?.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">+{room.amenities.length - 3}</span>
          )}
        </div>

        {/* Price & CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xl font-bold text-gray-900">₹{room.price?.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">/month</span>
          </div>
          <Link to={`/rooms/${room._id}`}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            View Details →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
