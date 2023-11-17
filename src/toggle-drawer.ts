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
        showToggleBtn: boolean;

        onModeChanged(isMini: boolean): void;

        renderCustomToggleBtn: (box: HTMLElement) => HTMLElement;
        renderCustomHeader: (box: HTMLElement) => HTMLElement;
        renderMenuItem: (box: HTMLElement, item: MenuItem, level: number) => HTMLElement;
    }

    export const ToggleDrawer = () => {
        const CLS_ROOT = 'td-root';
        const CLS_ROOT_LIST = 'td-root-list';
        const CLS_TOGGLE_BTN_BOX = 'td-toggle-btn-box';
        const CLS_TOGGLE_BTN = 'td-toggle-btn';
        const CLS_HEADER_BOX = 'td-header-box';
        const CLS_HEADER = 'td-header';


        const CLS_MENU_ITEM_BOX = 'td-menu-item-box';
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
        let _itemContentHeight: number = 0;

        function create(container: HTMLElement) {
            container.innerHTML = `
                <div class="${CLS_ROOT}">
                </div>
            `;
            _rootEl = container.querySelector(`.${CLS_ROOT}`) as HTMLElement;
            _rootListEl = container.querySelector(`.${CLS_ROOT} .${CLS_ROOT_LIST}`);

            _itemContentHeight = document.documentElement.style.getPropertyValue('--item-content-height') as any as number;

            // Get the computed style of the element
            const style = getComputedStyle(_rootEl);

            const heightText = style.getPropertyValue('--item-content-height');
            _itemContentHeight = parseInt(heightText);
        }

        function setOptions(options: ToggleDrawerOptions) {
            _options = options;
        }

        function setData(data: ToggleDrawerData) {
            _data = data;
        }

        function render() {
            _rootEl.replaceChildren();

            if (_options.showToggleBtn) {
                _renderToggleBtn();
            }

            _renderHeader();
            _renderMenuItemList();
        }

        function toggleMini() {
            _rootEl.classList.toggle(CLS_MINI);
            _isMini = !_isMini;

            // todo reset selected items
            if (_selectedItemEl) {
                _selectedItemEl.classList.remove(CLS_SELECTED);
                const selectedRootItem = _getRootListItemEl(_selectedItemEl);
                if (selectedRootItem) {
                    selectedRootItem.classList.remove(CLS_SELECTED);
                }
            }

            if (_options.onModeChanged)
                _options.onModeChanged(_isMini);
        }

        function _renderRootList() {
            const rootListEl = document.createElement('div');
            rootListEl.classList.add(`${CLS_ROOT_LIST}`);
            return rootListEl;
        }

        function _adjustContainerElTop(item: MenuItem, itemEl: HTMLElement, childrenContainerEl: HTMLElement) {
            if (item.children && 0 < item.children.length) {
                const containerElHeight = item.children.length * _itemContentHeight;
                const initialContainerElTop = itemEl.offsetTop - _rootEl.scrollTop;
                const containerMaxHeight = _rootEl.clientHeight;

                let adjustedContainerElTop = initialContainerElTop;
                if (initialContainerElTop + containerElHeight > containerMaxHeight) {
                    adjustedContainerElTop = containerMaxHeight - containerElHeight;
                    if (adjustedContainerElTop < 0) {
                        adjustedContainerElTop = 0;
                    }
                }
                childrenContainerEl.style.top = adjustedContainerElTop + 'px';
            }
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

        /* render functions start */

        function _renderToggleBtn() {
            const toggleBtnBoxEl = document.createElement('div');
            toggleBtnBoxEl.classList.add(CLS_TOGGLE_BTN_BOX);

            const btnEl = _options.renderCustomToggleBtn
                ? _options.renderCustomToggleBtn(toggleBtnBoxEl)
                : _renderDefaultToggleBtn(toggleBtnBoxEl);

            btnEl.addEventListener('click', () => {
                toggleMini();
            });
            _rootEl.appendChild(toggleBtnBoxEl);
        }

        function _renderHeader() {
            const headerBoxEl = document.createElement('div');
            headerBoxEl.classList.add(CLS_HEADER_BOX);

            const _ = _options.renderCustomHeader
                ? _options.renderCustomHeader(headerBoxEl)
                : _renderDefaultHeader(headerBoxEl);

            _rootEl.appendChild(headerBoxEl);
        }

        function _renderMenuItemList() {
            _rootListEl = _renderRootList();

            _data.menuItems.map(item => {
                const itemBox = _renderMenuItemBox(item, 0);
                _rootListEl.appendChild(itemBox);
            });

            _rootEl.appendChild(_rootListEl);
        }

        function _renderMenuItemBox(item: MenuItem, level: number) {
            const menuItemBoxEl = document.createElement('div');
            const clsLevel = 'td-level-' + level;
            menuItemBoxEl.classList.add(CLS_MENU_ITEM_BOX, clsLevel);

            const _ = _options.renderMenuItem
                ? _options.renderMenuItem(menuItemBoxEl, item, level)
                : _renderDefaultMenuItem(menuItemBoxEl, item, level);

            if (item.children && item.children.length > 0) {
                const childrenEl = document.createElement('div');
                childrenEl.className = `${CLS_MENU_ITEM_CHILDREN}`;
                for (const child of item.children) {
                    childrenEl.appendChild(_renderMenuItemBox(child, level + 1));
                }
                menuItemBoxEl.appendChild(childrenEl);

                menuItemBoxEl.addEventListener('click', (event) => {
                    event.stopPropagation();
                    if (_options.singleSelect) {
                        // check if item has the same root
                        const selectedRootItemEl = _getRootListItemEl(_selectedItemEl);
                        if (selectedRootItemEl) {
                            const currentRootItemEl = _getRootListItemEl(menuItemBoxEl);
                            if (selectedRootItemEl !== currentRootItemEl) {
                                selectedRootItemEl.classList.remove(CLS_SELECTED);
                            }
                        }
                    }
                    menuItemBoxEl.classList.toggle(CLS_SELECTED);
                    _selectedItemEl = menuItemBoxEl;
                });

                menuItemBoxEl.addEventListener('mouseenter', (event) => {
                    if (_isMini) {
                        _adjustContainerElTop(item, menuItemBoxEl, childrenEl);
                    }
                });
            }
            _rootListEl.appendChild(menuItemBoxEl);
            return menuItemBoxEl;
        }

        /* render functions end */

        /* default render functions  start */

        function _renderDefaultToggleBtn(box: HTMLElement) {
            const toggleBtnEl = document.createElement('button');
            toggleBtnEl.classList.add(CLS_TOGGLE_BTN);
            toggleBtnEl.classList.add('fa', 'fa-bars');
            box.appendChild(toggleBtnEl);
            return toggleBtnEl;
        }

        function _renderDefaultHeader(box: HTMLElement) {
            const header = document.createElement('div');
            header.classList.add(CLS_HEADER);
            header.innerText = 'Header Content';
            box.appendChild(header);
            return header;
        }

        function _renderDefaultMenuItem(box: HTMLElement, item: MenuItem, level: number) {
            const menuItemEl = document.createElement('div');
            menuItemEl.classList.add(CLS_MENU_ITEM_CONTENT);
            menuItemEl.innerHTML = `
                <a>
                <span>${item.icon || item.name[0]}</span><span>${item.name}</span>
                </a>
            `;
            menuItemEl.style.paddingLeft = `${(level + 1)  * 20}px`;

            box.appendChild(menuItemEl);
            return menuItemEl;
        }



        /* default renderers  end */



        return {
            create,
            setOptions,
            setData,
            render,
            toggleMini,
        }
    };

}