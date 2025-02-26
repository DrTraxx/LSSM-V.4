<template>
    <div>
        <label class="pull-right">
            <input
                :placeholder="lightbox.$sm('search_global')"
                ref="urlSearch"
                :value="urlSearch"
                @keyup.enter="setUrlSearch"
            />
            <button class="btn btn-success" @click="setUrlSearch">
                {{ lightbox.$sm('search_global') }}
            </button>
        </label>
        <h1>
            {{ lightbox.$sm('title') }}
            <small v-if="urlSearch">
                {{ lightbox.$sm('search_global') }}:
                <span class="url-search">{{ urlSearch }}</span>
            </small>
            <br />
            <small>
                {{ subtitle }}
            </small>
        </h1>
        <button
            class="btn btn-success"
            :disabled="startPage <= 1"
            @click="loadPrev"
        >
            {{ lightbox.$sm('load.prev') }}
        </button>
        <button
            class="btn btn-success"
            :disabled="
                endPage >= toplist.lastPage ||
                toplist.lastPage === Number.MAX_SAFE_INTEGER
            "
            @click="loadNext"
        >
            {{ lightbox.$sm('load.next') }}
        </button>
        <enhanced-table
            :head="head"
            :table-attrs="{ class: 'table table-striped' }"
            :search="search"
            :search-placeholder="lightbox.$sm('search_local')"
            @search="s => (search = s)"
            :sort="sort"
            :sort-dir="sortDir"
            @sort="setSort"
        >
            <template v-slot:head>
                <span>{{ lightbox.$smc('amount', usersFiltered.length) }}</span>
            </template>
            <tr v-for="(entry, id) in usersSorted" :key="id">
                <td>
                    <img
                        :src="entry.img"
                        :alt="entry.name"
                        v-if="entry.img"
                        loading="lazy"
                    />
                </td>
                <td>{{ entry.credits.toLocaleString() }}</td>
                <td>
                    <img
                        :src="`/images/user_${
                            entry.online ? 'green' : 'gray'
                        }.png`"
                        alt=""
                    />
                    <a :href="`/profile/${entry.id}`">
                        {{ entry.name }}
                    </a>
                </td>
                <td>
                    <a
                        :href="`/alliances/${entry.alliance.id}`"
                        v-if="entry.alliance.name"
                    >
                        {{ entry.alliance.name }}
                    </a>
                </td>
            </tr>
        </enhanced-table>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

import type { RedesignComponent } from 'typings/modules/Redesign';
import type { TopListWindow } from '../parsers/toplist';

type Component = RedesignComponent<
    'toplist',
    'toplist',
    {
        search: string;
        sort: string;
        sortDir: 'asc' | 'desc';
        head: Record<
            string,
            {
                title: string;
                noSort?: boolean;
            }
        >;
        startPage: number;
        endPage: number;
    },
    {
        setSort(type: string): void;
        loadPrev(): void;
        loadNext(): void;
        setUrlSearch(): void;
    },
    {
        urlSearch: string;
        page: number;
        subtitle: string;
        usersFiltered: TopListWindow['users'];
        usersSorted: TopListWindow['users'];
    }
>;

export default Vue.extend<
    Component['Data'],
    Component['Methods'],
    Component['Computed'],
    Component['Props']
>({
    name: 'lssmv4-redesign-toplist',
    components: {
        EnhancedTable: () =>
            import(
                /* webpackChunkName: "components/enhanced-table" */ '../../../components/enhanced-table.vue'
            ),
    },
    data() {
        return {
            search: '',
            sort: 'credits',
            sortDir: 'asc',
            head: {},
            startPage: 0,
            endPage: 0,
        };
    },
    methods: {
        setSort(type) {
            if (this.sort === type) {
                this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
            } else {
                this.sort = type;
                this.sortDir = 'asc';
            }
            this.setSetting('sort', type).then(() =>
                this.setSetting('sortDir', this.sortDir).then()
            );
        },
        loadPrev() {
            this.$set(this.lightbox, 'loading', true);
            this.startPage--;
            const url = new URL('/toplist', window.location.origin);
            url.searchParams.set('page', this.startPage.toString());
            const search =
                (this.$refs.urlSearch as HTMLInputElement)?.value?.trim() ?? '';
            if (search) url.searchParams.set('username', search);
            this.lightbox.apiStore
                .request({
                    url,
                    feature: `redesign-toplist-load-prev-${this.startPage}`,
                })
                .then((res: Response) => res.text())
                .then(async html => {
                    import('../parsers/toplist').then(async parser => {
                        const result = await parser.default({
                            doc: new DOMParser().parseFromString(
                                html,
                                'text/html'
                            ),
                            href: url.toString(),
                            getIdFromEl: this.lightbox.getIdFromEl,
                            LSSM: this.lightbox,
                            $m: this.lightbox.$m,
                            $sm: this.lightbox.$sm,
                            $mc: this.lightbox.$mc,
                            $smc: this.lightbox.$smc,
                        });
                        this.$set(
                            this.lightbox.data,
                            'lastPage',
                            result.lastPage
                        );
                        this.$set(this.lightbox.data, 'users', [
                            ...result.users,
                            ...this.lightbox.data.users,
                        ]);
                        this.lightbox.finishLoading('toplist-loadprev');
                    });
                });
        },
        loadNext() {
            this.$set(this.lightbox, 'loading', true);
            this.endPage++;
            const url = new URL('/toplist', window.location.origin);
            url.searchParams.set('page', this.endPage.toString());
            const search =
                (this.$refs.urlSearch as HTMLInputElement)?.value?.trim() ?? '';
            if (search) url.searchParams.set('username', search);
            this.lightbox.apiStore
                .request({
                    url,
                    feature: `redesign-toplist-load-next-${this.endPage}`,
                })
                .then((res: Response) => res.text())
                .then(async html => {
                    import('../parsers/toplist').then(async parser => {
                        const result = await parser.default({
                            doc: new DOMParser().parseFromString(
                                html,
                                'text/html'
                            ),
                            href: url.toString(),
                            getIdFromEl: this.lightbox.getIdFromEl,
                            LSSM: this.lightbox,
                            $m: this.lightbox.$m,
                            $sm: this.lightbox.$sm,
                            $mc: this.lightbox.$mc,
                            $smc: this.lightbox.$smc,
                        });
                        this.$set(
                            this.lightbox.data,
                            'lastPage',
                            result.lastPage
                        );
                        this.$set(this.lightbox.data, 'users', [
                            ...this.lightbox.data.users,
                            ...result.users,
                        ]);
                        this.lightbox.finishLoading('toplist-loadnext');
                    });
                });
        },
        setUrlSearch() {
            const url = new URL(this.url, window.location.origin);
            const search =
                (this.$refs.urlSearch as HTMLInputElement)?.value?.trim() ?? '';
            if (search) url.searchParams.set('username', search);
            else url.searchParams.delete('username');

            this.$set(this.lightbox, 'src', url.toString());
        },
    },
    computed: {
        urlSearch() {
            return (
                new URL(this.url, window.location.origin).searchParams.get(
                    'username'
                ) ?? ''
            );
        },
        page() {
            return parseInt(
                new URL(this.url, window.location.origin).searchParams.get(
                    'page'
                ) ?? '1'
            );
        },
        subtitle() {
            return this.lightbox
                .$smc(
                    this.urlSearch ? 'search_subtitle' : 'subtitle',
                    this.toplist.users.length,
                    {
                        startPage: this.startPage,
                        endPage: this.endPage,
                        firstCredits:
                            this.toplist.users[0]?.credits?.toLocaleString() ??
                            '',
                        lastCredits:
                            this.toplist.users[
                                this.toplist.users.length - 1
                            ]?.credits?.toLocaleString() ?? '',
                        totalPages: this.toplist.lastPage.toLocaleString(),
                    }
                )
                .toString();
        },
        usersFiltered() {
            return this.search.trim().length
                ? this.toplist.users.filter(user =>
                      JSON.stringify(Object.values(user))
                          .toLowerCase()
                          .match(this.search.trim().toLowerCase())
                  )
                : this.toplist.users;
        },
        usersSorted() {
            if (this.sort === 'credits' && !this.urlSearch) {
                if (this.sortDir === 'asc') return this.usersFiltered;
                return [...this.usersFiltered].reverse();
            }
            const modifier = this.sortDir === 'desc' ? -1 : 1;
            return [...this.usersFiltered].sort((a, b) => {
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                let f = a[this.sort] ?? '';
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                let s = b[this.sort] ?? '';
                if (this.sort === 'alliance') {
                    f = a.alliance.name ?? '';
                    s = b.alliance.name ?? '';
                }
                return f < s ? -1 * modifier : f > s ? modifier : 0;
            });
        },
    },
    props: {
        toplist: {
            type: Object,
            required: true,
        },
        url: {
            type: String,
            required: true,
        },
        lightbox: {
            type: Object,
            required: true,
        },
        getSetting: {
            type: Function,
            required: true,
        },
        setSetting: {
            type: Function,
            required: true,
        },
    },
    watch: {
        toplist() {
            this.lightbox.finishLoading('toplist-updated-data');
        },
    },
    beforeMount() {
        // Object.entries(this.filter).forEach(([filter, props]) => {
        //     Object.entries(props).forEach(([prop, value]) => {
        //         this.getSetting(`${filter}.${prop}`, value).then(v =>
        //             this.$set(props, prop, v)
        //         );
        //     });
        // });
        this.head = {
            image: { title: '', noSort: true },
            credits: { title: this.lightbox.$sm('credits').toString() },
            name: { title: this.lightbox.$sm('name').toString() },
            alliance: { title: this.lightbox.$sm('alliance').toString() },
        };
    },
    mounted() {
        this.getSetting(`sort`, this.sort).then(sort => (this.sort = sort));
        this.getSetting(`sortDir`, this.sortDir).then(
            dir => (this.sortDir = dir)
        );
        this.startPage = this.page;
        this.endPage = this.page;
        this.lightbox.finishLoading('toplist-mounted');
    },
});
</script>

<style lang="sass" scoped>
.url-search
    font-family: monospace
</style>
