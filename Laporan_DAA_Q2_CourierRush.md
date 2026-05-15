# Laporan Proyek Desain dan Analisis Algoritma (Quiz 2)
## Courier Rush - Graph Algorithm Delivery Game

### 1. Anggota Kelompok
* **NRP - Dustin** : Redesigned the entire user interface, implemented Kruskal's Minimum Spanning Tree (MST) algorithm, and added visual route comparisons and background music.
*(Silakan tambahkan anggota lain beserta NRP dan kontribusinya di sini)*

---

### 2. Deskripsi Program
**Courier Rush** adalah sebuah permainan simulasi pengiriman barang berbasis web yang mengimplementasikan algoritma graf. Dalam permainan ini, pemain berperan sebagai kurir yang harus mengatasi berbagai kendala rute di kota. Permainan ini terbagi menjadi dua fase utama yang masing-masing mengimplementasikan algoritma graf yang diajarkan di kelas, yaitu **Kruskal's Minimum Spanning Tree (MST)** dan **Dijkstra's Shortest Path**.

---

### 3. Implementasi Algoritma

#### A. Algoritma Kruskal (Minimum Spanning Tree)
* **Fase Permainan:** Road Repair (Perbaikan Jalan)
* **Deskripsi:** Sebelum kurir dapat mulai mengirim paket, beberapa jalan di kota rusak akibat badai. Pemain harus memilih jalan mana saja yang harus diperbaiki sedemikian rupa sehingga semua lokasi (node) di kota terhubung satu sama lain dengan total biaya perbaikan paling murah.
* **Cara Kerja:** 
  1. Algoritma Kruskal akan mengurutkan semua bobot sisi (edges) dari yang terkecil hingga terbesar.
  2. Menggunakan struktur data *Disjoint Set Union (DSU)*, algoritma akan menambahkan sisi ke dalam *Minimum Spanning Tree* asalkan tidak membentuk siklus (cycle).
  3. Setelah pemain selesai memilih jalan, program akan membandingkan graf pilihan pemain dengan graf optimal hasil algoritma Kruskal untuk memberikan skor efisiensi (Efficiency Score).

#### B. Algoritma Dijkstra (Shortest Path)
* **Fase Permainan:** Delivery Route (Pengiriman Barang)
* **Deskripsi:** Setelah jalan diperbaiki, kurir harus mengantarkan paket dari Gudang (Warehouse) ke berbagai tujuan. Terdapat rintangan seperti jalan yang ditutup (Blocked) atau macet (Slow traffic - bobot ganda). Pemain harus memilih rute terpendek untuk menghemat waktu dan jarak tempuh.
* **Cara Kerja:**
  1. Algoritma Dijkstra mencari rute dengan bobot terendah dari titik asal (Warehouse) ke titik tujuan (Drop-off point).
  2. Program menyimpan jarak terpendek dari titik awal ke semua titik lain dan menggunakan *Priority Queue* (atau unvisited set) untuk memproses node dengan jarak terkecil.
  3. Rute yang dilewati pemain akan dilacak dan kemudian dibandingkan langsung (secara visual dan metrik jarak) dengan rute paling optimal hasil dari algoritma Dijkstra di akhir permainan (Result Screen).

---

### 4. Fitur Utama & Antarmuka Pengguna (UI)
* **Visualisasi Interaktif:** Menampilkan peta kota (graf) menggunakan komponen SVG interaktif yang langsung merender node dan edges beserta status masing-masing (macet, ditutup, rute optimal).
* **Unified Premium UI:** Antarmuka pengguna didesain menggunakan tema gelap yang modern dengan aksen hijau (sukses) dan emas (peringatan/poin), memberikan pengalaman *gaming* yang mulus.
* **Visual Route Comparison:** Layar hasil permainan tidak hanya menampilkan teks, tetapi juga menumpuk (*overlay*) rute yang dilewati pemain dengan rute optimal hasil algoritma di atas peta yang sama, secara *real-time*.

---

### 5. Kesimpulan
Program **Courier Rush** berhasil mendemonstrasikan penerapan algoritma Kruskal dan Dijkstra secara nyata dan interaktif. Dengan membungkus algoritma ini ke dalam skenario *game*, pengguna dapat secara intuitif memahami bagaimana pencarian *Minimum Spanning Tree* dan *Shortest Path* bekerja untuk optimalisasi sumber daya di dunia nyata.

---
*Laporan ini di-generate secara otomatis untuk keperluan evaluasi DAA Quiz 2.*
