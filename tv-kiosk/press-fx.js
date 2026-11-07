// Hiệu ứng nhấn nút trong game: nhấn xuống thì nút co lại + sáng viền vàng, thả ra thì lóe một vòng sáng lan ra.
// Dùng uỷ quyền sự kiện ở document nên vẫn chạy khi game tạo lại màn/nút. Không đụng vào code game.
(() => {
  const BTN = ".cta, .instructions__action div";
  let down = null;

  const release = (pulse) => {
    if (!down) return;
    const el = down; down = null;
    el.classList.remove("fx-down");
    if (pulse) {
      el.classList.remove("fx-pulse"); void el.offsetWidth; // chạy lại animation nếu bấm liên tục
      el.classList.add("fx-pulse");
      el.addEventListener("animationend", () => el.classList.remove("fx-pulse"), { once: true });
    }
  };

  document.addEventListener("pointerdown", (e) => {
    const el = e.target.closest?.(BTN);
    if (!el) return;
    release(false);
    down = el; el.classList.add("fx-down");
  }, true);
  document.addEventListener("pointerup", () => release(true), true);
  document.addEventListener("pointercancel", () => release(false), true);
})();
