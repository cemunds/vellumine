export const useActiveCollectionStore = defineStore("activeCollection", () => {
  const activeCollection = ref({
    id: "abc",
  });

  const setActiveCollection = (id: string) => {
    activeCollection.value.id = id;
  };

  return {
    activeCollection: readonly(activeCollection),
    setActiveCollection,
  };
});
