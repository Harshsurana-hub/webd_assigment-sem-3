require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('../models/User');
const Venue = require('../models/Venue');
const VenueBlock = require('../models/VenueBlock');
const Booking = require('../models/Booking');

async function seed() {
  try {
    console.log('🌱 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Venue.deleteMany({});
    await VenueBlock.deleteMany({});
    await Booking.deleteMany({});

    // ========================
    // USERS
    // ========================
    console.log('👤 Creating users...');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin@123',
      role: 'admin'
    });

    const organiser1 = await User.create({
      name: 'Rahul Sharma',
      email: 'organiser@example.com',
      password: 'Organiser@123',
      role: 'organiser'
    });

    const organiser2 = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      password: 'Organiser@123',
      role: 'organiser'
    });

    console.log('  ✓ Admin: admin@example.com / Admin@123');
    console.log('  ✓ Organiser 1: organiser@example.com / Organiser@123');
    console.log('  ✓ Organiser 2: priya@example.com / Organiser@123');

    // ========================
    // VENUES
    // ========================
    console.log('🏛️  Creating venues...');

    const venues = await Venue.insertMany([
      {
        name: 'Grand Auditorium',
        description: 'The Grand Auditorium is our largest venue, featuring a full-size stage, professional lighting, and state-of-the-art acoustics. Perfect for conferences, cultural events, and large-scale presentations. The hall seats up to 500 guests with comfortable tiered seating.',
        capacity: 500,
        facilities: ['Projector', 'Sound System', 'Stage', 'Air Conditioning', 'WiFi', 'Parking', 'Power Backup', 'Wheelchair Access'],
        hourlyRate: 5000,
        location: 'Main Campus, Block A, Ground Floor',
        imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=400&fit=crop',
        status: 'active'
      },
      {
        name: 'Innovation Hub',
        description: 'A modern, tech-forward space designed for hackathons, workshops, and collaborative events. Equipped with high-speed internet, multiple screens, and flexible seating arrangements. Features breakout areas and a dedicated refreshment zone.',
        capacity: 150,
        facilities: ['Projector', 'WiFi', 'Whiteboard', 'Air Conditioning', 'Power Backup'],
        hourlyRate: 2000,
        location: 'Technology Park, Block C, 2nd Floor',
        imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop',
        status: 'active'
      },
      {
        name: 'Sunrise Conference Room',
        description: 'An elegant mid-sized conference room with panoramic windows, offering natural light and a professional atmosphere. Ideal for board meetings, seminars, and corporate presentations. Features video conferencing capabilities.',
        capacity: 80,
        facilities: ['Projector', 'WiFi', 'Air Conditioning', 'Whiteboard', 'Sound System'],
        hourlyRate: 1500,
        location: 'Admin Building, 3rd Floor, Room 301',
        imageUrl: 'https://images.unsplash.com/photo-1431540015159-0f55e7ee52af?w=600&h=400&fit=crop',
        status: 'active'
      },
      {
        name: 'Open Air Amphitheatre',
        description: 'A beautiful outdoor amphitheatre surrounded by lush greenery. Perfect for cultural performances, open-air screenings, and community gatherings. Features stone seating, a central performance area, and basic sound/lighting setup.',
        capacity: 300,
        facilities: ['Sound System', 'Stage', 'Parking', 'Power Backup'],
        hourlyRate: 3000,
        location: 'Central Lawn, Near Library',
        imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop',
        status: 'active'
      },
      {
        name: 'Boardroom Elite',
        description: 'An exclusive, wood-paneled boardroom designed for high-level meetings and VIP gatherings. Features a custom conference table, leather seating for 20, and premium AV equipment with video conferencing.',
        capacity: 20,
        facilities: ['Projector', 'WiFi', 'Air Conditioning', 'Sound System', 'Whiteboard', 'Power Backup'],
        hourlyRate: 1000,
        location: 'Executive Wing, Block B, 5th Floor',
        imageUrl: 'https://images.unsplash.com/photo-1462826303086-329426d1afd5?w=600&h=400&fit=crop',
        status: 'active'
      }
    ]);

    console.log(`  ✓ ${venues.length} venues created`);

    // ========================
    // BOOKINGS
    // ========================
    console.log('📋 Creating sample bookings...');

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Helper to create dates
    function futureDate(daysFromNow) {
      const d = new Date();
      d.setDate(d.getDate() + daysFromNow);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    function pastDate(daysAgo) {
      const d = new Date();
      d.setDate(d.getDate() - daysAgo);
      d.setHours(0, 0, 0, 0);
      return d;
    }

    const bookings = await Booking.insertMany([
      // Today's event
      {
        venue: venues[0]._id,
        organiser: organiser1._id,
        eventName: 'Annual Tech Summit 2026',
        eventDescription: 'A day-long technology conference featuring keynote speakers and workshops.',
        eventDate: futureDate(0),
        startTime: '09:00',
        endTime: '17:00',
        attendees: 350,
        totalAmount: 40000,
        status: 'approved'
      },
      // Upcoming approved
      {
        venue: venues[1]._id,
        organiser: organiser1._id,
        eventName: 'AI Workshop Series',
        eventDescription: 'Hands-on workshop on Machine Learning and AI fundamentals.',
        eventDate: futureDate(3),
        startTime: '10:00',
        endTime: '14:00',
        attendees: 100,
        totalAmount: 8000,
        status: 'approved'
      },
      // Pending request
      {
        venue: venues[2]._id,
        organiser: organiser2._id,
        eventName: 'Faculty Development Seminar',
        eventDescription: 'Seminar on innovative teaching methodologies.',
        eventDate: futureDate(7),
        startTime: '11:00',
        endTime: '15:00',
        attendees: 60,
        totalAmount: 6000,
        status: 'pending'
      },
      // Another pending
      {
        venue: venues[3]._id,
        organiser: organiser1._id,
        eventName: 'Cultural Night 2026',
        eventDescription: 'Annual cultural festival featuring music, dance, and drama performances.',
        eventDate: futureDate(14),
        startTime: '18:00',
        endTime: '22:00',
        attendees: 250,
        totalAmount: 12000,
        status: 'pending'
      },
      // Completed (past)
      {
        venue: venues[0]._id,
        organiser: organiser2._id,
        eventName: 'Orientation Day',
        eventDescription: 'New student orientation programme.',
        eventDate: pastDate(10),
        startTime: '09:00',
        endTime: '13:00',
        attendees: 400,
        totalAmount: 20000,
        status: 'completed'
      },
      // Completed (past)
      {
        venue: venues[4]._id,
        organiser: organiser1._id,
        eventName: 'Board Strategy Meeting',
        eventDescription: 'Quarterly strategy review meeting.',
        eventDate: pastDate(5),
        startTime: '14:00',
        endTime: '17:00',
        attendees: 15,
        totalAmount: 3000,
        status: 'completed'
      },
      // Rejected
      {
        venue: venues[1]._id,
        organiser: organiser2._id,
        eventName: 'Robotics Club Meetup',
        eventDescription: 'Monthly robotics club meeting and demo.',
        eventDate: futureDate(5),
        startTime: '15:00',
        endTime: '18:00',
        attendees: 80,
        totalAmount: 6000,
        status: 'rejected',
        rejectionReason: 'Venue is reserved for an institutional event on this date.'
      },
      // Cancelled
      {
        venue: venues[3]._id,
        organiser: organiser1._id,
        eventName: 'Sports Day Ceremony',
        eventDescription: 'Opening ceremony for annual sports day.',
        eventDate: futureDate(20),
        startTime: '08:00',
        endTime: '12:00',
        attendees: 200,
        totalAmount: 12000,
        status: 'cancelled'
      }
    ]);

    console.log(`  ✓ ${bookings.length} bookings created`);

    // ========================
    // VENUE BLOCKS
    // ========================
    console.log('🔒 Creating venue blocks...');

    const blocks = await VenueBlock.insertMany([
      {
        venue: venues[0]._id,
        startDateTime: new Date(futureDate(10).setHours(8, 0, 0, 0)),
        endDateTime: new Date(futureDate(10).setHours(18, 0, 0, 0)),
        reason: 'Maintenance'
      },
      {
        venue: venues[2]._id,
        startDateTime: new Date(futureDate(5).setHours(0, 0, 0, 0)),
        endDateTime: new Date(futureDate(6).setHours(23, 59, 0, 0)),
        reason: 'Renovation'
      },
      {
        venue: venues[1]._id,
        startDateTime: new Date(futureDate(15).setHours(9, 0, 0, 0)),
        endDateTime: new Date(futureDate(15).setHours(17, 0, 0, 0)),
        reason: 'College Event'
      }
    ]);

    console.log(`  ✓ ${blocks.length} venue blocks created`);

    // ========================
    // DONE
    // ========================
    console.log('\n🎉 Seed completed successfully!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  Demo Accounts:');
    console.log('  Admin:     admin@example.com / Admin@123');
    console.log('  Organiser: organiser@example.com / Organiser@123');
    console.log('  Organiser: priya@example.com / Organiser@123');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
