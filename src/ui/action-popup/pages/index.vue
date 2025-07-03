<script setup lang="ts">

const router = useRouter()

const host = ref('')
const toast = useToast()

const { state, isLoading } = useAsyncState(async () => {
  host.value = window.localStorage.getItem("jkHost") || "";

  if (!host.value) {
    router.push("/common/setting")
  }

  const data = (await fetch(`${toValue(host)}/view/All/api/json`)).json();
  if (data?.jobs) {
    toast.add({ title: '请求失败', color: "error" });
  }

  return data
}, null);

const jobs = computed<{ name: string, url: string, color: string }[]>(() => {
  return toValue(state)?.jobs
})

</script>

<template>
  <LoadingSpinner :loading="isLoading" class=" pb-8 " />

  <div v-if="!isLoading" class=" mb-6 ">
    <div class=" list  font-bold hover:!bg-transparent ">
      <div class=" ">Status</div>
      <div class=" ">Name</div>
      <div class=" ">???</div>
    </div>
    <div>
      <div v-for="job in jobs" class=" list ">
        <div class=" ">
          <JenkinsStatus :color="job.color" />
        </div>
        <div><a :href="job.url" target="_blank" class=" text-primary ">{{ job.name }}</a></div>
        <div class=" ">
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list {
  @apply flex border-b;
  border-color: var(--ui-border-muted);
  padding: 8px 0;
}

.list>div {
  @apply flex-1;
  padding: 0 8px;
}

.list:hover {
  background-color: var(--ui-bg-muted);
}
</style>
