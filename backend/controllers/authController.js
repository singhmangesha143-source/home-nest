const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const supabase = require('../config/supabase');
const { normalizeUser } = require('../utils/normalize');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE || '7d' });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    const { data: existing } = await supabase
      .from('users').select('id').eq('email', email).maybeSingle();
    if (existing) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const { data: user, error } = await supabase
      .from('users')
      .insert({ name, email, password: hashedPassword, phone })
      .select('id, name, email, role')
      .single();

    if (error) return res.status(500).json({ message: 'Registration failed. Please try again.' });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: { _id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, password')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: { _id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, avatar, preferences, saved_rooms, created_at')
      .eq('id', req.user.id)
      .single();

    if (error || !user) return res.status(404).json({ message: 'User not found.' });

    let savedRoomsDetails = [];
    if (user.saved_rooms && user.saved_rooms.length > 0) {
      const { data: rooms } = await supabase
        .from('rooms')
        .select('id, title, location, price, images, room_type, average_rating, amenities')
        .in('id', user.saved_rooms);
      savedRoomsDetails = (rooms || []).map(r => ({
        ...r,
        _id: r.id,
        roomType: r.room_type,
        averageRating: r.average_rating,
      }));
    }

    res.json({ ...normalizeUser(user), savedRooms: savedRoomsDetails });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowed = ['name', 'phone', 'avatar', 'preferences'];
    const updates = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    }
    updates.updated_at = new Date().toISOString();

    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, phone, role, avatar, preferences, saved_rooms')
      .single();

    if (error) return res.status(500).json({ message: 'Update failed. Please try again.' });
    res.json(normalizeUser(user));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.saveRoom = async (req, res) => {
  try {
    const { roomId } = req.body;
    // Validate UUID format to prevent injection into UUID array
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!roomId || !UUID_RE.test(roomId)) {
      return res.status(400).json({ message: 'Invalid room ID.' });
    }

    const { data: user } = await supabase
      .from('users').select('saved_rooms').eq('id', req.user.id).single();

    let savedRooms = user.saved_rooms || [];
    const index = savedRooms.indexOf(roomId);
    if (index > -1) savedRooms.splice(index, 1);
    else savedRooms.push(roomId);

    await supabase.from('users').update({ saved_rooms: savedRooms }).eq('id', req.user.id);
    res.json({ savedRooms });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('id, name, email, phone, role, avatar, created_at')
      .order('created_at', { ascending: false });
    if (error) return res.status(500).json({ message: 'Failed to fetch users.' });
    res.json(users.map(u => ({ ...u, _id: u.id })));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting their own account
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account.' });
    }
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ message: 'Delete failed.' });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};
