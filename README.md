# 🚀 WAIHub - WhatsApp AI Dashboard

WAIHub adalah dashboard manajemen WhatsApp Gateway berbasis web yang terintegrasi dengan kecerdasan buatan (AI) menggunakan model Llama 3.1 dari Groq SDK. Dashboard ini dikembangkan untuk mempermudah pengelolaan bot WhatsApp secara real-time.

## ✨ Fitur Utama
*   **Multi-Theme System**: Tersedia pilihan tema Emerald, Royal Blue, Luxury Purple, dan Orange yang dapat diganti langsung dari header.
*   **Real-time Monitoring**: Memantau status koneksi WhatsApp, jumlah pesan, dan latensi respon AI secara langsung.
*   **AI Personality Settings**: Mengatur instruksi atau *System Prompt* kepribadian AI langsung dari dashboard yang tersimpan di database MongoDB.
*   **Security Access**: Dashboard dilindungi oleh sistem login PIN keamanan.
*   **Mobile Optimized**: Navigasi khusus untuk pengguna smartphone lengkap dengan tombol *Exit/Logout* yang mudah dijangkau.
*   **Live Traffic Logs**: Menampilkan riwayat percakapan secara real-time dan log database lengkap.

## 🛠️ Teknologi yang Digunakan
*   **Frontend**: HTML5, Tailwind CSS, FontAwesome 6.
*   **Backend**: Node.js, Socket.io (untuk komunikasi data real-time).
*   **AI Engine**: Groq SDK (Llama 3.1 8B Instant).
*   **Database**: MongoDB (untuk menyimpan pengaturan prompt dan riwayat).

## 🚀 Panduan Instalasi

1.  **Clone Repositori**
    ```bash
    git clone [https://github.com/niz4m99/waihub.git](https://github.com/niz4m99/waihub.git)
    cd waihub
    ```

2.  **Install Dependensi**
    ```bash
    npm install
    ```

3.  **Jalankan Aplikasi**
    ```bash
    node src/server.js
    ```

## 📄 Kredit
Dikembangkan oleh [niz4m](https://niz4m.domcloud.dev).

---
*Catatan: Pastikan Anda telah mengonfigurasi file .env dengan GROQ_API_KEY dan MONGODB_URI sebelum memulai.*
