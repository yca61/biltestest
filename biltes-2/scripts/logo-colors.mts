import sharp from "sharp";
const { data } = await sharp("../dl/img/cropped-BILTES-LOGO-1.png").resize(128, 128).raw().toBuffer({ resolveWithObject: true });
const m = new Map<string, number>();
for (let i = 0; i < data.length; i += 4) { if (data[i + 3] < 200) continue; const [r, g, b] = [data[i], data[i + 1], data[i + 2]]; if (r > 225 && g > 225 && b > 225) continue; const k = [r, g, b].map((v) => (v >> 4) << 4).join(","); m.set(k, (m.get(k) ?? 0) + 1); }
console.log([...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, n]) => `#${k.split(",").map((v) => (+v + 8).toString(16).padStart(2, "0")).join("")} ${n}`).join("\n"));
