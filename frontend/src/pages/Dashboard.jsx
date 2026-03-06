import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProfile, getBookings, cancelBooking, updateProfile } from '../services/api';
import { useAuth } from '../context/AuthContext';
import RoomCard from '../components/RoomCard';
import Loader from '../components/Loader';
import toast, { Toaster } from 'react-hot-toast';
import {
  HiUser, HiHeart, HiCalendar, HiCog, HiTrash, HiPencil
} from 'react-icons/hi';

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [profileRes, bookingsRes] = await Promise.all([getProfile(), getBookings()]);
      setProfile(profileRes.data);
      setBookings(bookingsRes.data);
      setForm({ name: profileRes.data.name, phone: profileRes.data.phone || '' });
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(form);
      await refreshUser();
      setEditMode(false);
      toast.success('Profile updated!');
      fetchData();
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleCancelBooking = async (id) => {
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      fetchData();
    } catch {
      toast.error('Failed to cancel booking');
    }
  };

  const tabs = [
    { key: 'overview', label: 'Overview', icon: HiUser },
    { key: 'saved', label: 'Saved Rooms', icon: HiHeart },
    { key: 'bookings', label: 'Bookings', icon: HiCalendar },
    { key: 'settings', label: 'Settings', icon: HiCog },
  ];

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl font-bold">{user?.name?.[0]}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{user?.name}</p>
                  <p className="text-sm text-gray-500">{user?.email}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {tabs.map((t) => (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className={`flex items-center w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-colors
                      ${tab === t.key ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <t.icon className="w-5 h-5 mr-3" /> {t.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {tab === 'overview' && (
              <div className="space-y-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="card p-6 text-center">
                    <div className="text-3xl font-bold text-primary-600">{profile?.savedRooms?.length || 0}</div>
                    <p className="text-sm text-gray-500 mt-1">Saved Rooms</p>
                  </div>
                  <div className="card p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">{bookings.filter(b => b.status === 'confirmed').length}</div>
                    <p className="text-sm text-gray-500 mt-1">Confirmed Visits</p>
                  </div>
                  <div className="card p-6 text-center">
                    <div className="text-3xl font-bold text-orange-600">{bookings.filter(b => b.status === 'pending').length}</div>
                    <p className="text-sm text-gray-500 mt-1">Pending Bookings</p>
                  </div>
                </div>

                {/* Recent bookings */}
                <div className="card p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                  {bookings.length === 0 ? (
                    <p className="text-gray-500 text-sm">No bookings yet. <Link to="/rooms" className="text-primary-600">Browse rooms</Link></p>
                  ) : (
                    <div className="space-y-3">
                      {bookings.slice(0, 5).map((b) => (
                        <div key={b._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-medium text-gray-900">{b.roomId?.title || 'Room'}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(b.visitDate).toLocaleDateString()} · <span className={`font-medium ${
                                b.status === 'confirmed' ? 'text-green-600' :
                                b.status === 'cancelled' ? 'text-red-600' : 'text-orange-600'
                              }`}>{b.status}</span>
                            </p>
                          </div>
                          {b.status === 'pending' && (
                            <button onClick={() => handleCancelBooking(b._id)}
                              className="text-red-500 hover:text-red-700 p-2">
                              <HiTrash className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {tab === 'saved' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Saved Rooms</h2>
                {profile?.savedRooms?.length === 0 ? (
                  <div className="card p-8 text-center">
                    <div className="text-5xl mb-4">💾</div>
                    <p className="text-gray-500">No saved rooms yet. <Link to="/rooms" className="text-primary-600">Explore rooms</Link></p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-6">
                    {profile?.savedRooms?.map((room) => (
                      <RoomCard key={room._id} room={room} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'bookings' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">All Bookings</h2>
                {bookings.length === 0 ? (
                  <div className="card p-8 text-center">
                    <div className="text-5xl mb-4">📅</div>
                    <p className="text-gray-500">No bookings yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((b) => (
                      <div key={b._id} className="card p-4 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          {b.roomId?.images?.[0] && (
                            <img src={b.roomId.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover" />
                          )}
                          <div>
                            <p className="font-semibold text-gray-900">{b.roomId?.title}</p>
                            <p className="text-sm text-gray-500">
                              {b.roomId?.location?.city} · ₹{b.roomId?.price?.toLocaleString()}/mo
                            </p>
                            <p className="text-sm text-gray-500">
                              Visit: {new Date(b.visitDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            b.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                            'bg-orange-100 text-orange-700'
                          }`}>{b.status}</span>
                          {b.status === 'pending' && (
                            <button onClick={() => handleCancelBooking(b._id)}
                              className="text-red-500 hover:text-red-700 p-2 rounded-lg hover:bg-red-50">
                              <HiTrash className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'settings' && (
              <div className="card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
                  <button onClick={() => setEditMode(!editMode)}
                    className="flex items-center text-primary-600 text-sm font-medium">
                    <HiPencil className="mr-1" /> {editMode ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                {editMode ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input type="text" value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input-field" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                      <input type="tel" value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input-field" />
                    </div>
                    <button type="submit" className="btn-primary">Save Changes</button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-500">Name</label>
                      <p className="font-medium text-gray-900">{profile?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Email</label>
                      <p className="font-medium text-gray-900">{profile?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Phone</label>
                      <p className="font-medium text-gray-900">{profile?.phone || '–'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-gray-500">Role</label>
                      <p className="font-medium text-gray-900 capitalize">{profile?.role}</p>
                    </div>
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

export default Dashboard;
