<script setup lang="ts">
import { canAbortBuild, canTriggerBuild, JobItem, useJenkins } from '../hooks/useJenkins';
import { sleep } from '../utils/helper';

const router = useRouter()

const toast = useToast()

const { getJobs, triggerBuild, stopBuild, jkHost } = useJenkins();

// 获取任务列表
const jobs = ref<JobItem[]>([]);
const { isLoading, execute: refreshJobs } = useAsyncState(async () => {
  const jobs = await getJobs();
  if (!jobs) {
    toast.add({ title: '请求失败', color: "error" });
  }
  return jobs || [];
}, [], {
  immediate: false,
  onSuccess(_jobs) {
    jobs.value = _jobs;
  }
});

// 轮询获取
const { resume: pollRefresh } = useTimeoutPoll(async () => {
  refreshJobs()
}, 10000, { immediate: false, immediateCallback: true })

const curJob = ref(); // 当前选择的 job

// 手动触发构建
const isLoadingTriggerBuildName = ref('');
const { isLoading: isLoadingTriggerBuild, execute: triggerJKBuild } = useAsyncState(async (opts: { jobName: string }) => {
  isLoadingTriggerBuildName.value = opts?.jobName
  await triggerBuild(opts);
  await sleep(100)
  await refreshJobs()
}, null, {
  immediate: false,
});

// 手动停止构建
const isLoadingStopBuildName = ref('');
const { isLoading: isLoadingStopBuild, execute: stopJKBuild } = useAsyncState(async (opts: { jobName: string }) => {
  isLoadingStopBuildName.value = opts?.jobName
  await stopBuild(opts);
  await sleep(100)
  await refreshJobs()
}, null, {
  immediate: false,
});

onMounted(() => {
  if (!toValue(jkHost)) {
    // 判断是否已经设置 host
    router.push("/common/setting")
  } else {
    pollRefresh();
  }
})


const modalOpen = reactive({
  build: false,
  stopBuild: false,
})

const jump = () => {
  window.open(toValue(jkHost), '_blank')
}
</script>

<template>
  <div class=" mb-6 ">
    <div class=" flex justify-end gap-2">
      <UButton icon="ph:repeat-bold" size="sm" variant="ghost" :loading="isLoading" @click="() => { refreshJobs() }">
      </UButton>

      <UButton icon="ph:link-simple" size="sm" variant="ghost" @click="() => {
        jump()
      }">
      </UButton>
    </div>

    <div class=" list  font-bold hover:!bg-transparent ">
      <div class=" status ">Status</div>
      <div class=" flex-1 ">Name</div>
      <div class=" action ">Action</div>
    </div>

    <div>
      <div v-for="job in jobs" class=" list ">
        <div class=" status shrink-0 ">
          <JenkinsStatus :color="job.color" />
        </div>

        <div class=" overflow-hidden shrink-0 truncate flex-1 ">
          <UPopover mode="hover">
            <a :href="job.url" target="_blank" class=" text-primary truncate w-full overflow-hidden ">{{ job.name }}</a>
            <template #content>
              <div class="  px-3 py-0.5 ">{{ job.name }}</div>
            </template>
          </UPopover>
        </div>

        <div class=" action flex ">
          <!-- 构建 -->
          <UButton v-if="job.canBuild" icon="ph:google-play-logo" variant="ghost"
            :loading="isLoadingTriggerBuild && isLoadingTriggerBuildName == job?.name" size="sm" @click="() => {
              curJob = job;
              modalOpen.build = true;
            }">
          </UButton>

          <!-- 停止构建 -->
          <UButton v-if="job.building" icon="ph:pause-circle" variant="ghost" size="sm"
            :loading="isLoadingStopBuild && isLoadingStopBuildName == job?.name" @click="() => {
              curJob = job;
              modalOpen.stopBuild = true;
            }"></UButton>

          <!-- 刷新 -->
          <UButton v-if="!job.canBuild && !job.building" icon="ph:repeat-bold" size="sm" variant="ghost"
            :loading="isLoading" @click="() => { refreshJobs() }">
          </UButton>
        </div>
      </div>
    </div>
  </div>


  <!-- 构建询问 -->
  <UModal v-model:open="modalOpen.build">
    <template #content>
      <div class=" p-3 ">
        <h1 class=" text-lg font-bold">Build Job ({{ curJob?.name }})</h1>
        <p class=" text-base py-5 px-3 font-medium text-center "> Are you sure to build this job ?
        </p>
        <div class=" flex justify-end gap-3">
          <UButton size="sm" @click="() => { triggerJKBuild(0, { jobName: curJob?.name }); modalOpen.build = false }">
            Confirm
          </UButton>

          <UButton size="sm" variant="outline" @click="modalOpen.build = false">
            Cancel
          </UButton>
        </div>
      </div>
    </template>
  </UModal>

  <!-- 停止构建询问 -->
  <UModal v-model:open="modalOpen.stopBuild">
    <template #content>
      <div class=" p-3 ">
        <h1 class=" text-lg font-bold">Stop Job ({{ curJob?.name }})</h1>
        <p class=" text-base py-5 px-3 font-medium text-center "> Are you sure you want to stop this job?
        </p>
        <div class=" flex justify-end gap-3">
          <UButton color="error" size="sm"
            @click="() => { stopJKBuild(0, { jobName: curJob?.name }); modalOpen.stopBuild = false }">
            <p class=" text-white ">Stop</p>
          </UButton>

          <UButton size="sm" variant="outline" @click="modalOpen.build = false">
            Cancel
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>

<style scoped>
.list {
  @apply flex items-center border-b;
  border-color: var(--ui-border-muted);
  padding: 8px 0;
}


.status {
  width: 100px;
}

.action {
  width: 100px;
}

.list>div {
  padding: 0 8px;
}

.list:hover {
  background-color: var(--ui-bg-muted);
}
</style>
