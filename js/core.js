/* DEDIKASIH - INTI APLIKASI: variabel, navigasi, UI helper, API supabase, tampilan publik (dipecah dari index.html agar lebih ringan) */

    /* ============================================
         GLOBAL VARIABLES
      ============================================ */
    var currentView = 'dashboard';
    var adminToken = null;
    var publicData = { formulir:[], pengumuman:[], jadwal:[], sertifikat:[], formulirAdmin:[] };
    var statusChartInstance = null;
    var allSertifikat = [];
    var sertifikatPage = 1;
    // ============================================
    // SERTIFIKAT FILTER VARIABLES
    // ============================================
    var filteredSertifikat = [];
    var sertifikatFilterActive = false;
    

    var SERTIFIKAT_PER_PAGE = 10;
    var adminCurrentTab = 'usulan';
    var genericModalData = {};
    var sidebarOpen = false;

    /* ============================================
         DATE FORMATTING HELPERS
      ============================================ */
    
    function formatDateIndo(dateString) {
      if (!dateString) return '-';
      try {
        var date = new Date(dateString + 'T00:00:00');
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      } catch (e) { return dateString; }
    }

    function formatDateISO(dateString) {
      if (!dateString) return '';
      try {
        var date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toISOString().split('T')[0];
      } catch (e) { return dateString; }
    }

    function getTodayISO() { return new Date().toISOString().split('T')[0]; }

    function checkSupabaseReady() {
      if (!supabase || typeof supabase.from !== 'function') {
        console.error('%c[DEDIKASIH] ❌ Supabase client not ready!', 'color:#ef4444');
        showToast('Koneksi database gagal.', 'error');
        return false;
      }
      return true;
    }

    /* ============================================
         SIDEBAR TOGGLE (Mobile)
      ============================================ */
    function toggleSidebar() {
      var sidebar = document.getElementById('sidebar');
      var overlay = document.getElementById('sidebarOverlay');
      var hamburger = document.getElementById('hamburgerBtn');
      
      sidebarOpen = !sidebarOpen;
      
      if (sidebarOpen) {
        sidebar.classList.remove('-translate-x-full');
        overlay.classList.remove('hidden');
        hamburger.classList.add('hamburger-active');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
      } else {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
        hamburger.classList.remove('hamburger-active');
        document.body.style.overflow = '';
      }
    }

    /* ============================================
         NAVIGATION
      ============================================ */
    function navigateTo(view) {
      currentView = view;
      document.querySelectorAll('[id^="view-"]').forEach(function(el){ el.classList.add('hidden'); });
      document.getElementById('view-'+view).classList.remove('hidden');
      document.querySelectorAll('.nav-item').forEach(function(el){ el.classList.remove('active'); });
      var navEl = document.getElementById('nav-'+view);
      if(navEl) navEl.classList.add('active');
      
      var titles = {dashboard:'Dashboard',pengumuman:'Pengumuman',jadwal:'Jadwal Kegiatan',sertifikat:'Sertifikat',formulir:'Form Usulan',cekstatus:'Cek Status',petunjuk:'Petunjuk Penggunaan',kontak:'Kontak',admin:'Panel Admin'};
      document.getElementById('pageTitle').textContent = titles[view] || 'Dashboard';
      
      if(view==='dashboard') loadDashboard();
      if(view==='pengumuman') loadPengumuman();
      if(view==='jadwal') loadJadwal();
      if(view==='sertifikat') renderSertifikatTable();
      if(view==='petunjuk' && typeof window.initPedomanView === 'function') window.initPedomanView();
      
      // Close sidebar on mobile after navigation
      if(window.innerWidth < 1024 && sidebarOpen) {
        toggleSidebar();
      }
      
      // Scroll to top of content
      document.querySelector('.main-content').scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* ============================================
         THEME TOGGLE
      ============================================ */
    function toggleTheme() {
      var html = document.documentElement;
      var body = document.getElementById('mainBody');
      var icon = document.getElementById('themeIcon');
      var iconMobile = document.getElementById('themeIconMobile');
      
      if(html.classList.contains('dark')) {
        // Switch to LIGHT mode
        html.classList.remove('dark');
        if(body) {
          body.classList.remove('bg-slate-950', 'text-slate-200', 'dark');
          body.classList.add('bg-gradient-to-br', 'from-slate-100', 'to-slate-200', 'text-slate-800');
        }
        if(icon) icon.className = 'fa-solid fa-sun text-amber-500';
        if(iconMobile) iconMobile.className = 'fa-solid fa-sun text-amber-500';
        localStorage.setItem('dedikasi_dark','0');
        console.log('[DEDIKASIH] Theme: Light');
      } else {
        // Switch to DARK mode
        html.classList.add('dark');
        if(body) {
          body.classList.remove('bg-gradient-to-br', 'from-slate-100', 'to-slate-200', 'text-slate-800');
          body.classList.add('bg-slate-950', 'text-slate-200', 'dark');
        }
        if(icon) icon.className = 'fa-solid fa-moon text-teal-400';
        if(iconMobile) iconMobile.className = 'fa-solid fa-moon text-teal-400';
        localStorage.setItem('dedikasi_dark','1');
        console.log('[DEDIKASIH] Theme: Dark');
      }
    }

    /* ============================================
         UI HELPERS
      ============================================ */
    function showLoading(show) { document.getElementById('loadingOverlay').classList.toggle('hidden', !show); }
    
    function showToast(msg,type) {
      type = type || 'info';
      var colors = {success:'bg-emerald-500',error:'bg-red-500',info:'bg-teal-500',warning:'bg-amber-500'};
      var icons = {success:'check-circle',error:'circle-xmark',info:'info-circle',warning:'triangle-exclamation'};
      var c = document.getElementById('toastContainer');
      var t = document.createElement('div');
      t.className = 'toast glass px-4 py-3 rounded-xl flex items-center gap-3 min-w-[240px] sm:min-w-[280px] border border-white/10 max-w-[calc(100vw-32px)]';
      t.innerHTML = '<i class="fa-solid fa-'+icons[type]+' '+colors[type].replace('bg-','text-')+'"></i><div><div class="font-medium text-sm">'+msg+'</div></div>';
      c.appendChild(t);
      setTimeout(function(){ t.style.opacity='0'; t.style.transform='translateX(120%)'; setTimeout(function(){t.remove()},250); },3500);
    }
    
    function hideModal(id) { document.getElementById(id).classList.add('hidden'); }
    function showModal(id) { document.getElementById(id).classList.remove('hidden'); }
    
    function showConfirm(msg,callback) {
      document.getElementById('confirmMessage').textContent=msg;
      window._confirmCallback=callback;
      showModal('modalConfirm');
    }
    
    function initTailwind() { if(window.tailwind) tailwind.config={ darkMode:'class' }; }
    
    function initFormHelpers() {
      ['nik','telpon'].forEach(function(id){
        var el=document.getElementById(id);
        if(el) el.addEventListener('input',function(){
          if(this.id==='nik') this.value=this.value.replace(/[^0-9]/g,'').slice(0,16);
        });
      });
    }

    /* ============================================
         SUPABASE API FUNCTIONS
      ============================================ */
    
    async function getDashboardStats() {
      if (!checkSupabaseReady()) return { success: false, message: 'Supabase tidak siap' };
      try {
        const [usulanRes, menungguRes, disetujuiRes, ditolakRes, pengumumanRes, jadwalRes, sertifikatRes] = await Promise.all([
          supabase.from('formulir_usulan').select('*', { count: 'exact', head: true }),
          supabase.from('formulir_usulan').select('*', { count: 'exact', head: true }).eq('status', 'Menunggu Verifikasi'),
          supabase.from('formulir_usulan').select('*', { count: 'exact', head: true }).eq('status', 'Disetujui'),
          supabase.from('formulir_usulan').select('*', { count: 'exact', head: true }).eq('status', 'Ditolak'),
          supabase.from('pengumuman').select('*', { count: 'exact', head: true }),
          supabase.from('jadwal_kegiatan').select('*', { count: 'exact', head: true }),
          supabase.from('sertifikat').select('*', { count: 'exact', head: true })
        ]);
        return {
          success: true,
          data: {
            stats: {
              totalUsulan: usulanRes.count || 0,
              menunggu: menungguRes.count || 0,
              disetujui: disetujuiRes.count || 0,
              ditolak: ditolakRes.count || 0,
              totalPengumuman: pengumumanRes.count || 0,
              totalJadwal: jadwalRes.count || 0,
              totalSertifikat: sertifikatRes.count || 0
            }
          }
        };
      } catch (error) {
        console.error('[DEDIKASIH] Error getDashboardStats:', error);
        return { success: false, message: error.message };
      }
    }

    async function getRecentUsulan(limit = 5) {
      if (!checkSupabaseReady()) return { success: false };
      try {
        const { data, error } = await supabase.from('formulir_usulan').select('*').order('created_at', { ascending: false }).limit(limit);
        if (error) throw error;
        return { success: true, data: data.map(row => ({ nomorRegistrasi: row.nomor_registrasi, namaPengusul: row.nama_pengusul, namaKegiatan: row.nama_kegiatan, tanggal: row.tanggal_pelaksanaan || row.tanggal_kegiatan, status: row.status })) };
      } catch (error) { console.error('[DEDIKASIH] Error getRecentUsulan:', error); return { success: false }; }
    }

    async function getAllPengumuman() {
      if (!checkSupabaseReady()) return { success: false };
      try {
        const { data, error } = await supabase.from('pengumuman').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        return { success: true, data: data.map(row => ({ id: row.id, judul: row.judul, isi: row.isi, tanggal: row.tanggal })) };
      } catch (error) { console.error('[DEDIKASIH] Error getAllPengumuman:', error); return { success: false }; }
    }

    async function getAllJadwal() {
      if (!checkSupabaseReady()) return { success: false };
      try {
        const { data, error } = await supabase.from('jadwal_kegiatan').select('*').order('tanggal', { ascending: true });
        if (error) throw error;
        return { success: true, data: data.map(row => ({ id: row.id, namaKegiatan: row.nama_kegiatan, tempat: row.tempat, tanggal: row.tanggal, waktu: row.waktu, pic: row.pic })) };
      } catch (error) { console.error('[DEDIKASIH] Error getAllJadwal:', error); return { success: false }; }
    }

    async function getAllSertifikat() {
      if (!checkSupabaseReady()) return { success: false };
      try {
        const { data, error } = await supabase.from('sertifikat').select('*').order('id', { ascending: true });
        if (error) throw error;
        return { success: true, data: data.map(row => ({ 
          id: row.id, 
          nomorSertifikat: row.nomor_sertifikat, 
          namaLengkap: row.nama_lengkap, 
          nik: row.nik, 
          namaKegiatan: row.nama_kegiatan, 
          penyelenggara: row.penyelenggara, 
          tanggalTerbit: row.tanggal_terbit,
          tanggalPelaksanaan: row.tanggal_pelaksanaan || row.tanggal_kegiatan || null,
          linkSertifikat: row.link_sertifikat 
        })) };
      } catch (error) { console.error('[DEDIKASIH] Error getAllSertifikat:', error); return { success: false }; }
    }

    async function submitFormUsulan(formData) {
      if (!checkSupabaseReady()) return { success: false };
      try {
        const { data, error } = await supabase.from('formulir_usulan').insert({
          nik: formData.nik, nama_pengusul: formData.namaPengusul, asal_institusi: formData.asalInstitusi,
          telpon: formData.telpon, nama_kegiatan: formData.namaKegiatan, tempat_kegiatan: formData.tempatKegiatan,
          tanggal_pelaksanaan: formData.tanggalKegiatan, waktu_pelaksanaan: formData.waktuPelaksanaan,
          jumlah_peserta: parseInt(formData.jumlahPeserta), link_spreadsheet_peserta: formData.linkSpreadsheetPeserta || null,
          link_surat_tugas: formData.linkSuratTugas || null, link_dokumentasi_foto: formData.linkDokumentasiFoto || null,
          link_dokumentasi_video: formData.linkDokumentasiVideo || null, link_surat_pemberitahuan: formData.linkSuratPemberitahuan || null,
          link_daftar_hadir: formData.linkDaftarHadir || null, link_berita_acara: formData.linkBeritaAcara || null,
          status: 'Menunggu Verifikasi'
        }).select().single();
        if (error) throw error;
        return { success: true, message: 'Usulan berhasil diajukan!', data: { nomorRegistrasi: data.nomor_registrasi } };
      } catch (error) { console.error('[DEDIKASIH] Error submitFormUsulan:', error); return { success: false, message: error.message }; }
    }

    async function checkStatusUsulan(query) {
      if (!checkSupabaseReady()) return { success: false, message: 'Koneksi database belum siap' };
      
      try {
        // Bersihkan input
        var cleanQuery = query.trim();
        
        // Deteksi jenis query: NIK (16 digit angka) atau Nomor Registrasi (format DB: DK-202608-6352 -> DK-YYYYMM-XXXX)
        var isNIK = /^\d{16}$/.test(cleanQuery);
        var isNomorReg = /^DK-\d{5,6}-\d{4}$/i.test(cleanQuery);
        
        console.log('[DEDIKASIH] Check Status Query:', cleanQuery, '| isNIK:', isNIK, '| isNomorReg:', isNomorReg);
        
        let queryBuilder = supabase.from('formulir_usulan').select('*');
        
        if (isNIK) {
          // Cari berdasarkan NIK - gunakan eq untuk exact match
          queryBuilder = queryBuilder.eq('nik', cleanQuery);
          console.log('[DEDIKASIH] Searching by NIK:', cleanQuery);
        } else if (isNomorReg) {
          // Cari berdasarkan nomor registrasi
          queryBuilder = queryBuilder.eq('nomor_registrasi', cleanQuery.toUpperCase());
          console.log('[DEDIKASIH] Searching by Nomor Registrasi:', cleanQuery.toUpperCase());
        } else {
          // Jika format tidak cocok, coba pencarian fleksibel
          console.log('[DEDIKASIH] Format tidak terdeteksi, mencoba pencarian fleksibel...');
          
          // Coba cari sebagai NIK dulu (jika semua digit)
          if (/^\d+$/.test(cleanQuery)) {
            queryBuilder = queryBuilder.eq('nik', cleanQuery);
          } else {
            // Coba cari di nomor registrasi (case insensitive)
            queryBuilder = queryBuilder.ilike('nomor_registrasi', '%' + cleanQuery + '%');
          }
        }
        
        const { data: rawData, error } = await queryBuilder.limit(1);
        
        if (error) {
          console.error('[DEDIKASIH] Supabase error:', error);
          throw error;
        }
        
        // Handle data - could be array or single object
        var data = Array.isArray(rawData) ? (rawData.length > 0 ? rawData[0] : null) : rawData;
        
        if (!data) {
          return { 
            success: false, 
            message: 'Data tidak ditemukan. Pastikan NIK (16 digit) atau Nomor Registrasi (DK-XXXXXX-XXXX) benar.' 
          };
        }
        
        // Return data dengan mapping lengkap
        return { 
          success: true, 
          data: {
            id: data.id,
            nomorRegistrasi: data.nomor_registrasi,
            nik: data.nik,
            namaPengusul: data.nama_pengusul,
            asalInstitusi: data.asal_institusi,
            telpon: data.telpon,
            email: data.email || '',
            namaKegiatan: data.nama_kegiatan || data.namaKegiatan,
            tempatKegiatan: data.tempat_kegiatan || data.tempatKegiatan,
            tanggalPelaksanaan: data.tanggal_pelaksanaan || data.tanggal_kegiatan,
            waktuPelaksanaan: data.waktu_pelaksanaan,
            jumlahPeserta: data.jumlah_peserta,
            status: data.status,
            catatan: data.catatan,
            // Link dokumentasi
            linkSpreadsheetPeserta: data.link_spreadsheet_peserta || data.linkSpreadsheetPeserta || '',
            linkSuratTugas: data.link_surat_tugas || data.linkSuratTugas || '',
            linkDokumentasiFoto: data.link_dokumentasi_foto || data.linkDokumentasiFoto || '',
            linkDokumentasiVideo: data.link_dokumentasi_video || data.linkDokumentasiVideo || '',
            linkSuratPemberitahuan: data.link_surat_pemberitahuan || data.linkSuratPemberitahuan || '',
            linkDaftarHadir: data.link_daftar_hadir || data.linkDaftarHadir || '',
            linkBeritaAcara: data.link_berita_acara || data.linkBeritaAcara || '',
            createdAt: data.created_at,
            updatedAt: data.updated_at
          }
        };
        
      } catch (error) {
        console.error('[DEDIKASIH] Error checkStatusUsulan:', error);
        return { success: false, message: 'Error: ' + error.message };
      }
    }

    /* ============================================
         UI RENDERING FUNCTIONS
      ============================================ */

    async function loadDashboard() {
      showLoading(true);
      var result = await getDashboardStats();
      if(result.success) {
        var s = result.data.stats;
        document.getElementById('stat-totalUsulan').textContent = s.totalUsulan;
        document.getElementById('stat-menunggu').textContent = s.menunggu;
        document.getElementById('stat-disetujui').textContent = s.disetujui;
        document.getElementById('stat-ditolak').textContent = s.ditolak;
        document.getElementById('stat-totalPengumuman').textContent = s.totalPengumuman;
        document.getElementById('stat-totalJadwal').textContent = s.totalJadwal;
        document.getElementById('stat-totalSertifikat').textContent = s.totalSertifikat;
        updateStatusChart(s);
        loadRecentUsulan();
      }
      showLoading(false);
    }

    function updateStatusChart(stats) {
      var ctx = document.getElementById('statusChart');
      if(!ctx) return;
      if(statusChartInstance) statusChartInstance.destroy();
      statusChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['Menunggu', 'Disetujui', 'Ditolak'],
          datasets: [{
            data: [stats.menunggu, stats.disetujui, stats.ditolak],
            backgroundColor: ['#f59e0b', '#10b981', '#ef4444'],
            borderWidth: 0,
            hoverOffset: 8
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: { padding: 16, usePointStyle: true, pointStyle: 'circle', font: { size: 12, family: "'Inter', sans-serif" } }
            }
          }
        }
      });
    }

    async function loadRecentUsulan() {
      var result = await getRecentUsulan(5);
      var container = document.getElementById('recentUsulanList');
      if(!container) return;
      if(result.success && result.data.length > 0) {
        container.innerHTML = result.data.map(function(u) {
          var badgeClass = u.status === 'Disetujui' ? 'badge-disetujui' : u.status === 'Ditolak' ? 'badge-ditolak' : 'badge-menunggu';
          return '<div class="flex items-center justify-between p-3 rounded-xl bg-slate-800/30 hover:bg-slate-800/50 transition-colors cursor-pointer" onclick="navigateTo(\'formulir\')">'+
            '<div class="min-w-0 flex-1">'+
              '<p class="font-medium text-sm truncate">'+u.namaPengusul+'</p>'+
              '<p class="text-xs text-slate-400 truncate">'+u.namaKegiatan+'</p>'+
            '</div>'+
            '<span class="badge '+badgeClass+' ml-3 whitespace-nowrap">'+u.status+'</span>'+
          '</div>';
        }).join('');
      } else {
        container.innerHTML = '<div class="text-center py-8 text-slate-500 text-sm"><i class="fa-solid fa-inbox text-2xl mb-2 block"></i>Belum ada usulan</div>';
      }
    }

    async function loadPengumuman() {
      var result = await getAllPengumuman();
      var container = document.getElementById('pengumumanList');
      if(!container) return;
      if(result.success && result.data.length > 0) {
        container.innerHTML = result.data.map(function(p) {
          return '<article class="glass rounded-xl p-4 sm:p-6 enterprise-shadow">'+
            '<div class="flex items-start justify-between gap-4 mb-3">'+
              '<h3 class="font-semibold text-base sm:text-lg">'+p.judul+'</h3>'+
              '<span class="text-xs text-slate-500 whitespace-nowrap">'+formatDateIndo(p.tanggal)+'</span>'+
            '</div>'+
            '<p class="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">'+p.isi+'</p>'+
          '</article>';
        }).join('');
      } else {
        container.innerHTML = '<div class="glass rounded-xl p-8 text-center"><i class="fa-solid fa-bullhorn text-3xl text-slate-600 mb-3"></i><p class="text-slate-400">Belum ada pengumuman</p></div>';
      }
    }

    async function loadJadwal() {
      var result = await getAllJadwal();
      var container = document.getElementById('jadwalList');
      if(!container) return;
      if(result.success && result.data.length > 0) {
        container.innerHTML = result.data.map(function(j) {
          return '<div class="glass rounded-xl p-4 sm:p-5 enterprise-shadow">'+
            '<div class="flex items-start gap-4">'+
              '<div class="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">'+
                '<i class="fa-solid fa-calendar-check text-purple-400"></i>'+
              '</div>'+
              '<div class="min-w-0 flex-1">'+
                '<h3 class="font-semibold text-sm sm:text-base truncate">'+j.namaKegiatan+'</h3>'+
                '<p class="text-xs text-slate-400 mt-1"><i class="fa-solid fa-location-dot mr-1"></i>'+j.tempat+'</p>'+
                '<div class="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-slate-500">'+
                  '<span><i class="fa-solid fa-calendar mr-1"></i>'+formatDateIndo(j.tanggal)+'</span>'+
                  '<span><i class="fa-solid fa-clock mr-1"></i>'+j.waktu+'</span>'+
                '</div>'+
                (j.keterangan ? '<p class="text-xs text-amber-400/80 mt-2">'+j.keterangan+'</p>' : '')+
              '</div>'+
            '</div>'+
          '</div>';
        }).join('');
      } else {
        container.innerHTML = '<div class="glass rounded-xl p-8 text-center col-span-full"><i class="fa-solid fa-calendar-xmark text-3xl text-slate-600 mb-3"></i><p class="text-slate-400">Belum ada jadwal</p></div>';
      }
    }

    
    // ============================================
    // SERTIFIKAT FILTER FUNCTIONS
    // ============================================
    
    function applySertifikatFilter() {
      var namaFilter = document.getElementById('filterNamaSertifikat').value.toLowerCase().trim();
      var kegiatanFilter = document.getElementById('filterKegiatanSertifikat').value.toLowerCase().trim();
      var tanggalDari = document.getElementById('filterTanggalDari').value;
      var tanggalSampai = document.getElementById('filterTanggalSampai').value;
      
      // Check if any filter is active
      sertifikatFilterActive = !(!namaFilter && !kegiatanFilter && !tanggalDari && !tanggalSampai);
      
      // Apply filters
      filteredSertifikat = allSertifikat.filter(function(s) {
        // Filter by nama
        if (namaFilter && !s.namaLengkap.toLowerCase().includes(namaFilter)) {
          return false;
        }
        
        // Filter by kegiatan
        if (kegiatanFilter && !s.namaKegiatan.toLowerCase().includes(kegiatanFilter)) {
          return false;
        }
        
        // Filter by tanggal dari
        if (tanggalDari && s.tanggalTerbit) {
          var tanggalObj = new Date(s.tanggalTerbit);
          var dariObj = new Date(tanggalDari);
          if (tanggalObj < dariObj) {
            return false;
          }
        }
        
        // Filter by tanggal sampai
        if (tanggalSampai && s.tanggalTerbit) {
          var tanggalObj = new Date(s.tanggalTerbit);
          var sampaiObj = new Date(tanggalSampai);
          if (tanggalObj > sampaiObj) {
            return false;
          }
        }
        
        return true;
      });
      
      // Update filter info
      updateSertifikatFilterInfo(namaFilter, kegiatanFilter, tanggalDari, tanggalSampai);
      
      // Reset to page 1 and re-render
      sertifikatPage = 1;
      renderSertifikatTable();
    }
    
    function updateSertifikatFilterInfo(nama, kegiatan, dari, sampai) {
      var infoEl = document.getElementById('sertifikatFilterInfo');
      if (!infoEl) return;
      
      var activeFilters = [];
      if (nama) activeFilters.push('Nama: "' + nama + '"');
      if (kegiatan) activeFilters.push('Kegiatan: "' + kegiatan + '"');
      if (dari) activeFilters.push('Dari: ' + formatDateIndo(dari));
      if (sampai) activeFilters.push('Sampai: ' + formatDateIndo(sampai));
      
      if (activeFilters.length > 0) {
        infoEl.textContent = 'Menampilkan ' + filteredSertifikat.length + ' dari ' + allSertifikat.length + ' data';
        infoEl.classList.remove('hidden');
      } else {
        infoEl.classList.add('hidden');
      }
    }
    
    function resetSertifikatFilter() {
      document.getElementById('filterNamaSertifikat').value = '';
      document.getElementById('filterKegiatanSertifikat').value = '';
      document.getElementById('filterTanggalDari').value = '';
      document.getElementById('filterTanggalSampai').value = '';
      
      sertifikatFilterActive = false;
      filteredSertifikat = [];
      sertifikatPage = 1;
      
      var infoEl = document.getElementById('sertifikatFilterInfo');
      if (infoEl) infoEl.classList.add('hidden');
      
      renderSertifikatTable();
    }
    

