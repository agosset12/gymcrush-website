/* Screenshot carousel for the landing page.
   Deliberately an external file rather than an inline <script>: it lets the
   Content-Security-Policy in _headers use `script-src 'self'` with no
   'unsafe-inline' escape hatch, which is what actually stops an injected
   script from running. */
(function () {
    var track = document.getElementById('screenshotTrack');
    if (!track) return;

    var total = track.querySelectorAll('.screenshot-slide').length;
    var dots = Array.prototype.slice.call(document.querySelectorAll('.carousel-dot'));
    var current = 0;

    function goTo(index) {
        current = (index % total + total) % total;
        track.style.transform = 'translateX(-' + (current * 100) + '%)';
        dots.forEach(function (dot, i) {
            var active = i === current;
            dot.classList.toggle('active', active);
            dot.setAttribute('aria-selected', active ? 'true' : 'false');
        });
    }

    document.getElementById('prevBtn').addEventListener('click', function () { goTo(current - 1); });
    document.getElementById('nextBtn').addEventListener('click', function () { goTo(current + 1); });
    dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () { goTo(i); });
    });

    // Arrow keys move the carousel when focus is anywhere inside it.
    document.querySelector('.phone-section').addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { goTo(current - 1); }
        if (e.key === 'ArrowRight') { goTo(current + 1); }
    });

    var startX = null;
    var frame = document.querySelector('.screenshot-carousel');
    frame.addEventListener('touchstart', function (e) {
        startX = e.touches[0].clientX;
    }, { passive: true });
    frame.addEventListener('touchend', function (e) {
        if (startX === null) return;
        var diff = startX - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 40) { goTo(current + (diff > 0 ? 1 : -1)); }
        startX = null;
    }, { passive: true });
})();
