(() => {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hands = document.querySelectorAll('svg[data-hand]');

  function syncMotion() {
    const still = reducedMotion.matches;
    document.body.dataset.trackMotion = still ? 'still' : 'alive';
    hands.forEach((svg) => still ? svg.pauseAnimations() : svg.unpauseAnimations());
  }

  hands.forEach((svg) => {
    svg.pauseAnimations();
    svg.querySelectorAll('animate').forEach((animation) => animation.beginElement());
  });
  reducedMotion.addEventListener('change', syncMotion);
  syncMotion();
})();
