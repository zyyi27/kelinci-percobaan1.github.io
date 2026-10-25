require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Supabase Setup
const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'placeholder-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// ==========================================
// ROUTES API
// ==========================================
app.get('/api/penilaian', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('tabel_penilaian')
            .select('*')
            .order('id', { ascending: false });

        if (error) throw error;
        res.status(200).json({ success: true, data: data });
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ success: false, message: 'Gagal mengambil data dari server.' });
    }
});

app.post('/api/penilaian', async (req, res) => {
    try {
        const { nama_peserta, nilai, komentar } = req.body;

        if (!nama_peserta || !nilai) {
            return res.status(400).json({ success: false, message: 'Nama dan nilai wajib diisi!' });
        }

        const { data, error } = await supabase
            .from('tabel_penilaian')
            .insert([{ nama_peserta, nilai, komentar }]);

        if (error) throw error;
        res.status(201).json({ success: true, message: 'Data berhasil disimpan!', data });
    } catch (error) {
        console.error("API Error:", error.message);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan sistem.' });
    }
});

// ==========================================
// EXPORT UNTUK VERCEL & SERVER LOKAL
// ==========================================
module.exports = app;

// Hanya jalankan app.listen jika dijalankan secara lokal (bukan di lingkungan Vercel Serverless)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.use(express.static(path.join(__dirname, 'public')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    app.listen(PORT, () => {
        console.log(`Server berjalan di http://localhost:${PORT}`);
    });
}
