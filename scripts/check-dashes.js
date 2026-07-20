#!/usr/bin/env node
// Linter typograficzny: w `src/` zamiast długiego myślnika (—) używamy półpauzy (–).
// Uruchomienie: `node scripts/check-dashes.js [--fix]` (albo `pnpm lint:dashes`).
// Wyjątek: linia zawierająca marker `allow-em-dash` jest pomijana.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/** Znaki traktowane jako „za długie”: em dash (U+2014) i horizontal bar (U+2015). */
export const LONG_DASH = /[—―]/g;

/** Znak docelowy: półpauza / en dash (U+2013). */
export const EN_DASH = '–';

/** Marker w linii wyłączający regułę dla tej linii. */
export const ALLOW_MARKER = 'allow-em-dash';

const EXTENSIONS = ['.svelte', '.ts', '.js', '.css', '.html'];
const SKIP_DIRS = new Set(['node_modules', '.svelte-kit', 'build', 'dist']);

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');

/**
 * Znajduje wszystkie długie myślniki w tekście.
 * @param {string} text
 * @returns {{ line: number; column: number; source: string }[]}
 */
export function findLongDashes(text) {
	const hits = [];
	text.split('\n').forEach((source, index) => {
		if (source.includes(ALLOW_MARKER)) return;
		for (const match of source.matchAll(LONG_DASH)) {
			hits.push({ line: index + 1, column: match.index + 1, source: source.trim() });
		}
	});
	return hits;
}

/**
 * Zamienia długie myślniki na półpauzy, z pominięciem linii z markerem.
 * @param {string} text
 * @returns {string}
 */
export function fixLongDashes(text) {
	return text
		.split('\n')
		.map((source) => (source.includes(ALLOW_MARKER) ? source : source.replace(LONG_DASH, EN_DASH)))
		.join('\n');
}

/**
 * Zbiera pliki źródłowe do sprawdzenia.
 * @param {string} dir
 * @returns {string[]} ścieżki bezwzględne
 */
export function collectFiles(dir) {
	const files = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			if (!SKIP_DIRS.has(entry.name)) files.push(...collectFiles(path));
		} else if (EXTENSIONS.some((ext) => entry.name.endsWith(ext))) {
			files.push(path);
		}
	}
	return files;
}

/**
 * Sprawdza (lub poprawia) wszystkie pliki w katalogu.
 * @param {{ dir?: string; fix?: boolean }} options
 * @returns {{ file: string; line: number; column: number; source: string }[]} pozostałe trafienia
 */
export function checkDir({ dir = join(ROOT, 'src'), fix = false } = {}) {
	const problems = [];
	for (const file of collectFiles(dir)) {
		const text = readFileSync(file, 'utf8');
		const hits = findLongDashes(text);
		if (hits.length === 0) continue;
		if (fix) {
			writeFileSync(file, fixLongDashes(text), 'utf8');
		} else {
			problems.push(...hits.map((hit) => ({ file: relative(ROOT, file), ...hit })));
		}
	}
	return problems;
}

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;

if (isMain) {
	const fix = process.argv.includes('--fix');
	const problems = checkDir({ fix });

	if (fix) {
		console.log('check-dashes: zamieniono długie myślniki na półpauzy w src/.');
	} else if (problems.length > 0) {
		for (const { file, line, column, source } of problems) {
			console.error(
				`${file}:${line}:${column}  długi myślnik (—), użyj półpauzy (–)\n    ${source}`
			);
		}
		console.error(
			`\ncheck-dashes: ${problems.length} długich myślników. Napraw: pnpm lint:dashes -- --fix` +
				`\n(świadomy wyjątek: dopisz w linii komentarz z markerem ${ALLOW_MARKER})`
		);
		process.exit(1);
	} else {
		console.log('check-dashes: brak długich myślników w src/.');
	}
}
