/* Landing-page behaviour: the screenshot strip's arrows and the App Preview's
   pause button and scrubber.
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

    // ── Scrubber ──
    // Click anywhere on the bar to jump, or drag along it. Driven by rAF while
    // playing so the fill glides instead of ticking at timeupdate's ~4 Hz.
    var scrub = document.getElementById('previewScrub');
    var fill = document.getElementById('previewFill');

    if (video && scrub && fill) {
        var dragging = false;

        var paint = function () {
            var ratio = video.duration ? video.currentTime / video.duration : 0;
            fill.style.width = (ratio * 100) + '%';
            scrub.setAttribute('aria-valuenow', Math.round(ratio * 100));
            scrub.setAttribute('aria-valuetext', Math.round(video.currentTime) + ' of ' + Math.round(video.duration || 0) + ' seconds');
        };

        var loop = function () {
            paint();
            if (!video.paused) { requestAnimationFrame(loop); }
        };

        var seekTo = function (clientX) {
            if (!video.duration) return;
            var box = scrub.getBoundingClientRect();
            var ratio = Math.min(1, Math.max(0, (clientX - box.left) / box.width));
            video.currentTime = ratio * video.duration;
            paint();
        };

        scrub.addEventListener('pointerdown', function (e) {
            dragging = true;
            scrub.classList.add('dragging');
            scrub.setPointerCapture(e.pointerId);
            seekTo(e.clientX);
        });
        scrub.addEventListener('pointermove', function (e) {
            if (dragging) { seekTo(e.clientX); }
        });
        var release = function () {
            dragging = false;
            scrub.classList.remove('dragging');
        };
        scrub.addEventListener('pointerup', release);
        scrub.addEventListener('pointercancel', release);

        scrub.addEventListener('keydown', function (e) {
            if (!video.duration) return;
            var delta = e.key === 'ArrowRight' ? 2 : e.key === 'ArrowLeft' ? -2 : 0;
            if (!delta) return;
            e.preventDefault();
            video.currentTime = Math.min(video.duration, Math.max(0, video.currentTime + delta));
            paint();
        });

        video.addEventListener('play', loop);
        video.addEventListener('seeked', paint);
        video.addEventListener('loadedmetadata', paint);
        paint();
    }
})();
