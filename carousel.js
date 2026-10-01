/* Landing-page behaviour: the screenshot strip's arrows and the App Preview's
   pause button.
   Deliberately an external file rather than an inline <script>: it lets the
   Content-Security-Policy in _headers use `script-src 'self'` with no
   'unsafe-inline' escape hatch, which is what actually stops an injected
   script from running. */
(function () {
    // ── Screenshot strip ──
    // The strip is a native scroll-snap row, so swipe, trackpad and arrow keys
    // already work without script. The buttons just page it two cards at a time.
    var track = document.getElementById('shotsTrack');
    var prev = document.getElementById('shotsPrev');
    var next = document.getElementById('shotsNext');

    if (track && prev && next) {
        var step = function () {
            var card = track.querySelector('img');
            var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
            return card ? (card.getBoundingClientRect().width + gap) * 2 : track.clientWidth;
        };

        var sync = function () {
            prev.disabled = track.scrollLeft <= 2;
            next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
        };

        prev.addEventListener('click', function () { track.scrollBy({ left: -step() }); });
        next.addEventListener('click', function () { track.scrollBy({ left: step() }); });
        track.addEventListener('scroll', sync, { passive: true });
        window.addEventListener('resize', sync);
        sync();
    }

    // ── App Preview ──
    // Muted autoplay loop, with a visible pause control (anything that moves for
    // more than five seconds needs one). Visitors who ask the OS for reduced
    // motion get the poster frame and can start it themselves.
    var video = document.getElementById('preview');
    var toggle = document.getElementById('previewToggle');

    if (video && toggle) {
        var render = function () {
            toggle.classList.toggle('paused', video.paused);
            toggle.setAttribute('aria-label', video.paused ? 'Play video' : 'Pause video');
        };

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            video.removeAttribute('autoplay');
            video.pause();
        }

        toggle.addEventListener('click', function () {
            if (video.paused) { video.play(); } else { video.pause(); }
        });
        video.addEventListener('play', render);
        video.addEventListener('pause', render);
        render();
    }
})();
