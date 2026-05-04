const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Menghubungkan ke MongoDB menggunakan URI dari file .env
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected...');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1); // Hentikan aplikasi jika gagal konek ke database
  }
};

module.exports = connectDB;