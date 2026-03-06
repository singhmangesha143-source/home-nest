import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRoomById, saveRoom as saveRoomApi, addReview, bookRoom } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import toast, { Toaster } from 'react-hot-toast';
import {
  HiLocationMarker, HiStar, HiHeart, HiPhone, HiMail,
  HiShieldCheck, HiCalendar, HiArrowLeft, HiCheck
} from 'react-icons/hi';

const RoomDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [isSaved, setIsSaved] = useState(false);

  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  // Booking form
  const [visitDate, setVisitDate] = useState('');
  const [showBooking, setShowBooking] = useState(false);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await getRoomById(id);
        setRoom(data);
        if (user?.savedRooms) {
          setIsSaved(user.savedRooms.some(r => (r._id || r) === data._id));
        }
      } catch {
        navigate('/rooms');
      } finally {
        setLoading(false);
      }
    };
    fetchRoom();
  }, [id]);

  const handleSave = async () => {
    if (!user) return navigate('/login');
    try {
      const { data } = await saveRoomApi(room._id);
      setIsSaved(data.savedRooms.includes(room._id));
      toast.success(isSaved ? 'Removed from saved' : 'Room saved!');
    } catch { /* ignore */ }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      const { data } = await addReview(room._id, { rating, comment });
      setRoom(data);
      setComment('');
      toast.success('Review added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add review');
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    try {
      await bookRoom({ roomId: room._id, visitDate });
      toast.success('Visit booked successfully!');
      setShowBooking(false);
      setVisitDate('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book visit');
    }
  };

  if (loading) return <Loader />;
  if (!room) return null;

  const fallbackImg = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop';

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <button onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-primary-600 mb-6 transition-colors">
          <HiArrowLeft className="mr-2" /> Back to Rooms
        </button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Images & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="card overflow-hidden">
              <div className="relative h-72 md:h-96">
                <img
                  src={room.images?.[activeImg] || fallbackImg}
                  alt={room.title}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = fallbackImg; }}
                />
              </div>
              {room.images?.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {room.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors
                        ${activeImg === i ? 'border-primary-600' : 'border-transparent'}`}>
                      <img src={img} alt="" className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = fallbackImg; }} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Room Info */}
            <div className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{room.title}</h1>
                  <div className="flex items-center text-gray-500 mt-1">
                    <HiLocationMarker className="w-5 h-5 mr-1" />
                    <span>{room.location?.address}, {room.location?.city}, {room.location?.state}</span>
                  </div>
                </div>
                <button onClick={handleSave}
                  className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  <HiHeart className={`w-6 h-6 ${isSaved ? 'text-red-500' : 'text-gray-400'}`} />
                </button>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium capitalize">{room.roomType}</span>
                <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium capitalize">{room.furnishing}</span>
                {room.averageRating > 0 && (
                  <span className="flex items-center px-3 py-1 bg-yellow-50 text-yellow-700 rounded-full text-sm font-medium">
                    <HiStar className="w-4 h-4 mr-1" /> {room.averageRating.toFixed(1)} ({room.reviews?.length} reviews)
                  </span>
                )}
              </div>

              <p className="text-gray-600 leading-relaxed mb-6">{room.description}</p>

              {/* Amenities */}
              <h3 className="font-semibold text-gray-900 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2 mb-6">
                {room.amenities?.map((a, i) => (
                  <span key={i} className="flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm">
                    <HiCheck className="w-4 h-4 mr-1 text-green-500" /> {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Reviews ({room.reviews?.length || 0})
              </h3>

              {room.reviews?.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {room.reviews.map((r, i) => (
                    <div key={i} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 text-sm font-semibold">
                              {r.userId?.name?.[0] || '?'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-700">{r.userId?.name || 'Anonymous'}</span>
                        </div>
                        <div className="flex items-center text-yellow-500">
                          {Array.from({ length: r.rating }).map((_, j) => (
                            <HiStar key={j} className="w-4 h-4" />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mb-6">No reviews yet. Be the first to review!</p>
              )}

              {/* Add Review */}
              {user && (
                <form onSubmit={handleReview} className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-medium text-gray-700 mb-3">Write a Review</h4>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm text-gray-500">Rating:</span>
                    {[1, 2, 3, 4, 5].map((v) => (
                      <button key={v} type="button" onClick={() => setRating(v)}>
                        <HiStar className={`w-6 h-6 ${v <= rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea value={comment} onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience..."
                    className="input-field mb-3 resize-none" rows={3} required maxLength={500} />
                  <button type="submit" className="btn-primary text-sm !py-2">Submit Review</button>
                </form>
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="card p-6 sticky top-24">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                ₹{room.price?.toLocaleString()}
                <span className="text-base font-normal text-gray-400">/month</span>
              </div>
              <p className={`text-sm font-medium mb-6 ${room.availability ? 'text-green-600' : 'text-red-600'}`}>
                {room.availability ? '● Available' : '● Not Available'}
              </p>

              <button onClick={() => {
                if (!user) return navigate('/login');
                setShowBooking(!showBooking);
              }} className="btn-primary w-full mb-3 flex items-center justify-center">
                <HiCalendar className="mr-2" /> Book a Visit
              </button>

              {showBooking && (
                <form onSubmit={handleBooking} className="bg-gray-50 rounded-xl p-4 mb-4 fade-in">
                  <label className="text-sm font-medium text-gray-700 block mb-1">Select Date</label>
                  <input type="date" value={visitDate} onChange={(e) => setVisitDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="input-field mb-3" required />
                  <button type="submit" className="btn-primary w-full text-sm">Confirm Booking</button>
                </form>
              )}

              <button onClick={handleSave} className="btn-secondary w-full flex items-center justify-center">
                <HiHeart className={`mr-2 ${isSaved ? 'text-red-500' : ''}`} />
                {isSaved ? 'Saved' : 'Save Room'}
              </button>
            </div>

            {/* Landlord Info */}
            {room.landlordId && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Landlord Information</h3>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-bold">{room.landlordId.name?.[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{room.landlordId.name}</p>
                    {room.landlordId.verified && (
                      <span className="flex items-center text-green-600 text-sm">
                        <HiShieldCheck className="w-4 h-4 mr-1" /> Verified
                      </span>
                    )}
                  </div>
                </div>
                {room.landlordId.contact && (
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <HiPhone className="w-4 h-4 mr-2 text-gray-400" /> {room.landlordId.contact}
                  </div>
                )}
                {room.landlordId.email && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <HiMail className="w-4 h-4 mr-2 text-gray-400" /> {room.landlordId.email}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomDetails;
