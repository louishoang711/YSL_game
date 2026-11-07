// Pháo giấy vàng vẽ bằng canvas (nét theo độ phân giải màn hình), thay chuỗi ảnh PNG mờ của game
// ở màn mở đầu (.splash) và màn kết quả (.result). Được trang kiosk chèn vào iframe game.
(() => {
  const SEL = ".splash__confetti, .result__confetti";
  const GOLD = ["#FBEFCB", "#EED9A4", "#D9B979", "#C29A5B", "#9C7742"];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const css = document.createElement("style");
  css.textContent = `${SEL}{width:100%!important;height:100%!important;aspect-ratio:auto!important;pointer-events:none}
.splash__confetti ar-sequence,.result__confetti ar-sequence{display:none!important}
.crisp-confetti{position:absolute;inset:0;width:100%;height:100%;display:block}`;
  document.head.appendChild(css);

  function mount(host) {
    const c = document.createElement("canvas");
    c.className = "crisp-confetti";
    host.appendChild(c);
    const ctx = c.getContext("2d");
    let w = 0, h = 0, dpr = 1;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = host.clientWidth; h = host.clientHeight;
      c.width = Math.round(w * dpr); c.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = (y) => ({
      x: Math.random() * w, y,
      s: 7 + Math.random() * 11,                 // kích thước
      diamond: Math.random() < 0.6,             // hình thoi (motif YSL) hoặc dải giấy
      color: GOLD[(Math.random() * GOLD.length) | 0],
      vy: 0.5 + Math.random() * 0.9,            // rơi chậm, sang trọng
      sway: Math.random() * 6.28, vs: 0.008 + Math.random() * 0.015,
      rot: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.04,
      flip: Math.random() * 6.28, vf: 0.025 + Math.random() * 0.04,
    });
    resize();
    const parts = Array.from({ length: Math.max(30, Math.min(90, Math.round((w * h) / 11000))) }, () => spawn(Math.random() * h));

    const draw = (p) => {
      const fx = Math.cos(p.flip);              // lật 3D: co theo trục x
      ctx.save();
      ctx.translate(p.x + Math.sin(p.sway) * 14, p.y);
      ctx.rotate(p.rot);
      ctx.scale(fx || 0.01, 1);
      ctx.globalAlpha = 0.6 + 0.4 * Math.abs(fx);
      ctx.fillStyle = Math.abs(fx) > 0.85 ? "#FFF7E0" : p.color; // lóe sáng khi mặt giấy quay thẳng
      ctx.beginPath();
      if (p.diamond) { const r = p.s / 2; ctx.moveTo(0, -r); ctx.lineTo(r * 0.75, 0); ctx.lineTo(0, r); ctx.lineTo(-r * 0.75, 0); }
      else ctx.rect(-p.s / 2, -p.s * 0.18, p.s, p.s * 0.36);
      ctx.fill();
      ctx.restore();
    };

    let last = performance.now();
    const tick = (t) => {
      if (!host.isConnected) return;            // màn đã bị gỡ: dừng hẳn
      requestAnimationFrame(tick);
      if (!host.getClientRects().length) { last = t; return; } // đang ẩn: không vẽ, không tốn GPU
      const dt = Math.min((t - last) / 16.67, 3); last = t;
      if (host.clientWidth !== w || host.clientHeight !== h) resize();
      ctx.clearRect(0, 0, w, h);
      for (const p of parts) {
        p.y += p.vy * dt; p.sway += p.vs * dt; p.rot += p.vr * dt; p.flip += p.vf * dt;
        if (p.y > h + 24) Object.assign(p, spawn(-24));
        draw(p);
      }
    };
    if (reduce) parts.forEach(draw); else requestAnimationFrame(tick);
  }

  const scan = () => document.querySelectorAll(SEL).forEach((h) => { if (!h.querySelector(".crisp-confetti")) mount(h); });
  // chỉ quét khi có phần tử mới (đồng hồ của game đổi chữ liên tục, không cần quét lúc đó)
  new MutationObserver((ms) => { if (ms.some((m) => [...m.addedNodes].some((n) => n.nodeType === 1))) scan(); })
    .observe(document.documentElement, { childList: true, subtree: true });
  scan();
})();
