<template>
    <div class="inline-flex items-center space-x-1" :class="status.color">
        <component :is="status.icon" class="w-4 h-4" :class="status.iconClass" />
        <span class="text-sm">{{ status.label }}</span>
    </div>
</template>

<script setup lang="ts">
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    LoaderCircle,
    Slash,
    Ban,
    HelpCircle,
} from 'lucide-vue-next'

import { computed } from 'vue'

const props = defineProps<{
    color: string
}>()


const jenkinsStatusMap = {
    blue: { label: '成功', color: 'text-green-500', icon: CheckCircle },
    red: { label: '失败', color: 'text-red-500', icon: XCircle },
    yellow: { label: '不稳定', color: 'text-yellow-500', icon: AlertTriangle },
    grey: { label: '未构建', color: 'text-gray-400', icon: Slash },
    notbuilt: { label: '未构建', color: 'text-gray-400', icon: Slash },
    disabled: { label: '禁用', color: 'text-gray-400', icon: Ban },
    aborted: { label: '中止', color: 'text-gray-500', icon: Ban },

    // 构建中状态（动画）
    blue_anime: { label: '构建中', color: 'text-blue-500', icon: LoaderCircle },
    red_anime: { label: '构建中', color: 'text-blue-500', icon: LoaderCircle },
    yellow_anime: { label: '构建中', color: 'text-blue-500', icon: LoaderCircle },
    grey_anime: { label: '构建中', color: 'text-blue-500', icon: LoaderCircle },
    notbuilt_anime: { label: '构建中', color: 'text-blue-500', icon: LoaderCircle },
    disabled_anime: { label: '构建中', color: 'text-blue-500', icon: LoaderCircle },
    aborted_anime: { label: '构建中', color: 'text-blue-500', icon: LoaderCircle },

    default: { label: '未知', color: 'text-gray-300', icon: HelpCircle }
}

const status = computed(() => {
    const base = jenkinsStatusMap[props.color] || jenkinsStatusMap.default
    return {
        ...base,
        iconClass: props.color.includes('_anime') ? 'animate-spin' : '',
    }
})




</script>
