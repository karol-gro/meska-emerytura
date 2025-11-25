<script lang="ts">
  import SimpleRetirementCalculator from './lib/SimpleRetirementCalculator.svelte';
</script>

<main class="min-h-screen bg-gray-100 flex items-start justify-center py-10">
  <div class="w-full max-w-4xl mx-auto p-6">
    <h1 class="text-4xl font-bold text-gray-900 mb-2 text-center">Męska Emerytura</h1>
    <p class="text-lg text-gray-600 text-center mb-8">Mężczyzno, sprawdź, ile musisz odkładać, żeby mieć emeryturę taką, jak kobieta</p>
    <SimpleRetirementCalculator />
    <p class="text-center text-gray-500 text-sm mt-8">
      © {new Date().getFullYear()} KG. Wszelkie prawa zastrzeżone. Strona w celach demonstracyjnych; nie biorę odpowiedzialności za dokładność obliczeń ani za skutki wynikające z ich wykorzystania.
    </p>
  </div>
</main>