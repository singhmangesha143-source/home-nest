const supabase = require('../config/supabase');
const { normalizeRoom } = require('../utils/normalize');

const SELECT_ROOM = '*, landlord:landlord_id(id,name,contact,verified)';

exports.getAllRooms = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    const { data: rooms, count, error } = await supabase
      .from('rooms')
      .select(SELECT_ROOM, { count: 'exact' })
      .eq('availability', true)
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) return res.status(500).json({ message: 'Failed to fetch rooms.' });

    res.json({
      rooms: rooms.map(normalizeRoom),
      currentPage: page,
      totalPages: Math.ceil(count / limit),
      totalRooms: count,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getRoomById = async (req, res) => {
  try {
    const { data: room, error } = await supabase
      .from('rooms')
      .select(SELECT_ROOM)
      .eq('id', req.params.id)
      .single();

    if (error || !room) return res.status(404).json({ message: 'Room not found.' });

    res.json(normalizeRoom(room));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { landlordId, roomType, averageRating, ...rest } = req.body;
    const insertData = {
      ...rest,
      landlord_id: landlordId,
      room_type: roomType || rest.room_type,
      average_rating: 0,
    };

    const { data: room, error } = await supabase
      .from('rooms')
      .insert(insertData)
      .select(SELECT_ROOM)
      .single();

    if (error) return res.status(500).json({ message: 'Failed to create room.' });

    // Link room to landlord's properties array
    if (landlordId) {
      const { data: landlord } = await supabase
        .from('landlords').select('properties').eq('id', landlordId).single();
      const properties = [...(landlord?.properties || []), room.id];
      await supabase.from('landlords').update({ properties }).eq('id', landlordId);
    }

    res.status(201).json(normalizeRoom(room));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { landlordId, roomType, averageRating, ...rest } = req.body;
    const updateData = { ...rest };
    if (landlordId) updateData.landlord_id = landlordId;
    if (roomType) updateData.room_type = roomType;

    const { data: room, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', req.params.id)
      .select(SELECT_ROOM)
      .single();

    if (error || !room) return res.status(404).json({ message: 'Room not found.' });

    res.json(normalizeRoom(room));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { data: room } = await supabase
      .from('rooms').select('landlord_id').eq('id', req.params.id).single();
    if (!room) return res.status(404).json({ message: 'Room not found.' });

    await supabase.from('rooms').delete().eq('id', req.params.id);

    // Remove from landlord's properties array
    if (room.landlord_id) {
      const { data: landlord } = await supabase
        .from('landlords').select('properties').eq('id', room.landlord_id).single();
      const properties = (landlord?.properties || []).filter(p => p !== req.params.id);
      await supabase.from('landlords').update({ properties }).eq('id', room.landlord_id);
    }

    res.json({ message: 'Room deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    // Validate rating range
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
    }

    const { data: room, error } = await supabase
      .from('rooms').select('reviews, average_rating').eq('id', req.params.id).single();

    if (error || !room) return res.status(404).json({ message: 'Room not found.' });

    const reviews = room.reviews || [];
    const existing = reviews.find(r => r.userId?._id === req.user.id);
    if (existing) return res.status(400).json({ message: 'You have already reviewed this room.' });

    const newReview = {
      userId: { _id: req.user.id, name: req.user.name },
      rating: ratingNum,
      comment: String(comment || '').slice(0, 1000), // cap comment length
      createdAt: new Date().toISOString(),
    };
    const updatedReviews = [...reviews, newReview];
    const avgRating = updatedReviews.reduce((s, r) => s + r.rating, 0) / updatedReviews.length;

    const { data: updated } = await supabase
      .from('rooms')
      .update({ reviews: updatedReviews, average_rating: avgRating })
      .eq('id', req.params.id)
      .select(SELECT_ROOM)
      .single();

    res.status(201).json(normalizeRoom(updated));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.searchRooms = async (req, res) => {
  try {
    const { location, budget, amenities, roomType, furnishing } = req.query;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 12));
    const skip = (page - 1) * limit;

    let query = supabase
      .from('rooms')
      .select(SELECT_ROOM, { count: 'exact' })
      .eq('availability', true)
      .order('created_at', { ascending: false });

    if (location) query = query.filter('location->>city', 'ilike', `%${location}%`);
    if (budget) query = query.lte('price', parseInt(budget));
    if (roomType) query = query.eq('room_type', roomType);
    if (furnishing) query = query.eq('furnishing', furnishing);
    if (amenities) {
      const list = amenities.split(',').map(a => a.trim()).filter(Boolean);
      if (list.length > 0) query = query.contains('amenities', list);
    }

    const { data: rooms, count, error } = await query.range(skip, skip + limit - 1);
    if (error) return res.status(500).json({ message: 'Search failed.' });

    res.json({
      rooms: rooms.map(normalizeRoom),
      currentPage: page,
      totalPages: Math.ceil((count || 0) / limit),
      totalRooms: count || 0,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getRecommendations = async (req, res) => {
  try {
    const { budget, location, amenities, lifestyle } = req.query;

    const { data: allRooms, error } = await supabase
      .from('rooms')
      .select(SELECT_ROOM)
      .eq('availability', true);

    if (error) return res.status(500).json({ message: 'Failed to fetch rooms.' });

    const scored = allRooms.map((room) => {
      let score = 0;

      if (location && room.location?.city?.toLowerCase().includes(location.toLowerCase())) score += 2;
      if (budget && room.price <= parseInt(budget)) score += 2;
      if (amenities) {
        const requested = amenities.split(',').map(a => a.trim().toLowerCase());
        for (const a of requested) {
          if ((room.amenities || []).some(ra => ra.toLowerCase().includes(a))) score += 1;
        }
      }
      if (lifestyle && (room.furnishing === lifestyle || room.room_type === lifestyle)) score += 1;

      return { ...normalizeRoom(room), score };
    });

    scored.sort((a, b) => b.score - a.score || b.averageRating - a.averageRating);
    res.json(scored.slice(0, 20));
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};
