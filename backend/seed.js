require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('./config/supabase');

const seedData = async () => {
  console.log('Clearing existing data...');
  // Delete in FK-safe order
  await supabase.from('bookings').delete().gte('created_at', '1970-01-01');
  await supabase.from('rooms').delete().gte('created_at', '1970-01-01');
  await supabase.from('landlords').delete().gte('created_at', '1970-01-01');
  await supabase.from('users').delete().gte('created_at', '1970-01-01');
  console.log('Cleared existing data.');

  // ── Users ──────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash('admin123', 12);
  const userHash = await bcrypt.hash('password123', 12);

  const { data: users, error: usersError } = await supabase
    .from('users')
    .insert([
      { name: 'Admin User', email: 'admin@predictnest.com', password: adminHash, phone: '9999999999', role: 'admin' },
      { name: 'Rahul Sharma', email: 'rahul@example.com', password: userHash, phone: '9876543210', role: 'user', preferences: { budget: { min: 5000, max: 15000 }, location: 'Mumbai', amenities: ['WiFi', 'AC'], lifestyle: 'furnished' } },
      { name: 'Priya Patel', email: 'priya@example.com', password: userHash, phone: '9876543211', role: 'user', preferences: { budget: { min: 8000, max: 20000 }, location: 'Bangalore', amenities: ['Gym', 'Parking'], lifestyle: 'semi-furnished' } },
    ])
    .select('id, name');

  if (usersError) { console.error('Users error:', usersError.message); process.exit(1); }
  console.log('Users created.');
  const [, user1, user2] = users; // [admin, user1, user2]

  // ── Landlords ──────────────────────────────────────────────────────────
  const { data: landlords, error: landlordsError } = await supabase
    .from('landlords')
    .insert([
      { name: 'Vikram Singh', email: 'vikram@landlord.com', contact: '9111111111', verified: true },
      { name: 'Anita Desai', email: 'anita@landlord.com', contact: '9222222222', verified: true },
      { name: 'Rajesh Kumar', email: 'rajesh@landlord.com', contact: '9333333333', verified: false },
      { name: 'Meera Nair', email: 'meera@landlord.com', contact: '9444444444', verified: true },
      { name: 'Suresh Reddy', email: 'suresh@landlord.com', contact: '9555555555', verified: true },
    ])
    .select('id');

  if (landlordsError) { console.error('Landlords error:', landlordsError.message); process.exit(1); }
  console.log('Landlords created.');
  const [l0, l1, l2, l3, l4] = landlords;

  // ── Rooms ──────────────────────────────────────────────────────────────
  const { data: rooms, error: roomsError } = await supabase
    .from('rooms')
    .insert([
      {
        title: 'Spacious 1BHK in Andheri West',
        description: 'A beautifully furnished 1BHK apartment in the heart of Andheri West. Close to metro station, markets, and restaurants. Perfect for working professionals.',
        location: { address: '23 Lokhandwala Complex', city: 'Mumbai', state: 'Maharashtra', zipCode: '400053', coordinates: { lat: 19.1364, lng: 72.8296 } },
        price: 18000, amenities: ['WiFi', 'AC', 'Washing Machine', 'Kitchen', 'Power Backup', 'Security'],
        images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
        landlord_id: l0.id, availability: true, room_type: 'apartment', furnishing: 'furnished', average_rating: 4.5,
        reviews: [
          { userId: { _id: user1.id, name: user1.name }, rating: 5, comment: 'Amazing place! Very clean and well maintained.', createdAt: new Date().toISOString() },
          { userId: { _id: user2.id, name: user2.name }, rating: 4, comment: 'Good location, slightly noisy at night.', createdAt: new Date().toISOString() },
        ],
      },
      {
        title: 'Cozy Studio near Koramangala',
        description: 'Modern studio apartment in Koramangala, Bangalore. Fully furnished with high speed internet. Walking distance to major tech parks.',
        location: { address: '45 80 Feet Road, Koramangala', city: 'Bangalore', state: 'Karnataka', zipCode: '560034', coordinates: { lat: 12.9352, lng: 77.6245 } },
        price: 15000, amenities: ['WiFi', 'AC', 'Gym', 'Parking', 'Laundry', 'CCTV'],
        images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800'],
        landlord_id: l1.id, availability: true, room_type: 'studio', furnishing: 'furnished', average_rating: 4.2,
        reviews: [{ userId: { _id: user1.id, name: user1.name }, rating: 4, comment: 'Great for solo professionals.', createdAt: new Date().toISOString() }],
      },
      {
        title: 'Budget Friendly Room in Kothrud',
        description: 'Affordable single room in a residential area of Kothrud, Pune. Ideal for students. Near to bus stops and colleges.',
        location: { address: '12 Paud Road, Kothrud', city: 'Pune', state: 'Maharashtra', zipCode: '411038', coordinates: { lat: 18.5074, lng: 73.8077 } },
        price: 6000, amenities: ['WiFi', 'Water Supply', 'Power Backup'],
        images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800', 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800'],
        landlord_id: l2.id, availability: true, room_type: 'single', furnishing: 'semi-furnished', average_rating: 3.8, reviews: [],
      },
      {
        title: 'Premium 2BHK in Banjara Hills',
        description: 'Luxurious 2BHK apartment with premium amenities in Banjara Hills, Hyderabad. Gated community with swimming pool and garden.',
        location: { address: '78 Road No. 12, Banjara Hills', city: 'Hyderabad', state: 'Telangana', zipCode: '500034', coordinates: { lat: 17.4156, lng: 78.4347 } },
        price: 25000, amenities: ['WiFi', 'AC', 'Swimming Pool', 'Gym', 'Parking', 'Garden', 'Security', 'Power Backup'],
        images: ['https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800', 'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800'],
        landlord_id: l3.id, availability: true, room_type: 'apartment', furnishing: 'furnished', average_rating: 4.8, reviews: [],
      },
      {
        title: 'Shared Room near Hinjewadi IT Park',
        description: 'Comfortable shared room for IT professionals near Hinjewadi. All basic amenities included. 10 min drive to major tech parks.',
        location: { address: '34 Phase 1, Hinjewadi', city: 'Pune', state: 'Maharashtra', zipCode: '411057', coordinates: { lat: 18.5912, lng: 73.7390 } },
        price: 5000, amenities: ['WiFi', 'Laundry', 'Kitchen', 'Water Supply'],
        images: ['https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800', 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'],
        landlord_id: l4.id, availability: true, room_type: 'shared', furnishing: 'semi-furnished', average_rating: 3.5, reviews: [],
      },
      {
        title: 'Modern Flat in Whitefield',
        description: 'Brand new modern flat in Whitefield, Bangalore with excellent connectivity to IT corridor. Contemporary interiors with balcony view.',
        location: { address: '56 ITPL Main Road, Whitefield', city: 'Bangalore', state: 'Karnataka', zipCode: '560066', coordinates: { lat: 12.9698, lng: 77.7500 } },
        price: 22000, amenities: ['WiFi', 'AC', 'Gym', 'Swimming Pool', 'Parking', 'Security', 'Balcony', 'Elevator'],
        images: ['https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?w=800'],
        landlord_id: l1.id, availability: true, room_type: 'apartment', furnishing: 'furnished', average_rating: 4.6, reviews: [],
      },
      {
        title: 'Affordable PG in Marathahalli',
        description: 'Clean and affordable paying guest accommodation in Marathahalli. Meals included. Close to Outer Ring Road tech parks.',
        location: { address: '89 Marathahalli Bridge', city: 'Bangalore', state: 'Karnataka', zipCode: '560037', coordinates: { lat: 12.9591, lng: 77.6974 } },
        price: 8000, amenities: ['WiFi', 'Meals', 'Laundry', 'Water Supply', 'Power Backup'],
        images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800'],
        landlord_id: l3.id, availability: true, room_type: 'single', furnishing: 'furnished', average_rating: 4.0, reviews: [],
      },
      {
        title: 'Sea-View Studio in Juhu',
        description: 'Stunning sea-view studio apartment in Juhu, Mumbai. Premium location with beach access. Ideal for creative professionals.',
        location: { address: '15 Juhu Tara Road', city: 'Mumbai', state: 'Maharashtra', zipCode: '400049', coordinates: { lat: 19.0883, lng: 72.8263 } },
        price: 35000, amenities: ['WiFi', 'AC', 'Sea View', 'Security', 'Parking', 'Balcony', 'Power Backup', 'Kitchen'],
        images: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'],
        landlord_id: l0.id, availability: true, room_type: 'studio', furnishing: 'furnished', average_rating: 4.9, reviews: [],
      },
      {
        title: 'Student Hostel near Delhi University',
        description: 'Well-maintained student hostel room near Delhi University North Campus. Safe neighbourhood with good food options nearby.',
        location: { address: '22 Kamla Nagar', city: 'Delhi', state: 'Delhi', zipCode: '110007', coordinates: { lat: 28.6845, lng: 77.2030 } },
        price: 7000, amenities: ['WiFi', 'Water Supply', 'Study Room', 'Common Kitchen'],
        images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800'],
        landlord_id: l4.id, availability: true, room_type: 'single', furnishing: 'semi-furnished', average_rating: 3.9, reviews: [],
      },
      {
        title: 'Luxury Apartment in MG Road',
        description: 'High-end luxury apartment on MG Road, Bangalore. Walk to fine dining, shopping malls, and metro station. Concierge service available.',
        location: { address: '101 MG Road', city: 'Bangalore', state: 'Karnataka', zipCode: '560001', coordinates: { lat: 12.9756, lng: 77.6065 } },
        price: 40000, amenities: ['WiFi', 'AC', 'Gym', 'Swimming Pool', 'Parking', 'Concierge', 'Garden', 'Security', 'Elevator', 'Balcony'],
        images: ['https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800'],
        landlord_id: l1.id, availability: true, room_type: 'apartment', furnishing: 'furnished', average_rating: 4.7, reviews: [],
      },
      {
        title: 'Compact Room in Powai',
        description: 'Neat and compact room in Powai, Mumbai. Near IIT Bombay and Hiranandani Gardens. Suitable for students and young professionals.',
        location: { address: '67 Hiranandani Gardens', city: 'Mumbai', state: 'Maharashtra', zipCode: '400076', coordinates: { lat: 19.1176, lng: 72.9060 } },
        price: 12000, amenities: ['WiFi', 'AC', 'Laundry', 'Security', 'Power Backup'],
        images: ['https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800'],
        landlord_id: l0.id, availability: true, room_type: 'single', furnishing: 'furnished', average_rating: 4.1, reviews: [],
      },
      {
        title: 'Double Room in Sector 62 Noida',
        description: 'Spacious double room in Sector 62, Noida. Close to metro and IT companies. Well connected to Delhi NCR.',
        location: { address: 'B-45, Sector 62', city: 'Noida', state: 'Uttar Pradesh', zipCode: '201309', coordinates: { lat: 28.6270, lng: 77.3654 } },
        price: 10000, amenities: ['WiFi', 'AC', 'Parking', 'Water Supply', 'Power Backup'],
        images: ['https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800'],
        landlord_id: l2.id, availability: true, room_type: 'double', furnishing: 'semi-furnished', average_rating: 3.6, reviews: [],
      },
    ])
    .select('id, landlord_id');

  if (roomsError) { console.error('Rooms error:', roomsError.message); process.exit(1); }
  console.log('Rooms created.');

  // Update landlord properties arrays
  const landlordRooms = {};
  for (const r of rooms) {
    if (!landlordRooms[r.landlord_id]) landlordRooms[r.landlord_id] = [];
    landlordRooms[r.landlord_id].push(r.id);
  }
  for (const [landlordId, properties] of Object.entries(landlordRooms)) {
    await supabase.from('landlords').update({ properties }).eq('id', landlordId);
  }

  // ── Bookings ────────────────────────────────────────────────────────────
  const { error: bookingsError } = await supabase.from('bookings').insert([
    { user_id: user1.id, room_id: rooms[0].id, visit_date: '2026-03-15T00:00:00.000Z', status: 'confirmed' },
    { user_id: user2.id, room_id: rooms[1].id, visit_date: '2026-03-18T00:00:00.000Z', status: 'pending' },
    { user_id: user1.id, room_id: rooms[5].id, visit_date: '2026-03-20T00:00:00.000Z', status: 'pending' },
  ]);
  if (bookingsError) { console.error('Bookings error:', bookingsError.message); process.exit(1); }
  console.log('Bookings created.');

  // ── Saved rooms ─────────────────────────────────────────────────────────
  await supabase.from('users').update({ saved_rooms: [rooms[0].id, rooms[1].id, rooms[7].id] }).eq('id', user1.id);
  await supabase.from('users').update({ saved_rooms: [rooms[3].id, rooms[5].id] }).eq('id', user2.id);

  console.log('\nSeed data created successfully!');
  console.log('---');
  console.log('Admin:  admin@predictnest.com / admin123');
  console.log('User1:  rahul@example.com / password123');
  console.log('User2:  priya@example.com / password123');
  console.log('---');
  process.exit(0);
};

seedData().catch((err) => {
  console.error('Seed error:', err.message || err);
  process.exit(1);
});
