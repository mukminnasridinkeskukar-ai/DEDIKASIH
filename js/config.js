/* DEDIKASIH - KONFIGURASI SUPABASE (kredensial + koneksi) (dipecah dari index.html agar lebih ringan) */

    // ==================== SUPABASE CREDENTIALS ====================
    const SUPABASE_URL = 'https://kfxueyoddhwjszcyiukp.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtmeHVleW9kZGh3anN6Y3lpdWtwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY1MDQyOTAsImV4cCI6MjEwMjA4MDI5MH0.xv5Lr6QhbUZuMjQ8RtPvtiBcd8dvoG_S7wwZ7eTelzk';
    
    var _supabase = null;
    var _ready = false;
    var _retryCount = 0;
    var _maxRetries = 3;
    var _corsDetected = false;
    var _initPromise = null;
    
    function _initClient() {
      try {
        if (typeof window.supabase === 'undefined' || !window.supabase.createClient) return false;
        _supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        _ready = true;
        console.log('[DEDIKASIH] Client initialized');
        return true;
      } catch(e) { console.error('[DEDIKASIH] Init error:', e.message); return false; }
    }
    
    function _waitForLib() {
      if (_initPromise) return _initPromise;
      _initPromise = new Promise(function(resolve) {
        if (typeof window.supabase !== 'undefined' && window.supabase.createClient) { resolve(_initClient()); return; }
        var tries = 0;
        var interval = setInterval(function() {
          tries++;
          if (typeof window.supabase !== 'undefined' && window.supabase.createClient) { clearInterval(interval); resolve(_initClient()); }
          else if (tries >= 50) { clearInterval(interval); resolve(false); }
        }, 100);
      });
      return _initPromise;
    }
    
    async function _testConnection() {
      if (!_supabase || !_ready) return { ok: false, retry: false };
      try {
        var { data, error, status } = await _supabase.from('pengumuman').select('id').limit(1);
        if (error) {
          var msg = (error.message || '').toLowerCase();
          if (msg.includes('cors') || msg.includes('cross-origin') || msg.includes('failed to fetch') || msg.includes('networkerror') || status === 0) {
            _corsDetected = true; return { ok: false, retry: true, cors: true };
          }
          if (error.code === '42P01' || msg.includes('does not exist')) return { ok: true, needTables: true };
          return { ok: false, retry: _retryCount < _maxRetries };
        }
        return { ok: true };
      } catch(e) {
        var errMsg = (e.message || '').toLowerCase();
        if (errMsg.includes('cors') || errMsg.includes('failed to fetch') || errMsg.includes('networkerror')) { _corsDetected = true; return { ok: false, retry: true, cors: true }; }
        return { ok: false, retry: _retryCount < _maxRetries };
      }
    }
    
    async function connectSupabase() {
      console.log('[DEDIKASIH] Connecting...');
      var libReady = await _waitForLib();
      if (!libReady) { console.error('[DEDIKASIH] Library failed to load'); return false; }
      
      for (_retryCount = 0; _retryCount <= _maxRetries; _retryCount++) {
        var result = await _testConnection();
        if (result.ok) { console.log('[DEDIKASIH] ✓ Connected successfully'); return true; }
        if (result.cors) { console.error('[DEDIKASIH] ✗ CORS error detected'); return false; }
        if (result.retry && _retryCount < _maxRetries) { await new Promise(r => setTimeout(r, 1000 * (_retryCount + 1))); }
      }
      return false;
    }
    
    var supabase = null;
    var supabaseReady = false;
    
    async function initSupabase() {
      var connected = await connectSupabase();
      if (connected) { supabase = _supabase; supabaseReady = _ready; }
      return connected;
    }
    
    function isSupabaseConnected() { return _ready && _supabase !== null; }
