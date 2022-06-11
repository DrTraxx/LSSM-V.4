import type { Building } from 'typings/Building';
import type { ModuleMainFunction } from 'typings/Module';

interface FilterBtn extends HTMLButtonElement {
    reload?(): void;
}

export default <ModuleMainFunction>(async ({ LSSM, MODULE_ID, getSetting }) => {
    let selectGroup = document.querySelector<HTMLDivElement>(
        '#btn-group-building-select'
    );
    if (!selectGroup) return;

    await LSSM.$store.dispatch('api/registerBuildingsUsage', {
        feature: 'buildingListFilter-initial',
    });
    LSSM.$store.commit('useFontAwesome');

    const extraBtnsGroup = document.createElement('div');
    extraBtnsGroup.classList.add('btn-group');
    extraBtnsGroup.style.setProperty('flex-shrink', '0');

    const wrapper = document.createElement('div');
    wrapper.id = LSSM.$store.getters.nodeAttribute(
        `${MODULE_ID}-wrapper`,
        true
    );
    wrapper.style.setProperty('display', 'flex');
    wrapper.style.setProperty('margin-bottom', '1rem');
    wrapper.style.setProperty('justify-content', 'space-between');
    selectGroup.before(wrapper);
    wrapper.append(selectGroup, extraBtnsGroup);

    let breakElement: HTMLElement | null;
    while (
        (breakElement = document.querySelector<HTMLElement>(
            `#${wrapper.id} + br`
        ))
    )
        breakElement.remove();

    const fixedFilters = await getSetting('fixedFilters');

    const fixedWhiteSpace = document.createElement('div');

    if (fixedFilters) {
        LSSM.$store
            .dispatch('addStyles', [
                {
                    selectorText: `#${wrapper.id}`,
                    style: {
                        'position': 'absolute',
                        'width': 'calc(100% - 4 * 15px)',
                        'z-index': 10,
                    },
                },
                {
                    selectorText: `body.bigMap #${wrapper.id}`,
                    style: {
                        width: 'calc(100% - 2 * 5px)',
                    },
                },
            ])
            .then();
        fixedWhiteSpace.style.setProperty('margin-bottom', '1rem');
        wrapper.after(fixedWhiteSpace);
    }

    interface Filter {
        contentType: 'icon' | 'text';
        icon_style: 'fab' | 'far' | 'fas';
        title: string;
        buildings: number[];
        state: 'disabled' | 'enabled';
    }
    const filters = [
        {
            contentType: 'text',
            icon_style: 'fas',
            title: '',
            buildings: [],
            state: 'enabled',
        },
        ...(await getSetting<{ value: Filter[]; enabled: boolean }>('filters'))
            .value,
    ];

    let btns: [FilterBtn, number[]][] = [];

    const applyFilter = (buildings: number[], show: boolean) =>
        buildings.length &&
        document
            .querySelectorAll<HTMLDivElement>(
                buildings
                    .map(
                        b =>
                            `#buildings .building_list_li[building_type_id="${b}"]`
                    )
                    .join(',')
            )
            .forEach(b => {
                b.classList.add('category_selected');
                b.style.setProperty('display', show ? 'block' : 'none');
            });

    const enable = (btn: FilterBtn, buildings: number[], index: number) => {
        btn.classList.replace('btn-danger', 'btn-success');
        if (!index) {
            filters.forEach(
                (filter, index) => index && enable(...btns[index], index)
            );
        } else if (buildings.length) {
            applyFilter(buildings, true);
        }
        filters[index].state = 'enabled';
    };
    const disable = (btn: FilterBtn, buildings: number[], index: number) => {
        btn.classList.replace('btn-success', 'btn-danger');
        if (!index) {
            filters.forEach(
                (filter, index) => index && disable(...btns[index], index)
            );
        } else if (buildings.length) {
            applyFilter(buildings, false);
        }
        filters[index].state = 'disabled';
    };

    const updateSettings = () =>
        LSSM.$store.dispatch('settings/setSetting', {
            moduleId: MODULE_ID,
            settingId: 'filters',
            value: { value: filters.slice(1), enabled: true },
        });

    const smallBuildings = LSSM.$t('small_buildings') as unknown as Record<
        number,
        number
    >;

    let updateBuildingsArrayHookAttached = false;

    const updateFilters = async () => {
        selectGroup = document.querySelector<HTMLDivElement>(
            '#btn-group-building-select'
        );
        if (!selectGroup) return;
        selectGroup.querySelectorAll('a').forEach(a => a.remove());
        btns = [];

        const buildingsByType: Record<number, Building[]> =
            LSSM.$store.getters['api/buildingsByType'];
        Object.entries(smallBuildings).forEach(([big, small]) =>
            document
                .querySelectorAll<HTMLLIElement>(
                    `#buildings .building_list_li[building_type_id="${big}"]`
                )
                .forEach(building => {
                    const id = parseInt(
                        building
                            .querySelector<HTMLUListElement>(
                                'ul[data-building_id]'
                            )
                            ?.getAttribute('data-building_id') ?? '-1'
                    );
                    if (buildingsByType[small]?.find(b => b.id === id)) {
                        building.setAttribute(
                            'building_type_id',
                            small.toString()
                        );
                    }
                })
        );

        filters.forEach(
            ({ contentType, title, icon_style, buildings, state }, index) => {
                const btn: FilterBtn = document.createElement('button');
                btn.classList.add('btn', 'btn-xs', 'btn-success');
                if (contentType === 'text') {
                    if (title) btn.textContent = title;
                    else btn.innerHTML = '&nbsp;';
                } else {
                    const icon = document.createElement('i');
                    icon.classList.add(icon_style, `fa-${title}`, 'fa-fw');
                    btn.append(icon);
                }
                btn.addEventListener('click', () => {
                    if (btn.classList.contains('btn-danger'))
                        enable(btn, buildings, index);
                    else disable(btn, buildings, index);
                    updateSettings();
                    window.buildingsVehicleLoadVisible();
                });
                btn.reload = () => {
                    applyFilter(
                        buildings,
                        btn.classList.contains('btn-success')
                    );
                };
                if (index) {
                    btn.addEventListener('dblclick', () => {
                        btns.forEach(([btnI, buildings], index) => {
                            if (btnI === btn) enable(btnI, buildings, index);
                            else disable(btnI, buildings, index);
                            updateSettings();
                            window.buildingsVehicleLoadVisible();
                        });
                    });
                    if (state === 'disabled') disable(btn, buildings, index);
                    else enable(btn, buildings, index);
                }
                btns.push([btn, buildings]);
                selectGroup?.append(btn);
            }
        );

        const buildingList =
            document.querySelector<HTMLUListElement>('#building_list');
        if (!buildingList) return;

        const buildings: [HTMLLIElement, string][] = [];

        const updateBuildingsArray = () => {
            buildings.splice(
                0,
                buildings.length,
                ...Array.from(
                    buildingList.querySelectorAll<HTMLLIElement>(
                        'li.building_list_li'
                    )
                ).map<[HTMLLIElement, string]>(building => [
                    building,
                    building
                        .querySelector<HTMLAnchorElement>(
                            '.building_list_caption a.map_position_mover'
                        )
                        ?.textContent?.toLowerCase() ?? '',
                ])
            );
        };

        if (!updateBuildingsArrayHookAttached) {
            LSSM.$store
                .dispatch('hook', {
                    event: 'buildingMarkerBulkContentCacheDraw',
                    callback() {
                        updateBuildingsArray();
                        btns.forEach(([btn], index) => index && btn.reload?.());
                    },
                })
                .then();
            updateBuildingsArrayHookAttached = true;
        }

        updateBuildingsArray();

        const searchHideClass = LSSM.$store.getters.nodeAttribute(
            'blf-search-not-matching'
        );
        const reversedListClass = LSSM.$store.getters.nodeAttribute(
            'blf-reversed-buildinglist'
        );

        LSSM.$store
            .dispatch('addStyles', [
                {
                    selectorText: `.${searchHideClass}`,
                    style: {
                        display: 'none !important',
                    },
                },
                {
                    selectorText: `.${reversedListClass}, .${reversedListClass} > li`,
                    style: {
                        transform: 'rotate(180deg)',
                    },
                },
            ])
            .then();

        const sortBtn = document.createElement('button');
        sortBtn.classList.add('btn', 'btn-xs', 'btn-default');
        sortBtn.style.setProperty('margin-top', '-4px');
        const sortIcon = document.createElement('i');
        sortIcon.classList.add('fas', 'fa-sort-alpha-down');

        sortBtn.append(sortIcon);

        sortBtn.addEventListener('click', () => {
            const icon = sortBtn.querySelector('svg');
            if (!icon) return;
            const state = buildingList.classList.toggle(reversedListClass);
            if (state) icon.setAttribute('data-icon', 'arrow-up-a-z');
            else icon.setAttribute('data-icon', 'arrow-down-z-a');
            LSSM.$store
                .dispatch('settings/setSetting', {
                    moduleId: MODULE_ID,
                    settingId: 'sortDesc',
                    value: state,
                })
                .then();
        });

        if (await getSetting('sortDesc')) sortBtn.click();

        let searchTimeout = null as number | null;

        const searchBtn = document.createElement('button');
        searchBtn.classList.add('btn', 'btn-xs', 'btn-default');
        searchBtn.style.setProperty('margin-top', '-4px');
        const searchIcon = document.createElement('i');
        searchIcon.classList.add('fas', 'fa-search');

        searchBtn.append(searchIcon);

        const search = document.createElement('input');
        search.type = 'search';
        search.classList.add('search_input_field', 'hidden');
        search.style.setProperty('position', 'absolute');
        search.style.setProperty('margin-top', '-4px');
        search.style.setProperty('right', '22px');
        search.style.setProperty('height', '20px');

        searchBtn.addEventListener('click', e => {
            e.stopPropagation();
            search.classList.toggle('hidden');
            search.focus();
        });

        document.addEventListener('click', e => {
            if (e.target !== search) search.classList.add('hidden');
        });

        search.addEventListener('keyup', () => {
            if (searchTimeout) window.clearTimeout(searchTimeout);
            searchTimeout = window.setTimeout(
                () =>
                    buildings.forEach(([building, caption]) =>
                        building.classList[
                            caption.match(
                                LSSM.$utils.escapeRegex(
                                    search.value.trim().toLowerCase()
                                )
                            )
                                ? 'remove'
                                : 'add'
                        ](searchHideClass)
                    ),
                100
            );
        });

        if (fixedFilters) {
            fixedWhiteSpace.style.setProperty(
                'height',
                getComputedStyle(wrapper).height
            );
        } else {
            selectGroup.style.setProperty('width', '100%');
        }
        extraBtnsGroup.append(searchBtn, search, sortBtn);
        window.buildingsVehicleLoadVisible();
    };

    const observer = new MutationObserver(updateFilters);

    const buildingsElement =
        document.querySelector<HTMLDivElement>('#buildings');
    if (buildingsElement)
        observer.observe(buildingsElement, { childList: true });

    await updateFilters();
});
