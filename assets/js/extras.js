/* =========================================================
   Дизайн-детали школьной службы медиации
   Ничего критичного: если что-то не сработало — сайт живёт как жил.
   Из пасхалок остались две: «Код konami» (ПК) и прикосновение
   карточки приёма двумя пальцами (телефон).
   ========================================================= */
(() => {
  "use strict";

  if (window.__sh84Extras) return;
  window.__sh84Extras = true;

  const root = document.documentElement;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = !window.matchMedia("(pointer: coarse)").matches;

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

  /* ---------- Кольца на месте касания (две стороны за столом) ---------- */
  const spawnRings = (anchor) => {
    if (reduced) return;
    safe(() => {
      const layer = document.createElement("div");
      layer.className = "egg-fx egg-fx--rings";
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
      let center = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      }
      for (let i = 0; i < 3; i += 1) {
        const ring = document.createElement("i");
        ring.style.left = `${center.x}px`;
        ring.style.top = `${center.y}px`;
        ring.style.setProperty("--delay", `${i * 0.16}s`);
        layer.appendChild(ring);
      }
      if (anchor) {
        anchor.classList.remove("is-egg-pulse");
        void anchor.offsetWidth;
        anchor.classList.add("is-egg-pulse");
        window.setTimeout(() => anchor.classList.remove("is-egg-pulse"), 1100);
      }
      window.setTimeout(() => layer.remove(), 1600);
    });
  };

  /* ---------- Полноэкранная «арка согласия» (две стороны за столом) ---------- */
  const spawnDeal = (anchor) => {
    if (reduced) return;
    safe(() => {
      const layer = document.createElement("div");
      layer.className = "egg-fx egg-fx--deal";
      layer.setAttribute("aria-hidden", "true");
      layer.innerHTML =
        '<b class="egg-deal__band egg-deal__band--left"></b>' +
        '<b class="egg-deal__band egg-deal__band--right"></b>' +
        '<svg class="egg-deal__mark" viewBox="0 0 96 96" fill="none">' +
        '<circle cx="48" cy="48" r="42"></circle>' +
        '<path d="M30 50l13 13 24-28"></path>' +
        "</svg>";
      document.body.appendChild(layer);
      if (anchor) {
        const rect = anchor.getBoundingClientRect();
        layer.style.setProperty("--fx-x", `${(((rect.left + rect.width / 2) / window.innerWidth) * 100).toFixed(1)}%`);
        layer.style.setProperty("--fx-y", `${(((rect.top + rect.height / 2) / window.innerHeight) * 100).toFixed(1)}%`);
      }
      window.setTimeout(() => layer.remove(), 2600);
    });
  };

  /* ---------- «Падающий код зелёных»: матрица из зелёных символов ---------- */
  const MATRIX_GLYPHS = "01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンМИР".split("");
  const spawnMatrix = () => {
    if (reduced) return;
    safe(() => {
      const canvas = document.createElement("canvas");
      canvas.className = "egg-matrix";
      canvas.setAttribute("aria-hidden", "true");
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      document.body.appendChild(canvas);
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        canvas.remove();
        return;
      }
      ctx.scale(dpr, dpr);
      const size = 26;
      const columns = Math.max(Math.ceil(width / (size * 0.95)), 8);
      const drops = Array.from({ length: columns }, () => ({
        row: Math.random() * -50,
        speed: 0.3 + Math.random() * 0.6,
      }));
      const LIFE = 4200;
      const started = performance.now();
      const paint = (now) => {
        const age = now - started;
        ctx.clearRect(0, 0, width, height);
        ctx.font = `bold ${size}px ui-monospace, "Cascadia Mono", monospace`;
        ctx.shadowColor = "rgba(120, 255, 170, 0.9)";
        ctx.shadowBlur = 10;
        drops.forEach((drop, i) => {
          const x = i * size * 0.95 + 4;
          const head = Math.floor(drop.row);
          for (let t = 0; t < 5; t += 1) {
            const y = (head - t) * size;
            if (y < -size || y > height + size) continue;
            if (t === 0) {
              ctx.fillStyle = "rgba(224, 255, 236, 1)";
            } else {
              ctx.fillStyle = `rgba(110, 231, 183, ${(0.85 - t * 0.16).toFixed(2)})`;
            }
            ctx.fillText(
              MATRIX_GLYPHS[(i * 7 + t * 13 + head * 3) % MATRIX_GLYPHS.length],
              x,
              y
            );
          }
          drop.row += drop.speed;
          if (drop.row * size > height + size * 6) drop.row = -(6 + Math.random() * 34);
        });
        if (age > LIFE - 550) {
          canvas.style.opacity = String(Math.max((LIFE - age) / 550, 0));
        }
        if (age < LIFE) {
          window.requestAnimationFrame(paint);
        } else {
          canvas.remove();
        }
      };
      window.requestAnimationFrame(paint);
    });
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
    }, { threshold: 0.05, rootMargin: "0px 0px -4% 0px" });
    targets.forEach((el) => {
      const parent = el.parentElement;
      const index = parent ? Array.from(parent.children).indexOf(el) : 0;
      el.style.setProperty("--reveal-delay", `${Math.min(index * 30, 180)}ms`);
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

  /* ---------- Код konami: «Это код мира» ---------- */
  safe(() => {
    const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let progress = 0;
    document.addEventListener("keydown", (event) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      progress = key === KONAMI[progress] ? progress + 1 : key === KONAMI[0] ? 1 : 0;
      if (progress === KONAMI.length) {
        progress = 0;
        spawnMatrix();
        toast("Это код мира — к нему стремится медиатор");
      }
    });
  });

  /* ---------- Телефон: две стороны за одним столом (два пальца) ---------- */
  safe(() => {
    const card = document.querySelector(".appointment");
    if (!card) return;
    let last = 0;
    card.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length < 2) return;
        const now = Date.now();
        if (now - last < 4000) return;
        last = now;
        spawnRings(card);
        spawnDeal(card);
        /* масштабная анимация: карточка «дышит» — работает и на телефоне */
        if (!reduced) {
          card.classList.remove("is-egg-zoom");
          void card.offsetWidth;
          card.classList.add("is-egg-zoom");
          window.setTimeout(() => card.classList.remove("is-egg-zoom"), 1200);
        }
        toast("Две стороны за одним столом — так и начинаются переговоры 🤝");
      },
      { passive: true }
    );
  });

  /* ---------- Встряска телефона: конфетти-взрыв без текста ---------- */
  const CONFETTI_COLORS = ["#0d6b4f", "#3ecf95", "#a9edcf", "#f2c14e", "#1d8f6a", "#eafff4"];
  const spawnConfetti = (sx, sy) => {
    if (reduced) return;
    safe(() => {
      const layer = document.createElement("div");
      layer.className = "confetti-layer";
      layer.setAttribute("aria-hidden", "true");
      document.body.appendChild(layer);
      const cx = typeof sx === "number" ? sx : window.innerWidth / 2;
      const cy = typeof sy === "number" ? sy : window.innerHeight * 0.55;
      const power = Math.min(window.innerWidth, window.innerHeight) * 0.024 + 5;
      const pieces = [];
      for (let i = 0; i < 150; i += 1) {
        const piece = document.createElement("i");
        const size = 7 + Math.random() * 8;
        piece.style.width = `${size.toFixed(1)}px`;
        piece.style.height = `${(size * (0.5 + Math.random() * 0.9)).toFixed(1)}px`;
        piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        if (Math.random() > 0.7) piece.style.borderRadius = "50%";
        layer.appendChild(piece);
        const angle = Math.random() * Math.PI * 2;
        const speed = power * (0.55 + Math.random() * 0.9);
        pieces.push({
          node: piece,
          x: cx + (Math.random() - 0.5) * 24,
          y: cy + (Math.random() - 0.5) * 24,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - power * (0.6 + Math.random() * 0.8),
          rot: Math.random() * 360,
          spin: (Math.random() - 0.5) * 26,
          life: 0,
          ttl: 150 + Math.random() * 70,
        });
      }
      const step = () => {
        let alive = 0;
        pieces.forEach((p) => {
          p.life += 1;
          if (p.life >= p.ttl || p.y > window.innerHeight + 40) return;
          alive += 1;
          p.vy += 0.45; /* гравитация */
          p.vx *= 0.986; /* сопротивление воздуха */
          p.vy *= 0.986;
          p.x += p.vx;
          p.y += p.vy;
          p.rot += p.spin;
          const k = p.life / p.ttl;
          p.node.style.transform = `translate(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px) rotate(${p.rot.toFixed(0)}deg)`;
          p.node.style.opacity = String(k > 0.6 ? Math.max((1 - k) / 0.4, 0) : 1);
        });
        if (alive) {
          window.requestAnimationFrame(step);
        } else {
          layer.remove();
        }
      };
      window.requestAnimationFrame(step);
      window.setTimeout(() => layer.remove(), 7500); /* страховка */
    });
  };
  safe(() => {
    let armed = false;
    const listen = () => {
      let lastX = null;
      let lastY = null;
      let lastZ = null;
      let energy = 0;
      let lastFire = 0;
      window.addEventListener(
        "devicemotion",
        (event) => {
          const acc = event.accelerationIncludingGravity;
          if (!acc || acc.x == null || acc.y == null || acc.z == null) return;
          if (lastX !== null) {
            energy += Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ);
          }
          lastX = acc.x;
          lastY = acc.y;
          lastZ = acc.z;
          const now = performance.now();
          if (energy > 26 && now - lastFire > 2600) {
            energy = 0;
            lastFire = now;
            spawnConfetti();
          }
          energy *= 0.82; /* без накопления от мелкой тряски */
        },
        { passive: true }
      );
    };
    const arm = () => {
      if (armed) return;
      armed = true;
      if (typeof window.DeviceMotionEvent === "undefined") return;
      if (typeof window.DeviceMotionEvent.requestPermission === "function") {
        /* iOS: разрешение запрашивается только по касанию пользователя */
        window.DeviceMotionEvent.requestPermission()
          .then((state) => {
            if (state === "granted") listen();
          })
          .catch(() => {});
      } else {
        listen();
      }
    };
    window.addEventListener("touchend", arm, { once: true, passive: true });
    window.addEventListener("click", arm, { once: true });
  });

  /* ---------- Двойной клик по фону: конфетти на любом устройстве ----------
     Работает во всех разделах: встряска доступна только телефонам,
     а двойной клик — и компьютеру, и тач-экрану. */
  safe(() => {
    document.addEventListener("dblclick", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest("a, button, input, textarea, select, label, summary, dialog, .menu-toggle, .a11y-panel, .egg-spot__btn")) return;
      spawnConfetti(
        event.clientX || window.innerWidth / 2,
        event.clientY || window.innerHeight * 0.55
      );
    });
  });
})();
