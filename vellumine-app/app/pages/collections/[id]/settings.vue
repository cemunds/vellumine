<script setup lang="ts">
const { activeCollection } = storeToRefs(useActiveCollectionStore());

async function deleteCollection() {
  try {
    const response = await $fetch(
      `/api/v1/collections/${activeCollection.value.id}`,
      {
        method: "DELETE",
      },
    );

    useToast().add({
      title: "Collection deleted",
      description: "Collection has been deleted.",
      color: "success",
    });

    await navigateTo("/collections");
  } catch (err) {
    console.error("Failed to delete collection:", err);
    useToast().add({
      title: "Deletion failed",
      description:
        (err as any)?.statusMessage || "Failed to delete collection.",
      color: "error",
    });
  }
}
</script>

<template>
  <UDashboardPanel id="settings">
    <template #header>
      <UDashboardNavbar title="Settings">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <UCard>
        <template #header>
          <h3 class="font-medium text-gray-900 dark:text-white">Danger Zone</h3>
        </template>

        <div class="space-y-4">
          <UButton
            icon="i-lucide-trash"
            color="error"
            @click="deleteCollection"
          >
            Delete Collection
          </UButton>
        </div>
      </UCard>
    </template>
  </UDashboardPanel>
</template>
