<script setup lang="ts">
import type { FormSubmitEvent } from "@nuxt/ui";
import consola from "consola";
import { z } from "zod";

const toast = useToast();

const schema = z.object({
  name: z.string().nonempty("Collection name is required"),
  description: z.string(),
  ghostAdminUrl: z.url("Ghost Admin URL is required"),
  ghostAdminApiKey: z.string().nonempty("Ghost Admin API Key is required"),
});

type FormSchema = z.infer<typeof schema>;

const state = ref<FormSchema>({
  name: "",
  description: "",
  ghostAdminUrl: "",
  ghostAdminApiKey: "",
});

const isLoading = ref(false);

async function onSubmit(event: FormSubmitEvent<FormSchema>) {
  try {
    isLoading.value = true;

    const response = await $fetch("/api/v1/collections", {
      method: "POST",
      body: {
        name: state.value.name,
        description: state.value.description,
        ghostAdminUrl: state.value.ghostAdminUrl,
        ghostAdminApiKey: state.value.ghostAdminApiKey,
      },
    });

    toast.add({
      title: "Collection Created",
      description: "Your collection has been created successfully.",
      color: "success",
    });

    // Navigate to collection details
    await navigateTo(`/collections/${response.id}`);
  } catch (err: any) {
    consola.error("Failed to create collection:", err);

    toast.add({
      title: "Creation Failed",
      description: "Failed to create collection",
      color: "error",
    });
  } finally {
    isLoading.value = false;
  }
}

// Ghost API key instructions
const ghostApiKeyInstructions = `
## How to Generate Ghost Content API Key

1. **Log in** to your Ghost admin panel
2. **Navigate** to Settings → Advanced → Integrations
3. **Click** "Add custom integration"
4. **Name** your integration (e.g., "Vellumine")
5. **Click** "Create"
6. **Copy** the "Admin API Key"
7. **Paste** it into the form above
`;
</script>

<template>
  <UForm
    :schema="schema"
    :state="state"
    class="space-y-6"
    @submit.prevent="onSubmit"
  >
    <UFormField label="Collection Name" name="name" required>
      <UInput v-model="state.name" placeholder="My Blog" />
    </UFormField>

    <UFormField
      label="Description"
      name="description"
      hint="Optional description for your collection"
    >
      <UTextarea
        v-model="state.description"
        placeholder="Description of your collection"
      />
    </UFormField>

    <UFormField
      label="Ghost Admin URL"
      name="ghostAdminUrl"
      hint="e.g., https://admin.your-blog.com"
      required
    >
      <UInput
        v-model="state.ghostAdminUrl"
        placeholder="https://admin.your-blog.com"
      />
    </UFormField>

    <UFormField label="Ghost Admin API Key" name="ghostAdminApiKey" required>
      <UInput
        v-model="state.ghostAdminApiKey"
        type="password"
        placeholder="Admin API Key"
      />
    </UFormField>

    <div class="flex justify-end">
      <UButton
        type="submit"
        :loading="isLoading"
        icon="i-lucide-save"
        size="lg"
      >
        Create Collection
      </UButton>
    </div>
  </UForm>
</template>
