import { gsap } from "gsap";
const root = document.documentElement;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const navigationKey = "public-ip-navigation";
let media, currentContext, entrance, navIndicator;

export function animateResult(element) {
  if (!element || reduced() || !currentContext) return;
  currentContext.add(() =>
    gsap.fromTo(
      element,
      { opacity: 0.45, y: 7 },
      {
        opacity: 1,
        y: 0,
        duration: 0.28,
        ease: "power2.out",
        overwrite: true,
      },
    ),
  );
}
export function animateProtocol(element, position) {
  if (!element || element.dataset.position === String(position)) return;
  element.dataset.position = String(position);
  if (reduced() || !currentContext) {
    element.style.setProperty("--protocol-position", String(position));
    return;
  }
  currentContext.add(() =>
    gsap.to(element, {
      "--protocol-position": position,
      duration: 0.24,
      ease: "power2.inOut",
      overwrite: true,
    }),
  );
}
export function revealResults(element) {
  if (!element || reduced() || !currentContext) return;
  currentContext.add(() =>
    gsap.fromTo(
      element.querySelectorAll("tbody tr"),
      { opacity: 0, y: 9 },
      {
        opacity: 1,
        y: 0,
        duration: 0.32,
        stagger: { amount: 0.16 },
        ease: "power2.out",
        overwrite: true,
      },
    ),
  );
}
function readNavigation(restored) {
  if (restored) return { direction: -1 };
  try {
    const saved = JSON.parse(sessionStorage.getItem(navigationKey));
    sessionStorage.removeItem(navigationKey);
    if (saved?.to === location.pathname && Date.now() - saved.at < 15000)
      return saved;
  } catch {
    /* Navigation works when session storage is disabled too. */
  }
  return null;
}
function startMotion(restored = false) {
  const navigation = readNavigation(restored);
  root.dataset.pageTransition = navigation ? "animated" : "load";
  media?.revert();
  media = gsap.matchMedia();
  media.add(
    {
      regular: "(prefers-reduced-motion: no-preference)",
      reduced: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      if (context.conditions.reduced) {
        root.dataset.motionState = "reduced";
        return;
      }
      currentContext = context;
      root.dataset.motionState = "entering";
      const main = document.querySelector("main");
      const cards = [...document.querySelectorAll(".floating-card")];
      const headings = [...document.querySelectorAll("main h1")];
      const originals = headings.map((element) => ({
        element,
        html: element.innerHTML,
        label: element.getAttribute("aria-label"),
      }));
      const words = [];
      for (const heading of headings) {
        const text = heading.textContent.trim();
        heading.setAttribute("aria-label", text);
        heading.replaceChildren();
        text.split(/\s+/).forEach((word, index) => {
          if (index) heading.append(document.createTextNode(" "));
          const mask = document.createElement("span");
          mask.className = "text-mask";
          mask.setAttribute("aria-hidden", "true");
          const inner = document.createElement("span");
          inner.className = "text-word";
          inner.textContent = word;
          mask.append(inner);
          heading.append(mask);
          words.push(inner);
        });
      }
      const nav = document.querySelector(".primary-nav");
      const selected = nav?.querySelector('[aria-current="page"]');
      if (selected) {
        const previous = [...nav.querySelectorAll("a")].find(
          (link) => new URL(link.href).pathname === navigation?.from,
        );
        const indicator = document.createElement("span");
        indicator.className = "nav-indicator";
        indicator.setAttribute("aria-hidden", "true");
        nav.append(indicator);
        navIndicator = indicator;
        gsap.fromTo(
          indicator,
          {
            x: (previous || selected).offsetLeft,
            width: (previous || selected).offsetWidth,
          },
          {
            x: selected.offsetLeft,
            width: selected.offsetWidth,
            duration: 0.34,
            ease: "power2.inOut",
          },
        );
      }
      const atmosphere = gsap.to(cards, {
        "--shadow-offset": "6px",
        duration: 3.8,
        stagger: 0.2,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        paused: true,
      });
      const finish = () => {
        gsap.set([main, ...cards], {
          clearProps: "transform,opacity,visibility",
        });
        gsap.set(words, { clearProps: "transform" });
        root.dataset.motionState = "idle";
        if (!document.hidden) atmosphere.play();
      };
      entrance = gsap.timeline({ onComplete: finish });
      entrance.fromTo(
        main,
        {
          opacity: 0,
          x: navigation ? navigation.direction * 28 : 0,
          y: navigation ? 0 : 18,
        },
        { opacity: 1, x: 0, y: 0, duration: 0.42, ease: "power2.out" },
        0,
      );
      if (cards.length)
        entrance.fromTo(
          cards,
          { opacity: 0, y: navigation ? 12 : 24, scale: 0.985 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.065,
            ease: "power3.out",
          },
          0.04,
        );
      entrance.fromTo(
        words,
        { yPercent: 110 },
        { yPercent: 0, duration: 0.48, stagger: 0.045, ease: "power3.out" },
        0.1,
      );
      const onVisibility = () =>
        atmosphere.paused(
          document.hidden || root.dataset.motionState !== "idle",
        );
      document.addEventListener("visibilitychange", onVisibility);
      return () => {
        currentContext = null;
        navIndicator?.remove();
        navIndicator = null;
        document.removeEventListener("visibilitychange", onVisibility);
        for (const { element, html, label } of originals) {
          element.innerHTML = html;
          if (label === null) element.removeAttribute("aria-label");
          else element.setAttribute("aria-label", label);
        }
      };
    },
  );
}
export function installMotion() {
  startMotion();
  let leaving = false,
    destination;
  document.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey ||
      event.shiftKey ||
      reduced()
    )
      return;
    const link = event.target.closest?.(
      ".primary-nav a, .tool-shortcuts a, .brand, .footer-inner a",
    );
    if (!link || link.target || link.hasAttribute("download")) return;
    const url = new URL(link.href);
    if (url.origin !== location.origin || url.pathname === location.pathname)
      return;
    event.preventDefault();
    destination = url.href;
    const order = ["/", "/dns/", "/cidr/"];
    const direction =
      order.indexOf(url.pathname) < order.indexOf(location.pathname) ? -1 : 1;
    try {
      sessionStorage.setItem(
        navigationKey,
        JSON.stringify({
          from: location.pathname,
          to: url.pathname,
          direction,
          at: Date.now(),
        }),
      );
    } catch {
      /* Storage is optional. */
    }
    if (leaving) return;
    leaving = true;
    entrance?.pause();
    root.dataset.motionState = "leaving";
    const navTarget = [...document.querySelectorAll(".primary-nav a")].find(
      (item) => new URL(item.href).pathname === url.pathname,
    );
    if (navTarget && navIndicator)
      gsap.to(navIndicator, {
        x: navTarget.offsetLeft,
        width: navTarget.offsetWidth,
        duration: 0.18,
        ease: "power2.inOut",
      });
    gsap.to("main", {
      opacity: 0,
      x: direction * -24,
      duration: 0.18,
      ease: "power2.in",
      overwrite: true,
      onComplete: () => location.assign(destination),
    });
  });
  window.addEventListener("pagehide", () => {
    media?.revert();
    leaving = false;
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) startMotion(true);
  });
}
