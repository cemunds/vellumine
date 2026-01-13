<script setup lang="ts">
const props = defineProps<{
  name: string;
}>();

const firstLetter = computed(() => {
  return props.name.charAt(0).toUpperCase();
});
</script>

<template>
  <div class="dynamic-avatar">
    <div class="circle">
      <span>{{ firstLetter }}</span>
    </div>
  </div>
</template>

<style scoped>
.dynamic-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4caf50;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 20px;
}
</style>
