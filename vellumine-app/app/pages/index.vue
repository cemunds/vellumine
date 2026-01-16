<script setup lang="ts">
definePageMeta({
  layout: false,
});

const { setActiveCollection } = useActiveCollectionStore();

const { data } = await useFetch("/api/v1/collections", {
  default: () => [],
});

if (data.value.length > 0) {
  setActiveCollection(data.value[0]!.id);
  await navigateTo(`/collections/${data.value[0]!.id}`);
}
</script>

<template>
  <UCard>
    <CollectionForm />
  </UCard>
</template>
