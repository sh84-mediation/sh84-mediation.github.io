(() => {
  "use strict";

  const header = document.getElementById("site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const brand = document.querySelector(".site-header .brand");
  const mobileLinks = mobileMenu ? Array.from(mobileMenu.querySelectorAll("a")) : [];
  let menuOpen = false;

  /* Тень шапки при прокрутке */
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = window.requestAnimationFrame(() => {
      frame = 0;
      header?.classList.toggle("is-scrolled", window.scrollY > 8);
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Мобильное меню */
  const setMenu = (open, restoreFocus = false) => {
    if (!menuToggle || !mobileMenu) return;
    menuOpen = open;
    document.body.classList.toggle("menu-open", open);
    mobileMenu.classList.toggle("is-open", open);
    mobileMenu.setAttribute("aria-hidden", String(!open));

    if (open) {
      mobileMenu.removeAttribute("inert");
    } else {
      mobileMenu.setAttribute("inert", "");
    }

    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");

    if (open) {
      // The menu becomes focusable only after the browser applies inert/visibility.
      window.setTimeout(() => mobileLinks[0]?.focus({ preventScroll: true }), 30);
    } else if (restoreFocus) {
      menuToggle.focus({ preventScroll: true });
    }
  };

  menuToggle?.addEventListener("click", () => setMenu(!menuOpen));
  mobileLinks.forEach((link) => link.addEventListener("click", () => setMenu(false)));
  brand?.addEventListener("click", () => setMenu(false));

  const a11yButton = document.querySelector(".site-header .a11y-toggle");
  document.addEventListener("keydown", (event) => {
    if (!menuOpen) return;
    if (event.key === "Escape") {
      event.preventDefault();
      setMenu(false, true);
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = [brand, a11yButton, menuToggle, ...mobileLinks].filter(Boolean);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  window.matchMedia("(min-width: 921px)").addEventListener?.("change", (event) => {
    if (event.matches && menuOpen) setMenu(false);
  });

  /* Просмотр фотографий и документов */
  const triggers = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (!triggers.length) return;

  const lightbox = document.createElement("dialog");
  lightbox.className = "lightbox";
  lightbox.setAttribute("aria-label", "Просмотр изображения");
  lightbox.innerHTML = `
    <button class="lightbox__close" type="button" data-lightbox-close>Закрыть</button>
    <button class="lightbox__nav lightbox__nav--prev" type="button" data-lightbox-prev aria-label="Предыдущее изображение">
      <svg class="icon" aria-hidden="true"><use href="#icon-chevron"></use></svg>
    </button>
    <figure class="lightbox__figure">
      <img class="lightbox__image" data-lightbox-image alt="" />
      <figcaption class="lightbox__caption" data-lightbox-caption></figcaption>
    </figure>
    <button class="lightbox__nav lightbox__nav--next" type="button" data-lightbox-next aria-label="Следующее изображение">
      <svg class="icon" aria-hidden="true"><use href="#icon-chevron"></use></svg>
    </button>
  `;
  document.body.appendChild(lightbox);

  const image = lightbox.querySelector("[data-lightbox-image]");
  const caption = lightbox.querySelector("[data-lightbox-caption]");
  const prev = lightbox.querySelector("[data-lightbox-prev]");
  const next = lightbox.querySelector("[data-lightbox-next]");
  const close = lightbox.querySelector("[data-lightbox-close]");
  const groups = new Map();
  let group = null;
  let active = 0;

  triggers.forEach((trigger) => {
    const img = trigger.querySelector("img");
    const source = trigger.dataset.full || img?.currentSrc || img?.getAttribute("src");
    if (!source) return;

    const section = trigger.closest("section") || document.body;
    if (!groups.has(section)) groups.set(section, []);
    const slides = groups.get(section);
    const index = slides.length;
    slides.push({
      src: source,
      alt: img?.getAttribute("alt") || "Изображение",
      caption:
        trigger.dataset.caption ||
        trigger.closest("figure")?.querySelector("figcaption")?.textContent.trim() ||
        "",
    });
    trigger.addEventListener("click", () => open(slides, index));
  });

  if (!groups.size) {
    lightbox.remove();
    return;
  }

  function show(index) {
    if (!group) return;
    active = (index + group.length) % group.length;
    const slide = group[active];
    image.src = slide.src;
    image.alt = slide.alt;
    caption.textContent = slide.caption;
    const multiple = group.length > 1;
    prev.hidden = !multiple;
    next.hidden = !multiple;
  }

  function open(slides, index) {
    group = slides;
    show(index);
    if (typeof lightbox.showModal === "function") {
      lightbox.showModal();
    } else {
      lightbox.setAttribute("open", "");
    }
    document.documentElement.classList.add("lightbox-open");
  }

  function closeLightbox() {
    if (typeof lightbox.close === "function") {
      lightbox.close();
    } else {
      lightbox.removeAttribute("open");
      document.documentElement.classList.remove("lightbox-open");
    }
  }

  close.addEventListener("click", closeLightbox);
  prev.addEventListener("click", () => show(active - 1));
  next.addEventListener("click", () => show(active + 1));

  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) closeLightbox();
  });

  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(active - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      show(active + 1);
    }
  });

  lightbox.addEventListener("close", () => {
    document.documentElement.classList.remove("lightbox-open");
    image.removeAttribute("src");
  });
})();
