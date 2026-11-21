/* =========================================================
   Дизайн-детали и пасхалки школьной службы медиации
   Ничего критичного: если что-то не сработало — сайт живёт как жил.
   У ПК и у телефона — свои наборы секретов (трекер в подвале).
   Подсказки спрятаны по всему сайту — присмотритесь.
   ========================================================= */
(() => {
  "use strict";

  if (window.__sh84Extras) return;
  window.__sh84Extras = true;

  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = !window.matchMedia("(pointer: coarse)").matches;
  const EGGS_KEY = "sh84-eggs-found";

  /* Каталог секретов: у ПК и у телефона — свои наборы */
  const EGG_LIST = {
    "peace-code": { where: "pc", label: "код мира (↑↑↓↓←→←→BA или слово «мир»)" },
    "logo-talk": { where: "pc", label: "три клика по логотипу" },
    "logo-longpress": { where: "both", label: "долгое нажатие на логотип" },
    "thanks-word": { where: "pc", label: "вежливое слово с клавиатуры" },
    "school84": { where: "pc", label: "число школы, набранное на клавиатуре" },
    "shake-it": { where: "phone", label: "встряска конфликта" },
    "two-parties": { where: "phone", label: "две стороны за одним столом" },
    "motto-mix": { where: "both", label: "другая формулировка фразы дня" },
  };

  const safe = (fn) => {
    try {
      fn();
    } catch (error) {
      /* пасхалки не должны ломать сайт */
    }
  };

  /* ---------- Тосты (мягкие уведомления) ---------- */
  let toastZone = null;
  const toast = (message) => {
    if (!toastZone) {
      toastZone = document.createElement("div");
      toastZone.className = "toast-zone";
      toastZone.setAttribute("role", "status");
      toastZone.setAttribute("aria-live", "polite");
      document.body.appendChild(toastZone);
    }
    const item = document.createElement("p");
    item.className = "toast";
    item.textContent = message;
    toastZone.appendChild(item);
    while (toastZone.children.length > 2) toastZone.firstElementChild.remove();
    window.setTimeout(() => {
      item.classList.add("is-leaving");
      window.setTimeout(() => item.remove(), 350);
    }, 4600);
  };

  /* ---------- Учёт найденных пасхалок ---------- */
  const readEggs = () => {
    try {
      const list = JSON.parse(localStorage.getItem(EGGS_KEY) || "[]");
      return Array.isArray(list) ? list : [];
    } catch (error) {
      return [];
    }
  };

  /* Телефон или ПК: наборы секретов разные */
  const isTouchDevice = () =>
    window.matchMedia("(pointer: coarse)").matches ||
    (navigator.maxTouchPoints || 0) > 0 ||
    "ontouchstart" in window;

  const eggsForDevice = (touch) =>
    Object.entries(EGG_LIST).filter(([, meta]) => (touch ? meta.where !== "pc" : meta.where !== "phone"));

  let trackerNode = null;
  const renderTracker = () => {
    const legal = document.querySelector(".footer__legal");
    if (!legal) return;
    const touch = isTouchDevice();
    const available = eggsForDevice(touch);
    const found = available.filter(([name]) => readEggs().includes(name));
    if (!found.length) return;
    if (!trackerNode) {
      trackerNode = document.createElement("p");
      trackerNode.className = "footer__eggs";
      legal.appendChild(trackerNode);
    }
    trackerNode.textContent = "";
    const icon = document.createElement("span");
    icon.textContent = touch ? "📱" : "🖥️";
    icon.setAttribute("aria-hidden", "true");
    trackerNode.appendChild(icon);
    trackerNode.appendChild(
      document.createTextNode(`Секреты ${touch ? "телефона" : "ПК"}: ${found.length} из ${available.length}`)
    );
    const rest = available.length - found.length;
    trackerNode.title = `Открыто: ${found
      .map(([name]) => EGG_LIST[name].label)
      .join(" · ")}. Ещё ${rest} ждёт своего исследователя.${
      touch ? " А у ПК — свой набор секретов." : " А у телефона — свой набор секретов."
    }`;
  };

  const countEgg = (name) => {
    const found = readEggs();
    if (!found.includes(name)) {
      found.push(name);
      try {
        localStorage.setItem(EGGS_KEY, JSON.stringify(found));
      } catch (error) {}
    }
    renderTracker();
    return found.length;
  };

  /* ---------- «Дождь мира» и его варианты ---------- */
  const PEACE_GLYPHS = ["🕊️", "🤝", "🌿", "✨", "💚"];
  const HEART_GLYPHS = ["💛", "💚", "🤝", "✨", "🌟"];
  const dropPeace = (amount = 30, glyphs = PEACE_GLYPHS) => {
    if (reduced) return;
    const layer = document.createElement("div");
    layer.className = "egg-drop";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    for (let i = 0; i < amount; i += 1) {
      const flake = document.createElement("span");
      flake.textContent = glyphs[Math.floor(Math.random() * glyphs.length)];
      flake.style.left = `${Math.random() * 96 + 2}%`;
      flake.style.fontSize = `${14 + Math.random() * 18}px`;
      flake.style.opacity = String(0.7 + Math.random() * 0.3);
      layer.appendChild(flake);
      const sway = (Math.random() * 2 - 1) * 70;
      const spin = (Math.random() * 2 - 1) * 260;
      const anim = flake.animate(
        [
          { transform: "translate(0, -10vh) rotate(0deg)" },
          { transform: `translate(${sway}px, 52vh) rotate(${spin * 0.6}deg)`, offset: 0.55 },
          { transform: `translate(${sway * 0.4}px, 112vh) rotate(${spin}deg)` },
        ],
        { duration: 2400 + Math.random() * 2000, delay: Math.random() * 700, easing: "cubic-bezier(.3,.4,.6,1)" }
      );
      anim.onfinish = () => {
        flake.remove();
        if (!layer.childElementCount) layer.remove();
      };
    }
  };

  /* ---------- Спецэффекты: у каждой пасхалки — свой сценарий ---------- */
  const rand = (min, max) => min + Math.random() * (max - min);

  const spawnFx = (kind, anchor) => {
    if (reduced) return;
    safe(() => {
      const layer = document.createElement("div");
      layer.className = `egg-fx egg-fx--${kind}`;
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
      let ttl = 2200;
      const place = (tag, cls, css, text) => {
        const el = document.createElement(tag);
        if (cls) el.className = cls;
        for (const [key, value] of Object.entries(css)) {
          if (key.startsWith("--")) el.style.setProperty(key, value);
          else el.style[key] = value;
        }
        if (text) el.textContent = text;
        layer.appendChild(el);
        return el;
      };
      let center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      if (anchor) {
        const r = anchor.getBoundingClientRect();
        center = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      }

      if (kind === "doves") {
        place("i", "egg-fx__glow", {});
        for (let i = 0; i < 6; i += 1) {
          const toRight = i % 2 === 0;
          place("span", "", {
            left: toRight ? "-10%" : "110%",
            top: `${rand(18, 74)}%`,
            fontSize: `${rand(22, 36)}px`,
            "--fly": toRight ? "124vw" : "-124vw",
            "--dur": `${rand(1.5, 2.4)}s`,
            "--delay": `${rand(0, 0.5)}s`,
          }, PEACE_GLYPHS[0]);
        }
        ttl = 3100;
      } else if (kind === "hearts") {
        for (let i = 0; i < 16; i += 1) {
          place("span", "", {
            left: `${center.x}px`,
            top: `${center.y}px`,
            fontSize: `${rand(16, 30)}px`,
            "--dx": `${rand(-240, 240)}px`,
            "--dy": `${rand(-340, -70)}px`,
            "--dur": `${rand(1.1, 1.6)}s`,
            "--delay": `${rand(0, 0.25)}s`,
          }, HEART_GLYPHS[i % HEART_GLYPHS.length]);
        }
        ttl = 2000;
      } else if (kind === "stamp84") {
        const COLORS = ["#1e9a78", "#a9edcf", "#f2c94c", "#0b4a3a", "#fdf6e3"];
        for (let i = 0; i < 24; i += 1) {
          place("i", "", {
            left: `${rand(2, 98)}%`,
            "--w": `${rand(6, 11)}px`,
            "--h": `${rand(10, 17)}px`,
            "--c": COLORS[i % COLORS.length],
            "--spin": `${rand(-420, 420)}deg`,
            "--dur": `${rand(1.3, 2.1)}s`,
            "--delay": `${rand(0, 0.3)}s`,
          });
        }
        place("b", "egg-fx__stamp", {}, "84");
        ttl = 2100;
      } else if (kind === "bubbles") {
        for (let i = 0; i < 9; i += 1) {
          place("span", "", {
            left: `${center.x + rand(-36, 36)}px`,
            top: `${center.y + rand(-14, 14)}px`,
            fontSize: `${rand(12, 26)}px`,
            "--sway": `${rand(-46, 46)}px`,
            "--rise": `${rand(22, 38)}vh`,
            "--dur": `${rand(1.4, 2.2)}s`,
            "--delay": `${rand(0, 0.4)}s`,
          }, "🫧");
        }
        ttl = 2700;
      } else if (kind === "rings") {
        for (let i = 0; i < 3; i += 1) {
          place("i", "", {
            left: `${center.x}px`,
            top: `${center.y}px`,
            "--delay": `${i * 0.16}s`,
          });
        }
        if (anchor) {
          anchor.classList.remove("is-egg-pulse");
          void anchor.offsetWidth;
          anchor.classList.add("is-egg-pulse");
          window.setTimeout(() => anchor.classList.remove("is-egg-pulse"), 1100);
        }
        ttl = 1500;
      } else if (kind === "wobble") {
        ["main", ".site-footer"].forEach((sel) => {
          const el = document.querySelector(sel);
          if (!el) return;
          el.classList.remove("is-egg-wobble");
          void el.offsetWidth;
          el.classList.add("is-egg-wobble");
          window.setTimeout(() => el.classList.remove("is-egg-wobble"), 800);
        });
        ttl = 900;
      } else if (kind === "sparks") {
        for (let i = 0; i < 8; i += 1) {
          place("span", "", {
            left: `${center.x}px`,
            top: `${center.y}px`,
            fontSize: `${rand(12, 20)}px`,
            "--dx": `${rand(-110, 110)}px`,
            "--dy": `${rand(-110, 60)}px`,
            "--dur": "0.9s",
            "--delay": `${rand(0, 0.2)}s`,
          }, "✨");
        }
        ttl = 1300;
      }
      window.setTimeout(() => layer.remove(), ttl);
    });
  };
  window.__sh84Fx = spawnFx;

  /* ---------- Полоса прогресса чтения под шапкой ---------- */
  safe(() => {
    const header = document.querySelector(".site-header");
    if (!header) return;
    const bar = document.createElement("div");
    bar.className = "scroll-progress";
    bar.setAttribute("aria-hidden", "true");
    header.appendChild(bar);
    let frame = 0;
    const paint = () => {
      frame = 0;
      const max = root.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      bar.style.transform = `scaleX(${value})`;
    };
    window.addEventListener("scroll", () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    }, { passive: true });
    paint();
  });

  /* ---------- Кнопка «наверх» с круговым индикатором ---------- */
  safe(() => {
    const RING = 2 * Math.PI * 24;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "to-top";
    button.setAttribute("aria-label", "Наверх страницы");
    button.title = "Наверх страницы";
    button.innerHTML = `
      <svg viewBox="0 0 52 52" aria-hidden="true" focusable="false">
        <circle class="to-top__ring" cx="26" cy="26" r="24" />
        <circle class="to-top__fill" cx="26" cy="26" r="24" />
      </svg>
      <svg class="to-top__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <path d="m5 15 7-7 7 7" />
      </svg>`;
    document.body.appendChild(button);
    const fill = button.querySelector(".to-top__fill");
    fill.style.strokeDasharray = String(RING);
    let frame = 0;
    const paint = () => {
      frame = 0;
      const max = root.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      fill.style.strokeDashoffset = String(RING * (1 - value));
      button.classList.toggle("is-visible", window.scrollY > 640);
    };
    window.addEventListener("scroll", () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    }, { passive: true });
    paint();
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    });
  });

  /* ---------- Плавное появление карточек при прокрутке ---------- */
  safe(() => {
    if (reduced || typeof IntersectionObserver !== "function") return;
    const selector = [
      ".section-head",
      ".about__text",
      ".about__note",
      ".principle",
      ".documents__group",
      ".home-link",
      ".curator",
      ".member",
      ".award",
      ".gallery-item",
      ".video-card",
    ].join(",");
    const targets = Array.from(document.querySelectorAll(selector));
    if (!targets.length) return;
    targets.forEach((el) => el.classList.add("reveal"));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -8% 0px" });
    targets.forEach((el) => {
      const parent = el.parentElement;
      const index = parent ? Array.from(parent.children).indexOf(el) : 0;
      el.style.setProperty("--reveal-delay", `${Math.min(index * 70, 420)}ms`);
      observer.observe(el);
    });
  });

  /* ---------- Подсветка в «шапке-герое» следует за курсором ---------- */
  safe(() => {
    const hero = document.querySelector(".hero");
    if (!hero || reduced || !finePointer) return;
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      hero.style.setProperty("--my", `${event.clientY - rect.top}px`);
      hero.classList.add("has-spotlight");
    });
    hero.addEventListener("pointerleave", () => hero.classList.remove("has-spotlight"));
  });

  /* ---------- Параллакс точек в «герое» ---------- */
  safe(() => {
    const hero = document.querySelector(".hero");
    if (!hero || reduced) return;
    let frame = 0;
    const paint = () => {
      frame = 0;
      hero.style.setProperty("--hero-parallax", `${Math.round(window.scrollY * -0.06)}px`);
    };
    window.addEventListener("scroll", () => {
      if (!frame) frame = window.requestAnimationFrame(paint);
    }, { passive: true });
    paint();
  });

  /* ---------- Тилт карточек (только мышь) ---------- */
  safe(() => {
    if (reduced || !finePointer) return;
    document.querySelectorAll(".principle, .home-link").forEach((card) => {
      card.classList.add("tilt");
      card.addEventListener("pointermove", (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.setProperty("--tx", `${(x * 5).toFixed(2)}deg`);
        card.style.setProperty("--ty", `${(y * -5).toFixed(2)}deg`);
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tx", "0deg");
        card.style.setProperty("--ty", "0deg");
      });
    });
  });

  /* ---------- «Эхо диалога»: круг на месте нажатия ---------- */
  safe(() => {
    if (reduced) return;
    document.addEventListener("pointerdown", (event) => {
      if (event.target.closest("a, button, input, textarea, select, label, .a11y-option")) return;
      const ping = document.createElement("span");
      ping.className = "ping";
      ping.setAttribute("aria-hidden", "true");
      ping.style.left = `${event.clientX}px`;
      ping.style.top = `${event.clientY}px`;
      document.body.appendChild(ping);
      ping.animate(
        [
          { transform: "scale(0.4)", opacity: 0.45 },
          { transform: "scale(5.2)", opacity: 0 },
        ],
        { duration: 620, easing: "cubic-bezier(.2,.6,.4,1)" }
      ).onfinish = () => ping.remove();
    });
  });

  /* ---------- «Сейчас приём»: живой индикатор расписания (МСК) ---------- */
  safe(() => {
    const card = document.querySelector(".appointment");
    if (!card) return;
    const SCHEDULE = { 3: ["15:00", "17:00"], 4: ["10:00", "12:00"], 5: ["15:00", "17:00"] };
    const DAY_NAMES = { 3: "в среду", 4: "в четверг", 5: "в пятницу" };
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Moscow",
      weekday: "short",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    }).formatToParts(new Date());
    const get = (type) => parts.find((part) => part.type === type)?.value || "";
    const weekdays = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    const today = weekdays[get("weekday")] ?? new Date().getDay();
    const now = (Number(get("hour")) || 0) * 60 + (Number(get("minute")) || 0);
    const toMinutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

    const badge = document.createElement("p");
    badge.className = "visit-badge";
    const dot = document.createElement("span");
    dot.className = "visit-badge__dot";
    dot.setAttribute("aria-hidden", "true");
    badge.appendChild(dot);
    const text = document.createElement("span");

    let open = false;
    for (let shift = 0; shift <= 7 && !open; shift += 1) {
      const day = (today + shift) % 7;
      const slot = SCHEDULE[day];
      if (!slot) continue;
      const start = toMinutes(slot[0]);
      const end = toMinutes(slot[1]);
      if (shift === 0 && now >= end) continue;
      if (shift === 0 && now >= start) {
        text.textContent = `Сейчас приём · до ${slot[1]}`;
        open = true;
        break;
      }
      const when = shift === 0 ? "сегодня" : shift === 1 ? "завтра" : DAY_NAMES[day];
      text.textContent = `Ближайший приём ${when} · ${slot[0]}–${slot[1]}`;
      break;
    }
    badge.classList.toggle("is-open", open);
    badge.appendChild(text);
    badge.title = "Приём заявителей: среда и пятница 15:00–17:00, четверг 10:00–12:00 (время московское)";
    const heading = card.querySelector("h2");
    if (heading) heading.after(badge);
    else card.prepend(badge);
  });

  /* ---------- Фраза дня в подвале (можно перетасовать) ---------- */
  safe(() => {
    const footer = document.querySelector(".site-footer .container");
    const legal = document.querySelector(".footer__legal");
    if (!footer || !legal) return;
    const MOTTO = [
      "Услышать — уже наполовину помириться.",
      "Сильный не тот, кто громче, а тот, кто слышит.",
      "Спор — это два ответа, которым не хватило одного разговора.",
      "Прежде чем искать виноватого, поищите решение.",
      "В каждом «нет» спрятано чьё-то непонятое «да».",
      "Два уха и один рот: слушайте вдвое больше, чем говорите.",
      "Конфликт — это вопрос, который наконец задали вслух.",
      "Договориться можно о большем, чем кажется.",
      "Тишина в переговорах тоже работает — дайте мысли договорить.",
      "Мир — это не отсутствие споров, а умение их заканчивать.",
      "Один спокойный тон стоит десяти убедительных аргументов.",
      "Иногда, чтобы договориться, нужно просто выпить чаю.",
    ];
    const now = new Date();
    const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
    let current = dayOfYear % MOTTO.length;

    const line = document.createElement("p");
    line.className = "footer__motto";
    line.title = "Нажмите ↻ — скажем иначе";
    const label = document.createElement("span");
    label.className = "footer__motto-label";
    label.textContent = "Фраза дня";
    line.appendChild(label);
    const text = document.createElement("span");
    text.className = "footer__motto-text";
    text.textContent = MOTTO[current];
    line.appendChild(text);
    const shuffle = document.createElement("button");
    shuffle.type = "button";
    shuffle.className = "footer__motto-shuffle";
    shuffle.setAttribute("aria-label", "Показать другую фразу");
    shuffle.innerHTML =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6"/></svg>';
    line.appendChild(shuffle);
    legal.before(line);

    let mixes = 0;
    const remix = () => {
      let next = current;
      while (next === current) next = Math.floor(Math.random() * MOTTO.length);
      current = next;
      mixes += 1;
      line.classList.remove("is-shuffling");
      void line.offsetWidth;
      line.classList.add("is-shuffling");
      text.textContent = MOTTO[current];
      if (mixes === 1) {
        countEgg("motto-mix");
        spawnFx("sparks", shuffle);
        toast("Формулировки — тоже переговоры. Ещё разок? ↻");
      }
    };
    shuffle.addEventListener("click", remix);
    text.addEventListener("dblclick", remix);
  });

  /* ---------- Фавиконка и заголовок, когда вкладка уходит «на переговоры» ---------- */
  safe(() => {
    const fav = document.querySelector('link[rel="icon"]');
    const baseTitle = document.title;
    const eggFav =
      "data:image/svg+xml," +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="12" fill="#07382c"/><circle cx="18" cy="20" r="8" fill="#fff"/><circle cx="30" cy="28" r="8" fill="none" stroke="#a9edcf" stroke-width="2.5"/><path d="M24 12l1.6 3.4 3.4 1.6-3.4 1.6L24 22l-1.6-3.4L19 17l3.4-1.6Z" fill="#a9edcf"/></svg>'
      );
    let swapped = false;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && !swapped) {
        swapped = true;
        document.title = `${baseTitle} · переговоры на паузе 🤝`;
        if (fav) fav.setAttribute("href", eggFav);
      } else if (!document.hidden && swapped) {
        swapped = false;
        document.title = baseTitle;
        if (fav) fav.setAttribute("href", fav.dataset.originalHref || "assets/favicon.svg");
      }
    });
    if (fav) fav.dataset.originalHref = fav.getAttribute("href");
  });

  /* ---------- Кодовые слова и код мира ---------- */
  safe(() => {
    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let progress = 0;
    let typed = "";
    let fired = 0;

    const firePeace = () => {
      const total = countEgg("peace-code");
      spawnFx("doves");
      window.setTimeout(() => {
        toast(total > 1 ? `Пасхалка №${total}: мир — главное правило переговоров 🕊️` : "Пасхалка найдена: мир — главное правило переговоров 🕊️");
      }, 300);
    };

    const fireThanks = () => {
      const total = countEgg("thanks-word");
      spawnFx("hearts");
      window.setTimeout(() => toast(total > 1 ? `Пасхалка №${total}: и сайт говорит вам спасибо 💛` : "И сайт говорит вам спасибо 💛"), 300);
    };

    const fireSchool = () => {
      countEgg("school84");
      spawnFx("stamp84");
      document.querySelectorAll(".brand__mark").forEach((el) => {
        el.classList.remove("is-dancing");
        void el.offsetWidth;
        el.classList.add("is-dancing");
        window.setTimeout(() => el.classList.remove("is-dancing"), 1200);
      });
      toast("Школа № 84 носит имя дважды Героя Советского Союза П. А. Покрышева ✈️");
    };

    document.addEventListener("keydown", (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) firePeace();
      if (key.length === 1) {
        typed = (typed + key).slice(-8);
        const now = Date.now();
        if (now - fired < 3000) return;
        if (typed.endsWith("мир") || typed.endsWith("peace")) {
          fired = now;
          firePeace();
        } else if (typed.endsWith("спасибо")) {
          fired = now;
          fireThanks();
        } else if (typed.endsWith("84")) {
          fired = now;
          fireSchool();
        }
      }
    });
  });

  /* ---------- Логотип: три клика и долгое нажатие ---------- */
  safe(() => {
    const mark = document.querySelector(".site-header .brand__mark");
    const brandLink = document.querySelector(".site-header a.brand");
    if (!mark || !brandLink) return;

    let clicks = 0;
    let clickTimer = 0;
    mark.addEventListener("click", () => {
      clicks += 1;
      window.clearTimeout(clickTimer);
      clickTimer = window.setTimeout(() => (clicks = 0), 700);
      if (clicks >= 3) {
        clicks = 0;
        countEgg("logo-talk");
        spawnFx("bubbles", mark);
        toast("Два пузырька логотипа — два собеседника. Третий клик — ваша реплика 🫧");
      }
    });

    let holdTimer = 0;
    let suppressClick = false;
    const startHold = (event) => {
      window.clearTimeout(holdTimer);
      holdTimer = window.setTimeout(() => {
        suppressClick = true;
        mark.classList.remove("is-pressing");
        countEgg("logo-longpress");
        spawnFx("bubbles", mark);
        toast("Держать и слушать — уже медиация. Логотип это оценил 🫧");
      }, 550);
      mark.classList.add("is-pressing");
      if (event.pointerType !== "mouse") event.preventDefault?.();
    };
    const cancelHold = () => {
      window.clearTimeout(holdTimer);
      mark.classList.remove("is-pressing");
    };
    mark.addEventListener("pointerdown", startHold);
    ["pointerup", "pointercancel", "pointerleave"].forEach((type) =>
      mark.addEventListener(type, cancelHold)
    );
    mark.addEventListener("contextmenu", (event) => event.preventDefault());
    brandLink.addEventListener(
      "click",
      (event) => {
        if (suppressClick) {
          event.preventDefault();
          event.stopPropagation();
          suppressClick = false;
        }
      },
      true
    );
  });

  /* ---------- Мобильное: две стороны за столом (два пальца) ---------- */
  safe(() => {
    const card = document.querySelector(".appointment");
    if (!card) return;
    let last = 0;
    card.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length < 2) return;
        const now = Date.now();
        if (now - last < 5000) return;
        last = now;
        countEgg("two-parties");
        spawnFx("rings", card);
        toast("Две стороны за одним столом — так и начинаются переговоры 🤝");
      },
      { passive: true }
    );
  });

  /* ---------- Мобильное: встряхни конфликт ---------- */
  safe(() => {
    if (!("DeviceMotionEvent" in window)) return;
    let last = 0;
    const onMotion = (event) => {
      const g = event.accelerationIncludingGravity;
      if (!g) return;
      const magnitude = Math.hypot(g.x || 0, g.y || 0, g.z || 0);
      if (magnitude > 25 && Date.now() - last > 6000) {
        last = Date.now();
        countEgg("shake-it");
        spawnFx("wobble");
        toast("Встряхнули конфликт — он разлетелся конфетти 🕊️");
      }
    };
    if (typeof DeviceMotionEvent.requestPermission === "function") {
      document.addEventListener(
        "pointerdown",
        () => {
          DeviceMotionEvent.requestPermission()
            .then((state) => {
              if (state === "granted") window.addEventListener("devicemotion", onMotion);
            })
            .catch(() => {});
        },
        { once: true }
      );
    } else {
      window.addEventListener("devicemotion", onMotion);
    }
  });

  /* ---------- Кнопки-пасхалки на страницах-спутниках (например, 404) ---------- */
  safe(() => {
    document.querySelectorAll("[data-egg-peace]").forEach((el) => {
      el.addEventListener("click", () => {
        countEgg(el.dataset.eggPeace || "button");
        dropPeace(22);
        toast(el.dataset.eggToast || "Договорились 🤝");
      });
    });
    document.querySelectorAll("[data-egg-count]").forEach((el) => {
      el.addEventListener("click", () => {
        const clicks = (Number(el.dataset.eggCount) || 0) + 1;
        el.dataset.eggCount = String(clicks);
        if (clicks >= 3) {
          el.dataset.eggCount = "0";
          countEgg(el.dataset.eggName || "mystery");
          dropPeace(16);
          toast(el.dataset.eggToast || "Ещё одна пасхалка найдена ✨");
        }
      });
    });
  });

  /* ---------- Трекер секретов ---------- */
  safe(renderTracker);
})();
