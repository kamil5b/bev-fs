<template>
  <button v-bind="$attrs" class="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">
    <slot />
  </button>
</template>
