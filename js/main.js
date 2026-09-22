/* DEDIKASIH - PANEL ADMIN: muat data, pencarian, login, update status, inisialisasi (dipecah dari index.html agar lebih ringan) */

/* ============================================
         ADMIN DATA LOADING FUNCTIONS
      ============================================ */
    
    async function refreshAllAdminData() {
      showLoading(true);
      await Promise.all([
        loadAdminUsulan(),
        loadAdminPengumuman(),
        loadAdminJadwal(),
        loadAdminSertifikat()
      ]);
      showLoading(false);
      showToast('Semua data admin berhasil dimuat!', 'success');
    }
    
    async function loadAdminUsulan() {
      if (!checkSupabaseReady()) return;
      try {
        const { data, error } = await supabase.from('formulir_usulan')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if(error) throw error;
        
        publicData.formulirAdmin = (data || []).map(row => ({
          id: row.id,
          nomorRegistrasi: row.nomor_registrasi,
          namaPengusul: row.nama_pengusul,
          nik: row.nik,
          asalInstitusi: row.asal_institusi,
          telpon: row.telpon,
          namaKegiatan: row.nama_kegiatan,
          tempatKegiatan: row.tempat_kegiatan,
          tanggalPelaksanaan: row.tanggal_pelaksanaan || row.tanggal_kegiatan,
          waktuPelaksanaan: row.waktu_pelaksanaan,
          jumlahPeserta: row.jumlah_peserta,
          status: row.status,
          catatan: row.catatan,
          createdAt: row.created_at
        }));
        
        renderAdminUsulanTable();
      } catch(err) {
        console.error('[DEDIKASIH] Error loadAdminUsulan:', err);
      }
    }
    
    function renderAdminUsulanTable() {
      var tbody = document.getElementById('adminUsulanTable');
      if(!tbody) return;
      
      var items = publicData.formulirAdmin;
      
      if(items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="12" class="empty-state"><i class="fa-solid fa-inbox"></i><h4>Belum ada data usulan</h4><p>Data usulan akan muncul di sini</p></td></tr>';
        return;
      }
      
      tbody.innerHTML = items.map(function(item, idx) {
        var statusClass = item.status === 'Disetujui' ? 'status-approved' : 
                         item.status === 'Ditolak' ? 'status-rejected' : 'status-pending';
        
        return '<tr class="admin-row-animate" style="animation-delay:' + (idx * 50) + 'ms">' +
          '<td class="px-2 py-2 font-mono text-[10px] text-teal-400">' + (item.nomorRegistrasi || '-') + '</td>' +
          '<td class="px-2 py-2 font-medium max-w-[120px] truncate" title="' + (item.namaPengusul || '') + '">' + item.namaPengusul + '</td>' +
          '<td class="px-2 py-2 text-[10px]">' + (item.nik || '-') + '</td>' +
          '<td class="px-2 py-2 max-w-[100px] truncate" title="' + (item.asalInstitusi || '') + '">' + (item.asalInstitusi || '-') + '</td>' +
          '<td class="px-2 py-2 text-[10px]">' + (item.telpon || '-') + '</td>' +
          '<td class="px-2 py-2 max-w-[120px] truncate" title="' + (item.namaKegiatan || '') + '">' + item.namaKegiatan + '</td>' +
          '<td class="px-2 py-2 max-w-[80px] truncate" title="' + (item.tempatKegiatan || '') + '">' + (item.tempatKegiatan || '-') + '</td>' +
          '<td class="px-2 py-2 text-[10px]">' + formatDateIndo(item.tanggalPelaksanaan) + '</td>' +
          '<td class="px-2 py-2 text-[10px]">' + (item.waktuPelaksanaan || '-') + '</td>' +
          '<td class="px-2 py-2 text-center text-[10px]">' + (item.jumlahPeserta || '-') + '</td>' +
          '<td class="px-2 py-2"><span class="status-badge ' + statusClass + '">' + item.status + '</span></td>' +
          '<td class="px-2 py-2"><div class="action-cell flex gap-1 justify-end">' +
            '<button onclick="viewUsulanDetail(' + item.id + ')" class="btn-crud btn-view btn-icon" title="Lihat Detail"><i class="fa-solid fa-eye"></i></button>' +
            '<button onclick="showEditUsulanModal(' + item.id + ')" class="btn-crud btn-edit btn-icon" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
            '<button onclick="showUpdateStatusModal(' + item.id + ')" class="btn-crud btn-approve btn-icon" title="Update Status"><i class="fa-solid fa-arrows-rotate"></i></button>' +
            '<button onclick="confirmDeleteUsulan(' + item.id + ')" class="btn-crud btn-delete btn-icon" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }
    
    async function loadAdminPengumuman() {
      if (!checkSupabaseReady()) return;
      try {
        const { data, error } = await supabase.from('pengumuman')
          .select('*')
          .order('created_at', { ascending: false });
        
        if(error) throw error;
        
        publicData.pengumuman = (data || []).map(row => ({
          id: row.id,
          judul: row.judul,
          isi: row.isi,
          tanggal: row.tanggal,
          createdAt: row.created_at
        }));
        
        renderAdminPengumumanTable();
      } catch(err) {
        console.error('[DEDIKASIH] Error loadAdminPengumuman:', err);
      }
    }
    
    function renderAdminPengumumanTable() {
      var tbody = document.getElementById('adminPengumumanTable');
      if(!tbody) return;
      
      var items = publicData.pengumuman;
      
      if(items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fa-solid fa-bullhorn"></i><h4>Belum ada pengumuman</h4><p>Buat pengumuman baru untuk memulai</p></td></tr>';
        return;
      }
      
      // Helper function untuk status badge
      function getStatusBadge(status, id) {
        var s = (status || 'aktif').toLowerCase();
        var colors = {
          'aktif': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          'nonaktif': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
          'draft': 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        };
        var cls = colors[s] || colors['aktif'];
        return '<span class="status-badge ' + cls + '" onclick="updatePengumumanStatus(' + id + ',\'' + s + '\')" style="cursor:pointer;padding:2px 8px;border-radius:9999px;font-size:10px;border:1px solid;font-weight:600;">' + (s === 'aktif' ? '✓ Aktif' : s === 'nonaktif' ? '✗ Nonaktif' : '📝 Draft') + '</span>';
      }
      
      tbody.innerHTML = items.map(function(item, idx) {
        var isiPreview = (item.isi || '').substring(0, 80) + ((item.isi || '').length > 80 ? '...' : '');
        return '<tr class="admin-row-animate" style="animation-delay:' + (idx * 50) + 'ms">' +
          '<td class="px-3 py-2 font-mono text-[10px] text-slate-500">' + item.id + '</td>' +
          '<td class="px-3 py-2 font-medium">' + item.judul + '</td>' +
          '<td class="px-3 py-2 text-[10px] whitespace-nowrap">' + formatDateIndo(item.tanggal) + '</td>' +
          '<td class="px-3 py-2">' + getStatusBadge(item.status, item.id) + '</td>' +
          '<td class="px-3 py-2 text-[10px] text-slate-400 max-w-[200px] truncate" title="' + (item.isi || '').replace(/"/g, '&quot;') + '">' + isiPreview + '</td>' +
          '<td class="px-3 py-2"><div class="action-cell flex gap-1 justify-end">' +
            '<button onclick="viewPengumumanDetail(' + item.id + ')" class="btn-crud btn-view btn-icon" title="Lihat"><i class="fa-solid fa-eye"></i></button>' +
            '<button onclick="showEditPengumumanModal(' + item.id + ')" class="btn-crud btn-edit btn-icon" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
            '<button onclick="confirmDeletePengumuman(' + item.id + ')" class="btn-crud btn-delete btn-icon" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }
    
    async function loadAdminJadwal() {
      if (!checkSupabaseReady()) return;
      try {
        const { data, error } = await supabase.from('jadwal_kegiatan')
          .select('*')
          .order('tanggal', { ascending: true });
        
        if(error) throw error;
        
        publicData.jadwal = (data || []).map(row => ({
          id: row.id,
          namaKegiatan: row.nama_kegiatan,
          tempat: row.tempat,
          tanggal: row.tanggal,
          waktu: row.waktu,
          pic: row.pic,
          keterangan: row.keterangan
        }));
        
        renderAdminJadwalTable();
      } catch(err) {
        console.error('[DEDIKASIH] Error loadAdminJadwal:', err);
      }
    }
    
    function renderAdminJadwalTable() {
      var container = document.getElementById('adminJadwalTable');
      if(!container) return;
      
      var items = publicData.jadwal;
      
      if(items.length === 0) {
        container.innerHTML = '<tr><td colspan="8" class="empty-state"><i class="fa-solid fa-calendar-xmark"></i><h4>Belum ada jadwal</h4><p>Tambahkan jadwal kegiatan baru</p></td></tr>';
        return;
      }
      
      // Helper function untuk jadwal status badge
      function getJadwalStatusBadge(status, id) {
        var s = (status || 'terjadwal').toLowerCase();
        var colors = {
          'terjadwal': 'bg-slate-1000/20 text-teal-600 border-teal-700/30',
          'berlangsung': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          'selesai': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
          'dibatalkan': 'bg-red-500/20 text-red-400 border-red-500/30'
        };
        var cls = colors[s] || colors['terjadwal'];
        var labels = {
          'terjadwal': '📅 Terjadwal',
          'berlangsung': '▶️ Berlangsung',
          'selesai': '✅ Selesai',
          'dibatalkan': '❌ Dibatalkan'
        };
        return '<span class="status-badge ' + cls + '" onclick="updateJadwalStatus(' + id + ',\'' + s + '\')" style="cursor:pointer;padding:2px 8px;border-radius:9999px;font-size:10px;border:1px solid;font-weight:600;">' + (labels[s] || s) + '</span>';
      }
      
      container.innerHTML = items.map(function(item, idx) {
        return '<tr class="admin-row-animate" style="animation-delay:' + (idx * 50) + 'ms">' +
          // Kolom 1: Nama Kegiatan
          '<td class="px-3 py-2 font-medium max-w-[180px] truncate" title="' + (item.namaKegiatan || '') + '">' + (item.namaKegiatan || '-') + '</td>' +
          // Kolom 2: Tempat
          '<td class="px-3 py-2 text-slate-400 max-w-[100px] truncate" title="' + (item.tempat || '') + '">' + (item.tempat || '-') + '</td>' +
          // Kolom 3: PIC
          '<td class="px-3 py-2 text-[10px] whitespace-nowrap">' + (item.pic || '-') + '</td>' +
          // Kolom 4: Tanggal
          '<td class="px-3 py-2 text-[10px] whitespace-nowrap">' + formatDateIndo(item.tanggal) + '</td>' +
          // Kolom 5: Waktu
          '<td class="px-3 py-2 text-[10px] whitespace-nowrap">' + (item.waktu || '-') + '</td>' +
          // Kolom 6: Status (NEW)
          '<td class="px-3 py-2">' + getJadwalStatusBadge(item.status, item.id) + '</td>' +
          // Kolom 7: Keterangan
          '<td class="px-3 py-2 text-[10px] text-slate-400 max-w-[120px] truncate" title="' + (item.keterangan || '') + '">' + (item.keterangan || '-') + '</td>' +
          // Kolom 8: Aksi (CRUD buttons)
          '<td class="px-3 py-2"><div class="action-cell flex gap-1 justify-end">' +
            '<button onclick="viewJadwalDetail(' + item.id + ')" class="btn-crud btn-view btn-icon" title="Lihat Detail"><i class="fa-solid fa-eye"></i></button>' +
            '<button onclick="showEditJadwalModal(' + item.id + ')" class="btn-crud btn-edit btn-icon" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>' +
            '<button onclick="confirmDeleteJadwal(' + item.id + ')" class="btn-crud btn-delete btn-icon" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }
    
    async function loadAdminSertifikat() {
      if (!checkSupabaseReady()) return;
      try {
        var result = await getAllSertifikat();
        if(result.success) {
          allSertifikat = result.data;
          renderAdminSertifikatTable();
        }
      } catch(err) {
        console.error('[DEDIKASIH] Error loadAdminSertifikat:', err);
      }
    }
    
    function renderAdminSertifikatTable() {
      var container = document.getElementById('adminSertifikatTable');
      if(!container) return;
      
      var items = allSertifikat;
      
      if(items.length === 0) {
        container.innerHTML = '<tr><td colspan="10" class="empty-state"><i class="fa-solid fa-certificate"></i><h4>Belum ada sertifikat</h4><p>Tambahkan data sertifikat digital</p></td></tr>';
        return;
      }
      
      // Helper function untuk sertifikat status badge
      function getSertifikatStatusBadge(status, id) {
        var s = (status || 'valid').toLowerCase();
        var colors = {
          'valid': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
          'invalid': 'bg-red-500/20 text-red-400 border-red-500/30',
          'pending': 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        };
        var cls = colors[s] || colors['valid'];
        var labels = {
          'valid': '✓ Valid',
          'invalid': '✗ Invalid',
          'pending': '⏳ Pending'
        };
        return '<span class="status-badge ' + cls + '" onclick="updateSertifikatStatus(' + id + ',\'' + s + '\')" style="cursor:pointer;padding:2px 8px;border-radius:9999px;font-size:10px;border:1px solid;font-weight:600;">' + (labels[s] || s) + '</span>';
      }
      
      container.innerHTML = items.map(function(item, idx) {
        return '<tr class="admin-row-animate" style="animation-delay:' + (idx * 50) + 'ms">' +
          '<td class="px-2 py-2 font-mono text-[10px] text-yellow-400">' + (item.nomorSertifikat || '-') + '</td>' +
          '<td class="px-2 py-2 font-medium">' + item.namaLengkap + '</td>' +
          '<td class="px-2 py-2 text-[10px]">' + (item.nik || '-') + '</td>' +
          '<td class="px-2 py-2 max-w-[100px] truncate" title="' + (item.penyelenggara || '') + '">' + (item.penyelenggara || '-') + '</td>' +
          '<td class="px-2 py-2 max-w-[120px] truncate" title="' + (item.namaKegiatan || '') + '">' + item.namaKegiatan + '</td>' +
          '<td class="px-2 py-2 text-[10px] whitespace-nowrap">' + (item.tanggalPelaksanaan ? formatDateIndo(item.tanggalPelaksanaan) : '<span class="text-slate-500">-</span>') + '</td>' +
          '<td class="px-2 py-2 text-[10px] whitespace-nowrap">' + formatDateIndo(item.tanggalTerbit) + '</td>' +
          // Status Column
          '<td class="px-2 py-2">' + getSertifikatStatusBadge(item.status, item.id) + '</td>' +
          '<td class="px-2 py-2 text-center">' + (item.linkSertifikat ? '<a href="' + item.linkSertifikat + '" target="_blank" class="text-teal-400 hover:text-teal-300" title="Download Sertifikat"><i class="fa-solid fa-file-pdf"></i></a>' : '<span class="text-slate-500">-</span>') + '</td>' +
          '<td class="px-2 py-2"><div class="action-cell flex gap-1 justify-end">' +
            '<button onclick="viewSertifikatDetail(' + item.id + ')" class="btn-crud btn-view btn-icon" title="Lihat"><i class="fa-solid fa-eye"></i></button>' +
            '<button onclick="showEditSertifikatModal(' + item.id + ')" class="btn-crud btn-edit btn-icon" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
            (item.linkSertifikat ? '<a href="' + item.linkSertifikat + '" target="_blank" class="btn-crud btn-export btn-icon" title="Unduh"><i class="fa-solid fa-download"></i></a>' : '') +
            '<button onclick="confirmDeleteSertifikat(' + item.id + ')" class="btn-crud btn-delete btn-icon" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }
    
    /* ============================================
         SEARCH/FILTER FOR ADMIN TABLES
      ============================================ */
    
    function filterAdminTable(type) {
      var searchInput = document.getElementById('search' + type.charAt(0).toUpperCase() + type.slice(1));
      if(!searchInput) return;
      
      var query = searchInput.value.toLowerCase().trim();
      
      // This is a simple client-side filter implementation
      // For production, consider server-side filtering
      switch(type) {
        case 'usulan':
          var filtered = publicData.formulirAdmin.filter(function(item) {
            return !query || 
              (item.nomorRegistrasi && item.nomorRegistrasi.toLowerCase().includes(query)) ||
              (item.namaPengusul && item.namaPengusul.toLowerCase().includes(query)) ||
              (item.namaKegiatan && item.namaKegiatan.toLowerCase().includes(query)) ||
              (item.status && item.status.toLowerCase().includes(query));
          });
          renderFilteredUsulan(filtered);
          break;
        case 'pengumuman':
          var filteredP = publicData.pengumuman.filter(function(item) {
            return !query || 
              (item.judul && item.judul.toLowerCase().includes(query)) ||
              (item.isi && item.isi.toLowerCase().includes(query));
          });
          renderFilteredPengumuman(filteredP);
          break;
        case 'jadwal':
          var filteredJ = publicData.jadwal.filter(function(item) {
            return !query || 
              (item.namaKegiatan && item.namaKegiatan.toLowerCase().includes(query)) ||
              (item.tempat && item.tempat.toLowerCase().includes(query)) ||
              (item.pic && item.pic.toLowerCase().includes(query));
          });
          renderFilteredJadwal(filteredJ);
          break;
        case 'sertifikat':
          var filteredS = allSertifikat.filter(function(item) {
            return !query || 
              (item.nomorSertifikat && item.nomorSertifikat.toLowerCase().includes(query)) ||
              (item.namaLengkap && item.namaLengkap.toLowerCase().includes(query)) ||
              (item.namaKegiatan && item.namaKegiatan.toLowerCase().includes(query));
          });
          renderFilteredSertifikat(filteredS);
          break;
      }
    }
    
    function renderFilteredUsulan(items) {
      var tbody = document.getElementById('adminUsulanTable');
      if(!tbody) return;
      
      if(items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="empty-state"><i class="fa-solid fa-search"></i><h4>Tidak ada hasil</h4><p>Coba gunakan kata kunci lain</p></td></tr>';
        return;
      }
      
      tbody.innerHTML = items.map(function(item) {
        var statusClass = item.status === 'Disetujui' ? 'status-approved' : 
                         item.status === 'Ditolak' ? 'status-rejected' : 'status-pending';
        return '<tr class="admin-row-animate">' +
          '<td class="px-2 py-2 font-mono text-[10px] text-teal-400">' + (item.nomorRegistrasi || '-') + '</td>' +
          '<td class="px-2 py-2 font-medium">' + item.namaPengusul + '</td>' +
          '<td class="px-2 py-2 text-[10px]">' + (item.nik || '-') + '</td>' +
          '<td class="px-2 py-2 max-w-[80px] truncate">' + (item.asalInstitusi || '-') + '</td>' +
          '<td class="px-2 py-2 text-[10px]">' + (item.telpon || '-') + '</td>' +
          '<td class="px-2 py-2 max-w-[100px] truncate">' + item.namaKegiatan + '</td>' +
          '<td class="px-2 py-2 max-w-[70px] truncate">' + (item.tempatKegiatan || '-') + '</td>' +
          '<td class="px-2 py-2 text-[10px]">' + formatDateIndo(item.tanggalPelaksanaan) + '</td>' +
          '<td class="px-2 py-2 text-[10px]">' + (item.waktuPelaksanaan || '-') + '</td>' +
          '<td class="px-2 py-2 text-center text-[10px]">' + (item.jumlahPeserta || '-') + '</td>' +
          '<td class="px-2 py-2"><span class="status-badge ' + statusClass + '">' + item.status + '</span></td>' +
          '<td class="px-2 py-2"><div class="action-cell flex gap-1 justify-end">' +
            '<button onclick="viewUsulanDetail(' + item.id + ')" class="btn-crud btn-view btn-icon" title="Lihat Detail"><i class="fa-solid fa-eye"></i></button>' +
            '<button onclick="showEditUsulanModal(' + item.id + ')" class="btn-crud btn-edit btn-icon" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
            '<button onclick="showUpdateStatusModal(' + item.id + ')" class="btn-crud btn-approve btn-icon" title="Update Status"><i class="fa-solid fa-arrows-rotate"></i></button>' +
            '<button onclick="confirmDeleteUsulan(' + item.id + ')" class="btn-crud btn-delete btn-icon" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }
    
    function renderFilteredPengumuman(items) {
      var tbody = document.getElementById('adminPengumumanTable');
      if(!tbody) return;
      
      if(items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" class="empty-state"><i class="fa-solid fa-search"></i><h4>Tidak ada hasil</h4><p>Coba gunakan kata kunci lain</p></td></tr>';
        return;
      }
      
      tbody.innerHTML = items.map(function(item) {
        var isiPreview = (item.isi || '').substring(0, 80) + ((item.isi || '').length > 80 ? '...' : '');
        return '<tr class="admin-row-animate">' +
          '<td class="px-3 py-2 font-mono text-[10px]">' + item.id + '</td>' +
          '<td class="px-3 py-2 font-medium">' + item.judul + '</td>' +
          '<td class="px-3 py-2 text-[10px]">' + formatDateIndo(item.tanggal) + '</td>' +
          '<td class="px-3 py-2 text-[10px] text-slate-400 max-w-[300px] truncate">' + isiPreview + '</td>' +
          '<td class="px-3 py-2"><div class="action-cell flex gap-1 justify-end">' +
            '<button onclick="viewPengumumanDetail(' + item.id + ')" class="btn-crud btn-view btn-icon" title="Lihat"><i class="fa-solid fa-eye"></i></button>' +
            '<button onclick="showEditPengumumanModal(' + item.id + ')" class="btn-crud btn-edit btn-icon" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
            '<button onclick="confirmDeletePengumuman(' + item.id + ')" class="btn-crud btn-delete btn-icon" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }
    
    function renderFilteredJadwal(items) {
      var container = document.getElementById('adminJadwalTable');
      if(!container) return;
      
      if(items.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-search"></i><h4>Tidak ada hasil</h4><p>Coba gunakan kata kunci lain</p></div>';
        return;
      }
      
      container.innerHTML = items.map(function(item) {
        return '<tr class="admin-row-animate">' +
          // Kolom 1: Nama Kegiatan
          '<td class="px-3 py-2 font-medium max-w-[180px] truncate" title="' + (item.namaKegiatan || '') + '">' + (item.namaKegiatan || '-') + '</td>' +
          // Kolom 2: Tempat
          '<td class="px-3 py-2 text-slate-400 max-w-[100px] truncate" title="' + (item.tempat || '') + '">' + (item.tempat || '-') + '</td>' +
          // Kolom 3: PIC
          '<td class="px-3 py-2 text-[10px] whitespace-nowrap">' + (item.pic || '-') + '</td>' +
          // Kolom 4: Tanggal
          '<td class="px-3 py-2 text-[10px] whitespace-nowrap">' + formatDateIndo(item.tanggal) + '</td>' +
          // Kolom 5: Waktu
          '<td class="px-3 py-2 text-[10px] whitespace-nowrap">' + (item.waktu || '-') + '</td>' +
          // Kolom 6: Keterangan
          '<td class="px-3 py-2 text-[10px] text-slate-400 max-w-[150px] truncate" title="' + (item.keterangan || '') + '">' + (item.keterangan || '-') + '</td>' +
          // Kolom 7: Aksi
          '<td class="px-3 py-2"><div class="action-cell flex gap-1 justify-end">' +
            '<button onclick="viewJadwalDetail(' + item.id + ')" class="btn-crud btn-view btn-icon" title="Lihat Detail"><i class="fa-solid fa-eye"></i></button>' +
            '<button onclick="showEditJadwalModal(' + item.id + ')" class="btn-crud btn-edit btn-icon" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>' +
            '<button onclick="confirmDeleteJadwal(' + item.id + ')" class="btn-crud btn-delete btn-icon" title="Hapus"><i class="fa-solid fa-trash-can"></i></button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }
    
    function renderFilteredSertifikat(items) {
      var container = document.getElementById('adminSertifikatTable');
      if(!container) return;
      
      if(items.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-search"></i><h4>Tidak ada hasil</h4><p>Coba gunakan kata kunci lain</p></div>';
        return;
      }
      
      container.innerHTML = items.map(function(item) {
        return '<tr class="admin-row-animate">' +
          '<td class="px-2 py-2 font-mono text-[10px] text-yellow-400">' + (item.nomorSertifikat || '-') + '</td>' +
          '<td class="px-2 py-2 font-medium">' + item.namaLengkap + '</td>' +
          '<td class="px-2 py-2 text-[10px]">' + (item.nik || '-') + '</td>' +
          '<td class="px-2 py-2">' + (item.penyelenggara || '-') + '</td>' +
          '<td class="px-2 py-2 max-w-[120px] truncate">' + item.namaKegiatan + '</td>' +
          '<td class="px-2 py-2 text-[10px]">' + formatDateIndo(item.tanggalTerbit) + '</td>' +
          '<td class="px-2 py-2 text-center">' + (item.linkSertifikat ? '<a href="' + item.linkSertifikat + '" target="_blank" class="text-teal-400"><i class="fa-solid fa-file-pdf"></i></a>' : '-') + '</td>' +
          '<td class="px-2 py-2"><div class="action-cell flex gap-1 justify-end">' +
            '<button onclick="viewSertifikatDetail(' + item.id + ')" class="btn-crud btn-view btn-icon" title="Lihat"><i class="fa-solid fa-eye"></i></button>' +
            '<button onclick="showEditSertifikatModal(' + item.id + ')" class="btn-crud btn-edit btn-icon" title="Edit"><i class="fa-solid fa-pen"></i></button>' +
            (item.linkSertifikat ? '<a href="' + item.linkSertifikat + '" target="_blank" class="btn-crud btn-export btn-icon" title="Unduh"><i class="fa-solid fa-download"></i></a>' : '') +
            '<button onclick="confirmDeleteSertifikat(' + item.id + ')" class="btn-crud btn-delete btn-icon" title="Hapus"><i class="fa-solid fa-trash"></i></button>' +
          '</div></td>' +
        '</tr>';
      }).join('');
    }


/* ============================================
         FORM HANDLERS
      ============================================ */

    function submitFormHandler(e) {
      e.preventDefault();
      var formData = {
        nik: document.getElementById('nik').value.trim(),
        namaPengusul: document.getElementById('namaPengusul').value.trim(),
        asalInstitusi: document.getElementById('asalInstitusi').value.trim(),
        telpon: document.getElementById('telpon').value.trim(),
        namaKegiatan: document.getElementById('namaKegiatan').value.trim(),
        tempatKegiatan: document.getElementById('tempatKegiatan').value.trim(),
        tanggalKegiatan: document.getElementById('tanggalKegiatan').value,
        waktuPelaksanaan: document.getElementById('waktuPelaksanaan').value.trim(),
        jumlahPeserta: document.getElementById('jumlahPeserta').value,
        linkSpreadsheetPeserta: document.getElementById('linkSpreadsheetPeserta').value.trim(),
        linkSuratTugas: document.getElementById('linkSuratTugas').value.trim(),
        linkDokumentasiFoto: document.getElementById('linkDokumentasiFoto').value.trim(),
        linkDokumentasiVideo: document.getElementById('linkDokumentasiVideo').value.trim(),
        linkSuratPemberitahuan: document.getElementById('linkSuratPemberitahuan').value.trim(),
        linkDaftarHadir: document.getElementById('linkDaftarHadir').value.trim(),
        linkBeritaAcara: document.getElementById('linkBeritaAcara').value.trim()
      };
      if(!formData.nik || !formData.namaPengusul || !formData.asalInstitusi || !formData.telpon || !formData.namaKegiatan || !formData.tempatKegiatan || !formData.tanggalKegiatan || !formData.waktuPelaksanaan || !formData.jumlahPeserta) {
        showToast('Harap isi semua field wajib!', 'warning'); return false;
      }
      if(formData.nik.length !== 16) { showToast('NIK harus 16 digit!', 'warning'); return false; }
      showLoading(true);
      submitFormUsulan(formData).then(function(result) {
        showLoading(false);
        if(result.success) {
          showToast(result.message + ' No.Reg: ' + result.data.nomorRegistrasi, 'success');
          document.getElementById('formUsulan').reset();
        } else { showToast(result.message || 'Gagal mengirim usulan', 'error'); }
      });
      return false;
    }

    function handleCheckStatus() {
      var query = document.getElementById('statusQuery').value.trim();
      
      if (!query) {
        showToast('Masukkan NIK atau nomor registrasi!', 'warning');
        return;
      }
      
      showLoading(true);
      
      checkStatusUsulan(query).then(function(result) {
        showLoading(false);
        
        var container = document.getElementById('statusResult');
        if (!container) return;
        
        if (result.success) {
          renderStatusResult(result.data);
        } else {
          container.innerHTML = `
            <div class="glass rounded-xl p-6 text-center">
              <div class="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-4">
                <i class="fa-solid fa-exclamation-circle text-red-400 text-2xl"></i>
              </div>
              <p class="text-red-400 font-medium">${result.message}</p>
              <p class="text-sm text-slate-400 mt-2">Pastikan data yang Anda masukkan sudah benar</p>
            </div>
          `;
          container.classList.remove('hidden');
        }
      });
    }

    /* ============================================
         ADMIN FUNCTIONS
      ============================================ */

    async function handleAdminLogin() {
      var user = document.getElementById('adminUser').value.trim();
      var pass = document.getElementById('adminPass').value;
      if(!user || !pass) { showToast('Isi username & password!', 'warning'); return; }
      showLoading(true);
      try {
        var { data, error } = await supabase.rpc('admin_login', { p_username: user, p_password: pass });
        if(error) throw error;
        if(data && data.length > 0 && data[0].success) {
          adminToken = data[0].admin_data;
          document.getElementById('adminLoginSection').classList.add('hidden');
          document.getElementById('adminDashboard').classList.remove('hidden');
          showToast('Login berhasil! Selamat datang, ' + adminToken.nama_lengkap, 'success');
          loadAdminData();
        } else { showToast('Username atau password salah!', 'error'); }
      } catch(e) { showToast('Error: ' + e.message, 'error'); }
      showLoading(false);
    }

    function handleAdminLogout() {
      adminToken = null;
      document.getElementById('adminLoginSection').classList.remove('hidden');
      document.getElementById('adminDashboard').classList.add('hidden');
      document.getElementById('adminUser').value = '';
      document.getElementById('adminPass').value = '';
      showToast('Berhasil logout', 'info');
    }

    function switchAdminTab(tab) {
      adminCurrentTab = tab;
      document.querySelectorAll('.admin-tab').forEach(function(t){ t.classList.remove('active'); });
      event.target.classList.add('active');
      document.querySelectorAll('[id^="adminTab-"]').forEach(function(t){ t.classList.add('hidden'); });
      document.getElementById('adminTab-'+tab).classList.remove('hidden');
      if(tab === 'usulan') loadAdminUsulan();
      if(tab === 'pengumuman') loadAdminPengumuman();
      if(tab === 'jadwal') loadAdminJadwal();
      if(tab === 'sertifikat') loadAdminSertifikat();
    }

    // NOTE: loadAdminUsulan() is defined above at line 5133 with FULL CRUD support
    // DO NOT add simplified version here - it breaks the complete functionality!
    // The full version includes: 12 columns, View/Edit/Status/Delete buttons, proper data mapping

    // NOTE: Functions loadAdminPengumuman, loadAdminJadwal, loadAdminSertifikat
    // are defined above with FULL CRUD support (lines 5200-5350)
    // DO NOT add simplified versions here - they break the CRUD functionality!

    async function loadAdminData() {
      loadAdminUsulan();
      loadAdminPengumuman();
      loadAdminJadwal();
      loadAdminSertifikat();
    }

    // NOTE: Obsolete Usulan functions removed:
    // - openUpdateStatus(nomor) → replaced by showUpdateStatusModal(id) at line 4729
    // - confirmUpdateStatus() → replaced by submitStatusUpdate(e) at line 4742
    // - deleteUsulan(nomor) → replaced by confirmDeleteUsulan(id) at line 4707
    // All now use ID-based approach with proper lightbox modals

    async function deletePengumuman(id) {
      showConfirm('Hapus pengumuman ini?', async function() {
        showLoading(true);
        try {
          var { error } = await supabase.from('pengumuman').delete().eq('id', id);
          if(error) throw error;
          showToast('Pengumuman dihapus!', 'success'); loadAdminPengumuman();
        } catch(e) { showToast('Error: ' + e.message, 'error'); }
        showLoading(false);
      });
    }

    async function deleteJadwal(id) {
      showConfirm('Hapus jadwal ini?', async function() {
        showLoading(true);
        try {
          var { error } = await supabase.from('jadwal_kegiatan').delete().eq('id', id);
          if(error) throw error;
          showToast('Jadwal dihapus!', 'success'); loadAdminJadwal();
        } catch(e) { showToast('Error: ' + e.message, 'error'); }
        showLoading(false);
      });
    }

    async function deleteSertifikat(id) {
      showConfirm('Hapus sertifikat ini?', async function() {
        showLoading(true);
        try {
          var { error } = await supabase.from('sertifikat').delete().eq('id', id);
          if(error) throw error;
          showToast('Sertifikat dihapus!', 'success'); loadAdminSertifikat();
        } catch(e) { showToast('Error: ' + e.message, 'error'); }
        showLoading(false);
      });
    }

    /* ============================================
         STATUS UPDATE FUNCTIONS
         Ubah status langsung dari tabel
      ============================================ */
    
    /**
     * Update Status Pengumuman (Aktif/Nonaktif)
     * @param {number} id - ID pengumuman
     * @param {string} currentStatus - Status saat ini
     */
    async function updatePengumumanStatus(id, currentStatus) {
      var newStatus = currentStatus === 'aktif' ? 'nonaktif' : 'aktif';
      
      showLoading(true);
      try {
        var { error } = await supabase.from('pengumuman')
          .update({ status: newStatus })
          .eq('id', id);
        
        if(error) throw error;
        
        showToast('Status pengumuman diperbarui: ' + newStatus, 'success');
        loadAdminPengumuman();
      } catch(err) {
        showToast('Gagal update status: ' + err.message, 'error');
      }
      showLoading(false);
    }
    
    /**
     * Update Status Jadwal Kegiatan
     * @param {number} id - ID jadwal
     * @param {string} currentStatus - Status saat ini
     */
    async function updateJadwalStatus(id, currentStatus) {
      var statuses = ['terjadwal', 'berlangsung', 'selesai', 'dibatalkan'];
      var currentIndex = statuses.indexOf(currentStatus);
      var newIndex = (currentIndex + 1) % statuses.length;
      var newStatus = statuses[newIndex];
      
      showLoading(true);
      try {
        var { error } = await supabase.from('jadwal_kegiatan')
          .update({ status: newStatus })
          .eq('id', id);
        
        if(error) throw error;
        
        showToast('Status jadwal: ' + newStatus, 'success');
        loadAdminJadwal();
      } catch(err) {
        showToast('Gagal update status: ' + err.message, 'error');
      }
      showLoading(false);
    }
    
    /**
     * Update Status Sertifikat (Valid/Tidak Valid)
     * @param {number} id - ID sertifikat
     * @param {string} currentStatus - Status saat ini
     */
    async function updateSertifikatStatus(id, currentStatus) {
      var newStatus = currentStatus === 'valid' ? 'invalid' : 'valid';
      
      showLoading(true);
      try {
        var { error } = await supabase.from('sertifikat')
          .update({ status: newStatus })
          .eq('id', id);
        
        if(error) throw error;
        
        showToast('Status sertifikat: ' + newStatus, 'success');
        loadAdminSertifikat();
      } catch(err) {
        showToast('Gagal update status: ' + err.message, 'error');
      }
      showLoading(false);
    }
    
    /**
     * Quick Status Toggle Helper
     * Fungsi universal untuk toggle status
     */
    async function quickStatusToggle(table, id, currentStatus, statusOptions) {
      if(!statusOptions) {
        // Default toggle untuk aktif/nonaktif
        statusOptions = ['aktif', 'nonaktif'];
      }
      
      var currentIndex = statusOptions.indexOf(currentStatus);
      var newStatus = statusOptions[(currentIndex + 1) % statusOptions.length];
      
      showLoading(true);
      try {
        var { error } = await supabase.from(table)
          .update({ status: newStatus })
          .eq('id', id);
        
        if(error) throw error;
        
        showToast('Status berhasil diubah!', 'success');
        
        // Reload sesuai tabel
        switch(table) {
          case 'pengumuman': loadAdminPengumuman(); break;
          case 'jadwal_kegiatan': loadAdminJadwal(); break;
          case 'sertifikat': loadAdminSertifikat(); break;
          default: break;
        }
      } catch(err) {
        showToast('Error: ' + err.message, 'error');
      }
      showLoading(false);
    }

    /* ============================================
         NOTE: Generic Modal functions removed
         Complete CRUD functions (showAdd*Modal) 
         are defined above with lightbox forms
         (lines 4768-5100)
      ============================================ */
    
    // Export function kept for compatibility
    function exportData(type) {
      showToast('Fitur export segera hadir!', 'info');
    }

    /* ============================================
         INITIALIZATION
      ============================================ */

    // Landing Page Timer
    function startLandingTimer() {
      setTimeout(function() {
        var progress = document.getElementById('landingProgress');
        if(progress) progress.style.width = '100%';
      }, 100);
      
      setTimeout(function() {
        var landing = document.getElementById('landingPage');
        if(landing) {
          landing.style.animation = 'landingExit 0.5s ease forwards';
          setTimeout(function() {
            landing.style.display = 'none';
            initializeApp();
          }, 500);
        }
      }, 3000);
    }

    /* ============================================
       DASHBOARD STAT LIGHTBOX FUNCTIONS
       Shows source data info (non-sensitive)
       ============================================ */
    
    // Store current stat context for navigation
    var currentLightboxStat = null;
    
    // Color mapping for stats
    var statColors = {
      teal: { bg: 'bg-teal-500/10', text: 'text-teal-400', gradient: 'from-teal-500 to-emerald-500' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', gradient: 'from-amber-500 to-orange-500' },
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', gradient: 'from-emerald-500 to-green-500' },
      red: { bg: 'bg-red-500/10', text: 'text-red-400', gradient: 'from-red-500 to-rose-500' }
    };
    
    // Source data configuration (NON-SENSITIVE only)
    var statSourceConfig = {
      totalUsulan: {
        table: 'formulir_usulan',
        queryType: 'COUNT(*)',
        filter: 'Semua Record',
        description: 'Total jumlah usulan masuk dari formulir pengajuan'
      },
      menunggu: {
        table: 'formulir_usulan',
        queryType: 'COUNT(*) WHERE',
        filter: "status = 'Menunggu Verifikasi'",
        description: 'Usulan yang belum diverifikasi oleh admin'
      },
      disetujui: {
        table: 'formulir_usulan',
        queryType: 'COUNT(*) WHERE',
        filter: "status = 'Disetujui'",
        description: 'Usulan yang telah disetujui dan dapat diproses'
      },
      ditolak: {
        table: 'formulir_usulan',
        queryType: 'COUNT(*) WHERE',
        filter: "status = 'Ditolak'",
        description: 'Usulan yang ditolak karena tidak memenuhi syarat'
      }
    };
    
    /**
     * Show Dashboard Stat Lightbox
     * @param {string} statId - ID statistik (totalUsulan, menunggu, disetujui, ditolak)
     * @param {string} label - Label tampilan
     * @param {string} iconClass - Icon FontAwesome
     * @param {string} color - Warna tema (teal, amber, emerald, red)
     */
    function showDashboardLightbox(statId, label, iconClass, color) {
      var lightbox = document.getElementById('dashboardStatLightbox');
      if (!lightbox) return;
      
      // Get current value
      var valueEl = document.getElementById('stat-' + statId);
      var currentValue = valueEl ? valueEl.textContent : '0';
      
      // Set current stat context
      currentLightboxStat = statId;
      
      // Get source config
      var config = statSourceConfig[statId] || {};
      var colors = statColors[color] || statColors.teal;
      
      // Update lightbox content
      document.getElementById('lightbox-stat-title').textContent = 'Detail: ' + label;
      document.getElementById('lightbox-stat-value').textContent = currentValue;
      document.getElementById('lightbox-stat-label').textContent = label;
      
      // Update icon
      var iconContainer = document.getElementById('lightbox-stat-icon');
      iconContainer.className = 'lightbox-stat-icon ' + colors.bg;
      iconContainer.innerHTML = '<i class="fa-solid ' + iconClass + ' ' + colors.text + '"></i>';
      
      // Update source info (NON-SENSITIVE DATA ONLY)
      document.getElementById('lightbox-source-table').textContent = config.table || '-';
      document.getElementById('lightbox-source-query').textContent = config.queryType || '-';
      document.getElementById('lightbox-source-filter').textContent = config.filter || '-';
      document.getElementById('lightbox-source-updated').textContent = formatUpdateTime();
      
      // Show lightbox
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
    
    /**
     * Close Dashboard Stat Lightbox
     */
    function closeDashboardLightbox(event) {
      // Allow close if clicking backdrop or close button
      if (event && event.target !== event.currentTarget && !event.target.closest('button')) {
        return;
      }
      
      var lightbox = document.getElementById('dashboardStatLightbox');
      if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
    
    /**
     * Format update time for display
     */
    function formatUpdateTime() {
      var now = new Date();
      return now.toLocaleDateString('id-ID', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    
    /**
     * Navigate from lightbox to detail page
     */
    function navigateFromLightbox() {
      closeDashboardLightbox();
      
      // Navigate based on current stat
      if (currentLightboxStat) {
        // All usulan-related stats go to admin panel
        navigateTo('admin');
        
        // Switch to usulan tab after a short delay
        setTimeout(function() {
          switchAdminTab('usulan');
        }, 300);
      }
    }
    
    // Close lightbox on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') {
        closeDashboardLightbox({ target: document.getElementById('dashboardStatLightbox') });
      }
    });

    async function initializeApp() {
      console.log('[DEDIKASIH] Initializing app...');
      
      // Initialize helpers
      initTailwind();
      initFormHelpers();
      
      // Load saved theme - apply correctly based on saved preference
      var savedTheme = localStorage.getItem('dedikasi_dark');
      var html = document.documentElement;
      var body = document.getElementById('mainBody');
      
      if(savedTheme === '0') {
        // User prefers LIGHT mode - remove dark classes
        html.classList.remove('dark');
        if(body) {
          body.classList.remove('bg-slate-950', 'text-slate-200', 'dark');
          body.classList.add('bg-gradient-to-br', 'from-slate-100', 'to-slate-200', 'text-slate-800');
        }
        var icon = document.getElementById('themeIcon');
        var iconMobile = document.getElementById('themeIconMobile');
        if(icon) icon.className = 'fa-solid fa-sun text-amber-500';
        if(iconMobile) iconMobile.className = 'fa-solid fa-sun text-amber-500';
        console.log('[DEDIKASIH] Theme initialized: Light');
      } else {
        // Default DARK mode
        console.log('[DEDIKASIH] Theme initialized: Dark');
      }
      
      // Connect to Supabase
      var connected = await initSupabase();
      updateDBStatus(connected);
      
      // Load initial data
      if(connected) {
        loadDashboard();
        // Preload other data in background
        getAllSertifikat().then(function(r) { if(r.success) allSertifikat = r.data; });
      }
      
      console.log('[DEDIKASIH] App initialized!');
    }

    // Update DB Status Indicator
    function updateDBStatus(connected) {
      var indicator = document.getElementById('dbStatusIndicator');
      var desktop = document.getElementById('dbStatusDesktop');
      var statusHtml = connected 
        ? '<span class="w-2 h-2 rounded-full bg-emerald-500"></span><span>Connected</span>'
        : '<span class="w-2 h-2 rounded-full bg-red-500"></span><span>Offline</span>';
      
      if(indicator) indicator.innerHTML = statusHtml;
      if(desktop) desktop.innerHTML = statusHtml;
    }

    // Handle resize events
    window.addEventListener('resize', function() {
      if(window.innerWidth >= 1024 && sidebarOpen) {
        toggleSidebar();
      }
    });

    // Handle back button on mobile
    window.addEventListener('popstate', function() {
      if(sidebarOpen) toggleSidebar();
    });

    // Start the app
    document.addEventListener('DOMContentLoaded', function() {
      startLandingTimer();
    });
  