(() => {
  const button = document.querySelector('.track-motion-toggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hands = document.querySelectorAll('svg[data-hand]');
  let paused = reducedMotion.matches;

  function syncMotion() {
    const still = paused || reducedMotion.matches;
    document.body.dataset.trackMotion = still ? 'still' : 'alive';
    hands.forEach((svg) => still ? svg.pauseAnimations() : svg.unpauseAnimations());
    button.setAttribute('aria-pressed', String(still));
    button.textContent = still ? 'Play animations' : 'Pause animations';
    button.hidden = reducedMotion.matches;
  }

  hands.forEach((svg) => {
    svg.pauseAnimations();
    svg.querySelectorAll('animate').forEach((animation) => animation.beginElement());
  });
  button.addEventListener('click', () => {
    paused = !paused;
    syncMotion();
  });
  reducedMotion.addEventListener('change', () => {
    paused = reducedMotion.matches;
    syncMotion();
  });
  syncMotion();
})();
