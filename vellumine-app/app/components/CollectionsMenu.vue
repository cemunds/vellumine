<script setup lang="ts">
import type { DropdownMenuItem } from "@nuxt/ui";

defineProps<{
  collapsed?: boolean;
}>();

const CollectionAvatar = resolveComponent("CollectionAvatar");

const { setActiveCollection } = useActiveCollectionStore();

const { data } = await useFetch("/api/v1/collections", {
  default: () => [],
});

const collections = computed(() => {
  return data.value.map((col) => ({
    label: col.name,
    id: col.id,
    avatar: {
      component: CollectionAvatar,
      alt: col.name,
    },
    to: `/collections/${col.id}`,
  }));
});

const selectedCollection = ref(collections.value[0]);
// setActiveCollection(selectedCollection.value.id);

const items = computed<DropdownMenuItem[][]>(() => {
  return [
    collections.value.map((collection) => ({
      ...collection,
      onSelect() {
        selectedCollection.value = collection;
      },
    })),
    [
      {
        label: "Create collection",
        icon: "i-lucide-circle-plus",
        to: "/collections/create",
      },
      // {
      //   label: "Manage collections",
      //   icon: "i-lucide-cog",
      // },
    ],
  ];
});
</script>

<template>
  <UDropdownMenu
    :items="items"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{
      content: collapsed ? 'w-40' : 'w-(--reka-dropdown-menu-trigger-width)',
    }"
  >
    <UButton
      v-bind="{
        ...selectedCollection,
        label: collapsed ? undefined : selectedCollection?.label,
        trailingIcon: collapsed ? undefined : 'i-lucide-chevrons-up-down',
      }"
      color="neutral"
      variant="ghost"
      block
      :square="collapsed"
      class="data-[state=open]:bg-elevated"
      :class="[!collapsed && 'py-2']"
      :ui="{
        trailingIcon: 'text-dimmed',
      }"
    />
  </UDropdownMenu>
</template>
