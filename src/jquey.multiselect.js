'use strict';
(function ($) {
    function MultiSelect($element, options) {
        this.options = $.extend({}, this._defaults, options, $element.data());
        this._buildMultiSelect(this._generateUniqueId(), $element);
    }

    MultiSelect.prototype = {
        constructor: MultiSelect,

        getSelectedValues: function () {
            const selectedValues = [];
            this.$dropdown.find('.multiselect-tree-node:not([data-parent]):checked').each(function () {
                selectedValues.push(this.value);
            });

            return selectedValues;
        },

        setSelectedValues(selectedValues) {
            const selectedTexts = [];
            selectedValues.forEach((item) => {
                const $checkbox = this.$dropdown.find('.multiselect-tree-node[value="' + item + '"]');
                selectedTexts.push($checkbox.parent().text());
                $checkbox.prop('checked', true);
                this._toggleChildren($checkbox, true);
                this._toggleParent($checkbox, true);
                this._checkSelectAll();
            });

            this._updateButtonText();
        },

        /* Private Functions */
        _defaults: {
            showFilter: false,
            filterPlaceHolder: 'Search...',
            filterNoData: 'No results match',
            showSelectAll: false,
            selectAllText: 'Select All',
            noneSelectedText: 'None Selected',
            maxHeight: 'auto',
            numberDisplayed: 0,
            nSelectedText: '# Selected',
            allSelectedText: 'All (#)',
            tree: {},
            selectedValues: [],
            onChange: undefined,
            onSelectAll: undefined
        },

        _generateUniqueId: function () {
            return Math.random().toString(36).substring(2);
        },

        _buildMultiSelect: function (id, $element) {
            $('body').append(this._buildDropdown(id));
            this.$dropdown = $('#' + id);
            this._bindDropdownEvents();
            if (this.options.maxHeight && !isNaN(this.options.maxHeight)) {
                this.$dropdown.find('.multiselect-subtree.root').css({
                    'max-height': this.options.maxHeight,
                    'overflow-y': 'auto'
                });
            }

            $element.addClass('multiselect').html(this._buildButton());
            this.$button = $element
                .find('.multiselect-button')
                .off()
                .click((e) => {
                    e.stopPropagation();
                    $('.multiselect-dropdown').each((_, item) => {
                        const $this = $(item);
                        if ($this.is(this.$dropdown)) {
                            if (this.$dropdown.is(':visible')) {
                                this.$dropdown.slideUp();
                            } else {
                                this._calcPosition();
                                this.$dropdown.slideDown();
                            }
                        } else {
                            $this.is(':visible') && $this.slideUp();
                        }
                    });
                });
            const selectedValues = this.options.selectedValues || this.getSelectedValues();
            this.setSelectedValues(selectedValues);
        },

        _buildDropdown: function (id) {
            const treeHtml = this._buildTree(this.options.tree, true);

            return ['<div class="multiselect multiselect-dropdown" style="display:none" id="', id, '">', this._buildFilter(), this._buildSelectAll(), treeHtml, '</div>'].join('');
        },

        _buildButton: function () {
            return '<button type="button" class="multiselect-button"></button>';
        },

        _buildFilter: function () {
            if (this.options.showFilter) {
                return ['<div class="multiselect-filter">', '<input type="text" class="multiselect-search" autocomplete="off" placeholder="', this.options.filterPlaceHolder, '"/>', '<i class="icon-search"></i>', '<div class="multiselect-search-not-found"></div>', '</div>'].join('');
            }

            return '';
        },

        _buildSelectAll: function () {
            if (this.options.showSelectAll) {
                const html = ['<div class="multiselect-all">'];
                if (this.hasGroups) {
                    html.push('<i class="tree-icon right-down-caret"></i>');
                } else {
                    html.push('<i class="tree-icon no-caret"></i>');
                }

                html.push('<label><input type="checkbox" class="select-all"/>', this.options.selectAllText, '</label>', '</div>');
                return html.join('');
            }

            return '';
        },

        _buildTree: function (dataTree, isRoot = false) {
            let hasGroups = false;
            const html = ['<ul class="multiselect-subtree', isRoot ? ' root' : '', '">'];
            dataTree.forEach((item) => {
                const hasChildren = item.items && item.items.length > 0;
                if (hasChildren && !hasGroups) {
                    hasGroups = true;
                }

                html.push('<li>');
                if (item.items && item.items.length) {
                    html.push('<i class="tree-icon right-down-caret"></i>');
                } else {
                    html.push('<i class="tree-icon no-caret"></i>');
                }
                html.push('<label><input type="checkbox" class="multiselect-tree-node" value="', item.value, '"', item.checked ? ' checked' : '', hasChildren ? ' data-parent="1"' : '', '/>', item.text, '</label>');
                hasChildren && html.push(this._buildTree(item.items));
                html.push('</li>');
            });
            html.push('</ul>');
            this.hasGroups = hasGroups;

            return html.join('');
        },

        _bindDropdownEvents: function () {
            this.$dropdown.off().click(function (e) {
                e.stopPropagation();
            });
            this._bindSearchEvent();
            this._bindSelectAllEvent();
            this.$dropdown
                .find('.multiselect-subtree .tree-icon:not(.no-caret)')
                .off()
                .click(function () {
                    const $ins = $(this),
                        $subtree = $ins.siblings('.multiselect-subtree');
                    if ($subtree.is(':visible')) {
                        $ins.removeClass('right-down-caret').addClass('right-caret');
                        $subtree.slideUp();
                    } else {
                        $ins.removeClass('right-caret').addClass('right-down-caret');
                        $subtree.slideDown();
                    }
                });
            this.$dropdown
                .find('.multiselect-tree-node')
                .off()
                .change((e) => {
                    const $checkbox = $(e.target),
                        checked = $checkbox.is(':checked');
                    this._toggleChildren($checkbox, checked);
                    this._toggleParent($checkbox, checked);
                    this._checkSelectAll();
                    this._updateButtonText();

                    this.options.onChange && this.options.onChange(e);
                });
            $(document).click(() => {
                this.$dropdown.is(':visible') && this.$dropdown.slideUp();
            });
        },

        _bindSearchEvent: function () {
            this.options.showFilter &&
                this.$dropdown
                    .find('.multiselect-search')
                    .off()
                    .bind('input', (e) => {
                        const $checkboxes = this.$dropdown.find('.multiselect-tree-node');
                        const text = $.trim($(e.target).val());
                        if (text.length) {
                            const textLowerCase = text.toLowerCase();
                            $checkboxes.each(function () {
                                const $label = $(this).parent();
                                const $li = $label.parent();
                                $li.toggle($label.text().toLowerCase().indexOf(textLowerCase) > -1);
                            });
                            if ($checkboxes.filter(':visible').length) {
                                this.$dropdown.find('.multiselect-search-not-found').hide();
                                this.$dropdown.find('.multiselect-all').show();
                            } else {
                                this.$dropdown.find('.multiselect-search-not-found').text(`${this.options.filterNoData} '${text}'`).show();
                                this.$dropdown.find('.multiselect-all').hide();
                            }
                        } else {
                            $checkboxes.closest('li').show();
                        }
                    });
        },

        _bindSelectAllEvent: function () {
            if (this.options.showSelectAll) {
                this.hasGroups &&
                    this.$dropdown
                        .find('.multiselect-all .tree-icon:not(.no-caret)')
                        .off()
                        .click((e) => {
                            const $this = $(e.target);
                            const isCollapsed = $this.hasClass('right-caret');
                            this.$dropdown
                                .find('.multiselect-subtree.root')
                                .children('li')
                                .each(function () {
                                    const $li = $(this);
                                    if (isCollapsed) {
                                        $li.children('.multiselect-subtree').slideDown();
                                        $li.children('.tree-icon:not(.no-caret)').removeClass('right-caret').addClass('right-down-caret');
                                    } else {
                                        $li.children('.multiselect-subtree').slideUp();
                                        $li.children('.tree-icon:not(.no-caret)').removeClass('right-down-caret').addClass('right-caret');
                                    }
                                });
                            isCollapsed ? $this.removeClass('right-caret').addClass('right-down-caret') : $this.removeClass('right-down-caret').addClass('right-caret');
                        });
                this.$dropdown
                    .find('.multiselect-all .select-all')
                    .off()
                    .change((e) => {
                        const checked = $(e.target).is(':checked');
                        const $allTreeNodes = this.$dropdown.find('.multiselect-tree-node');
                        $allTreeNodes.prop({ indeterminate: false, checked: checked });
                        if (checked) {
                            const $checkedTreeNodes = $allTreeNodes.filter(':not([data-parent]):checked');
                            const numChecked = $checkedTreeNodes.length;
                            this.$button.text(this.options.allSelectedText.replace('#', numChecked));
                        } else {
                            this.$button.text(this.options.noneSelectedText);
                        }

                        this.options.onSelectAll && this.options.onSelectAll(e);
                    });
            }
        },

        _toggleChildren: function ($checkbox, checked) {
            $checkbox.parent().next('.multiselect-subtree').find('.multiselect-tree-node').prop({
                indeterminate: false,
                checked: checked
            });
        },

        _toggleParent: function ($checkbox, checked) {
            if (!$checkbox.length) {
                return;
            }

            const $subtree = $checkbox.closest('.multiselect-subtree');
            if ($subtree.hasClass('root')) {
                return;
            }

            const $allChildren = $subtree.children('li').find('input:checkbox'),
                $uncheckedChildren = $allChildren.filter(':not(:checked)');

            let indeterminateChildren = false;
            $uncheckedChildren.each(function () {
                if (this.indeterminate) {
                    indeterminateChildren = true;
                }
            });

            const allSelectedChildren = $uncheckedChildren.length === 0,
                someSelectedChildren = !allSelectedChildren && $uncheckedChildren.length !== $allChildren.length;
            $subtree
                .prev()
                .children('.multiselect-tree-node')
                .prop({
                    indeterminate: indeterminateChildren || someSelectedChildren,
                    checked: allSelectedChildren
                });

            this._toggleParent($subtree.parent(), checked);
        },

        _checkSelectAll: function () {
            if (!this.options.showSelectAll) {
                return;
            }

            const $allChildren = this.$dropdown.find('.multiselect-tree-node'),
                $uncheckedChildren = $allChildren.filter(':not(:checked)');
            const allSelectedChildren = $uncheckedChildren.length === 0,
                someSelectedChildren = !allSelectedChildren && $uncheckedChildren.length !== $allChildren.length;
            this.$dropdown.find('.select-all').prop({
                indeterminate: someSelectedChildren,
                checked: allSelectedChildren
            });
        },

        _updateButtonText: function () {
            const $allTreeNodes = this.$dropdown.find('.multiselect-tree-node:not([data-parent])'),
                $checkedTreeNodes = $allTreeNodes.filter(':checked'),
                numChecked = $checkedTreeNodes.length;
            if (numChecked === 0) {
                this.$button.text(this.options.noneSelectedText);
            } else if (numChecked === $allTreeNodes.length) {
                this.$button.text(this.options.allSelectedText.replace('#', numChecked));
            } else {
                const selectedTexts = [];
                $checkedTreeNodes.each(function () {
                    selectedTexts.push($(this).parent().text());
                });

                if (!this.options.numberDisplayed || this.options.numberDisplayed >= selectedTexts.length) {
                    this.$button.text(selectedTexts.join(', '));
                } else {
                    this.$button.text(this.options.nSelectedText.replace('#', selectedTexts.length));
                }
            }
        },

        _calcPosition: function () {
            const offset = this.$button.position();
            this.$dropdown.css({
                position: 'absolute',
                top: offset.top + this.$button.outerHeight(),
                left: offset.left
            });
        }
    };

    $.fn.multiselect = function (option, parameter) {
        let data;
        if (typeof option === 'string') {
            data = this.data('multiselect');
            return data[option](parameter);
        }

        return this.each(function () {
            const $this = $(this);
            data = $this.data('multiselect');

            if (!data) {
                const options = typeof option === 'object' && option;
                data = new MultiSelect($this, options);
                $this.data('multiselect', data);
            }
        });
    };

    $.fn.multiselect.Constructor = MultiSelect;
})(window.jQuery);
