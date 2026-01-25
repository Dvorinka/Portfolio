"use strict";

const $HTML = document.documentElement;

if (sessionStorage.getItem("theme")) {
  $HTML.dataset.theme = sessionStorage.getItem("theme");
} else {
  $HTML.dataset.theme = "dark"; // Set the default theme to dark
}

// ===== Resume timeline duration auto-update =====
function parseYearMonth(value) {
  // value format: 'YYYY-MM' or 'present'
  if (!value || value === 'present') return null;
  const [y, m] = value.split('-').map(Number);
  return { year: y, month: m };
}

function monthDiff(start, end) {
  // start/end: {year, month}
  return (end.year - start.year) * 12 + (end.month - start.month);
}

function toYearMonth(date) {
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}

function humanizeMonthsEN(totalMonths) {
  if (totalMonths < 0) return '';
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  const yearStr = years === 0 ? '' : years === 1 ? '1 year' : `${years} years`;
  const monthStr = months === 0 ? '' : months === 1 ? '1 month' : `${months} months`;

  if (yearStr && monthStr) return `${yearStr} ${monthStr}`;
  return yearStr || monthStr || '0 months';
}

function updateDurations() {
  const nowYM = toYearMonth(new Date());
  document.querySelectorAll('.duration').forEach(el => {
    const startAttr = el.getAttribute('data-start');
    const endAttr = el.getAttribute('data-end');
    const startYM = parseYearMonth(startAttr);
    const endYM = endAttr === 'present' ? nowYM : parseYearMonth(endAttr);
    if (!startYM || !endYM) return;
    const diff = monthDiff(startYM, endYM);
    el.textContent = humanizeMonthsEN(diff);
  });
}

// Update footer copyright with current year
function updateFooterCopyright() {
  const currentYear = new Date().getFullYear();
  const footerText = document.querySelector('.footer p.body-medium');
  if (footerText) {
    footerText.innerHTML = `Copyright ${currentYear}. All rights reserved by <b><a href="https://tdvorak.dev">TDvorak.</a></b>`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  updateDurations();
  updateFooterCopyright();
  // refresh once a day to keep counters accurate as months roll
  setInterval(updateDurations, 24 * 60 * 60 * 1000);
});

const changeTheme = () => {
  $HTML.dataset.theme = sessionStorage.getItem("theme") === "dark";
  sessionStorage.setItem("theme", $HTML.dataset.theme);
};

const $tabBtn = document.querySelectorAll("[data-tab-btn]");
let [lastActiveTab] = document.querySelectorAll("[data-tab-content]");
let [lastActiveTabBtn] = $tabBtn;

$tabBtn.forEach(item => {
  item.addEventListener("click", function () {
    lastActiveTab.classList.remove("active");
    lastActiveTabBtn.classList.remove("active");

    const $tabContent = document.querySelector(`[data-tab-content="${item.dataset.tabBtn}"]`);
    $tabContent.classList.add("active");
    this.classList.add("active");

    lastActiveTab = $tabContent;
    lastActiveTabBtn = this;
  });
});

const cursor = document.getElementById('cursor');
cursor.style.position = 'fixed'; // Add 'position: fixed' to ensure absolute positioning

let cursorX = 0,
  cursorY = 0;

const isTouchDevice = () => {
  try {
    document.createEvent('TouchEvent');
    return true;
  } catch (e) {
    return false;
  }
};

const move = (e) => {
  if (!isTouchDevice()) {
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursor.style.left = `${cursorX}px`;
    cursor.style.top = `${cursorY}px`;
  } else {
    // Disable custom cursor on touch devices
    cursor.style.display = "none";
    return;
  }
  
  cursor.style.zIndex = "9999";
  cursor.style.display = "block";
};

document.addEventListener('mouseenter', (e) => {
  cursor.style.zIndex = "9999";
  move(e);
});

document.addEventListener('mouseleave', () => {
  if (isTouchDevice()) {
    cursor.style.display = "none";
  }
});

document.addEventListener('mousemove', (e) => {
  move(e);
});

document.addEventListener('touchmove', (e) => {
  move(e);
  cursor.style.display = "none";
});

document.addEventListener('touchend', () => {
  cursor.style.display = "none";
});

document.addEventListener('touchstart', (e) => {
  cursor.style.display = "none"; // Hide the cursor on touchstart
  const scrollX = e.touches[0].pageX;
  const scrollY = e.touches[0].pageY;
  move({ clientX: scrollX, clientY: scrollY });
});

// animate border
const borderAnimation = () => {
  requestAnimationFrame(borderAnimation);
};

requestAnimationFrame(borderAnimation);

// handle scroll event
document.addEventListener('scroll', (e) => {
  const scrollX = e.pageX;
  const scrollY = e.pageY;
  move({ clientX: scrollX, clientY: scrollY });
});

function sendEmail() {
  emailjs.send('service_j9prncb', 'template_drg2vil', {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    subject: document.getElementById('subject').value,
    message: document.getElementById('message').value
  })
  .then(function(response) {
    console.log('SUCCESS!', response.status, response.text);
  }, function(error) {
    console.log('FAILED...', error);
  });
}

// ===== Contact form submission =====
document.addEventListener('DOMContentLoaded', () => {

  // Contact form submission
  const form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitButton = form.querySelector('button[type="submit"]');
      const originalButtonText = submitButton.innerHTML;
      
      try {
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.innerHTML = 'Odesílám...';
        }

        const data = Object.fromEntries(new FormData(form));
        const params = new URLSearchParams(data);
        // Preserve existing query string too
        const existing = window.location.search.replace(/^\?/, '');
        const url = 'https://sendmail.tdvorak.dev/send' + (existing ? ('?' + existing + '&' + params.toString()) : ('?' + params.toString()));

        const res = await fetch(url, { method: 'GET' });
        const text = await res.text();

        if (res.ok) {
          alert('Děkujeme za vaši zprávu! Brzy se vám ozveme zpět.');
          form.reset();
        } else {
          throw new Error(text || 'Něco se pokazilo. Zkuste to prosím znovu.');
        }
      } catch (error) {
        console.error('Error:', error);
        alert(error.message || 'Při odesílání zprávy došlo k chybě. Zkuste to prosím znovu později.');
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.innerHTML = originalButtonText;
        }
      }
    });
  }
});
