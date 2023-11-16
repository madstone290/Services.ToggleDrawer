namespace Services {

    interface MenuItem {
        name: string;
        icon: string;
        url: string;
        children: MenuItem[];
    }

    interface ToggleDrawerData {
        menuItems: MenuItem[];
    }

    interface ToggleDrawerOptions {
        /**
         * whether not to allow multiple selection. Default is true.
         */
        singleSelect: boolean;

        enableToggleBtn: boolean;

        modeChangedCallback(isMini: boolean): void;
    }

    export const ToggleDrawer = () => {
        const CLS_ROOT = 'td-root';
        const CLS_ROOT_LIST = 'td-root-list';
        const CLS_TOGGLE_BTN_BOX = 'td-toggle-btn-box';
        const CLS_TOGGLE_BTN = 'td-toggle-btn';

        const CLS_MENU_ITEM = 'td-menu-item';
        const CLS_MENU_ITEM_CONTENT = 'td-menu-item-content';
        const CLS_MENU_ITEM_CHILDREN = 'td-menu-item-children';
        const CLS_LEVEL_0 = 'td-level-0';

        const CLS_SELECTED = 'td-selected';
        const CLS_MINI = 'td-mini';




        let _options: ToggleDrawerOptions;
        let _data: ToggleDrawerData;

        let _rootEl: HTMLElement;
        let _rootListEl: HTMLElement;
        let _selectedItemEl: HTMLElement;

        let _isMini: boolean = false;

        function create(container: HTMLElement) {
            container.innerHTML = `
                <div class="${CLS_ROOT}">
                </div>
            `;
            _rootEl = container.querySelector(`.${CLS_ROOT}`) as HTMLElement;
            _rootListEl = container.querySelector(`.${CLS_ROOT} .${CLS_ROOT_LIST}`);
        }

        function setOptions(options: ToggleDrawerOptions) {
            _options = options;
        }

        function setData(data: ToggleDrawerData) {
            _data = data;
        }

        function render() {
            _rootEl.replaceChildren();
            if (_options.enableToggleBtn) {
                _rootEl.appendChild(_renderToggleBtnBox());
            }

            _rootListEl = _renderRootList();
            const menuItems = _renderMenuItems();
            _rootListEl.replaceChildren(...menuItems);

            _rootEl.appendChild(_rootListEl);
        }

        function _renderToggleBtnBox() {
            const toggleBtnBoxEl = document.createElement('div');
            toggleBtnBoxEl.classList.add(CLS_TOGGLE_BTN_BOX);

            const toggleBtnEl = document.createElement('div');
            toggleBtnEl.classList.add(CLS_TOGGLE_BTN);
            toggleBtnEl.innerText = 'Toggle';
            toggleBtnEl.addEventListener('click', () => {
                toggleMini();
            });

            toggleBtnBoxEl.appendChild(toggleBtnEl);
            return toggleBtnBoxEl;
        }

        function toggleMini() {
            _rootEl.classList.toggle(CLS_MINI);
            _isMini = !_isMini;

            // todo reset selected items
            if(_selectedItemEl){
                _selectedItemEl.classList.remove(CLS_SELECTED);
                const selectedRootItem = _getRootListItemEl(_selectedItemEl);
                if (selectedRootItem) {
                    selectedRootItem.classList.remove(CLS_SELECTED);
                }
            }

            if (_options.modeChangedCallback)
                _options.modeChangedCallback(_isMini);
        }

        function _renderRootList() {
            const rootListEl = document.createElement('ul');
            rootListEl.classList.add(`${CLS_ROOT_LIST}`);
            return rootListEl;
        }

        function _renderMenuItems() {
            return _data.menuItems.map(item => {
                return _renderMenuItem(item);
            })
        }

        function _renderMenuItem(item: MenuItem, level: number = 0) {
            const itemEl = document.createElement('li');
            const clsLevel = 'td-level-' + level;
            itemEl.className = `${CLS_MENU_ITEM} ${clsLevel}`;
            itemEl.innerHTML = `
            <div class="${CLS_MENU_ITEM_CONTENT}">
            <a>
            <span>${item.icon || item.name[0]}</span><span>${item.name}</span>
            </a>
            </div>`;

            if (item.children && item.children.length > 0) {
                const containerEl = document.createElement('ul');
                containerEl.className = `${CLS_MENU_ITEM_CHILDREN}`;
                for (const child of item.children) {
                    containerEl.appendChild(_renderMenuItem(child, level + 1));
                }
                itemEl.appendChild(containerEl);

                itemEl.addEventListener('click', (event) => {
                    event.stopPropagation();
                    if (_options.singleSelect) {
                        const selectedRootItemEl = _getRootListItemEl(_selectedItemEl);
                        if (selectedRootItemEl) {
                            const currentRootItemEl = _getRootListItemEl(itemEl);
                            if (selectedRootItemEl !== currentRootItemEl) {
                                selectedRootItemEl.classList.remove(CLS_SELECTED);
                            }
                        }
                    }
                    if (_isMini) {
                        containerEl.style.top = itemEl.offsetTop - _rootEl.scrollTop + 'px';
                    }

                    itemEl.classList.toggle(CLS_SELECTED);
                    _selectedItemEl = itemEl;
                });
            }

            return itemEl;
        }

        function _getRootListItemEl(itemEl: HTMLElement) {
            if (itemEl == null)
                return null;
            if (itemEl.classList.contains(CLS_LEVEL_0)) {
                return itemEl;
            }
            let parentEl = itemEl.parentElement;
            while (parentEl) {
                if (parentEl.classList.contains(CLS_LEVEL_0)) {
                    return parentEl;
                }
                parentEl = parentEl.parentElement;
            }
            return null;
        }

        return {
            create,
            setOptions,
            setData,
            render
        }
    };

}