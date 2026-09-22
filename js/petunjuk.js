/* DEDIKASIH - Petunjuk Penggunaan: Pembaca Buku Pedoman (PDF baca-saja) */
/* Render halaman PDF ke canvas via PDF.js:
   - Tanpa tombol unduh/cetak, tanpa layer teks (tidak bisa diseleksi/disalin)
   - Klik kanan & seret gambar dinonaktifkan di dalam viewer
   - Zoom 60% - 200%, layar penuh, indikator halaman */
(function () {
  'use strict';

  var PDF_URL = 'pdf/buku-pedoman-dedikasih.pdf';
  var WORKER_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  var state = {
    pdf: null,
    rendered: false,
    loading: false,
    zoom: 1,          // 1 = 100% (lebar disesuaikan kontainer)
    pageVisible: 0,
    pageCount: 0
  };

  function el(id) { return document.getElementById(id); }

  function configureWorker() {
    if (window.pdfjsLib && pdfjsLib.GlobalWorkerOptions) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = WORKER_SRC;
    }
  }

  function baseScale() {
    var viewer = el('pedomanViewer');
    var available = viewer ? viewer.clientWidth - 48 : 640; // padding 24px kiri-kanan
    return Math.max(320, Math.min(available, 900)) / 612;   // 612pt = lebar A4 potret
  }

  function show(elId, yes) {
    var node = el(elId);
    if (node) node.classList.toggle('hidden', !yes);
  }

  function updatePageInfo() {
    var info = el('pedomanPageInfo');
    if (info && state.pageCount) {
      info.textContent = 'Halaman ' + state.pageVisible + '/' + state.pageCount;
    }
  }

  function renderPage(pdf, num, scale) {
    return pdf.getPage(num).then(function (page) {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var viewport = page.getViewport({ scale: scale });
      var wrap = document.createElement('div');
      wrap.className = 'pedoman-canvas-wrap';
      wrap.setAttribute('data-page', num);
      wrap.style.width = Math.floor(viewport.width) + 'px';

      var canvas = document.createElement('canvas');
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);
      canvas.style.width = Math.floor(viewport.width) + 'px';
      canvas.setAttribute('data-page', num);
      wrap.appendChild(canvas);

      var label = document.createElement('span');
      label.className = 'pedoman-page-num';
      label.textContent = num;
      wrap.appendChild(label);

      var holder = el('pedomanPages');
      if (holder) holder.appendChild(wrap);

      var ctx = canvas.getContext('2d');
      return page.render({
        canvasContext: ctx,
        viewport: page.getViewport({ scale: scale * dpr }),
        transform: dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : null
      }).promise.then(function () { return num; });
    });
  }

  function renderAll() {
    if (!state.pdf) return;
    var pdf = state.pdf;
    var scale = baseScale() * state.zoom;
    var holder = el('pedomanPages');
    if (!holder) return;
    holder.innerHTML = '';
    var chain = Promise.resolve();
    for (var i = 1; i <= pdf.numPages; i++) {
      (function (n) {
        chain = chain.then(function () {
          if (!state.pdf) return n; // dibatalkan (viewer ditutup/di-reload)
          return renderPage(pdf, n, scale);
        });
      })(i);
    }
    chain.then(function () {
      var zoomLabel = el('pedomanZoomLabel');
      if (zoomLabel) zoomLabel.textContent = Math.round(state.zoom * 100) + '%';
      updatePageInfo();
    }).catch(function (err) {
      console.error('[DEDIKASIH] Render pedoman:', err);
    });
  }

  function trackVisiblePage() {
    var viewer = el('pedomanViewer');
    if (!viewer || !state.pageCount) return;
    var wraps = viewer.querySelectorAll('.pedoman-canvas-wrap');
    var mid = viewer.scrollTop + viewer.clientHeight / 2;
    var current = 1;
    wraps.forEach(function (w) {
      if (w.offsetTop <= mid) current = parseInt(w.getAttribute('data-page'), 10) || 1;
    });
    state.pageVisible = current;
    updatePageInfo();
  }

  function loadPedoman() {
    if (state.rendered || state.loading) return;
    if (!window.pdfjsLib) {
      show('pedomanLoading', false);
      show('pedomanError', true);
      return;
    }
    configureWorker();
    state.loading = true;
    show('pedomanLoading', true);
    show('pedomanError', false);

    pdfjsLib.getDocument({ url: PDF_URL }).promise.then(function (pdf) {
      state.pdf = pdf;
      state.pageCount = pdf.numPages;
      state.pageVisible = 1;
      state.loading = false;
      show('pedomanLoading', false);
      renderAll();
      state.rendered = true;
    }).catch(function (err) {
      console.error('[DEDIKASIH] Muat pedoman:', err);
      state.loading = false;
      show('pedomanLoading', false);
      show('pedomanError', true);
    });
  }

  /* ===== API publik (dipakai index.html & navigateTo) ===== */

  // Dipanggil oleh navigateTo('petunjuk') setiap kali view dibuka
  window.initPedomanView = function () {
    // Viewer berada di section yang baru saja di-unhide -> lebar sudah valid
    setTimeout(function () {
      if (!state.rendered) loadPedoman();
      else trackVisiblePage();
    }, 50);
  };

  window.pedomanZoom = function (dir) {
    var next = state.zoom + dir * 0.15;
    if (next < 0.6) next = 0.6;
    if (next > 2.0) next = 2.0;
    if (next === state.zoom) return;
    state.zoom = next;
    renderAll();
  };

  window.pedomanFullscreen = function () {
    var viewer = el('pedomanViewer');
    if (!viewer) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      if (viewer.requestFullscreen) viewer.requestFullscreen();
    }
  };

  // Pasang proteksi & pelacak halaman setelah DOM siap
  document.addEventListener('DOMContentLoaded', function () {
    var viewer = el('pedomanViewer');
    if (!viewer) return;
    // Blokir klik kanan di dalam viewer baca-saja
    viewer.addEventListener('contextmenu', function (e) { e.preventDefault(); });
    // Blokir seret elemen (canvas/gambar)
    viewer.addEventListener('dragstart', function (e) { e.preventDefault(); });
    // Update indikator halaman saat menggulir
    viewer.addEventListener('scroll', trackVisiblePage);
    // Render ulang saat layar penuh masuk/keluar (lebar berubah)
    document.addEventListener('fullscreenchange', function () {
      if (state.rendered) renderAll();
    });
    var resizeTimer = null;
    window.addEventListener('resize', function () {
      if (!state.rendered) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { renderAll(); }, 250);
    });
  });
})();
