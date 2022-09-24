import type { Empty, Scope } from 'typings/modules/Hotkeys';

export default <Scope<Empty, ['chat', 'map', 'missionlist'], [], true>>{
    chat: <Scope<{ chatInput: HTMLInputElement | null }, [], ['focus']>>{
        validatorFunction() {
            this.chatInput = document.querySelector<HTMLInputElement>(
                '#alliance_chat_message'
            );
            return !!this.chatInput;
        },
        focus() {
            this.chatInput?.focus();
        },
    },
    map: <Scope<Empty, ['search', 'zoom', 'move']>>{
        validatorFunction() {
            return !!document.querySelector<HTMLDivElement>('#map');
        },
        search: <Scope<{ mapSearch: HTMLInputElement | null }, [], ['focus']>>{
            validatorFunction() {
                this.mapSearch =
                    document.querySelector<HTMLInputElement>(
                        '#map_adress_search'
                    );
                return !!this.mapSearch;
            },
            focus() {
                this.mapSearch?.focus();
            },
        },
        zoom: <Scope<{ leaflet: typeof window.map }, [], ['in', 'out']>>{
            validatorFunction() {
                this.leaflet = window.map;
                return !!this.leaflet;
            },
            in() {
                this.leaflet?.zoomIn();
            },
            out() {
                this.leaflet?.zoomOut();
            },
        },
        move: <
            Scope<
                { leaflet: typeof window.map },
                [],
                ['up', 'down', 'left', 'right']
            >
        >{
            validatorFunction() {
                this.leaflet = window.map;
                return !!this.leaflet;
            },
            up() {
                this.leaflet?.panTo([
                    this.leaflet?.getCenter().lat + 0.005,
                    this.leaflet?.getCenter().lng,
                ]);
            },
            down() {
                this.leaflet?.panTo([
                    this.leaflet?.getCenter().lat - 0.005,
                    this.leaflet?.getCenter().lng,
                ]);
            },
            left() {
                this.leaflet?.panTo([
                    this.leaflet?.getCenter().lat,
                    this.leaflet?.getCenter().lng - 0.005,
                ]);
            },
            right() {
                this.leaflet?.panTo([
                    this.leaflet?.getCenter().lat,
                    this.leaflet?.getCenter().lng + 0.005,
                ]);
            },
        },
    },
    missionlist: <Scope<Empty, ['search', 'eclSort']>>{
        validatorFunction() {
            return !!document.querySelector<HTMLDivElement>('#missions');
        },
        search: <
            Scope<{ missionlistSearch: HTMLInputElement | null }, [], ['focus']>
        >{
            validatorFunction() {
                this.missionlistSearch =
                    document.querySelector<HTMLInputElement>(
                        '#search_input_field_missions'
                    );
                return !!this.missionlistSearch;
            },
            focus() {
                this.missionlistSearch?.focus();
            },
        },
        eclSort: <
            Scope<
                {
                    eclSortBtn: HTMLButtonElement | null;
                    eclSortList: HTMLLinkElement | null;
                },
                [],
                ['open']
            >
        >{
            validatorFunction() {
                this.eclSortBtn = document.querySelector<HTMLButtonElement>(
                    '#lssmv4-extendedCallList_missionlist-sorting_selection-list-btn'
                );
                this.eclSortList = document.querySelector(
                    '#lssmv4-extendedCallList-missionlist-sorting-selection-list > :first-child > a'
                );
                return !!this.eclSortBtn;
            },
            open() {
                this.eclSortBtn?.click();
                this.eclSortList?.focus();
            },
        },
    },
    lssm: <Scope<Empty, ['menu']>>{
        validatorFunction() {
            return !!window[PREFIX];
        },
        menu: <
            Scope<
                {
                    lssmMenuTrigger: HTMLAnchorElement | null;
                    lssmMenuIsOpened(): boolean;
                },
                [],
                ['toggle']
            >
        >{
            validatorFunction() {
                this.lssmMenuTrigger =
                    document.querySelector<HTMLAnchorElement>(
                        '#lssmv4-indicator_menu'
                    );

                this.lssmMenuIsOpened = () =>
                    this.lssmMenuTrigger?.getAttribute('aria-expanded') ===
                    'true';

                return !!this.lssmMenuTrigger;
            },
            toggle() {
                if (this.lssmMenuTrigger) {
                    this.lssmMenuTrigger.click();
                    if (this.lssmMenuIsOpened()) {
                        this.lssmMenuTrigger.nextElementSibling
                            ?.querySelector('a')
                            ?.focus();
                    }
                }
            },
        },
    },
};
