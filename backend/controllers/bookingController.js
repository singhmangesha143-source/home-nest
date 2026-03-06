const supabase = require('../config/supabase');
const { normalizeBooking } = require('../utils/normalize');

const SELECT_BOOKING = '*, room:room_id(id,title,location,price,images), user:user_id(id,name,email)';

exports.createBooking = async (req, res) => {
  try {
    const { roomId, visitDate, notes } = req.body;

    const { data: room } = await supabase.from('rooms').select('id').eq('id', roomId).single();
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    const { data: existing } = await supabase
      .from('bookings')
      .select('id')
      .eq('user_id', req.user.id)
      .eq('room_id', roomId)
      .in('status', ['pending', 'confirmed'])
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ message: 'You already have a pending or confirmed booking for this room.' });
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .insert({ user_id: req.user.id, room_id: roomId, visit_date: visitDate, notes })
      .select(SELECT_BOOKING)
      .single();

    if (error) return res.status(500).json({ message: 'Booking failed. Please try again.' });
    res.status(201).json(normalizeBooking(booking));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(SELECT_BOOKING)
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: 'Failed to fetch bookings.' });
    res.json(bookings.map(normalizeBooking));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', req.params.id)
      .select(SELECT_BOOKING)
      .single();

    if (error || !booking) return res.status(404).json({ message: 'Booking not found.' });
    res.json(normalizeBooking(booking));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { data: booking } = await supabase
      .from('bookings').select('id,status').eq('id', req.params.id).eq('user_id', req.user.id).single();

    if (!booking) return res.status(404).json({ message: 'Booking not found.' });

    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', req.params.id);
    res.json({ message: 'Booking cancelled successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getAllBookings = async (req, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('bookings')
      .select(SELECT_BOOKING)
      .order('created_at', { ascending: false });

    if (error) return res.status(500).json({ message: 'Failed to fetch bookings.' });
    res.json(bookings.map(normalizeBooking));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};
