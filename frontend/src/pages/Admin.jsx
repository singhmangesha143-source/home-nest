import { useState, useEffect } from 'react';
import {
  getAllUsers, deleteUser, getRooms, createRoom, deleteRoom,
  getLandlords, createLandlord, verifyLandlord, getAllBookings
} from '../services/api';
import Loader from '../components/Loader';
import toast, { Toaster } from 'react-hot-toast';
import {
  HiUsers, HiHome, HiClipboardList, HiShieldCheck,
  HiTrash, HiPlus, HiCheck, HiX
} from 'react-icons/hi';

const Admin = () => {
  const [tab, setTab] = useState('rooms');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [landlords, setLandlords] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [showAddRoom, setShowAddRoom] = useState(false);
  const [showAddLandlord, setShowAddLandlord] = useState(false);

  const [roomForm, setRoomForm] = useState({
    title: '', description: '', price: '',
    'location.address': '', 'location.city': '', 'location.state': '',
    amenities: '', roomType: 'single', furnishing: 'semi-furnished',
    landlordId: '',
  });
  const [landlordForm, setLandlordForm] = useState({ name: '', email: '', contact: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [u, r, l, b] = await Promise.all([
        getAllUsers(), getRooms({ limit: 100 }), getLandlords(), getAllBookings()
      ]);
      setUsers(u.data);
      setRooms(r.data.rooms);
      setLandlords(l.data);
      setBookings(b.data);
    } catch { /* ignore */ }
    setLoading(false);
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return;
    try {
      await deleteUser(id);
      toast.success('User deleted');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Delete this room?')) return;
    try {
      await deleteRoom(id);
      toast.success('Room deleted');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: roomForm.title,
        description: roomForm.description,
        price: Number(roomForm.price),
        location: {
          address: roomForm['location.address'],
          city: roomForm['location.city'],
          state: roomForm['location.state'],
        },
        amenities: roomForm.amenities.split(',').map(a => a.trim()).filter(Boolean),
        roomType: roomForm.roomType,
        furnishing: roomForm.furnishing,
        landlordId: roomForm.landlordId,
      };
      await createRoom(payload);
      toast.success('Room added');
      setShowAddRoom(false);
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add room');
    }
  };

  const handleAddLandlord = async (e) => {
    e.preventDefault();
    try {
      await createLandlord(landlordForm);
      toast.success('Landlord added');
      setShowAddLandlord(false);
      setLandlordForm({ name: '', email: '', contact: '' });
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const handleVerifyLandlord = async (id) => {
    try {
      await verifyLandlord(id);
      toast.success('Landlord verified');
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const tabs = [
    { key: 'rooms', label: 'Rooms', icon: HiHome, count: rooms.length },
    { key: 'users', label: 'Users', icon: HiUsers, count: users.length },
    { key: 'landlords', label: 'Landlords', icon: HiShieldCheck, count: landlords.length },
    { key: 'bookings', label: 'Bookings', icon: HiClipboardList, count: bookings.length },
  ];

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 fade-in">
      <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-500 mb-8">Manage rooms, users, landlords, and bookings</p>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-medium transition-colors
                ${tab === t.key ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-gray-600 hover:bg-gray-100'}`}>
              <t.icon className="w-4 h-4 mr-2" /> {t.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                tab === t.key ? 'bg-white/20' : 'bg-gray-100'
              }`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* Rooms Tab */}
        {tab === 'rooms' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Room Listings</h2>
              <button onClick={() => setShowAddRoom(!showAddRoom)}
                className="btn-primary text-sm !py-2 flex items-center">
                <HiPlus className="mr-1" /> Add Room
              </button>
            </div>

            {showAddRoom && (
              <form onSubmit={handleAddRoom} className="card p-6 mb-6 fade-in">
                <h3 className="font-semibold mb-4">Add New Room</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <input placeholder="Title" required value={roomForm.title}
                    onChange={e => setRoomForm({ ...roomForm, title: e.target.value })}
                    className="input-field" />
                  <input placeholder="Price" type="number" required value={roomForm.price}
                    onChange={e => setRoomForm({ ...roomForm, price: e.target.value })}
                    className="input-field" />
                  <input placeholder="Address" required value={roomForm['location.address']}
                    onChange={e => setRoomForm({ ...roomForm, 'location.address': e.target.value })}
                    className="input-field" />
                  <input placeholder="City" required value={roomForm['location.city']}
                    onChange={e => setRoomForm({ ...roomForm, 'location.city': e.target.value })}
                    className="input-field" />
                  <input placeholder="State" value={roomForm['location.state']}
                    onChange={e => setRoomForm({ ...roomForm, 'location.state': e.target.value })}
                    className="input-field" />
                  <input placeholder="Amenities (comma separated)" value={roomForm.amenities}
                    onChange={e => setRoomForm({ ...roomForm, amenities: e.target.value })}
                    className="input-field" />
                  <select value={roomForm.roomType}
                    onChange={e => setRoomForm({ ...roomForm, roomType: e.target.value })}
                    className="input-field">
                    <option value="single">Single</option>
                    <option value="double">Double</option>
                    <option value="shared">Shared</option>
                    <option value="studio">Studio</option>
                    <option value="apartment">Apartment</option>
                  </select>
                  <select value={roomForm.furnishing}
                    onChange={e => setRoomForm({ ...roomForm, furnishing: e.target.value })}
                    className="input-field">
                    <option value="furnished">Furnished</option>
                    <option value="semi-furnished">Semi-Furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                  <select value={roomForm.landlordId} required
                    onChange={e => setRoomForm({ ...roomForm, landlordId: e.target.value })}
                    className="input-field">
                    <option value="">Select Landlord</option>
                    {landlords.map(l => (
                      <option key={l._id} value={l._id}>{l.name}</option>
                    ))}
                  </select>
                </div>
                <textarea placeholder="Description" required value={roomForm.description}
                  onChange={e => setRoomForm({ ...roomForm, description: e.target.value })}
                  className="input-field mt-4" rows={3} />
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="btn-primary text-sm !py-2">Create Room</button>
                  <button type="button" onClick={() => setShowAddRoom(false)}
                    className="btn-secondary text-sm !py-2">Cancel</button>
                </div>
              </form>
            )}

            <div className="card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Room</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Location</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Price</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Type</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rooms.map((r) => (
                    <tr key={r._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{r.title}</td>
                      <td className="px-4 py-3 text-gray-600">{r.location?.city}</td>
                      <td className="px-4 py-3 text-gray-600">₹{r.price?.toLocaleString()}</td>
                      <td className="px-4 py-3 capitalize text-gray-600">{r.roomType}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteRoom(r._id)}
                          className="text-red-500 hover:text-red-700 p-1">
                          <HiTrash className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {tab === 'users' && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Role</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Joined</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                    <td className="px-4 py-3 text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium 
                        ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right">
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(u._id)}
                          className="text-red-500 hover:text-red-700 p-1">
                          <HiTrash className="w-5 h-5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Landlords Tab */}
        {tab === 'landlords' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Landlords</h2>
              <button onClick={() => setShowAddLandlord(!showAddLandlord)}
                className="btn-primary text-sm !py-2 flex items-center">
                <HiPlus className="mr-1" /> Add Landlord
              </button>
            </div>

            {showAddLandlord && (
              <form onSubmit={handleAddLandlord} className="card p-6 mb-6 fade-in">
                <div className="grid sm:grid-cols-3 gap-4">
                  <input placeholder="Name" required value={landlordForm.name}
                    onChange={e => setLandlordForm({ ...landlordForm, name: e.target.value })}
                    className="input-field" />
                  <input placeholder="Email" type="email" value={landlordForm.email}
                    onChange={e => setLandlordForm({ ...landlordForm, email: e.target.value })}
                    className="input-field" />
                  <input placeholder="Contact" required value={landlordForm.contact}
                    onChange={e => setLandlordForm({ ...landlordForm, contact: e.target.value })}
                    className="input-field" />
                </div>
                <div className="flex gap-3 mt-4">
                  <button type="submit" className="btn-primary text-sm !py-2">Add</button>
                  <button type="button" onClick={() => setShowAddLandlord(false)}
                    className="btn-secondary text-sm !py-2">Cancel</button>
                </div>
              </form>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {landlords.map((l) => (
                <div key={l._id} className="card p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">{l.name}</h3>
                    {l.verified ? (
                      <span className="flex items-center text-green-600 text-xs"><HiCheck className="mr-1" /> Verified</span>
                    ) : (
                      <button onClick={() => handleVerifyLandlord(l._id)}
                        className="text-xs text-primary-600 font-medium hover:text-primary-700">Verify</button>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{l.email}</p>
                  <p className="text-sm text-gray-500">{l.contact}</p>
                  <p className="text-xs text-gray-400 mt-2">{l.properties?.length || 0} properties</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {tab === 'bookings' && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">User</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Room</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Visit Date</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map((b) => (
                  <tr key={b._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">{b.userId?.name}</td>
                    <td className="px-4 py-3 text-gray-600">{b.roomId?.title}</td>
                    <td className="px-4 py-3 text-gray-600">{new Date(b.visitDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize
                        ${b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                          b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                          'bg-orange-100 text-orange-700'}`}>{b.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
