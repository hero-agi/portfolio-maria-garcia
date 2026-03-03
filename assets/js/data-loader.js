/**
 * Portfolio Data Loader
 * Carga portfolio-data/data.json y expone window.PORTFOLIO_DATA
 * Si falla, el portfolio funciona con el HTML hardcodeado (fallback)
 */
(async function () {
  try {
    const res = await fetch('./portfolio-data/data.json');
    if (!res.ok) return;
    window.PORTFOLIO_DATA = await res.json();
    document.dispatchEvent(new Event('portfolioDataLoaded'));
  } catch (e) {
    console.info('No data.json found, using hardcoded content.');
  }
})();
