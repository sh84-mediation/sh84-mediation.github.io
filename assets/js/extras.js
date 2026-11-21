/* =========================================================
   Дизайн-детали и пасхалки школьной службы медиации
   Ничего критичного: если что-то не сработало — сайт живёт как жил.
   ========================================================= */
(() => {
  "use strict";

  if (window.__sh84Extras) return;
  window.__sh84Extras = true;

  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const EGGS_KEY = "sh84-eggs-found";

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

  const countEgg = (name) => {
    let found = [];
    try {
      found = JSON.parse(localStorage.getItem(EGGS_KEY) || "[]");
    } catch (error) {}
    if (!found.includes(name)) {
      found.push(name);
      try {
        localStorage.setItem(EGGS_KEY, JSON.stringify(found));
      } catch (error) {}
    }
    return found.length;
  };

  /* ---------- «Дождь мира»: 🕊️ 🤝 🌿 ✨ ---------- */
  const dropPeace = (amount = 30) => {
    if (reduced) {
      toast("Пусть в ваших переговорах будет мир 🤝");
      return;
    }
    const layer = document.createElement("div");
    layer.className = "egg-drop";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);
    const glyphs = ["🕊️", "🤝", "🌿", "✨", "💚"];
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
    if (!hero || reduced || !window.matchMedia("(pointer: fine)").matches) return;
    let frame = 0;
    hero.addEventListener("pointermove", (event) => {
      const rect = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", `${event.clientX - rect.left}px`);
      hero.style.setProperty("--my", `${event.clientY - rect.top}px`);
      if (!frame) {
        frame = window.requestAnimationFrame(() => {
          frame = 0;
          hero.classList.add("has-spotlight");
        });
      }
    });
    hero.addEventListener("pointerleave", () => hero.classList.remove("has-spotlight"));
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

  /* ---------- Фраза дня в подвале ---------- */
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
    const motto = MOTTO[dayOfYear % MOTTO.length];
    const line = document.createElement("p");
    line.className = "footer__motto";
    const label = document.createElement("span");
    label.className = "footer__motto-label";
    label.textContent = "Фраза дня";
    line.appendChild(label);
    line.appendChild(document.createTextNode(motto));
    legal.before(line);
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

  /* ---------- Приветствие в консоли для любопытных ---------- */
  safe(() => {
    if (reduced) return;
    console.log(
      "%c        ╭─────────────╮         ╭─────────────╮\n" +
        "        │  «Здравствуйте!»  │───│  «Здравствуйте!»  │\n" +
        "        ╰─────────────╯         ╰─────────────╯",
      "color:#1e9a78;font-weight:bold;font-family:monospace"
    );
    console.log(
      "%cВы заглянули под капот школьной службы медиации. И правильно: здесь всё открыто.\n" +
        "%cНайдите «код мира»: ↑ ↑ ↓ ↓ ← → ← → B A\n" +
        "%c…или просто наберите на клавиатуре слово: мир",
      "color:#0f241e;font-size:12px",
      "color:#15785e;font-size:12px;font-weight:bold",
      "color:#15785e;font-size:12px"
    );
  });

  /* ---------- Код мира: Konami или слово «мир» ---------- */
  safe(() => {
    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let progress = 0;
    let typed = "";
    let triggered = false;
    const fire = () => {
      if (triggered) return;
      triggered = true;
      const total = countEgg("peace-code");
      dropPeace(34);
      window.setTimeout(() => {
        toast(total > 1 ? `Пасхалка №${total}: мир — главное правило переговоров 🕊️` : "Пасхалка найдена: мир — главное правило переговоров 🕊️");
      }, 300);
      window.setTimeout(() => (triggered = false), 4000);
    };
    document.addEventListener("keydown", (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) fire();
      if (key.length === 1 && /[а-яёa-z]/i.test(key)) {
        typed = (typed + key).slice(-6);
        if (typed.endsWith("мир") || typed.endsWith("peace")) fire();
      }
    });
  });

  /* ---------- Три клика по логотипу: диалог двух пузырьков ---------- */
  safe(() => {
    const mark = document.querySelector(".site-header .brand__mark");
    if (!mark) return;
    let clicks = 0;
    let timer = 0;
    mark.addEventListener("click", () => {
      clicks += 1;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => (clicks = 0), 700);
      if (clicks >= 3) {
        clicks = 0;
        countEgg("logo-talk");
        dropPeace(12);
        toast("Два пузырька логотипа — два собеседника. Третий клик — ваша реплика 🫧");
      }
    });
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
})();
