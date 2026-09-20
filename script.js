"use strict";

// Theme: persisted in sessionStorage, dark default.
const root = document.documentElement;
root.dataset.theme = sessionStorage.getItem("theme") || "dark";

document.querySelector("[data-theme-btn]")?.addEventListener("click", () => {
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
  sessionStorage.setItem("theme", root.dataset.theme);
});

// Footer year
document.getElementById("year").textContent = new Date().getFullYear();

// Contact form -> sendmail.tdvorak.dev
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = "Sending…";
  status.textContent = "";
  status.className = "form-status mono";

  try {
    const params = new URLSearchParams(Object.fromEntries(new FormData(form)));
    const res = await fetch(`https://sendmail.tdvorak.dev/send?${params}`, { method: "GET" });
    if (!res.ok) throw new Error(await res.text() || "Send failed");
    status.textContent = "Message sent. I'll get back to you soon.";
    status.classList.add("ok");
    form.reset();
  } catch (err) {
    status.textContent = "Something went wrong — try again or email me directly.";
    status.classList.add("err");
  } finally {
    btn.disabled = false;
    btn.textContent = "Send message";
  }
});
