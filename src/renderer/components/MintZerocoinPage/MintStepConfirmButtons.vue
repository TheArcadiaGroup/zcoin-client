<template>
    <base-button
        v-if="isTimerDone"
        :disabled="!canSubmit"
        :color="color"
        tabindex="4"
        @click.prevent="actions.next"
    >
        <span>{{ $t('mint.flyout-confirm-mint.button__mint-confirm--primary') }}</span>
    </base-button>
    <circular-timer
        v-else
        key="confirm-timer"
        class="circular-timer"
        :complete="onTimerDone"
    />
</template>

<script>
import CircularTimer from '@/components/Icons/CircularTimer'

export default {
    name: 'MintStepConfirmButtons',
    components: {
        CircularTimer
    },
    props: {
        actions: {
            type: Object,
            required: true
        },
        canSubmit: {
            type: Boolean,
            default: false
        },
        color: {
            type: String,
            default: ''
        },
        isTimerDone: {
            type: Boolean,
            default: false
        }
    },

    data () {
        return {
            // timerDone: false
            // confirmed: false,
            // minCellWidth: 0
        }
    },

    beforeCreate () {
        this.$parent.$emit('can-submit', false)
        this.$parent.$emit('can-cancel', false)
    },

    methods: {
        onTimerDone () {
            this.$parent.$emit('is-confirmed', true)
            this.$parent.$emit('can-submit', true)
            this.$parent.$emit('can-cancel', true)
            window.dispatchEvent(new Event('resize'))
        }
    }

}
</script>

<style scoped>

</style>
