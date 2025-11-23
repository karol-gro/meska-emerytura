<script lang="ts">
  import { CalculationService } from './services/calculationService';
  import type { SimpleCalculationParams } from './types/CalculationParams';
  import type { CalculationResults } from './types/CalculationResults';

  const service = new CalculationService();

  let birthYear: number = 1985;
  let birthMonth: number = 1;
  const months: { value: number; label: string }[] = [
    { value: 1, label: 'Styczeń' },
    { value: 2, label: 'Luty' },
    { value: 3, label: 'Marzec' },
    { value: 4, label: 'Kwiecień' },
    { value: 5, label: 'Maj' },
    { value: 6, label: 'Czerwiec' },
    { value: 7, label: 'Lipiec' },
    { value: 8, label: 'Sierpień' },
    { value: 9, label: 'Wrzesień' },
    { value: 10, label: 'Październik' },
    { value: 11, label: 'Listopad' },
    { value: 12, label: 'Grudzień' }
  ];
  let expectedNetRetirementIncome: number = 5000; // PLN

  let results: CalculationResults | null = null;
  let errorMessage = '';

  function formatPln(value: number) {
    return value.toLocaleString('pl-PL', { style: 'currency', currency: 'PLN' });
  }

  function handleSubmit(event: Event) {
    event.preventDefault();
    errorMessage = '';
    results = null;

    if (!birthYear || birthYear < 1900) {
      errorMessage = 'Podaj prawidłowy rok urodzenia.';
      return;
    }
    if (!expectedNetRetirementIncome || expectedNetRetirementIncome <= 0) {
      errorMessage = 'Oczekiwana emerytura netto musi być większa od zera.';
      return;
    }

    const params: SimpleCalculationParams = {
      birthYear,
      birthMonth,
      expectedNetRetirementIncome,
    };

    try {
      results = service.doSimpleCalculation(params);
      if (results.numberOfMonthsToRetirement < 0) {
        errorMessage = 'Data osiągnięcia wieku 60 lat już minęła. Obliczenia niedostępne.';
        results = null;
      }
    } catch (e) {
      errorMessage = 'Wystąpił błąd podczas obliczeń.';
      console.error(e);
    }
  }
</script>

<form class="bg-white shadow rounded-lg p-6 space-y-4" on:submit|preventDefault={handleSubmit}>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1" for="birthYear">Rok urodzenia</label>
    <input id="birthYear" type="number" bind:value={birthYear} min="1900" max="2100" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300" required />
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1" for="birthMonth">Miesiąc urodzenia</label>
    <select id="birthMonth" bind:value={birthMonth} class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300">
      {#each months as m}
        <option value={m.value}>{m.label}</option>
      {/each}
    </select>
  </div>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-1" for="expectedNetRetirementIncome">Oczekiwana miesięczna emerytura netto (zł)</label>
    <input id="expectedNetRetirementIncome" type="number" bind:value={expectedNetRetirementIncome} min="1" class="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300" required />
  </div>
  {#if errorMessage}
    <div class="text-red-600 text-sm">{errorMessage}</div>
  {/if}
  <button type="submit" class="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition">Oblicz</button>
</form>

{#if results}
  <div class="mt-8 bg-white shadow rounded-lg p-6">
    <h2 class="text-2xl font-semibold mb-4">Wyniki</h2>
    <ul class="space-y-2">
      <li><span class="font-medium">Oczekiwana emerytura netto:</span> {formatPln(results.expectedNetRetirement)}</li>
      <li><span class="font-medium">Miesięcy do emerytury:</span> {results.numberOfMonthsToRetirement}</li>
      <li><span class="font-medium">Wymagany kapitał początkowy na start wypłat:</span> {formatPln(results.requiredCapital)}</li>
      <li><span class="font-medium">Wymagana miesięczna składka oszczędnościowa:</span> {formatPln(results.requiredMonthlySavings)}</li>
    </ul>
  </div>
{/if}
