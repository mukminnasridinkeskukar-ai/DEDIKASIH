/* DEDIKASIH - CRUD ADMIN: modal tambah/edit/lihat + simpan + hapus (usulan, pengumuman, jadwal, sertifikat) (dipecah dari index.html agar lebih ringan) */

/* ============================================
         ADMIN CRUD - GLOBAL VARIABLES
      ============================================ */
    var currentEditId = null;
    var currentEditType = null;
    var deleteCallback = null;
    var currentViewId = null;

    /* ============================================
         LIGHTBOX HELPER FUNCTIONS
      ============================================ */
    
    function openLightbox(id) {
      var lb = document.getElementById(id);
      if(lb) {
        lb.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
    
    function closeLightbox(id) {
      var lb = document.getElementById(id);
      if(lb) {
        lb.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
    
    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
      if(e.key === 'Escape') {
        document.querySelectorAll('.lightbox-overlay.active').forEach(function(lb) {
          lb.classList.remove('active');
        });
        document.body.style.overflow = '';
      }
    });

    /* ============================================
         CRUD: USULAN FUNCTIONS
      ============================================ */
    
    function showAddUsulanModal() {
      currentEditType = 'create';
      currentEditId = null;
      
      // Reset form
      document.getElementById('usulanForm').reset();
      document.getElementById('usulanId').value = '';
      document.getElementById('usulanLightboxTitle').textContent = 'Tambah Usulan Baru';
      document.getElementById('usulanLightboxIcon').className = 'fa-solid fa-file-lines';
      
      openLightbox('lightboxUsulan');
    }
    
    function showEditUsulanModal(id) {
      currentEditType = 'edit';
      currentEditId = id;
      
      // Find the item data
      var item = publicData.formulirAdmin.find(function(u) { return u.id == id; });
      if(!item) {
        showToast('Data tidak ditemukan!', 'error');
        return;
      }
      
      // Fill form with existing data
      document.getElementById('usulanId').value = item.id;
      document.getElementById('usulanNama').value = item.namaPengusul || '';
      document.getElementById('usulanNIK').value = item.nik || '';
      document.getElementById('usulanInstitusi').value = item.asalInstitusi || '';
      document.getElementById('usulanTelepon').value = item.telpon || '';
      document.getElementById('usulanKegiatan').value = item.namaKegiatan || '';
      document.getElementById('usulanTempat').value = item.tempatKegiatan || '';
      document.getElementById('usulanTanggal').value = formatDateISO(item.tanggalPelaksanaan || item.tanggalKegiatan);
      document.getElementById('usulanWaktu').value = item.waktuPelaksanaan || '';
      document.getElementById('usulanPeserta').value = item.jumlahPeserta || '';
      
      // Populate documentation link fields
      document.getElementById('usulanLinkSpreadsheet').value = item.linkSpreadsheetPeserta || '';
      document.getElementById('usulanLinkSuratTugas').value = item.linkSuratTugas || '';
      document.getElementById('usulanLinkFoto').value = item.linkDokumentasiFoto || '';
      document.getElementById('usulanLinkVideo').value = item.linkDokumentasiVideo || '';
      document.getElementById('usulanLinkPemberitahuan').value = item.linkSuratPemberitahuan || '';
      document.getElementById('usulanLinkDaftarHadir').value = item.linkDaftarHadir || '';
      document.getElementById('usulanLinkBeritaAcara').value = item.linkBeritaAcara || '';
      
      document.getElementById('usulanLightboxTitle').textContent = 'Edit Usulan';
      document.getElementById('usulanLightboxIcon').className = 'fa-solid fa-pen-to-square';
      
      openLightbox('lightboxUsulan');
    }
    
    function viewUsulanDetail(id) {
      var item = publicData.formulirAdmin.find(function(u) { return u.id == id; });
      if(!item) return;
      
      currentViewId = id;
      
      var statusClass = item.status === 'Disetujui' ? 'status-approved' : 
                       item.status === 'Ditolak' ? 'status-rejected' : 'status-pending';
      
      // Helper function to create file link button
      var makeFileLink = function(label, url, icon, type) {
        if (!url) return '';
        return '<a href="' + url + '" target="_blank" rel="noopener" class="file-link-btn ' + type + '">' +
               '<i class="' + icon + '"></i> ' + label + '</a>';
      };
      
      // Check if any documentation links exist
      var hasDocs = item.linkSpreadsheetPeserta || item.linkSuratTugas || 
                    item.linkDokumentasiFoto || item.linkDokumentasiVideo ||
                    item.linkSuratPemberitahuan || item.linkDaftarHadir || 
                    item.linkBeritaAcara;
      
      // Build documentation section HTML
      var docsHtml = '';
      if (hasDocs) {
        docsHtml = '<div class="file-link-section mt-4 pt-4 border-t border-slate-700/50">' +
          '<div class="file-link-title mb-3"><i class="fa-solid fa-paperclip"></i> Dokumen & Berkas Terkait</div>' +
          '<div class="file-link-grid">' +
            makeFileLink('Spreadsheet Peserta', item.linkSpreadsheetPeserta, 'fa-solid fa-table-cells', 'btn-sheet') +
            makeFileLink('Surat Tugas', item.linkSuratTugas, 'fa-solid fa-file-signature', 'btn-pdf') +
            makeFileLink('Dokumentasi Foto', item.linkDokumentasiFoto, 'fa-solid fa-images', 'btn-image') +
            makeFileLink('Dokumentasi Video', item.linkDokumentasiVideo, 'fa-solid fa-video', 'btn-video') +
            makeFileLink('Surat Pemberitahuan', item.linkSuratPemberitahuan, 'fa-solid fa-envelope', 'btn-pdf') +
            makeFileLink('Daftar Hadir', item.linkDaftarHadir, 'fa-solid fa-clipboard-user', 'btn-sheet') +
            makeFileLink('Berita Acara', item.linkBeritaAcara, 'fa-solid fa-file-lines', 'btn-pdf') +
          '</div></div>';
      } else {
        docsHtml = '<div class="file-link-section mt-4 pt-4 border-t border-slate-700/50">' +
          '<div class="no-file-links text-center py-3"><i class="fa-solid fa-folder-open mr-1"></i>Tidak ada dokumen terlampir</div></div>';
      }
      
      var html = '<div class="space-y-4">' +
        // Status Badge at top
        '<div class="flex justify-center"><span class="status-badge ' + statusClass + '">' +
          '<i class="fa-solid fa-circle-info"></i> ' + item.status + '</span></div>' +
        
        // Data Pengusul Section
        '<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-3">' +
          '<i class="fa-solid fa-user mr-1"></i>Data Pengusul</div>' +
        '<div class="detail-grid">' +
          '<div class="detail-item"><div class="detail-label">Nama Lengkap</div><div class="detail-value font-semibold">' + (item.namaPengusul || '-') + '</div></div>' +
          '<div class="detail-item"><div class="detail-label">NIK</div><div class="detail-value font-mono">' + (item.nik || '-') + '</div></div>' +
          '<div class="detail-item"><div class="detail-label">No. Registrasi</div><div class="detail-value font-mono text-teal-400">' + (item.nomorRegistrasi || '-') + '</div></div>' +
          '<div class="detail-item"><div class="detail-label">Asal Institusi</div><div class="detail-value">' + (item.asalInstitusi || '-') + '</div></div>' +
          '<div class="detail-item"><div class="detail-label">No. Telepon</div><div class="detail-value">' + (item.telpon || '-') + '</div></div>' +
        '</div>' +
        
        // Detail Kegiatan Section
        '<div class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 mt-4">' +
          '<i class="fa-solid fa-calendar-check mr-1"></i>Detail Kegiatan</div>' +
        '<div class="detail-grid">' +
          '<div class="detail-item"><div class="detail-label">Nama Kegiatan</div><div class="detail-value font-semibold text-emerald-400">' + (item.namaKegiatan || '-') + '</div></div>' +
          '<div class="detail-item"><div class="detail-label">Tempat</div><div class="detail-value">' + (item.tempatKegiatan || '-') + '</div></div>' +
          '<div class="detail-item"><div class="detail-label">Tanggal Pelaksanaan</div><div class="detail-value">' + formatDateIndo(item.tanggalPelaksanaan || item.tanggalKegiatan) + '</div></div>' +
          '<div class="detail-item"><div class="detail-label">Waktu</div><div class="detail-value">' + (item.waktuPelaksanaan || '-') + '</div></div>' +
          '<div class="detail-item"><div class="detail-label">Jumlah Peserta</div><div class="detail-value"><span class="bg-teal-500/20 text-teal-300 px-2 py-1 rounded-lg">' + (item.jumlahPeserta || '0') + ' orang</span></div></div>' +
        '</div>' +
        
        // Catatan Admin (if exists)
        (item.catatan ? '<div class="mt-4 pt-4 border-t border-slate-700/30">' +
          '<div class="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-2">' +
            '<i class="fa-solid fa-comment-dots mr-1"></i>Catatan Admin</div>' +
          '<div class="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-200">' + item.catatan + '</div></div>' : '') +
        
        // DOCUMENTATION LINKS SECTION - KEY FEATURE!
        docsHtml +
        
      '</div>';
      
      document.getElementById('viewUsulanContent').innerHTML = html;
      openLightbox('lightboxViewUsulan');
    }
    
    function editFromViewUsulan() {
      closeLightbox('lightboxViewUsulan');
      setTimeout(function() { showEditUsulanModal(currentViewId); }, 300);
    }
    
    async function submitUsulanForm(e) {
      e.preventDefault();
      
      showLoading(true);
      
      try {
        var formData = {
          nik: document.getElementById('usulanNIK').value,
          nama_pengusul: document.getElementById('usulanNama').value,
          asal_institusi: document.getElementById('usulanInstitusi').value,
          telpon: document.getElementById('usulanTelepon').value,
          nama_kegiatan: document.getElementById('usulanKegiatan').value,
          tempat_kegiatan: document.getElementById('usulanTempat').value,
          tanggal_pelaksanaan: document.getElementById('usulanTanggal').value,
          waktu_pelaksanaan: document.getElementById('usulanWaktu').value,
          jumlah_peserta: parseInt(document.getElementById('usulanPeserta').value) || 0,
          status: 'Menunggu Verifikasi',
          // Documentation Links - Complete Supabase Fields
          link_spreadsheet_peserta: document.getElementById('usulanLinkSpreadsheet').value || null,
          link_surat_tugas: document.getElementById('usulanLinkSuratTugas').value || null,
          link_dokumentasi_foto: document.getElementById('usulanLinkFoto').value || null,
          link_dokumentasi_video: document.getElementById('usulanLinkVideo').value || null,
          link_surat_pemberitahuan: document.getElementById('usulanLinkPemberitahuan').value || null,
          link_daftar_hadir: document.getElementById('usulanLinkDaftarHadir').value || null,
          link_berita_acara: document.getElementById('usulanLinkBeritaAcara').value || null
        };
        
        if(currentEditType === 'create') {
          var result = await submitFormUsulan(formData);
          if(result.success) {
            showToast('Usulan berhasil ditambahkan! No: ' + result.data.nomorRegistrasi, 'success');
            closeLightbox('lightboxUsulan');
            loadAdminUsulan();
          } else {
            showToast(result.message || 'Gagal menambahkan usulan', 'error');
          }
        } else {
          // Update existing
          var { error } = await supabase.from('formulir_usulan')
            .update(formData)
            .eq('id', currentEditId);
          
          if(error) throw error;
          showToast('Usulan berhasil diperbarui!', 'success');
          closeLightbox('lightboxUsulan');
          loadAdminUsulan();
        }
      } catch(err) {
        console.error('[DEDIKASIH] Error submitUsulanForm:', err);
        showToast('Terjadi kesalahan: ' + err.message, 'error');
      }
      
      showLoading(false);
    }
    
    function confirmDeleteUsulan(id) {
      var item = publicData.formulirAdmin.find(function(u) { return u.id == id; });
      if(!item) return;
      
      deleteCallback = async function() {
        showLoading(true);
        try {
          var { error } = await supabase.from('formulir_usulan').delete().eq('id', id);
          if(error) throw error;
          showToast('Usulan berhasil dihapus!', 'success');
          loadAdminUsulan();
        } catch(err) {
          showToast('Gagal menghapus: ' + err.message, 'error');
        }
        showLoading(false);
      };
      
      document.getElementById('deleteConfirmMessage').textContent = 'Apakah Anda yakin ingin menghapus usulan ini?';
      document.getElementById('deleteItemName').textContent = item.namaPengusul + ' - ' + item.namaKegiatan;
      openLightbox('lightboxConfirmDelete');
    }
    
    function showUpdateStatusModal(id) {
      var item = publicData.formulirAdmin.find(function(u) { return u.id == id; });
      if(!item) return;
      
      currentEditId = id;
      document.getElementById('statusUpdateId').value = id;
      document.getElementById('statusUpdateNomor').textContent = item.nomorRegistrasi || '-';
      document.getElementById('statusUpdateNewStatus').value = item.status || 'Menunggu Verifikasi';
      document.getElementById('statusUpdateCatatan').value = item.catatan || '';
      
      openLightbox('lightboxUpdateStatus');
    }
    
    async function submitStatusUpdate(e) {
      e.preventDefault();
      
      showLoading(true);
      try {
        var newStatus = document.getElementById('statusUpdateNewStatus').value;
        var catatan = document.getElementById('statusUpdateCatatan').value;
        
        var { error } = await supabase.from('formulir_usulan')
          .update({ status: newStatus, catatan: catatan })
          .eq('id', currentEditId);
        
        if(error) throw error;
        showToast('Status berhasil diupdate menjadi "' + newStatus + '"!', 'success');
        closeLightbox('lightboxUpdateStatus');
        loadAdminUsulan();
      } catch(err) {
        showToast('Gagal update status: ' + err.message, 'error');
      }
      showLoading(false);
    }

    /* ============================================
         CRUD: PENGUMUMAN FUNCTIONS
      ============================================ */
    
    function showAddPengumumanModal() {
      currentEditType = 'create';
      currentEditId = null;
      
      document.getElementById('pengumumanForm').reset();
      document.getElementById('pengumumanId').value = '';
      document.getElementById('pengumumanLightboxTitle').textContent = 'Tambah Pengumuman';
      document.getElementById('pengumumanLightboxIcon').className = 'fa-solid fa-bullhorn';
      document.getElementById('pengumumanTanggal').value = getTodayISO();
      
      openLightbox('lightboxPengumuman');
    }
    
    function showEditPengumumanModal(id) {
      currentEditType = 'edit';
      currentEditId = id;
      
      var item = publicData.pengumuman.find(function(p) { return p.id == id; });
      if(!item) return;
      
      document.getElementById('pengumumanId').value = item.id;
      document.getElementById('pengumumanJudul').value = item.judul || '';
      document.getElementById('pengumumanIsi').value = item.isi || '';
      document.getElementById('pengumumanTanggal').value = formatDateISO(item.tanggal);
      
      document.getElementById('pengumumanLightboxTitle').textContent = 'Edit Pengumuman';
      document.getElementById('pengumumanLightboxIcon').className = 'fa-solid fa-pen-to-square';
      
      openLightbox('lightboxPengumuman');
    }
    
    function viewPengumumanDetail(id) {
      var item = publicData.pengumuman.find(function(p) { return p.id == id; });
      if(!item) return;
      
      currentViewId = id;
      
      var html = '<div class="space-y-4">' +
        '<div class="detail-item"><div class="detail-label">Judul</div><div class="detail-value text-lg font-semibold text-teal-400">' + item.judul + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">Tanggal Publikasi</div><div class="detail-value">' + formatDateIndo(item.tanggal) + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">Isi Pengumuman</div><div class="detail-value whitespace-pre-wrap leading-relaxed">' + item.isi + '</div></div>' +
      '</div>';
      
      document.getElementById('viewPengumumanContent').innerHTML = html;
      openLightbox('lightboxViewPengumuman');
    }
    
    function editFromViewPengumuman() {
      closeLightbox('lightboxViewPengumuman');
      setTimeout(function() { showEditPengumumanModal(currentViewId); }, 300);
    }
    
    async function submitPengumumanForm(e) {
      e.preventDefault();
      showLoading(true);
      
      try {
        var data = {
          judul: document.getElementById('pengumumanJudul').value,
          isi: document.getElementById('pengumumanIsi').value,
          tanggal: document.getElementById('pengumumanTanggal').value || getTodayISO()
        };
        
        if(currentEditType === 'create') {
          var { error } = await supabase.from('pengumuman').insert(data);
          if(error) throw error;
          showToast('Pengumuman berhasil ditambahkan!', 'success');
        } else {
          var { error } = await supabase.from('pengumuman').update(data).eq('id', currentEditId);
          if(error) throw error;
          showToast('Pengumuman berhasil diperbarui!', 'success');
        }
        
        closeLightbox('lightboxPengumuman');
        loadAdminPengumuman();
      } catch(err) {
        showToast('Error: ' + err.message, 'error');
      }
      showLoading(false);
    }
    
    function confirmDeletePengumuman(id) {
      var item = publicData.pengumuman.find(function(p) { return p.id == id; });
      if(!item) return;
      
      deleteCallback = async function() {
        showLoading(true);
        try {
          var { error } = await supabase.from('pengumuman').delete().eq('id', id);
          if(error) throw error;
          showToast('Pengumuman berhasil dihapus!', 'success');
          loadAdminPengumuman();
        } catch(err) {
          showToast('Gagal hapus: ' + err.message, 'error');
        }
        showLoading(false);
      };
      
      document.getElementById('deleteConfirmMessage').textContent = 'Hapus pengumuman ini?';
      document.getElementById('deleteItemName').textContent = item.judul;
      openLightbox('lightboxConfirmDelete');
    }

    /* ============================================
         CRUD: JADWAL FUNCTIONS
      ============================================ */
    
    function showAddJadwalModal() {
      currentEditType = 'create';
      currentEditId = null;
      
      document.getElementById('jadwalForm').reset();
      document.getElementById('jadwalId').value = '';
      document.getElementById('jadwalLightboxTitle').textContent = 'Tambah Jadwal Kegiatan';
      document.getElementById('jadwalLightboxIcon').className = 'fa-solid fa-calendar-plus';
      
      openLightbox('lightboxJadwal');
    }
    
    function showEditJadwalModal(id) {
      currentEditType = 'edit';
      currentEditId = id;
      
      var item = publicData.jadwal.find(function(j) { return j.id == id; });
      if(!item) return;
      
      document.getElementById('jadwalId').value = item.id;
      document.getElementById('jadwalNamaKegiatan').value = item.namaKegiatan || '';
      document.getElementById('jadwalTempat').value = item.tempat || '';
      document.getElementById('jadwalPIC').value = item.pic || '';
      document.getElementById('jadwalTanggal').value = formatDateISO(item.tanggal);
      document.getElementById('jadwalWaktu').value = item.waktu || '';
      document.getElementById('jadwalKeterangan').value = item.keterangan || '';
      
      document.getElementById('jadwalLightboxTitle').textContent = 'Edit Jadwal';
      document.getElementById('jadwalLightboxIcon').className = 'fa-solid fa-pen-to-square';
      
      openLightbox('lightboxJadwal');
    }
    
    function viewJadwalDetail(id) {
      var item = publicData.jadwal.find(function(j) { return j.id == id; });
      if(!item) return;
      
      currentViewId = id;
      
      var html = '<div class="detail-grid">' +
        '<div class="detail-item"><div class="detail-label">Nama Kegiatan</div><div class="detail-value text-lg font-semibold text-teal-600">' + item.namaKegiatan + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">Tempat</div><div class="detail-value">' + (item.tempat || '-') + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">PIC</div><div class="detail-value">' + (item.pic || '-') + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">Tanggal</div><div class="detail-value">' + formatDateIndo(item.tanggal) + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">Waktu</div><div class="detail-value">' + (item.waktu || '-') + '</div></div>' +
        (item.keterangan ? '<div class="detail-item col-span-full"><div class="detail-label">Keterangan</div><div class="detail-value">' + item.keterangan + '</div></div>' : '') +
      '</div>';
      
      document.getElementById('viewJadwalContent').innerHTML = html;
      openLightbox('lightboxViewJadwal');
    }
    
    function editFromViewJadwal() {
      closeLightbox('lightboxViewJadwal');
      setTimeout(function() { showEditJadwalModal(currentViewId); }, 300);
    }
    
    // Fallback bila skema DB belum memiliki kolom tertentu (mis. 'pic' pada jadwal_kegiatan).
    // Mengembalikan payload tanpa kolom yang ditolak Supabase (error PGRST204), atau null bila tak relevan.
    function stripMissingCols(err, data) {
      try {
        var m = /Could not find the '([^']+)' column/.exec(err && err.message || '');
        if (m && Object.prototype.hasOwnProperty.call(data, m[1])) {
          var clone = Object.assign({}, data);
          delete clone[m[1]];
          console.warn('[DEDIKASIH] Kolom "' + m[1] + '" belum ada di database — disimpan tanpa kolom tersebut. Jalankan ALTER TABLE untuk menambahkannya.');
          return clone;
        }
      } catch (e) {}
      return null;
    }
    
    async function submitJadwalForm(e) {
      e.preventDefault();
      showLoading(true);
      
      try {
        var data = {
          nama_kegiatan: document.getElementById('jadwalNamaKegiatan').value,
          tempat: document.getElementById('jadwalTempat').value,
          pic: document.getElementById('jadwalPIC').value,
          tanggal: document.getElementById('jadwalTanggal').value,
          waktu: document.getElementById('jadwalWaktu').value,
          keterangan: document.getElementById('jadwalKeterangan').value
        };
        
        if(currentEditType === 'create') {
          var { error } = await supabase.from('jadwal_kegiatan').insert(data);
          if (error && error.code === 'PGRST204') {
            var fixed = stripMissingCols(error, data);
            if (fixed) { var r = await supabase.from('jadwal_kegiatan').insert(fixed); error = r.error; }
          }
          if(error) throw error;
          showToast('Jadwal berhasil ditambahkan!', 'success');
        } else {
          var { error } = await supabase.from('jadwal_kegiatan').update(data).eq('id', currentEditId);
          if (error && error.code === 'PGRST204') {
            var fixed = stripMissingCols(error, data);
            if (fixed) { var r = await supabase.from('jadwal_kegiatan').update(fixed).eq('id', currentEditId); error = r.error; }
          }
          if(error) throw error;
          showToast('Jadwal berhasil diperbarui!', 'success');
        }
        
        closeLightbox('lightboxJadwal');
        loadAdminJadwal();
      } catch(err) {
        showToast('Error: ' + err.message, 'error');
      }
      showLoading(false);
    }
    
    function confirmDeleteJadwal(id) {
      var item = publicData.jadwal.find(function(j) { return j.id == id; });
      if(!item) return;
      
      deleteCallback = async function() {
        showLoading(true);
        try {
          var { error } = await supabase.from('jadwal_kegiatan').delete().eq('id', id);
          if(error) throw error;
          showToast('Jadwal berhasil dihapus!', 'success');
          loadAdminJadwal();
        } catch(err) {
          showToast('Gagal hapus: ' + err.message, 'error');
        }
        showLoading(false);
      };
      
      document.getElementById('deleteConfirmMessage').textContent = 'Hapus jadwal kegiatan ini?';
      document.getElementById('deleteItemName').textContent = item.namaKegiatan;
      openLightbox('lightboxConfirmDelete');
    }

    /* ============================================
         CRUD: SERTIFIKAT FUNCTIONS
      ============================================ */
    
    function showAddSertifikatModal() {
      currentEditType = 'create';
      currentEditId = null;
      
      document.getElementById('sertifikatForm').reset();
      document.getElementById('sertifikatId').value = '';
      document.getElementById('sertifikatLightboxTitle').textContent = 'Tambah Sertifikat Digital';
      document.getElementById('sertifikatLightboxIcon').className = 'fa-solid fa-certificate';
      
      openLightbox('lightboxSertifikat');
    }
    
    function showEditSertifikatModal(id) {
      currentEditType = 'edit';
      currentEditId = id;
      
      var item = allSertifikat.find(function(s) { return s.id == id; });
      if(!item) return;
      
      document.getElementById('sertifikatId').value = item.id;
      document.getElementById('sertifikatNomor').value = item.nomorSertifikat || '';
      document.getElementById('sertifikatNama').value = item.namaLengkap || '';
      document.getElementById('sertifikatNIK').value = item.nik || '';
      document.getElementById('sertifikatPenyelenggara').value = item.penyelenggara || '';
      document.getElementById('sertifikatKegiatan').value = item.namaKegiatan || '';
      document.getElementById('sertifikatTanggalPelaksana').value = formatDateISO(item.tanggalPelaksanaan);
      document.getElementById('sertifikatTanggalTerbit').value = formatDateISO(item.tanggalTerbit);
      document.getElementById('sertifikatLink').value = item.linkSertifikat || '';
      
      document.getElementById('sertifikatLightboxTitle').textContent = 'Edit Sertifikat';
      document.getElementById('sertifikatLightboxIcon').className = 'fa-solid fa-pen-to-square';
      
      openLightbox('lightboxSertifikat');
    }
    
    function viewSertifikatDetail(id) {
      var item = allSertifikat.find(function(s) { return s.id == id; });
      if(!item) return;
      
      currentViewId = id;
      
      var html = '<div class="detail-grid">' +
        '<div class="detail-item"><div class="detail-label">No. Sertifikat</div><div class="detail-value font-mono text-yellow-400">' + (item.nomorSertifikat || '-') + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">Nama Lengkap</div><div class="detail-value text-lg font-semibold">' + item.namaLengkap + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">NIK</div><div class="detail-value font-mono">' + (item.nik || '-') + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">Penyelenggara</div><div class="detail-value">' + (item.penyelenggara || '-') + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">Nama Kegiatan</div><div class="detail-value">' + item.namaKegiatan + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">Tanggal Pelaksanaan</div><div class="detail-value">' + (item.tanggalPelaksanaan ? formatDateIndo(item.tanggalPelaksanaan) : '<span class="text-slate-500">-</span>') + '</div></div>' +
        '<div class="detail-item"><div class="detail-label">Tanggal Terbit</div><div class="detail-value">' + formatDateIndo(item.tanggalTerbit) + '</div></div>' +
        '<div class="detail-item col-span-full"><div class="detail-label">Link Sertifikat</div><div class="detail-value"><a href="' + (item.linkSertifikat || '#') + '" target="_blank" class="text-teal-400 hover:text-teal-300">' + (item.linkSertifikat || '-') + '</a></div></div>' +
      '</div>';
      
      document.getElementById('viewSertifikatContent').innerHTML = html;
      document.getElementById('downloadSertifikatBtn').href = item.linkSertifikat || '#';
      
      openLightbox('lightboxViewSertifikat');
    }
    
    function editFromViewSertifikat() {
      closeLightbox('lightboxViewSertifikat');
      setTimeout(function() { showEditSertifikatModal(currentViewId); }, 300);
    }
    
    async function submitSertifikatForm(e) {
      e.preventDefault();
      showLoading(true);
      
      try {
        var data = {
          nomor_sertifikat: document.getElementById('sertifikatNomor').value,
          nama_lengkap: document.getElementById('sertifikatNama').value,
          nik: document.getElementById('sertifikatNIK').value,
          penyelenggara: document.getElementById('sertifikatPenyelenggara').value,
          nama_kegiatan: document.getElementById('sertifikatKegiatan').value,
          tanggal_pelaksanaan: document.getElementById('sertifikatTanggalPelaksana').value || null,
          tanggal_terbit: document.getElementById('sertifikatTanggalTerbit').value,
          link_sertifikat: document.getElementById('sertifikatLink').value
        };
        
        if(currentEditType === 'create') {
          var { error } = await supabase.from('sertifikat').insert(data);
          if (error && error.code === 'PGRST204') {
            var fixed = stripMissingCols(error, data);
            if (fixed) { var r = await supabase.from('sertifikat').insert(fixed); error = r.error; }
          }
          if(error) throw error;
          showToast('Sertifikat berhasil ditambahkan!', 'success');
        } else {
          var { error } = await supabase.from('sertifikat').update(data).eq('id', currentEditId);
          if (error && error.code === 'PGRST204') {
            var fixed = stripMissingCols(error, data);
            if (fixed) { var r = await supabase.from('sertifikat').update(fixed).eq('id', currentEditId); error = r.error; }
          }
          if(error) throw error;
          showToast('Sertifikat berhasil diperbarui!', 'success');
        }
        
        closeLightbox('lightboxSertifikat');
        loadAdminSertifikat();
      } catch(err) {
        showToast('Error: ' + err.message, 'error');
      }
      showLoading(false);
    }
    
    function confirmDeleteSertifikat(id) {
      var item = allSertifikat.find(function(s) { return s.id == id; });
      if(!item) return;
      
      deleteCallback = async function() {
        showLoading(true);
        try {
          var { error } = await supabase.from('sertifikat').delete().eq('id', id);
          if(error) throw error;
          showToast('Sertifikat berhasil dihapus!', 'success');
          loadAdminSertifikat();
        } catch(err) {
          showToast('Gagal hapus: ' + err.message, 'error');
        }
        showLoading(false);
      };
      
      document.getElementById('deleteConfirmMessage').textContent = 'Hapus data sertifikat ini?';
      document.getElementById('deleteItemName').textContent = item.namaLengkap + ' - ' + item.namaKegiatan;
      openLightbox('lightboxConfirmDelete');
    }

    /* ============================================
         DELETE CONFIRMATION HANDLER
      ============================================ */
    
    function confirmDeleteAction() {
      closeLightbox('lightboxConfirmDelete');
      if(typeof deleteCallback === 'function') {
        deleteCallback();
      }
    }
