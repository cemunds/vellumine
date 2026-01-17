<script setup lang="ts">
const { activeCollection } = storeToRefs(useActiveCollectionStore());

async function deleteCollection() {
  if (!activeCollection.value) return;

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

    await navigateTo("/");
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

async function syncCollection() {
  if (!activeCollection.value) return;

  try {
    const response = await $fetch("/api/v1/sync", {
      method: "POST",
      body: { collectionId: activeCollection.value.id },
    });

    useToast().add({
      title: "Sync Started",
      description: "Content synchronization has been started.",
      color: "success",
    });

    // Refresh sync status
    // await fetchCollectionDetails();
  } catch (err) {
    console.error("Failed to sync collection:", err);
    useToast().add({
      title: "Sync Failed",
      description:
        (err as any)?.statusMessage || "Failed to start synchronization.",
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
          <h3 class="font-medium text-gray-900 dark:text-white">Collection</h3>
        </template>

        <div class="space-y-4">
          <UButton icon="i-lucide-refresh-cw" @click="syncCollection">
            <!-- {{ syncStatus?.status === "syncing" ? "Syncing..." : "Sync Now" }} -->
            Sync Now
          </UButton>
        </div>
      </UCard>
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