function renderSertifikatTable() {
      var tbody = document.getElementById('sertifikatTableBody');
      if(!tbody) return;
      
      // Use filtered data if filter is active, otherwise use all data
      var dataSource = sertifikatFilterActive ? filteredSertifikat : allSertifikat;
      
      if(dataSource.length === 0) {
        if (sertifikatFilterActive) {
          tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-400"><i class="fa-solid fa-search mr-2"></i>Tidak ada data yang cocok dengan filter</td></tr>';
        } else {
          tbody.innerHTML = '<tr><td colspan="5" class="p-6 text-center text-slate-400">Belum ada data sertifikat</td></tr>';
        }
        document.getElementById('sertifikatPagination').innerHTML = '';
        return;
      }
      var start = (sertifikatPage - 1) * SERTIFIKAT_PER_PAGE;
      var end = start + SERTIFIKAT_PER_PAGE;
      var pageData = dataSource.slice(start, end);
      tbody.innerHTML = pageData.map(function(s) {
        return '<tr>'+
          '<td class="font-mono text-xs">'+s.nomorSertifikat+'</td>'+
          '<td>'+s.namaLengkap+'</td>'+
          '<td class="max-w-[200px] truncate">'+s.namaKegiatan+'</td>'+
          '<td>'+formatDateIndo(s.tanggalTerbit)+'</td>'+
          '<td class="text-right"><a href="'+s.linkSertifikat+'" target="_blank" class="text-teal-400 hover:text-teal-300 text-xs"><i class="fa-solid fa-download mr-1"></i>Unduh</a></td>'+
        '</tr>';
      }).join('');
      renderPagination();
    }

    function renderPagination() {
      var container = document.getElementById('sertifikatPagination');
      if(!container) return;
      var dataSource = sertifikatFilterActive ? filteredSertifikat : allSertifikat;
      var totalPages = Math.ceil(dataSource.length / SERTIFIKAT_PER_PAGE);
      if(totalPages <= 1) { container.innerHTML = ''; return; }
      var html = '';
      if(sertifikatPage > 1) html += '<button onclick="changeSertifikatPage('+(sertifikatPage-1)+')" class="btn btn-secondary px-3 py-2 text-xs"><i class="fa-solid fa-chevron-left"></i></button>';
      for(var i = 1; i <= totalPages; i++) {
        if(i === sertifikatPage) html += '<button class="btn btn-primary px-3 py-2 text-xs">'+i+'</button>';
        else if(i === 1 || i === totalPages || Math.abs(i - sertifikatPage) <= 1) html += '<button onclick="changeSertifikatPage('+i+')" class="btn btn-secondary px-3 py-2 text-xs">'+i+'</button>';
        else if(Math.abs(i - sertifikatPage) === 2) html += '<span class="px-2 text-slate-500">...</span>';
      }
      if(sertifikatPage < totalPages) html += '<button onclick="changeSertifikatPage('+(sertifikatPage+1)+')" class="btn btn-secondary px-3 py-2 text-xs"><i class="fa-solid fa-chevron-right"></i></button>';
      container.innerHTML = html;
    }

    function changeSertifikatPage(page) { sertifikatPage = page; renderSertifikatTable(); }
