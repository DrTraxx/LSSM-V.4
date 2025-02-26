<template>
    <lightbox name="libraryOverview">
        <h1>Open-Source Libraries</h1>
        <label class="search_label">
            <input
                type="search"
                class="search_input_field"
                v-model="librarySearch"
                placeholder="search"
            />
        </label>
        <ul class="auto-sized-grid">
            <li
                v-for="libraryName in librariesFiltered"
                :key="libraryName"
                :library="(lib = libraries[libraryName])"
                class="card"
            >
                <a :href="lib.url" class="lightbox-open">
                    <img
                        :src="
                            lib.icon ||
                            'https://github.githubassets.com/pinned-octocat.svg'
                        "
                        :alt="libraryName"
                    />
                </a>
                <div class="linebreak"></div>
                <a
                    :href="
                        lib.url || `https://yarnpkg.com/package/${libraryName}`
                    "
                    class="lightbox-open"
                >
                    <h4>
                        <b>{{ libraryName }}</b>
                    </h4>
                </a>
                <div class="linebreak"></div>
                <small>
                    Version:
                    <code> {{ lib.version }}</code>
                </small>
            </li>
        </ul>
    </lightbox>
</template>

<script lang="ts">
import Vue from 'vue';

import libraries from '../libraries.json';

import type { DefaultMethods, DefaultProps } from 'vue/types/options';
import type {
    LibraryOverviewComputed,
    LibraryOverviewData,
} from '../../typings/components/LibraryOverview';

export default Vue.extend<
    LibraryOverviewData,
    DefaultMethods<Vue>,
    LibraryOverviewComputed,
    DefaultProps
>({
    name: 'libraryOverview',
    components: {
        Lightbox: () =>
            import(
                /* webpackChunkName: "components/lightbox" */ './lightbox.vue'
            ),
    },
    data() {
        return {
            librarySearch: '',
            libraries,
        };
    },
    computed: {
        librariesFiltered(): string[] {
            return Object.keys(libraries)
                .sort()
                .filter(m =>
                    this.librarySearch.length > 0
                        ? m
                              .toLowerCase()
                              .match(this.librarySearch.toLowerCase())
                        : true
                );
        },
    },
});
</script>

<style scoped lang="sass">
.search_label
    position: absolute
    right: 1em
    top: calc(1em + 32px)

.auto-sized-grid
    display: grid
    grid-gap: 16px
    grid-template-columns: repeat(auto-fit, 250px)
    list-style: none
    padding-left: 0
    margin-top: 10px
    margin-bottom: 10px

    .card
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2)
        transition: 0.3s
        border-radius: 5px
        padding: 1rem
        display: flex
        align-items: center
        justify-content: center
        flex-flow: row wrap

        img
            width: 100%
            height: 60px

        .linebreak
            width: 100%

        &:hover
            box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2)
</style>
