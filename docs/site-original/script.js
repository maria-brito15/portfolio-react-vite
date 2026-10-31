// ========== THEME ==========
const html = document.documentElement;
function applyTheme(t) {
  html.setAttribute("data-theme", t);
  const d = t === "dark";
  const themeIcon = document.getElementById("themeIcon");
  const themeLabel = document.getElementById("themeLabel");
  if (themeIcon && themeLabel) {
    themeIcon.textContent = d ? "☀️" : "🌙";
    themeLabel.textContent = d ? "Modo claro" : "Modo escuro";
  }
  try {
    localStorage.setItem("portfolio-theme", t);
  } catch (e) {}
}
function toggleTheme() {
  const current = html.getAttribute("data-theme") || "dark";
  applyTheme(current === "dark" ? "light" : "dark");
}
try {
  const saved = localStorage.getItem("portfolio-theme");
  if (saved) applyTheme(saved);
} catch (e) {}

// ========== RADIAL EFFECT ON PROJECT CARDS ==========
const projCards = document.querySelectorAll(".proj-card");
if (projCards.length) {
  projCards.forEach((c) => {
    c.addEventListener("mousemove", (e) => {
      const r = c.getBoundingClientRect();
      c.style.setProperty(
        "--mx",
        (((e.clientX - r.left) / r.width) * 100).toFixed(1) + "%",
      );
      c.style.setProperty(
        "--my",
        (((e.clientY - r.top) / r.height) * 100).toFixed(1) + "%",
      );
    });
  });
}

// ========== INTERSECTION OBSERVER ==========
const fadeElements = document.querySelectorAll(".ap");
if (fadeElements.length) {
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("v");
      }),
    { threshold: 0.12 },
  );
  fadeElements.forEach((el) => observer.observe(el));
}

// ========== SMOOTH SCROLL FOR ANCHOR LINKS ==========
const anchorLinks = document.querySelectorAll('a[href^="#"]');
if (anchorLinks.length) {
  anchorLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = document.querySelector(a.getAttribute("href"));
      if (target) target.scrollIntoView({ behavior: "smooth" });
    });
  });
}

// ========== FAQ ACCORDION ==========
const faqButtons = document.querySelectorAll(".faq-q");
if (faqButtons.length) {
  faqButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      // close all
      document.querySelectorAll(".faq-q").forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        if (b.nextElementSibling) b.nextElementSibling.classList.remove("open");
      });
      if (!expanded) {
        btn.setAttribute("aria-expanded", "true");
        if (btn.nextElementSibling)
          btn.nextElementSibling.classList.add("open");
      }
    });
  });
}

// ========== LIGHTBOX ==========
(function () {
  const lb = document.getElementById("lightbox"),
    lbImg = document.getElementById("lb-img"),
    lbCounter = document.getElementById("lb-counter"),
    lbClose = document.getElementById("lb-close"),
    lbPrev = document.getElementById("lb-prev"),
    lbNext = document.getElementById("lb-next");
  if (!lb || !lbImg || !lbCounter || !lbClose || !lbPrev || !lbNext) return;

  let currentIndex = 0,
    currentGroup = [];

  function bindGallery(container, imgSelector, wrapSelector) {
    const imgs = Array.from(container.querySelectorAll(imgSelector));
    const group = imgs.map((img) => ({ src: img.src, alt: img.alt }));
    imgs.forEach((img, i) => {
      const wrap = wrapSelector ? img.closest(wrapSelector) : img.parentElement;
      if (!wrap) return;
      wrap.setAttribute("role", "button");
      wrap.setAttribute("tabindex", "0");
      wrap.setAttribute("aria-label", "Ampliar imagem");
      const open = () => openLb(group, i);
      wrap.addEventListener("click", open);
      wrap.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") open();
      });
    });
  }

  const galleries = document.querySelectorAll(".case-img-grid");
  if (galleries.length) {
    galleries.forEach((g) => bindGallery(g, ".img-wrap img", ".img-wrap"));
  }

  function openLb(group, idx) {
    currentGroup = group;
    currentIndex = idx;
    showImg();
    lb.classList.add("open");
    document.body.style.overflow = "hidden";
  }
  function closeLb() {
    lb.classList.remove("open");
    document.body.style.overflow = "";
  }
  function showImg() {
    const item = currentGroup[currentIndex];
    lbImg.src = item.src;
    lbImg.alt = item.alt;
    lbCounter.textContent = currentIndex + 1 + " / " + currentGroup.length;
    lbPrev.style.display = currentGroup.length > 1 ? "flex" : "none";
    lbNext.style.display = currentGroup.length > 1 ? "flex" : "none";
  }
  lbClose.addEventListener("click", closeLb);
  lbPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentGroup.length) {
      currentIndex =
        (currentIndex - 1 + currentGroup.length) % currentGroup.length;
      showImg();
    }
  });
  lbNext.addEventListener("click", (e) => {
    e.stopPropagation();
    if (currentGroup.length) {
      currentIndex = (currentIndex + 1) % currentGroup.length;
      showImg();
    }
  });
  lb.addEventListener("click", (e) => {
    if (e.target === lb) closeLb();
  });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") closeLb();
    if (e.key === "ArrowLeft") {
      if (currentGroup.length) {
        currentIndex =
          (currentIndex - 1 + currentGroup.length) % currentGroup.length;
        showImg();
      }
    }
    if (e.key === "ArrowRight") {
      if (currentGroup.length) {
        currentIndex = (currentIndex + 1) % currentGroup.length;
        showImg();
      }
    }
  });
})();
