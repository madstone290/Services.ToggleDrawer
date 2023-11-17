namespace Services {

    interface MenuItem {
        icon: string;
        name: string;
        url: string;
        subList: MenuItem[];
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
        renderCustomMiniHeader: (box: HTMLElement) => HTMLElement;
        renderCustomAnchorContent: (anchor: HTMLElement, item: MenuItem, level: number) => HTMLElement;
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
        const CLS_MENU_ITEM_SUB_LIST = 'td-menu-item-sub-list';
        const CLS_MENU_ITEM_ANCHOR = 'td-menu-item-anchor';
        const CLS_ARROW_ICON = 'td-arrow-icon';

        const CLS_LEVEL_0 = 'td-level-0';

        const CLS_SELECTED = 'td-selected';
        const CLS_MINI = 'td-mini';
        const CLS_HIDE_WHEN_MINI = 'td-hide-when-mini';


        let _options: ToggleDrawerOptions;
        let _data: ToggleDrawerData;

        let _rootEl: HTMLElement;
        let _headerBoxEl: HTMLElement;
        let _rootListEl: HTMLElement;
        let _selectedItemEl: HTMLElement;

        let _isMini: boolean = false;

        function create(container: HTMLElement) {
            _rootEl = document.createElement('div');
            _rootEl.classList.add(CLS_ROOT);

            container.appendChild(_rootEl);
        }

        function setOptions(options: ToggleDrawerOptions) {
            _options = options;
        }

        function setData(data: ToggleDrawerData) {
            _data = data;
        }

        function render() {
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

            _renderHeader();

            if (_options.onModeChanged)
                _options.onModeChanged(_isMini);
        }

        function _renderRootList() {
            const rootListEl = document.createElement('div');
            rootListEl.classList.add(`${CLS_ROOT_LIST}`);
            return rootListEl;
        }

        function _adjustContainerElPosition(item: MenuItem, itemEl: HTMLElement, childrenContainerEl: HTMLElement) {
            if (!item.subList)
                return;
            const containerElHeight = childrenContainerEl.offsetHeight;
            const initialContainerElTop = itemEl.offsetTop - _rootEl.scrollTop;
            const containerMaxHeight = _rootEl.clientHeight;

            let adjustedContainerElTop = initialContainerElTop;
            if (initialContainerElTop + containerElHeight > containerMaxHeight) {
                adjustedContainerElTop = containerMaxHeight - containerElHeight;
                if (adjustedContainerElTop < 0) {
                    adjustedContainerElTop = 0;
                }
            }
            // 서브리스트가 화면 하단을 넘어가지 않도록 top을 조정한다.
            childrenContainerEl.style.top = adjustedContainerElTop + 'px';
            // 서브리스트가 아이템우측에 바로 위치하도록 clientWidth를 적용한다.
            childrenContainerEl.style.left = _rootEl.clientWidth + 'px';
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
            if (!_headerBoxEl) {
                _headerBoxEl = document.createElement('div');
                _headerBoxEl.classList.add(CLS_HEADER_BOX);
                _rootEl.appendChild(_headerBoxEl);
            }

            _headerBoxEl.replaceChildren();
            if (_isMini) {
                const _ = _options.renderCustomMiniHeader
                    ? _options.renderCustomMiniHeader(_headerBoxEl)
                    : _renderDefaultMiniHeader(_headerBoxEl);
            } else {
                const _ = _options.renderCustomHeader
                    ? _options.renderCustomHeader(_headerBoxEl)
                    : _renderDefaultHeader(_headerBoxEl);
            }


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

            _renderMenuItemContent(menuItemBoxEl, item, level);

            if (item.subList && item.subList.length > 0) {
                const subListEl = document.createElement('div');
                subListEl.className = `${CLS_MENU_ITEM_SUB_LIST}`;
                for (const child of item.subList) {
                    subListEl.appendChild(_renderMenuItemBox(child, level + 1));
                }
                menuItemBoxEl.appendChild(subListEl);

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
                        _adjustContainerElPosition(item, menuItemBoxEl, subListEl);
                    }
                });
            }
            _rootListEl.appendChild(menuItemBoxEl);
            return menuItemBoxEl;
        }


        function _renderMenuItemContent(box: HTMLElement, item: MenuItem, level: number) {
            const contentContainerEl = document.createElement('div');
            contentContainerEl.classList.add(CLS_MENU_ITEM_CONTENT);
            contentContainerEl.style.paddingLeft = `${(level + 1) * 20}px`;

            const anchor = document.createElement('a');
            anchor.classList.add(CLS_MENU_ITEM_ANCHOR);
            if (item.url)
                anchor.href = item.url;
            contentContainerEl.appendChild(anchor);

            const contentEl = _options.renderCustomAnchorContent
                ? _options.renderCustomAnchorContent(anchor, item, level)
                : _renderDefaultAnchorContent(anchor, item, level);

            if (item.subList && item.subList.length > 0) {
                const arrowEl = document.createElement('i');
                arrowEl.classList.add('fa', 'fa-angle-left', CLS_ARROW_ICON);
                contentContainerEl.appendChild(arrowEl);
            }

            box.appendChild(contentContainerEl);
            return contentContainerEl;
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

        function _renderDefaultMiniHeader(box: HTMLElement) {
            const header = document.createElement('div');
            header.classList.add(CLS_HEADER);
            header.innerText = 'H-C';
            box.appendChild(header);
            return header;
        }

        function _renderDefaultAnchorContent(anchor: HTMLElement, item: MenuItem, level: number) {
            const iconEl = document.createElement('i');
            if (item.icon) {
                iconEl.className = item.icon;
                iconEl.style.marginRight = '5px';
            }

            const nameEl = document.createElement('span');
            nameEl.classList.add(CLS_HIDE_WHEN_MINI);
            nameEl.innerText = item.name;

            anchor.appendChild(iconEl);
            anchor.appendChild(nameEl);
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