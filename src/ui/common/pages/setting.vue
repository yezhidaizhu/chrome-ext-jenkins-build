<script setup lang="ts">

const props = withDefaults(defineProps<{

}>(), {
});

const host = ref<string>("")

onMounted(() => {
    host.value = window.localStorage.getItem("jkHost") || "";
})

watch(host, () => {
    window.localStorage.setItem("jkHost", toValue(host));
});

</script>
<template>
    <div>
        <UFormField label="Jenkins Host">
            <UInput v-model="host" class=" w-full " />
        </UFormField>
    </div>

    <RouterLinkUp :disabled="!host" />
</template>