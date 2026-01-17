<script setup lang="ts">
import { TypesenseCollection } from "~~/shared/parsers/collection";

definePageMeta({
  layout: false,
});

const { setActiveCollection } = useActiveCollectionStore();

const { data } = await useFetch("/api/v1/collections", {
  default: () => [],
  // transform: (cols) => cols.map((col) => TypesenseCollection.parse(col)),
});

if (data.value.length > 0) {
  setActiveCollection(data.value[0]!);
  await navigateTo(`/collections/${data.value[0]!.id}`);
}
</script>

<template>
  <UCard>
    <CollectionForm />
  </UCard>
</template>
