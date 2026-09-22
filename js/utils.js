/* DEDIKASIH - UTILITAS: export excel, cetak, perbaikan, filter (dipecah dari index.html agar lebih ringan) */

/* ============================================
       EXPORT TO EXCEL FUNCTION
       Exports table data to CSV format (opens in Excel)
       ============================================ */
    function exportToExcel(type) {
      var data, filename, headers;
      
      switch(type) {
        case 'usulan':
          data = publicData.formulirAdmin || [];
          headers = ['No.Registrasi', 'NIK', 'Nama Pengusul', 'Asal Institusi', 'No. Telepon', 
                     'Nama Kegiatan', 'Tempat Kegiatan', 'Tanggal Pelaksanaan', 'Waktu Pelaksanaan',
                     'Jumlah Peserta', 'Status', 'Catatan', 
                     'Link Spreadsheet', 'Link Surat Tugas', 'Link Foto', 'Link Video',
                     'Link Pemberitahuan', 'Link Daftar Hadir', 'Link Berita Acara'];
          filename = 'Data_Usulan_DEDIKASIH_' + new Date().toISOString().slice(0,10) + '.csv';
          break;
          
        case 'pengumuman':
          data = publicData.pengumumanAdmin || [];
          headers = ['ID', 'Judul Pengumuman', 'Tanggal Publikasi', 'Isi Pengumuman'];
          filename = 'Data_Pengumuman_DEDIKASIH_' + new Date().toISOString().slice(0,10) + '.csv';
          break;
          
        case 'jadwal':
          data = publicData.jadwalAdmin || [];
          headers = ['ID', 'Nama Kegiatan', 'Tempat', 'PIC', 'Tanggal', 'Waktu', 'Keterangan'];
          filename = 'Data_Jadwal_Kegiatan_DEDIKASIH_' + new Date().toISOString().slice(0,10) + '.csv';
          break;
          
        case 'sertifikat':
          data = publicData.sertifikatAdmin || [];
          headers = ['No. Sertifikat', 'Nama Lengkap', 'NIK', 'Penyelenggara', 
                     'Nama Kegiatan', 'Tanggal Terbit', 'Link Sertifikat'];
          filename = 'Data_Sertifikat_DEDIKASIH_' + new Date().toISOString().slice(0,10) + '.csv';
          break;
          
        default:
          showToast('Tipe data tidak valid!', 'error');
          return;
      }
      
      if (!data || data.length === 0) {
        showToast('Tidak ada data untuk diekspor!', 'warning');
        return;
      }
      
      // Build CSV content
      var csvContent = '\uFEFF'; // BOM for UTF-8
      csvContent += headers.join(',') + '\n';
      
      data.forEach(function(row) {
        var values = headers.map(function(header) {
          // Map header to actual field name
          var value = '';
          switch(header) {
            case 'No.Registrasi': value = row.nomorRegistrasi || ''; break;
            case 'NIK': value = row.nik || ''; break;
            case 'Nama Pengusul': value = row.namaPengusul || ''; break;
            case 'Asal Institusi': value = row.asalInstitusi || ''; break;
            case 'No. Telepon': value = row.telpon || ''; break;
            case 'Nama Kegiatan': value = row.namaKegiatan || ''; break;
            case 'Tempat Kegiatan': value = row.tempatKegiatan || ''; break;
            case 'Tanggal Pelaksanaan': value = row.tanggalPelaksanaan || row.tanggalKegiatan || ''; break;
            case 'Waktu Pelaksanaan': value = row.waktuPelaksanaan || ''; break;
            case 'Jumlah Peserta': value = row.jumlahPeserta || ''; break;
            case 'Status': value = row.status || ''; break;
            case 'Catatan': value = row.catatan || ''; break;
            case 'Link Spreadsheet': value = row.linkSpreadsheetPeserta || ''; break;
            case 'Link Surat Tugas': value = row.linkSuratTugas || ''; break;
            case 'Link Foto': value = row.linkDokumentasiFoto || ''; break;
            case 'Link Video': value = row.linkDokumentasiVideo || ''; break;
            case 'Link Pemberitahuan': value = row.linkSuratPemberitahuan || ''; break;
            case 'Link Daftar Hadir': value = row.linkDaftarHadir || ''; break;
            case 'Link Berita Acara': value = row.linkBeritaAcara || ''; break;
            case 'ID': value = row.id || ''; break;
            case 'Judul Pengumuman': value = row.judul || ''; break;
            case 'Tanggal Publikasi': value = row.tanggal || ''; break;
            case 'Isi Pengumuman': value = (row.isi || '').replace(/\n/g, ' '); break;
            case 'PIC': value = row.pic || ''; break;
            case 'Keterangan': value = row.keterangan || ''; break;
            case 'Waktu': value = row.waktu || ''; break;
            case 'No. Sertifikat': value = row.nomorSertifikat || ''; break;
            case 'Nama Lengkap': value = row.nama || ''; break;
            case 'Penyelenggara': value = row.penyelenggara || ''; break;
            case 'Nama Kegiatan': value = (type === 'sertifikat' ? (row.kegiatan || '') : (row.nama_kegiatan || '')); break;
            case 'Tanggal Terbit': value = row.tanggalTerbit || ''; break;
            case 'Link Sertifikat': value = row.linkSertifikat || ''; break;
            default: value = '';
          }
          // Escape quotes and wrap in quotes
          value = String(value).replace(/"/g, '""');
          return '"' + value + '"';
        });
        csvContent += values.join(',') + '\n';
      });
      
      // Create download link
      var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      var link = document.createElement('a');
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      showToast('Data berhasil diekspor ke Excel!', 'success');
    }
    
    /* ============================================
       PRINT DATA FUNCTION
       Opens print-friendly view of table data
       ============================================ */
        function printData(type) {
          var title, content, data;
          
          switch(type) {
            case 'usulan':
              title = 'Laporan Data Usulan - DEDIKASIH';
              data = publicData.formulirAdmin || [];
              content = generatePrintContent('usulan', data);
              break;
            
            case 'pengumuman':
              title = 'Laporan Data Pengumuman - DEDIKASIH';
              data = publicData.pengumumanAdmin || [];
              content = generatePrintContent('pengumuman', data);
              break;
            
            case 'jadwal':
              title = 'Laporan Jadwal Kegiatan - DEDIKASIH';
              data = publicData.jadwalAdmin || [];
              content = generatePrintContent('jadwal', data);
              break;
            
            case 'sertifikat':
              title = 'Laporan Data Sertifikat - DEDIKASIH';
              data = publicData.sertifikatAdmin || [];
              content = generatePrintContent('sertifikat', data);
              break;
            
            default:
              showToast('Tipe data tidak valid!', 'error');
              return;
          }
          
          if (!data || data.length === 0) {
            showToast('Tidak ada data untuk dicetak!', 'warning');
            return;
          }
          
          // Build print HTML using string concatenation
          var printHtml = "<!DOCTYPE html><html lang=\"id\"><head><meta charset=\"UTF-8\"><title>" + title + "</title>";
          printHtml += "<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:20px;color:#333}";
          printHtml += ".header{text-align:center;margin-bottom:30px;border-bottom:2px solid #0f766e;padding-bottom:15px}";
          printHtml += ".header h1{color:#0f766e;font-size:24px;margin-bottom:5px}.header p{color:#666;font-size:14px}";
          printHtml += ".meta{display:flex;justify-content:space-between;margin-bottom:20px;font-size:12px;color:#666}";
          printHtml += "table{width:100%;border-collapse:collapse;font-size:12px}th{background:#0f766e;color:white;padding:10px 8px;text-align:left}";
          printHtml += "td{padding:8px;border-bottom:1px solid #ddd}tr:nth-child(even){background:#f9f9f9}";
          printHtml += ".footer{margin-top:30px;text-align:center;font-size:11px;color:#999}</style></head><body>";
          printHtml += '<div class="header"><h1>DEDIKASIH v1.0</h1><p>Digitalisasi Kegiatan Pengabdian Masyarakat SDM Kesehatan</p>';
          printHtml += '<p>Dinas Kesehatan Kabupaten Kutai Kartanegara</p></div>';
          printHtml += "<h2 style=\"margin-bottom:15px\">" + title + "</h2>";
          printHtml += '<div class="meta"><span>Tanggal Cetak: ' + new Date().toLocaleDateString("id-ID", {weekday:"long",year:"numeric",month:"long",day:"numeric"}) + '</span>';
          printHtml += "<span>Total Data: " + data.length + " record</span></div>";
          printHtml += content;
          printHtml += '<div class="footer"><p>Dokumen ini dicetak dari sistem DEDIKASIH</p><p>&copy; 2026 Dinas Kesehatan Kabupaten Kutai Kartanegara</p></div>';
          printHtml += '<' + 'script>window.onload=function(){window.print()}<' + '/script>';
          
          // Open print window
          var printWindow = window.open("", "_blank");
          if (printWindow) {
            printWindow.document.write(printHtml);
            printWindow.document.close();
            printWindow.focus();
          } else {
            showToast("Popup diblokir! Izinkan popup untuk fitur print.", "warning");
          }
        }

    /* ============================================
         RENDER STATUS RESULT DENGAN TOMBOL PERBAIKI
      ============================================ */
    
    function renderStatusResult(d) {
      var container = document.getElementById('statusResult');
      
      // Tentukan badge status
      var badgeClass = '';
      var badgeIcon = '';
      var statusText = d.status || 'Menunggu';
      
      switch (d.status) {
        case 'Disetujui':
          badgeClass = 'badge-disetujui';
          badgeIcon = '<i class="fa-solid fa-circle-check mr-1"></i>';
          break;
        case 'Ditolak':
          badgeClass = 'badge-ditolak';
          badgeIcon = '<i class="fa-solid fa-circle-xmark mr-1"></i>';
          break;
        default:
          badgeClass = 'badge-menunggu';
          badgeIcon = '<i class="fa-solid fa-clock mr-1"></i>';
          statusText = 'Menunggu';
      }
      
      // Generate HTML hasil
      var html = `
        <div class="glass rounded-xl p-4 sm:p-6 space-y-4">
          <!-- Header Status -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
            <div>
              <p class="font-semibold text-lg">${d.namaPengusul}</p>
              <p class="text-xs text-slate-400 mt-1">NIK: ${d.nik} | No.Reg: <span class="font-mono text-teal-400">${d.nomorRegistrasi}</span></p>
            </div>
            <span class="badge ${badgeClass}">${badgeIcon}${statusText}</span>
          </div>
          
          <!-- Detail Data -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div class="bg-slate-50 rounded-lg p-3">
              <p class="text-xs text-slate-400 mb-1"><i class="fa-solid fa-building mr-1"></i>Asal Institusi</p>
              <p class="font-medium">${d.asalInstitusi || '-'}</p>
            </div>
            <div class="bg-slate-50 rounded-lg p-3">
              <p class="text-xs text-slate-400 mb-1"><i class="fa-solid fa-phone mr-1"></i>Telepon</p>
              <p class="font-medium">${d.telpon || '-'}</p>
            </div>
            <div class="bg-slate-50 rounded-lg p-3">
              <p class="text-xs text-slate-400 mb-1"><i class="fa-solid fa-calendar mr-1"></i>Tanggal Pelaksanaan</p>
              <p class="font-medium">${formatDateIndo(d.tanggalPelaksanaan) || '-'}</p>
            </div>
            <div class="bg-slate-50 rounded-lg p-3">
              <p class="text-xs text-slate-400 mb-1"><i class="fa-solid fa-clock mr-1"></i>Waktu</p>
              <p class="font-medium">${d.waktuPelaksanaan || '-'}</p>
            </div>
            <div class="bg-slate-50 rounded-lg p-3 sm:col-span-2">
              <p class="text-xs text-slate-400 mb-1"><i class="fa-solid fa-location-dot mr-1"></i>Tempat Kegiatan</p>
              <p class="font-medium">${d.tempatKegiatan || '-'}</p>
            </div>
            <div class="bg-slate-50 rounded-lg p-3 sm:col-span-2">
              <p class="text-xs text-slate-400 mb-1"><i class="fa-solid fa-clipboard-list mr-1"></i>Nama Kegiatan</p>
              <p class="font-medium">${d.namaKegiatan || '-'}</p>
            </div>
            <div class="bg-slate-50 rounded-lg p-3">
              <p class="text-xs text-slate-400 mb-1"><i class="fa-solid fa-users mr-1"></i>Jumlah Peserta</p>
              <p class="font-medium">${d.jumlahPeserta || '-'} orang</p>
            </div>
          </div>
          
          <!-- Catatan (jika ada) -->
          ${d.catatan ? `
          <div class="bg-amber-500/10 border border-amber-500/20 rounded-lg p-3">
            <p class="text-xs text-amber-400 font-semibold mb-1"><i class="fa-solid fa-comment-dots mr-1"></i>Catatan Admin:</p>
            <p class="text-sm text-amber-200">${d.catatan}</p>
          </div>
          ` : ''}
          
          <!-- TOMBOL PERBAIKI (Hanya jika status Ditolak) -->
          ${d.status === 'Ditolak' ? `
          <div class="pt-4 border-t border-white/10">
            <button onclick='openPerbaikanForm(${JSON.stringify(d)})' 
                    class="btn btn-primary w-full sm:w-auto px-6 py-3 rounded-xl font-semibold">
              <i class="fa-solid fa-rotate-left mr-2"></i>Ajukan Perbaikan
            </button>
            <p class="text-xs text-slate-400 mt-2 text-center sm:text-left">
              <i class="fa-solid fa-info-circle mr-1"></i>Klik tombol di atas untuk memperbaiki dan mengajukan ulang data usulan Anda
            </p>
          </div>
          ` : ''}
        </div>
      `;
      
      container.innerHTML = html;
      container.classList.remove('hidden');
    }

    /* ============================================
         LIGHTBOX FORMULIR PERBAIKAN
      ============================================ */
    
    var currentPerbaikanData = null;

    function openPerbaikanForm(data) {
      currentPerbaikanData = data;
      
      // Create modal
      var modalId = 'perbaikanModal';
      var existingModal = document.getElementById(modalId);
      
      if (!existingModal) {
        var modalHtml = `
          <div id="${modalId}" class="lightbox-overlay" onclick="closePerbaikanModal(event)">
            <div class="lightbox-container" style="max-width:900px; max-height:90vh; overflow-y:auto;" onclick="event.stopPropagation()">
              
              <!-- Modal Header -->
              <div class="lightbox-header" style="border-bottom: 1px solid rgba(15,118,110,0.15); padding-bottom:1rem;">
                <div class="lightbox-title">
                  <div class="lightbox-icon" style="background: linear-gradient(135deg, rgba(217,119,6,0.15), rgba(217,119,6,0.08)); color: #D97706;">
                    <i class="fa-solid fa-rotate-left"></i>
                  </div>
                  <div>
                    <h3 style="font-size:1.25rem; font-weight:700; color:var(--color-text-primary);">Formulir Perbaikan Usulan</h3>
                    <p style="font-size:0.75rem; color:var(--color-text-muted); margin-top:0.25rem;">No.Reg: <span id="perbaikanNoReg" class="font-mono font-semibold text-teal-600"></span></p>
                  </div>
                </div>
                <div class="lightbox-close" onclick="closePerbaikanModal()" style="background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.15); color:#EF4444;">
                  <i class="fa-solid fa-xmark"></i>
                </div>
              </div>
              
              <!-- Modal Body -->
              <div class="lightbox-body" style="padding:1.5rem;">
                <form id="formPerbaikan" onsubmit="return submitPerbaikan(event)" class="space-y-5">
                  
                  <!-- Info Status Lama -->
                  <div class="rounded-xl p-4" style="background:rgba(239,68,68,0.05); border-color:rgba(239,68,68,0.2); border:1px solid rgba(239,68,68,0.2);">
                    <p class="text-sm font-semibold text-red-600 flex items-center gap-2">
                      <i class="fa-solid fa-triangle-exclamation"></i>
                      Usulan Sebelumnya Ditolak
                    </p>
                    <p class="text-xs text-red-400 mt-1" id="perbaikanCatatanLama"></p>
                  </div>
                  
                  <!-- Data Pengusul -->
                  <div class="space-y-4">
                    <h3 class="text-sm font-semibold flex items-center gap-2 pb-2 border-b" style="color:var(--color-primary); border-color:var(--color-border);">
                      <i class="fa-solid fa-user"></i> Data Pengusul
                    </h3>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">NIK <span class="text-red-500">*</span></label>
                        <input type="text" id="perbaikan_nik" maxlength="16" required readonly
                               class="w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm"
                               style="border-color:var(--color-input-border); color:var(--color-text-muted);" placeholder="16 digit NIK">
                        <p class="text-xs text-slate-500 mt-1">NIK tidak dapat diubah</p>
                      </div>
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">No. Telepon <span class="text-red-500">*</span></label>
                        <input type="tel" id="perbaikan_telpon" placeholder="08xxxxxxxxxx" required
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                    </div>

                    <div>
                      <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Nama Lengkap <span class="text-red-500">*</span></label>
                      <input type="text" id="perbaikan_nama" placeholder="Nama lengkap sesuai KTP" required
                             class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                             style="border-color:var(--color-input-border);">
                    </div>

                    <div>
                      <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Asal Institusi <span class="text-red-500">*</span></label>
                      <input type="text" id="perbaikan_institusi" placeholder="Rumah Sakit / Puskesmas / Instansi" required
                             class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                             style="border-color:var(--color-input-border);">
                    </div>
                  </div>

                  <!-- Detail Kegiatan -->
                  <div class="space-y-4">
                    <h3 class="text-sm font-semibold flex items-center gap-2 pb-2 border-b" style="color:var(--color-primary); border-color:var(--color-border);">
                      <i class="fa-solid fa-clipboard-list"></i> Detail Kegiatan
                    </h3>

                    <div>
                      <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Nama Kegiatan <span class="text-red-500">*</span></label>
                      <input type="text" id="perbaikan_kegiatan" placeholder="Contoh: Donor Darah, Pelatihan EMAS, dll" required
                             class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                             style="border-color:var(--color-input-border);">
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Tempat Kegiatan <span class="text-red-500">*</span></label>
                        <input type="text" id="perbaikan_tempat" placeholder="Lokasi pelaksanaan" required
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Tanggal <span class="text-red-500">*</span></label>
                        <input type="date" id="perbaikan_tanggal" required
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Waktu Pelaksanaan <span class="text-red-500">*</span></label>
                        <input type="text" id="perbaikan_waktu" placeholder="Contoh: 08.00 - 13.00 WITA" required
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Jumlah Peserta <span class="text-red-500">*</span></label>
                        <input type="number" id="perbaikan_peserta" placeholder="Minimal 20" min="20" required
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                    </div>
                  </div>

                  <!-- Link Dokumentasi -->
                  <div class="space-y-4">
                    <h3 class="text-sm font-semibold flex items-center gap-2 pb-2 border-b" style="color:var(--color-primary); border-color:var(--color-border);">
                      <i class="fa-solid fa-link"></i> Link Dokumentasi (Opsional)
                    </h3>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Spreadsheet Peserta</label>
                        <input type="url" id="perbaikan_spreadsheet" placeholder="Google Sheets URL"
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Surat Tugas</label>
                        <input type="url" id="perbaikan_surtug" placeholder="Google Drive URL"
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Dokumentasi Foto</label>
                        <input type="url" id="perbaikan_foto" placeholder="Google Drive Folder URL"
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Dokumentasi Video</label>
                        <input type="url" id="perbaikan_video" placeholder="Google Drive URL"
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Surat Pemberitahuan</label>
                        <input type="url" id="perbaikan_pemberitahuan" placeholder="URL"
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Daftar Hadir</label>
                        <input type="url" id="perbaikan_hadir" placeholder="URL"
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                      <div>
                        <label class="block text-xs font-medium mb-1.5" style="color:var(--color-text-secondary);">Berita Acara</label>
                        <input type="url" id="perbaikan_beritaacara" placeholder="URL"
                               class="w-full px-4 py-3 bg-white border rounded-xl text-sm focus:ring-2 focus:ring-teal-500"
                               style="border-color:var(--color-input-border);">
                      </div>
                    </div>
                  </div>
                  
                  <!-- Hidden field for ID -->
                  <input type="hidden" id="perbaikan_id" value="">
                  
                </form>
              </div>
              
              <!-- Modal Footer -->
              <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4" style="border-top: 1px solid rgba(15,118,110,0.1); margin-top:auto; padding:1rem 1.5rem 1.5rem;">
                <button type="button" onclick="closePerbaikanModal()" 
                        class="px-6 py-3 rounded-xl font-medium transition-all"
                        style="background:var(--color-surface); border:1px solid rgba(15,118,110,0.2); color:var(--color-primary);">
                  Batal
                </button>
                <button type="submit" form="formPerbaikan"
                        class="px-8 py-3 rounded-xl font-semibold text-white transition-all"
                        style="background:linear-gradient(135deg, #0F766E, #14B8A6); box-shadow:0 4px 14px rgba(15,118,110,0.25);">
                  <i class="fa-solid fa-save mr-2"></i>Simpan Perbaikan
                </button>
              </div>
              
            </div>
          </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHtml);
      }
      
      // Fill form with existing data
      document.getElementById('perbaikan_id').value = data.id || '';
      document.getElementById('perbaikanNoReg').textContent = data.nomorRegistrasi || '-';
      document.getElementById('perbaikanCatatanLama').textContent = data.catatan || 'Tidak ada catatan dari admin.';
      
      // Fill all fields
      document.getElementById('perbaikan_nik').value = data.nik || '';
      document.getElementById('perbaikan_telpon').value = data.telpon || '';
      document.getElementById('perbaikan_nama').value = data.namaPengusul || '';
      document.getElementById('perbaikan_institusi').value = data.asalInstitusi || '';
      document.getElementById('perbaikan_kegiatan').value = data.namaKegiatan || '';
      document.getElementById('perbaikan_tempat').value = data.tempatKegiatan || '';
      document.getElementById('perbaikan_tanggal').value = data.tanggalPelaksanaan || '';
      document.getElementById('perbaikan_waktu').value = data.waktuPelaksanaan || '';
      document.getElementById('perbaikan_peserta').value = data.jumlahPeserta || '';
      
      // Link fields
      document.getElementById('perbaikan_spreadsheet').value = data.linkSpreadsheetPeserta || '';
      document.getElementById('perbaikan_surtug').value = data.linkSuratTugas || '';
      document.getElementById('perbaikan_foto').value = data.linkDokumentasiFoto || '';
      document.getElementById('perbaikan_video').value = data.linkDokumentasiVideo || '';
      document.getElementById('perbaikan_pemberitahuan').value = data.linkSuratPemberitahuan || '';
      document.getElementById('perbaikan_hadir').value = data.linkDaftarHadir || '';
      document.getElementById('perbaikan_beritaacara').value = data.linkBeritaAcara || '';
      
      // Show modal
      setTimeout(function() {
        var modal = document.getElementById(modalId);
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }, 10);
    }

    function closePerbaikanModal(event) {
      if (event && event.target !== event.currentTarget && !event.target.classList.contains('lightbox-close')) {
        return;
      }
      
      var modal = document.getElementById('perbaikanModal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        
        setTimeout(function() {
          modal.remove();
        }, 300);
      }
      
      currentPerbaikanData = null;
    }

    /* ============================================
         SUBMIT PERBAIKAN KE SUPABASE
      ============================================ */

    function submitPerbaikan(event) {
      event.preventDefault();
      
      if (!currentPerbaikanData || !currentPerbaikanData.id) {
        showToast('Error: Data perbaikan tidak valid!', 'error');
        return;
      }
      
      if (!checkSupabaseReady()) {
        showToast('Koneksi database belum siap!', 'error');
        return;
      }
      
      // Gather form data
      var updateData = {
        telpon: document.getElementById('perbaikan_telpon').value.trim(),
        nama_pengusul: document.getElementById('perbaikan_nama').value.trim(),
        asal_institusi: document.getElementById('perbaikan_institusi').value.trim(),
        nama_kegiatan: document.getElementById('perbaikan_kegiatan').value.trim(),
        tempat_kegiatan: document.getElementById('perbaikan_tempat').value.trim(),
        tanggal_pelaksanaan: document.getElementById('perbaikan_tanggal').value,
        waktu_pelaksanaan: document.getElementById('perbaikan_waktu').value.trim(),
        jumlah_peserta: parseInt(document.getElementById('perbaikan_peserta').value) || 0,
        link_spreadsheet_peserta: document.getElementById('perbaikan_spreadsheet').value.trim(),
        link_surat_tugas: document.getElementById('perbaikan_surtug').value.trim(),
        link_dokumentasi_foto: document.getElementById('perbaikan_foto').value.trim(),
        link_dokumentasi_video: document.getElementById('perbaikan_video').value.trim(),
        link_surat_pemberitahuan: document.getElementById('perbaikan_pemberitahuan').value.trim(),
        link_daftar_hadir: document.getElementById('perbaikan_hadir').value.trim(),
        link_berita_acara: document.getElementById('perbaikan_beritaacara').value.trim(),
        status: 'Menunggu',
        catatan: null,
        updated_at: new Date().toISOString()
      };
      
      // Validation
      if (!updateData.telpon || !updateData.nama_pengusul || !updateData.asal_institusi ||
          !updateData.nama_kegiatan || !updateData.tempat_kegiatan || !updateData.tanggal_pelaksanaan ||
          !updateData.waktu_pelaksanaan || !updateData.jumlah_peserta) {
        showToast('Mohon lengkapi semua field yang wajib diisi!', 'warning');
        return;
      }
      
      showConfirm('Apakah Anda yakin ingin mengajukan perbaikan? Status akan direset menjadi "Menunggu".', async function() {
        showLoading(true);
        
        try {
          console.log('[DEDIKASIH] Submitting perbaikan for ID:', currentPerbaikanData.id);
          
          const { data, error } = await supabase
            .from('formulir_usulan')
            .update(updateData)
            .eq('id', currentPerbaikanData.id)
            .select()
            .single();
          
          if (error) throw error;
          
          console.log('[DEDIKASIH] Perbaikan success:', data);
          
          showLoading(false);
          showToast('Data perbaikan berhasil disimpan! Status direset menjadi "Menunggu".', 'success');
          
          closePerbaikanModal();
          
          // Refresh status result
          document.getElementById('statusQuery').value = currentPerbaikanData.nik;
          handleCheckStatus();
          
        } catch (err) {
          console.error('[DEDIKASIH] Error submitting perbaikan:', err);
          showLoading(false);
          showToast('Gagal menyimpan perbaikan: ' + err.message, 'error');
        }
      });
    }

    console.log('[DEDIKASIH] ✅ Fitur Cek Status & Perbaikan Formulir berhasil dimuat!');

    function generatePrintContent(type, data) {
      var html = '<table>';
      
      // Headers based on type
      switch(type) {
        case 'usulan':
          html += `<thead><tr>
            <th>No</th>
            <th>No.Registrasi</th>
            <th>Nama Pengusul</th>
            <th>NIK</th>
            <th>Institusi</th>
            <th>Kegiatan</th>
            <th>Tanggal</th>
            <th>Status</th>
          </tr></thead><tbody>`;
          data.forEach(function(item, i) {
            html += `<tr>
              <td>${i+1}</td>
              <td>${item.nomorRegistrasi || '-'}</td>
              <td>${item.namaPengusul || '-'}</td>
              <td>${item.nik || '-'}</td>
              <td>${item.asalInstitusi || '-'}</td>
              <td>${item.namaKegiatan || '-'}</td>
              <td>${item.tanggalPelaksanaan || item.tanggalKegiatan || '-'}</td>
              <td>${item.status || '-'}</td>
            </tr>`;
          });
          break;
          
        case 'pengumuman':
          html += `<thead><tr>
            <th>No</th>
            <th>Judul</th>
            <th>Tanggal</th>
            <th>Isi Pengumuman</th>
          </tr></thead><tbody>`;
          data.forEach(function(item, i) {
            html += `<tr>
              <td>${i+1}</td>
              <td>${item.judul || '-'}</td>
              <td>${item.tanggal || '-'}</td>
              <td>${(item.isi || '').substring(0, 100)}...</td>
            </tr>`;
          });
          break;
          
        case 'jadwal':
          html += `<thead><tr>
            <th>No</th>
            <th>Kegiatan</th>
            <th>Tempat</th>
            <th>PIC</th>
            <th>Tanggal</th>
            <th>Waktu</th>
          </tr></thead><tbody>`;
          data.forEach(function(item, i) {
            html += `<tr>
              <td>${i+1}</td>
              <td>${item.nama_kegiatan || item.namaKegiatan || '-'}</td>
              <td>${item.tempat || '-'}</td>
              <td>${item.pic || '-'}</td>
              <td>${item.tanggal || '-'}</td>
              <td>${item.waktu || '-'}</td>
            </tr>`;
          });
          break;
          
        case 'sertifikat':
          html += `<thead><tr>
            <th>No</th>
            <th>No.Sertifikat</th>
            <th>Nama</th>
            <th>NIK</th>
            <th>Kegiatan</th>
            <th>Tanggal Terbit</th>
          </tr></thead><tbody>`;
          data.forEach(function(item, i) {
            html += `<tr>
              <td>${i+1}</td>
              <td>${item.nomorSertifikat || '-'}</td>
              <td>${item.nama || '-'}</td>
              <td>${item.nik || '-'}</td>
              <td>${item.kegiatan || '-'}</td>
              <td>${item.tanggalTerbit || '-'}</td>
            </tr>`;
          });
          break;
      }
      
      html += '</tbody></table>';
      return html;
    }
    
    /* ============================================
       FILTER ADMIN TABLE FUNCTION
       Real-time search/filter for all admin tables
       ============================================ */
    function filterAdminTable(type) {
      var searchTerm = '';
      var tableBodyId = '';
      
      switch(type) {
        case 'usulan':
          searchTerm = document.getElementById('searchUsulan').value.toLowerCase();
          filterTableRows('adminUsulanTable', searchTerm, [0, 1, 2, 3, 4]);
          break;
        case 'pengumuman':
          searchTerm = document.getElementById('searchPengumuman').value.toLowerCase();
          filterTableRows('adminPengumumanTable', searchTerm, [0, 1, 2]);
          break;
        case 'jadwal':
          searchTerm = document.getElementById('searchJadwal').value.toLowerCase();
          filterTableRows('adminJadwalTable', searchTerm, [0, 1, 2]);
          break;
        case 'sertifikat':
          searchTerm = document.getElementById('searchSertifikat').value.toLowerCase();
          filterTableRows('adminSertifikatTable', searchTerm, [0, 1, 2, 3]);
          break;
      }
    }
    
    function filterTableRows(tableId, searchTerm, searchColumns) {
      var table = document.getElementById(tableId);
      if (!table) return;
      
      var rows = table.getElementsByTagName('tr');
      var visibleCount = 0;
      
      for (var i = 0; i < rows.length; i++) {
        var cells = rows[i].getElementsByTagName('td');
        if (cells.length === 1 && cells[0].colSpan) continue; // Skip empty state row
        
        var found = false;
        for (var j = 0; j < searchColumns.length; j++) {
          var colIndex = searchColumns[j];
          if (cells[colIndex]) {
            var cellText = cells[colIndex].textContent || cells[colIndex].innerText;
            if (cellText.toLowerCase().indexOf(searchTerm) > -1) {
              found = true;
              break;
            }
          }
        }
        
        rows[i].style.display = found ? '' : 'none';
        if (found) visibleCount++;
      }
      
      // Update count badge if exists
      // Could add badge update logic here
    }
    
    /* ============================================
       UPDATE COUNT BADGES
       Updates the data count badges in each tab
       ============================================ */
    function updateCountBadges() {
      // Usulan count
      var usulanBadge = document.getElementById('usulanCountBadge');
      if (usulanBadge && publicData.formulirAdmin) {
        usulanBadge.textContent = publicData.formulirAdmin.length + ' data';
      }
      
      // Pengumuman count
      var pengumumanBadge = document.getElementById('pengumumanCountBadge');
      if (pengumumanBadge && publicData.pengumumanAdmin) {
        pengumumanBadge.textContent = publicData.pengumumanAdmin.length + ' data';
      }
      
      // Jadwal count
      var jadwalBadge = document.getElementById('jadwalCountBadge');
      if (jadwalBadge && publicData.jadwalAdmin) {
        jadwalBadge.textContent = publicData.jadwalAdmin.length + ' data';
      }
      
      // Sertifikat count
      var sertifikatBadge = document.getElementById('sertifikatCountBadge');
      if (sertifikatBadge && publicData.sertifikatAdmin) {
        sertifikatBadge.textContent = publicData.sertifikatAdmin.length + ' data';
      }
    }

  