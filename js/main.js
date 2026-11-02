(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const isMobile = window.matchMedia("(max-width: 800px)").matches;
  document.documentElement.classList.add("js-ready");

  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");

  function closeMenu() {
    menuToggle?.setAttribute("aria-expanded", "false");
    menuToggle?.setAttribute("aria-label", "Open navigation");
    mainNav?.classList.remove("is-open");
    document.body.classList.remove("menu-open");
  }

  menuToggle?.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Open navigation" : "Close navigation",
    );
    mainNav?.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("menu-open", !isOpen);
  });

  mainNav
    ?.querySelectorAll("a")
    .forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      closeLightbox();
    }
  });

  document.querySelectorAll(".water-button").forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();

      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;

      button.style.setProperty("--mouse-x", `${x}%`);
      button.style.setProperty("--mouse-y", `${y}%`);
    });

    button.addEventListener("pointerleave", () => {
      button.style.setProperty("--mouse-x", "50%");
      button.style.setProperty("--mouse-y", "50%");
    });
  });

  document.addEventListener("DOMContentLoaded", () => {
    const galleryTabs = document.querySelectorAll("[data-gallery-tab]");
    const galleryPanels = document.querySelectorAll("[data-gallery-panel]");

    const lightbox = document.getElementById("lightbox");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxClose = document.getElementById("lightboxClose");

    let lastGalleryTrigger = null;
    let previousBodyOverflow = "";

    function resetGalleryPanel(panel) {
      const grid = panel.querySelector(".gallery-grid");
      const extraImages = panel.querySelectorAll(".gallery-extra-item");
      const viewAllButton = panel.querySelector("[data-gallery-view-all]");

      extraImages.forEach((image) => {
        image.hidden = true;
      });

      grid?.classList.remove("gallery-expanded");

      if (viewAllButton) {
        viewAllButton.setAttribute("aria-expanded", "false");
        viewAllButton.innerHTML =
          'View All Images <i class="fa-solid fa-arrow-right"></i>';
      }
    }

    function activateGalleryTab(tab, moveFocus = false) {
      const selectedCategory = tab.dataset.galleryTab;

      galleryTabs.forEach((item) => {
        const isActive = item === tab;

        item.classList.toggle("active", isActive);
        item.setAttribute("aria-selected", String(isActive));
        item.tabIndex = isActive ? 0 : -1;
      });

      galleryPanels.forEach((panel) => {
        const isActive = panel.dataset.galleryPanel === selectedCategory;

        if (!isActive) {
          resetGalleryPanel(panel);
        }

        panel.hidden = !isActive;
        panel.classList.toggle("active", isActive);
      });

      if (moveFocus) {
        tab.focus();
      }

      if (window.ScrollTrigger) {
        requestAnimationFrame(() => window.ScrollTrigger.refresh());
      }
    }

    galleryTabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        activateGalleryTab(tab);
      });

      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;

        if (event.key === "ArrowRight") {
          nextIndex = (index + 1) % galleryTabs.length;
        } else if (event.key === "ArrowLeft") {
          nextIndex = (index - 1 + galleryTabs.length) % galleryTabs.length;
        } else if (event.key === "Home") {
          nextIndex = 0;
        } else if (event.key === "End") {
          nextIndex = galleryTabs.length - 1;
        } else {
          return;
        }

        event.preventDefault();
        activateGalleryTab(galleryTabs[nextIndex], true);
      });
    });

    document.querySelectorAll("[data-gallery-panel]").forEach((panel) => {
      const grid = panel.querySelector(".gallery-grid");
      const viewAllButton = panel.querySelector("[data-gallery-view-all]");
      const extraImages = panel.querySelectorAll(".gallery-extra-item");

      if (!grid || !viewAllButton || !extraImages.length) return;

      viewAllButton.addEventListener("click", () => {
        const isExpanded =
          viewAllButton.getAttribute("aria-expanded") === "true";

        const expand = !isExpanded;

        extraImages.forEach((image) => {
          image.hidden = !expand;
        });

        grid.classList.toggle("gallery-expanded", expand);

        viewAllButton.setAttribute("aria-expanded", String(expand));
        viewAllButton.innerHTML = expand
          ? 'Show Less <i class="fa-solid fa-arrow-up"></i>'
          : 'View All Images <i class="fa-solid fa-arrow-right"></i>';

        if (window.ScrollTrigger) {
          requestAnimationFrame(() => window.ScrollTrigger.refresh());
        }
      });
    });

    function openLightbox(src, alt, trigger) {
      if (!lightbox || !lightboxImage || !lightboxClose || !src) return;

      lastGalleryTrigger = trigger;
      previousBodyOverflow = document.body.style.overflow;

      lightboxImage.src = src;
      lightboxImage.alt = alt || "Cottage gallery image";

      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";

      lightboxClose.focus();
    }

    function closeLightbox() {
      if (!lightbox?.classList.contains("is-open")) return;

      lightbox.classList.remove("is-open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = previousBodyOverflow;

      lightboxImage.removeAttribute("src");
      lightboxImage.alt = "";

      if (lastGalleryTrigger?.isConnected) {
        lastGalleryTrigger.focus();
      }
    }

    document.querySelectorAll(".gallery-item").forEach((item) => {
      const image = item.querySelector("img");

      if (!image) return;

      item.addEventListener("click", () => {
        const fullImage = item.dataset.full || image.currentSrc || image.src;

        openLightbox(fullImage, image.alt, item);
      });
    });

    lightboxClose?.addEventListener("click", closeLightbox);

    lightbox?.addEventListener("click", (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox?.classList.contains("is-open")) return;

      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "Tab") {
        event.preventDefault();
        lightboxClose.focus();
      }
    });
  });

  document.getElementById("currentYear").textContent = new Date().getFullYear();

  // FAQ accordion: only one answer can remain open at a time.
  document.addEventListener("DOMContentLoaded", function () {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(function (item) {
      const button = item.querySelector(".faq-question");

      button.addEventListener("click", function () {
        const willOpen = button.getAttribute("aria-expanded") !== "true";

        faqItems.forEach(function (faq) {
          const faqButton = faq.querySelector(".faq-question");

          faq.classList.remove("is-open");
          faqButton.setAttribute("aria-expanded", "false");
        });

        if (willOpen) {
          item.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
        }
      });
    });
  });

  // // Accessible gallery lightbox.
  // const lightbox = document.getElementById("lightbox");
  // const lightboxImage = document.getElementById("lightboxImage");
  // const lightboxClose = document.getElementById("lightboxClose");

  // function openLightbox(src, alt) {
  //   lightboxImage.src = src;
  //   lightboxImage.alt = alt || "Cottage gallery image";
  //   lightbox.classList.add("is-open");
  //   lightbox.setAttribute("aria-hidden", "false");
  //   document.body.style.overflow = "hidden";
  //   lightboxClose.focus();
  // }

  // function closeLightbox() {
  //   if (!lightbox?.classList.contains("is-open")) return;
  //   lightbox.classList.remove("is-open");
  //   lightbox.setAttribute("aria-hidden", "true");
  //   lightboxImage.src = "";
  //   document.body.style.overflow = "";
  // }

  // document.querySelectorAll(".gallery-item").forEach((item) => {
  //   item.addEventListener("click", () => {
  //     const image = item.querySelector("img");
  //     openLightbox(item.dataset.full || image.src, image.alt);
  //   });
  // });
  // lightboxClose?.addEventListener("click", closeLightbox);
  // lightbox?.addEventListener("click", (event) => {
  //   if (event.target === lightbox) closeLightbox();
  // });

  // Testimonials carousel with arrows, dots, autoplay and touch swipe.
  const track = document.getElementById("testimonialTrack");
  const cards = Array.from(track?.children || []);
  const dotsWrap = document.getElementById("testimonialDots");
  const prevButton = document.getElementById("testimonialPrev");
  const nextButton = document.getElementById("testimonialNext");
  let activeSlide = 0;
  let autoTimer;
  let touchStartX = 0;

  function goToSlide(index) {
    if (!cards.length) return;
    activeSlide = (index + cards.length) % cards.length;
    track.style.transform = `translateX(-${activeSlide * 100}%)`;
    Array.from(dotsWrap.children).forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === activeSlide);
      dot.setAttribute(
        "aria-current",
        dotIndex === activeSlide ? "true" : "false",
      );
    });
  }

  cards.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `Show testimonial ${index + 1}`);
    dot.addEventListener("click", () => {
      goToSlide(index);
      restartAutoplay();
    });
    dotsWrap.appendChild(dot);
  });
  prevButton?.addEventListener("click", () => {
    goToSlide(activeSlide - 1);
    restartAutoplay();
  });
  nextButton?.addEventListener("click", () => {
    goToSlide(activeSlide + 1);
    restartAutoplay();
  });
  track?.addEventListener(
    "touchstart",
    (event) => {
      touchStartX = event.changedTouches[0].clientX;
    },
    { passive: true },
  );
  track?.addEventListener(
    "touchend",
    (event) => {
      const delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) > 45) goToSlide(activeSlide + (delta < 0 ? 1 : -1));
      restartAutoplay();
    },
    { passive: true },
  );

  function startAutoplay() {
    if (prefersReducedMotion || cards.length < 2) return;
    autoTimer = window.setInterval(() => goToSlide(activeSlide + 1), 6000);
  }
  function restartAutoplay() {
    window.clearInterval(autoTimer);
    startAutoplay();
  }
  goToSlide(0);
  startAutoplay();
  document
    .querySelector(".testimonial-carousel")
    ?.addEventListener("mouseenter", () => window.clearInterval(autoTimer));
  document
    .querySelector(".testimonial-carousel")
    ?.addEventListener("mouseleave", startAutoplay);

  // // Lenis smooth scroll; disabled for reduced-motion preferences and smaller screens.
  // let lenis = null;
  // if (!prefersReducedMotion && !isMobile && window.Lenis) {
  //   lenis = new Lenis({
  //     duration: 1.05,
  //     smoothWheel: true,
  //     wheelMultiplier: 0.9,
  //   });
  //   lenis.on("scroll", () => window.ScrollTrigger?.update());
  //   if (window.gsap) gsap.ticker.add((time) => lenis.raf(time * 1000));
  //   if (window.gsap) gsap.ticker.lagSmoothing(0);
  // }

  // Split heading text into individual word spans for a soft word-reveal animation.
  function splitHeadingWords() {
    document.querySelectorAll(".section-title").forEach((heading) => {
      if (heading.dataset.splitReady) return;
      const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) {
        if (walker.currentNode.nodeValue.trim()) nodes.push(walker.currentNode);
      }
      nodes.forEach((node) => {
        const fragment = document.createDocumentFragment();
        node.nodeValue.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            fragment.appendChild(document.createTextNode(part));
          } else {
            const word = document.createElement("span");
            word.className = "split-word";
            word.textContent = part;
            fragment.appendChild(word);
          }
        });
        node.parentNode.replaceChild(fragment, node);
      });
      heading.dataset.splitReady = "true";
    });
  }

  if (!prefersReducedMotion) splitHeadingWords();

  if (window.gsap && window.ScrollTrigger && !prefersReducedMotion) {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray(".section-title").forEach((heading) => {
      const words = heading.querySelectorAll(".split-word");
      gsap.fromTo(
        words,
        { yPercent: 115, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.72,
          stagger: 0.045,
          ease: "power3.out",
          scrollTrigger: { trigger: heading, start: "top 86%", once: true },
        },
      );
    });

    gsap.fromTo(
      ".hero-image",
      { scale: 1.12, yPercent: -2 },
      {
        scale: 1,
        yPercent: 7,
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      },
    );

    gsap.from(".hero-eyebrow", {
      opacity: 0,
      y: 18,
      duration: 0.8,
      delay: 0.15,
      ease: "power2.out",
    });
    gsap.from(".hero-title", {
      opacity: 0,
      y: 45,
      duration: 1.1,
      delay: 0.25,
      ease: "power3.out",
    });
    gsap.from(".hero-subtitle", {
      opacity: 0,
      y: 24,
      duration: 0.85,
      delay: 0.5,
      ease: "power2.out",
    });
    gsap.from(".hero-actions > *", {
      opacity: 0,
      y: 20,
      duration: 0.7,
      delay: 0.7,
      stagger: 0.12,
      ease: "power2.out",
    });

    gsap.utils.toArray(".reveal").forEach((element) => {
      gsap.fromTo(
        element,
        { opacity: 0, y: isMobile ? 18 : 28 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 88%", once: true },
        },
      );
    });

    gsap.utils
      .toArray(".amenity-card, .faq-item")
      .forEach((element, index, list) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 22 },
          {
            opacity: 1,
            y: 0,
            duration: 0.65,
            delay: (index % 4) * 0.06,
            ease: "power2.out",
            scrollTrigger: { trigger: element, start: "top 90%", once: true },
          },
        );
      });
  } else {
    document.querySelectorAll(".reveal").forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });
  }

  // One raindrop follows the same title markers through the page and finishes in the footer credit bar.
  const drop = document.getElementById("journeyDrop");
  const ripple = document.getElementById("dropRipple");
  const targetTitles = [
    document.getElementById("heroTitle"),
    document.getElementById("aboutTitle"),
    document.getElementById("roomsTitle"),
    document.getElementById("amenitiesTitle"),
    document.getElementById("galleryTitle"),
    document.getElementById("testimonialsTitle"),
    document.getElementById("faqTitle"),
    document.getElementById("contactTitle"),
    document.querySelector(".footer-drop-space"),
  ].filter(Boolean);

  let currentTarget = 1;
  let dropTicking = false;

  function placeDrop() {
    if (!drop || !targetTitles.length || prefersReducedMotion) return;
    const viewportCenter = window.innerHeight * 0.48;
    let bestIndex = 0;
    let bestDistance = Infinity;
    targetTitles.forEach((target, index) => {
      const rect = target.getBoundingClientRect();
      const pointY = target.classList.contains("footer-drop-space")
        ? rect.top + rect.height / 2
        : rect.top + Math.min(rect.height * 0.45, 28);
      const distance = Math.abs(pointY - viewportCenter);
      if (
        rect.bottom > 0 &&
        rect.top < window.innerHeight &&
        distance < bestDistance
      ) {
        bestDistance = distance;
        bestIndex = index;
      }
    });

    const target = targetTitles[bestIndex];
    const rect = target.getBoundingClientRect();
    const isFooter = target.classList.contains("footer-drop-space");
    const x = isFooter
      ? rect.left + rect.width / 2
      : rect.left + Math.min(rect.width * 0.5, 24);
    const y = isFooter
      ? rect.top + rect.height / 2
      : rect.top + Math.min(rect.height * 0.45, 28);
    const visible = bestIndex > 0 && window.scrollY > 180;
    drop.style.opacity = visible ? "1" : "0";

    if (window.gsap) {
      gsap.to(drop, {
        left: x,
        top: y,
        duration: isMobile ? 0.2 : 0.38,
        ease: "power2.out",
        overwrite: true,
      });
    } else {
      drop.style.left = `${x}px`;
      drop.style.top = `${y}px`;
    }

    if (bestIndex !== currentTarget && visible) {
      currentTarget = bestIndex;
      if (ripple && window.gsap) {
        gsap.set(ripple, { left: x, top: y + 7, scale: 0.2, opacity: 0.8 });
        gsap.to(ripple, {
          scale: 2.1,
          opacity: 0,
          duration: 0.65,
          ease: "power2.out",
        });
        gsap.fromTo(
          drop,
          { scale: 0.75 },
          { scale: 1, duration: 0.35, ease: "back.out(2)" },
        );
      }
    }
    dropTicking = false;
  }

  function requestDropPosition() {
    if (dropTicking) return;
    dropTicking = true;
    requestAnimationFrame(placeDrop);
  }
  window.addEventListener("scroll", requestDropPosition, { passive: true });
  window.addEventListener("resize", requestDropPosition);
  window.addEventListener("load", requestDropPosition);
  requestDropPosition();

  // Refresh animation positions after images/fonts finish loading.
  window.addEventListener("load", () => {
    window.ScrollTrigger?.refresh();
    requestDropPosition();
  });
  if (document.fonts?.ready) document.fonts.ready.then(requestDropPosition);
})();
