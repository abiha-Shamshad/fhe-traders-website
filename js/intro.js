// ==========================================================================
// FHE Traders — home page brand intro
//
// Three beats: the logo draws itself centre-screen (traced outline, stroked
// on via stroke-dashoffset), the finished artwork cross-fades in over the
// outline, then the whole thing flies into its slot in the header while the
// hero copy rises behind it.
//
// The flight is a FLIP: the stage is animated onto the *measured* rect of the
// header mark, so it lands on target at any viewport width with no hard-coded
// offsets.
// ==========================================================================

(function brandIntro() {
  const BEATS = {
    draw: 120,     // outline starts stroking
    fill: 1080,    // artwork cross-fades in over the finished outline
    fly: 1560,     // stage leaves for the header
    flight: 820,   // how long the flight takes
  };

  const body = document.body;
  const overlay = document.getElementById("brand-intro");
  const stage = document.getElementById("brand-intro-stage");
  const introLogo = document.getElementById("brand-intro-logo");
  const headerMark = document.querySelector(".logo .logo-mark img");

  // Nothing to do on pages without the overlay, and never leave the page
  // hidden if a piece is missing.
  if (!overlay || !stage || !introLogo || !headerMark) {
    body.classList.remove("intro-pending");
    if (overlay) overlay.remove();
    return;
  }

  const finish = () => {
    body.classList.remove("intro-pending");
    body.classList.add("intro-done");
    overlay.remove();
  };

  // Reduced motion: no curtain, no drawing, no flight — just the page.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finish();
    return;
  }

  // Belt and braces: if an animation is dropped or the artwork never loads,
  // the page still reveals itself.
  const failsafe = setTimeout(finish, 6000);

  const fly = () => {
    const from = stage.getBoundingClientRect();
    const to = headerMark.getBoundingClientRect();
    if (!from.width || !to.width) {
      clearTimeout(failsafe);
      finish();
      return;
    }

    const scale = to.width / from.width;
    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);

    // Hero copy comes up while the logo is still travelling, so the intro
    // reads as one movement rather than two waits.
    body.classList.add("intro-revealing");
    overlay.classList.add("lifting");

    const flight = stage.animate(
      [
        { transform: "translate(0, 0) scale(1)" },
        { transform: `translate(${dx}px, ${dy}px) scale(${scale})` },
      ],
      { duration: BEATS.flight, easing: "cubic-bezier(0.66, 0, 0.24, 1)", fill: "forwards" }
    );

    flight.finished.catch(() => {}).then(() => {
      clearTimeout(failsafe);
      finish();
    });
  };

  const run = () => {
    overlay.classList.add("ready");
    setTimeout(() => overlay.classList.add("drawing"), BEATS.draw);
    setTimeout(() => overlay.classList.add("filled"), BEATS.fill);
    setTimeout(fly, BEATS.fly);
  };

  if (introLogo.complete) {
    run();
  } else {
    introLogo.addEventListener("load", run, { once: true });
    introLogo.addEventListener("error", () => {
      clearTimeout(failsafe);
      finish();
    }, { once: true });
  }
})();
