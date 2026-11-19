// Google Analytics 4 loader for psvl.kr.
// Set MEASUREMENT_ID to the GA4 web data stream ID (format "G-XXXXXXXXXX").
// While it is empty this file does nothing and loads no external script.
(function () {
  var MEASUREMENT_ID = "";
  if (!MEASUREMENT_ID) return;
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(MEASUREMENT_ID);
  document.head.appendChild(s);
  gtag("js", new Date());
  gtag("config", MEASUREMENT_ID);
})();
