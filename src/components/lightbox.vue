<template>
    <div :class="{ titleHidden, fullHeight, ...extraClasses }">
        <div class="controlbtn-container" :class="{ vertical: verticalBtns }">
            <span
                v-if="!noXBtn && !noModal"
                class="lightbox-close"
                @click="$modal.hide(name)"
                :title="$t('close')"
            >
                <font-awesome-icon :icon="faTimes"></font-awesome-icon>
            </span>
            <span
                v-if="!noFullscreen && !fullscreen && !noModal"
                class="toggle-modal-fullscreen"
                @click="expand"
                :title="$t('fullscreen.expand')"
            >
                <font-awesome-icon :icon="faExpand"></font-awesome-icon>
            </span>
            <span
                v-if="!noFullscreen && fullscreen && !noModal"
                class="toggle-modal-fullscreen"
                @click="compress"
                :title="$t('fullscreen.compress')"
            >
                <font-awesome-icon :icon="faCompress"></font-awesome-icon>
            </span>
            <span
                v-if="!noTitleHide"
                class="toggle-title"
                @click="titleHidden = !titleHidden"
                :title="$tc('hideTitle', +!titleHidden)"
            >
                <font-awesome-icon :icon="faChevronUp"></font-awesome-icon>
            </span>
            <slot name="control-buttons"></slot>
        </div>
        <slot></slot>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import { faChevronUp } from '@fortawesome/free-solid-svg-icons/faChevronUp';
import { faCompress } from '@fortawesome/free-solid-svg-icons/faCompress';
import { faExpand } from '@fortawesome/free-solid-svg-icons/faExpand';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';

import type { DefaultComputed } from 'vue/types/options';
import type {
    LightboxData,
    LightboxMethods,
    LightboxProps,
} from 'typings/components/Lightbox';

export default Vue.extend<
    LightboxData,
    LightboxMethods,
    DefaultComputed,
    LightboxProps
>({
    name: 'lssmv4-lightbox',
    data() {
        return {
            fullscreen: false,
            fullscreenBefore: window.fullScreen,
            origWidth: this.noModal ? 0 : this.$parent.$parent.modal.width,
            origHeight: this.noModal ? 0 : this.$parent.$parent.modal.height,
            titleHidden: false,
            faTimes,
            faExpand,
            faCompress,
            faChevronUp,
            verticalBtns: false,
        };
    },
    props: {
        name: {
            type: String,
            required: true,
        },
        noXBtn: {
            type: Boolean,
            required: false,
            default: false,
        },
        noFullscreen: {
            type: Boolean,
            required: false,
            default: false,
        },
        noTitleHide: {
            type: Boolean,
            required: false,
            default: false,
        },
        fullHeight: {
            type: Boolean,
            required: false,
            default: false,
        },
        extraClasses: {
            type: Object,
            required: false,
            default: () => ({}),
        },
        noModal: {
            type: Boolean,
            required: false,
            default: () => false,
        },
    },
    methods: {
        expand() {
            if (this.noModal) return;
            this.fullscreen = true;
            this.$parent.$parent.modal.width = 100;
            this.$parent.$parent.modal.height = 100;
            if (!window.fullScreen)
                this.$parent.$parent.$el.requestFullscreen();
        },
        compress() {
            if (this.noModal) return;
            this.fullscreen = false;
            this.$parent.$parent.modal.width = this.origWidth;
            this.$parent.$parent.modal.height = this.origHeight;
            if (!this.fullscreenBefore && window.fullScreen)
                document.exitFullscreen();
        },
    },
});
</script>

<style scoped lang="sass">
.controlbtn-container
    display: flex
    justify-content: end
    width: auto
    position: absolute
    right: 1rem
    top: 1rem
    flex-direction: row-reverse

    &.vertical
        flex-flow: column

    > span
        cursor: pointer
        width: 32px
        height: 32px
        display: flex
        align-items: center
        justify-content: center

        svg
            transition: transform 1s
h1
    transition: font-size 1s, margin 1s, opacity 1s

.titleHidden
    h1
        font-size: 0 !important
        margin: 0 !important
        opacity: 0 !important

    .toggle-title svg
        transform: rotate(180deg)

.fullHeight
    height: 100%
</style>
