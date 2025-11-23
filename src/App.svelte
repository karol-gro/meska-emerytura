<script lang="ts">
  import SimpleRetirementCalculator from './lib/SimpleRetirementCalculator.svelte';
</script>

<main class="min-h-screen bg-gray-100 flex items-start justify-center py-10">
  <div class="w-full max-w-4xl mx-auto p-6">
    <h1 class="text-4xl font-bold text-gray-900 mb-2 text-center">Męska Emerytura</h1>
    <p class="text-lg text-gray-600 text-center mb-8">Prosty kalkulator oszczędzania na emeryturę (kobieta 60 lat).</p>
    <SimpleRetirementCalculator />
  </div>
</main>
