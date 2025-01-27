export default (
    LSSM: Vue,
    icons: {
        icon: string;
        type: 'fab' | 'far' | 'fas';
        vehicleTypes: (number | string)[];
    }[]
): void => {
    const alarmBtn =
        document.querySelector<HTMLAnchorElement>('#mission_alarm_btn');
    const vehicleList = document.querySelector<HTMLTableElement>(
        '#vehicle_show_table_all'
    );
    if (!alarmBtn || !vehicleList) return;

    alarmBtn.insertAdjacentHTML('afterbegin', '&nbsp;');

    icons.reverse().forEach(({ icon, type }) => {
        const iconEl = document.createElement('i');
        iconEl.classList.add(type, `fa-${icon}`, 'hidden');
        alarmBtn.prepend(iconEl);
    });

    const calcIcons = () => {
        const vehicles = vehicleList.querySelectorAll(
            '.vehicle_checkbox:checked'
        );
        Array.from(alarmBtn.querySelectorAll('.svg-inline--fa')).forEach(icon =>
            icon.classList.add('hidden')
        );
        vehicles.forEach(v => {
            const type = v.getAttribute('vehicle_type_id');
            const type_name = `${type}-${v.parentElement?.parentElement?.getAttribute(
                'vehicle_type'
            )}`;
            ([type, type_name].filter(t => !!t) as string[]).forEach(vType =>
                icons
                    .filter(icon =>
                        icon.vehicleTypes.map(t => t.toString()).includes(vType)
                    )
                    .forEach(({ icon }) =>
                        alarmBtn
                            .querySelector(`.svg-inline--fa.fa-${icon}`)
                            ?.classList.remove('hidden')
                    )
            );
        });
    };

    vehicleList.addEventListener('change', calcIcons);

    calcIcons();

    LSSM.$stores.root.hook({
        event: 'aaoClickHandler',
        callback: calcIcons,
    });
    LSSM.$stores.root.hook({
        event: 'vehicleGroupClickHandler',
        callback: calcIcons,
    });
};
