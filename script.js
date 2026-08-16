document.addEventListener('DOMContentLoaded', () => {
  const revealEls = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const compactFormatter = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 });

  function formatCompact(n) {
    return compactFormatter.format(n);
  }

  function showFinal(countEl) {
    const target = parseFloat(countEl.dataset.target);
    const prefix = countEl.dataset.prefix || '';
    if (!isNaN(target)) countEl.textContent = prefix + formatCompact(target);
  }

  function animateCount(countEl) {
    const target = parseFloat(countEl.dataset.target);
    const prefix = countEl.dataset.prefix || '';
    if (reduceMotion || isNaN(target)) {
      showFinal(countEl);
      return;
    }
    const duration = 1400;
    const start = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic — counts fast, settles at the end
      const current = Math.round(target * eased);
      countEl.textContent = prefix + formatCompact(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        showFinal(countEl);
      }
    }
    requestAnimationFrame(tick);
  }

  if (!('IntersectionObserver' in window) || revealEls.length === 0) {
    revealEls.forEach(el => {
      el.classList.add('is-visible');
      el.querySelectorAll('.count').forEach(showFinal);
    });
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const el = entry.target;
        setTimeout(() => {
          el.classList.add('is-visible');
          const counts = el.querySelectorAll('.count');
          counts.forEach((c, idx) => setTimeout(() => animateCount(c), idx * 120));
        }, i * 60);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach(el => io.observe(el));
});
