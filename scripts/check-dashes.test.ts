import { describe, expect, it } from 'vitest';
// @ts-expect-error - skrypt narzędziowy w czystym JS, bez deklaracji typów
import { ALLOW_MARKER, checkDir, findLongDashes, fixLongDashes } from './check-dashes.js';

describe('findLongDashes', () => {
	it('wykrywa długi myślnik z pozycją', () => {
		expect(findLongDashes('ala\nma — kota')).toEqual([{ line: 2, column: 4, source: 'ma — kota' }]);
	});

	it('nie zgłasza półpauzy ani łącznika', () => {
		expect(findLongDashes('zakres 60–65, e-mail, minus -')).toEqual([]);
	});

	it('pomija linię z markerem wyjątku', () => {
		expect(findLongDashes(`'—' // ${ALLOW_MARKER}: placeholder pustej wartości`)).toEqual([]);
	});
});

describe('fixLongDashes', () => {
	it('zamienia wszystkie długie myślniki na półpauzy', () => {
		expect(fixLongDashes('a — b ― c')).toBe('a – b – c');
	});

	it('zostawia linie z markerem nietknięte', () => {
		const line = `const empty = '—'; // ${ALLOW_MARKER}`;
		expect(fixLongDashes(line)).toBe(line);
	});
});

describe('src/', () => {
	it('nie zawiera długich myślników', () => {
		const problems = checkDir();
		const report = problems
			.map(
				({
					file,
					line,
					column,
					source
				}: {
					file: string;
					line: number;
					column: number;
					source: string;
				}) => `${file}:${line}:${column}  ${source}`
			)
			.join('\n');
		expect(report, `Użyj półpauzy (–) zamiast długiego myślnika (—):\n${report}`).toBe('');
	});
});
