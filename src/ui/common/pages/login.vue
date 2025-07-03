<script setup lang="ts">
import * as v from 'valibot'
import type { FormSubmitEvent } from '@nuxt/ui'

const schema = v.object({
    user: v.pipe(v.string(), v.minLength(1, 'Invalid user')),
    password: v.pipe(v.string(), v.minLength(8, 'Must be at least 8 characters'))
})

type Schema = v.InferOutput<typeof schema>

const state = reactive({
    user: '',
    password: ''
})

const toast = useToast()
async function onSubmit(event: FormSubmitEvent<Schema>) {
    toast.add({ title: 'Success', description: 'The form has been submitted.', color: 'success' })
    console.log(event.data)
}
</script>

<template>
    <h1 class=" text-center text-xl">Login</h1>
    <UForm :schema="schema" :state="state" class="space-y-3 w-[200px] m-auto flex flex-col justify-center pb-3"
        @submit="onSubmit">
        <UFormField label="User" name="user">
            <UInput v-model="state.user" class=" w-full " />
        </UFormField>

        <UFormField label="Password" name="password">
            <UInput v-model="state.password" type="password" class=" w-full " />
        </UFormField>

        <UButton type="submit" class=" text-center block ">
            Submit
        </UButton>
    </UForm>
</template>