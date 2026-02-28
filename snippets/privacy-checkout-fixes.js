// Drop-in fixes for the provided Privacy Checkout page.
// 1) Prevents crashes when optional elements are missing.
// 2) Fixes tabs not switching because of an empty event name.
// 3) Supports both old and new purchase URLs.

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('exit-modal');
  const countdownElem = document.getElementById('countdown');
  const cancelBtn = document.getElementById('cancel-btn');

  if (modal && countdownElem && cancelBtn) {
    const redirectUrl = 'https://privadojulianabnd.shop/juliana/desconto/';
    const countdownDuration = 5;
    let countdown = countdownDuration;
    let countdownTimer;
    let redirecting = false;

    const startRedirectCountdown = () => {
      if (redirecting) return;
      redirecting = true;
      countdown = countdownDuration;
      countdownElem.textContent = String(countdown);
      modal.style.display = 'flex';

      countdownTimer = window.setInterval(() => {
        countdown -= 1;
        countdownElem.textContent = String(countdown);
        if (countdown <= 0) {
          window.clearInterval(countdownTimer);
          window.location.href = redirectUrl;
        }
      }, 1000);
    };

    const cancelRedirect = () => {
      redirecting = false;
      window.clearInterval(countdownTimer);
      modal.style.display = 'none';
    };

    cancelBtn.addEventListener('click', cancelRedirect);
    window.addEventListener('popstate', (event) => {
      event.preventDefault();
      startRedirectCountdown();
      history.pushState(null, document.title, location.href);
    });

    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') startRedirectCountdown();
    });

    window.addEventListener('pagehide', (event) => {
      if (!redirecting && !event.persisted) startRedirectCountdown();
    });

    history.pushState(null, document.title, location.href);
  }

  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => t.classList.remove('active'));
      tabContents.forEach((content) => content.classList.remove('active'));

      tab.classList.add('active');
      const tabId = tab.getAttribute('data-tab');
      if (!tabId) return;
      document.getElementById(`${tabId}-content`)?.classList.add('active');
    });
  });

  const cookieConsent = document.querySelector('.cookie-consent');
  const acceptButton = cookieConsent?.querySelector('button');

  if (cookieConsent && acceptButton) {
    if (localStorage.getItem('cookiesAccepted')) {
      cookieConsent.style.display = 'none';
    }

    acceptButton.addEventListener('click', () => {
      localStorage.setItem('cookiesAccepted', 'true');
      cookieConsent.style.display = 'none';
    });
  }

  const purchaseButtons = document.querySelectorAll(
    'a[href*="compraseguraonline.org.ua"], a[href*="pay.sunize.com.br"]',
  );

  purchaseButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const lastEventTime = sessionStorage.getItem('last_purchase_event_time');
      const now = Date.now();
      const timeDiff = lastEventTime ? now - Number(lastEventTime) : Number.POSITIVE_INFINITY;

      if (timeDiff < 30000) return;
      sessionStorage.setItem('last_purchase_event_time', String(now));
    });
  });
});
