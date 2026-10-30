export const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
const reduced = () => matchMedia("(prefers-reduced-motion:reduce)").matches;

export function toast(title: string, msg: string) {
  const d = document.createElement("div");
  d.className = "toast";
  d.setAttribute("role", "status");
  d.innerHTML = `<b>${title}</b><span>${msg}</span>`;
  document.body.appendChild(d);
  setTimeout(() => { d.classList.add("out"); setTimeout(() => d.remove(), 400); }, 3200);
}

export function burst(el: HTMLElement) {
  if (reduced()) return;
  const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
  const cols = ["#3FCDB8", "#F2A33A", "#6C8CFF", "#FF7A90", "#8CF5E1"];
  for (let i = 0; i < 34; i++) {
    const s = document.createElement("i");
    s.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:8px;height:${4 + Math.random() * 6}px;background:${cols[i % 5]};border-radius:2px;z-index:99;pointer-events:none`;
    document.body.appendChild(s);
    const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 170;
    s.animate(
      [{ transform: "translate(0,0) rotate(0)", opacity: 1 },
       { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d + 90}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }],
      { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.2,.7,.3,1)" }
    ).onfinish = () => s.remove();
  }
}
