<script setup lang="ts">

const jkToken = useStorage('jkToken', '');
const jkUser = useStorage('jkUser', '');
const jkHost = useStorage('jkHost', '');

</script>
<template>
    <div class=" space-y-3 ">
        <UFormField label="Jenkins Host">
            <UInput v-model="jkHost" class=" w-full " />
        </UFormField>

        <UFormField label="User Name (use for build)">
            <UInput v-model="jkUser" class=" w-full " />
        </UFormField>

        <UFormField label="Api Token (use for build)">
            <UInput v-model="jkToken" class=" w-full " />
        </UFormField>
    </div>

    <RouterLinkUp :disabled="!jkHost" />
</template>