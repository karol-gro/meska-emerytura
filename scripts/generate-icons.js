#!/usr/bin/env node
// Generator favikon: z `src/lib/assets/unequal.svg` robi komplet ikon w `static/`.
// Uruchomienie: `pnpm icons` po każdej zmianie logo; wynikowe pliki commitujemy.
//
// Ikony muszą leżeć w statycznym HTML (src/app.html), a nie być wstrzykiwane przez JS –
// crawler favikon Google nie wykonuje skryptów, a apka jest SPA bez SSR.

import { copyFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const SOURCE = resolve(ROOT, 'src/lib/assets/unequal.svg');
const OUT = resolve(ROOT, 'static');

/** Tło ikon „aplikacyjnych” = tło strony (iOS zamienia przezroczystość na czerń). */
const BACKGROUND = '#0b1326';

/** Margines ikon aplikacyjnych jako ułamek boku – mieści się w strefie bezpiecznej maskable. */
const APP_ICON_PADDING = 0.2;

/** Rozmiary PNG upakowane w favicon.ico. */
const ICO_SIZES = [16, 32, 48];

/**
 * Renderuje SVG do kwadratowego PNG o boku `size`.
 * @param {number} size
 * @param {{ padding?: number; background?: string }} [options]
 * @returns {Promise<Buffer>}
 */
async function renderPng(size, { padding = 0, background } = {}) {
	const inner = Math.round(size * (1 - 2 * padding));
	// Wysoka gęstość, żeby sharp rasteryzował wektor, a nie skalował bitmapę 24×24.
	const glyph = await sharp(SOURCE, { density: 72 * Math.ceil(inner / 24) * 2 })
		.resize(inner, inner)
		.png()
		.toBuffer();
	const offset = Math.floor((size - inner) / 2);
	return sharp({
		create: {
			width: size,
			height: size,
			channels: 4,
			background: background ?? { r: 0, g: 0, b: 0, alpha: 0 }
		}
	})
		.composite([{ input: glyph, left: offset, top: offset }])
		.png()
		.toBuffer();
}

/**
 * Składa plik ICO z obrazów PNG (format „PNG w ICO”, wspierany od Windows Vista).
 * @param {{ size: number; data: Buffer }[]} images
 * @returns {Buffer}
 */
function buildIco(images) {
	const header = Buffer.alloc(6);
	header.writeUInt16LE(0, 0); // zarezerwowane
	header.writeUInt16LE(1, 2); // typ: ikona
	header.writeUInt16LE(images.length, 4);

	const entries = [];
	let offset = 6 + 16 * images.length;
	for (const { size, data } of images) {
		const entry = Buffer.alloc(16);
		entry.writeUInt8(size >= 256 ? 0 : size, 0); // szerokość (0 = 256)
		entry.writeUInt8(size >= 256 ? 0 : size, 1); // wysokość
		entry.writeUInt8(0, 2); // liczba kolorów palety
		entry.writeUInt8(0, 3); // zarezerwowane
		entry.writeUInt16LE(1, 4); // płaszczyzny
		entry.writeUInt16LE(32, 6); // bity na piksel
		entry.writeUInt32LE(data.length, 8);
		entry.writeUInt32LE(offset, 12);
		entries.push(entry);
		offset += data.length;
	}
	return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

async function main() {
	copyFileSync(SOURCE, resolve(OUT, 'favicon.svg'));

	const icoImages = await Promise.all(
		ICO_SIZES.map(async (size) => ({ size, data: await renderPng(size) }))
	);
	writeFileSync(resolve(OUT, 'favicon.ico'), buildIco(icoImages));

	writeFileSync(resolve(OUT, 'favicon-96x96.png'), await renderPng(96));

	const appIcon = { padding: APP_ICON_PADDING, background: BACKGROUND };
	writeFileSync(resolve(OUT, 'apple-touch-icon.png'), await renderPng(180, appIcon));
	writeFileSync(resolve(OUT, 'web-app-manifest-192x192.png'), await renderPng(192, appIcon));
	writeFileSync(resolve(OUT, 'web-app-manifest-512x512.png'), await renderPng(512, appIcon));

	console.log('Ikony zapisane w static/.');
}

await main();
