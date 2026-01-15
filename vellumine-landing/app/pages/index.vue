<script setup lang="ts">
const { data: page } = await useAsyncData("index", () =>
  queryCollection("content").first(),
);
if (!page.value) {
  throw createError({
    statusCode: 404,
    statusMessage: "Page not found",
    fatal: true,
  });
}

useSeoMeta({
  title: page.value.seo?.title || page.value.title,
  ogTitle: page.value.seo?.title || page.value.title,
  description: page.value.seo?.description || page.value.description,
  ogDescription: page.value.seo?.description || page.value.description,
});
</script>

<template>
  <div v-if="page" class="relative">
    <UPageHero :description="page.description" :links="page.hero.links" :ui="{
      container: 'md:pt-18 lg:pt-20',
      title: 'max-w-3xl mx-auto',
    }">
      <template #top>
        <HeroBackground />
      </template>

      <template #title>
        <MDC :value="page.title" unwrap="p" />
      </template>
    </UPageHero>

    <UPageSection :description="page.section.description" :features="page.section.features" orientation="horizontal"
      :ui="{
        container: 'lg:px-0 2xl:px-20 mx-0 max-w-none md:mr-10',
        features: 'gap-0',
      }" reverse>
      <template #title>
        <MDC :value="page.section.title" class="sm:*:leading-11" />
      </template>
      <img :src="page.section.images.desktop" :alt="page.section.title"
        class="hidden lg:block 2xl:hidden left-0 w-full max-w-2xl" />
      <img :src="page.section.images.mobile" :alt="page.section.title"
        class="block lg:hidden 2xl:block 2xl:w-full 2xl:max-w-2xl" />
    </UPageSection>

    <USeparator :ui="{ border: 'border-primary/30' }" />

    <UPageSection id="features" :description="page.features.description" :features="page.features.features" :ui="{
      title: 'text-left @container relative flex',
      description: 'text-left',
    }" class="relative overflow-hidden">
      <div class="absolute rounded-full -left-10 top-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" />
      <div class="absolute rounded-full -right-10 -bottom-10 size-[300px] z-10 bg-primary opacity-30 blur-[200px]" />
      <template #title>
        <MDC :value="page.features.title" class="*:leading-9" />
      </template>
    </UPageSection>

    <USeparator :ui="{ border: 'border-primary/30' }" />

    <UPageSection id="steps" :description="page.steps.description" class="relative overflow-hidden">
      <template #title>
        <MDC :value="page.steps.title" />
      </template>

      <template #features>
        <UPageCard v-for="(step, index) in page.steps.items" :key="index" class="group"
          :ui="{ container: 'p-4 sm:p-4', title: 'flex items-center gap-1' }">
          <UColorModeImage v-if="step.image" :light="step.image?.light" :dark="step.image?.dark" :alt="step.title"
            class="size-full" />

          <div class="flex flex-col gap-2">
            <span class="text-lg font-semibold">
              {{ step.title }}
            </span>
            <span class="text-sm text-muted">
              {{ step.description }}
            </span>
          </div>
        </UPageCard>
      </template>
    </UPageSection>

    <UPageSection id="pricing" class="mb-32 overflow-hidden" :title="page.pricing.title"
      :description="page.pricing.description"
      :ui="{ title: 'text-left @container relative', description: 'text-left' }">
      <template #title>
        <MDC :value="page.pricing.title" />
      </template>

      <UPricingPlans scale>
        <UPricingPlan v-for="(plan, index) in page.pricing.plans" :key="index" :title="plan.title"
          :description="plan.description" :price="plan.price" :billing-period="plan.billing_period"
          :billing-cycle="plan.billing_cycle" :highlight="plan.highlight" :scale="plan.highlight" variant="soft"
          :features="plan.features" :button="plan.button" />
      </UPricingPlans>
    </UPageSection>

    <UPageSection id="testimonials" :title="page.testimonials.title" :description="page.testimonials.description"
      :items="page.testimonials.items">
      <template #title>
        <MDC :value="page.testimonials.title" />
      </template>

      <UContainer>
        <UPageColumns class="xl:columns-3">
          <UPageCard v-for="(testimonial, index) in page.testimonials.items" :key="index" variant="subtle"
            :description="testimonial.quote" :ui="{
              description:
                'before:content-[open-quote] after:content-[close-quote]',
            }">
            <template #footer>
              <UUser v-bind="testimonial.user" size="xl" />
            </template>
          </UPageCard>
        </UPageColumns>
      </UContainer>
    </UPageSection>

    <USeparator />

    <UPageCTA v-bind="page.cta" variant="naked" class="overflow-hidden @container">
      <template #title>
        <MDC :value="page.cta.title" />
      </template>

      <LazyStarsBg />
    </UPageCTA>
  </div>
</template>
