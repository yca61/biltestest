import sharp from "sharp"; import fs from "node:fs";
const dir = process.argv[2]; const files = fs.readdirSync(dir).filter((f) => /\.(jpg|png)$/.test(f));
const W = 300, H = 200, cols = 6;
const tiles = await Promise.all(files.map(async (f, i) => ({ input: await sharp(`${dir}/${f}`).resize(W, H, { fit: "contain", background: "#888" }).toBuffer(), left: (i % cols) * W, top: Math.floor(i / cols) * H })));
await sharp({ create: { width: cols * W, height: Math.ceil(files.length / cols) * H, channels: 3, background: "#fff" } }).composite(tiles).jpeg().toFile(process.argv[3]);
console.log(files.map((f, i) => `${i}:${f}`).join("\n"));
