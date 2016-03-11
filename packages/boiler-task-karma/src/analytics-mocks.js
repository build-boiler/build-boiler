function noop() {}

window._fbq = [];
window.ga = noop;
window.optimizely = {
  push: noop
};
window.silverpop = {
  trackEvent: noop,
  flush: noop
};
window.startTime = new Date().getTime();
window.featureDetection = {
  sessionStorage: true,
  cookies: true
};
window.Raven = {
  captureException: noop
};

