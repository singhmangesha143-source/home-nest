/**
 * Normalize Supabase snake_case responses into the camelCase format
 * the frontend expects (matching previous Mongoose output).
 */

const normalizeLandlord = (landlord) => {
  if (!landlord) return null;
  const { id, created_at, updated_at, ...rest } = landlord;
  return { ...rest, _id: id, createdAt: created_at };
};

const normalizeRoom = (room) => {
  if (!room) return null;
  const {
    id, room_type, average_rating, landlord_id,
    landlord, created_at, updated_at, ...rest
  } = room;
  return {
    ...rest,
    _id: id,
    roomType: room_type,
    averageRating: average_rating ?? 0,
    landlordId: landlord ? normalizeLandlord(landlord) : landlord_id,
    createdAt: created_at,
  };
};

const normalizeUser = (user) => {
  if (!user) return null;
  const { id, saved_rooms, created_at, updated_at, password, ...rest } = user;
  return {
    ...rest,
    _id: id,
    savedRooms: saved_rooms || [],
    createdAt: created_at,
  };
};

const normalizeBooking = (booking) => {
  if (!booking) return null;
  const {
    id, user_id, room_id, visit_date,
    created_at, updated_at, user, room, ...rest
  } = booking;
  return {
    ...rest,
    _id: id,
    userId: user ? normalizeUser(user) : user_id,
    roomId: room ? normalizeRoom(room) : room_id,
    visitDate: visit_date,
    createdAt: created_at,
  };
};

module.exports = { normalizeRoom, normalizeUser, normalizeBooking, normalizeLandlord };
