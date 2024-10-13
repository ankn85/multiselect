'use strict';
class TreePicker {
    constructor(element, options = {}) {
        this.element = element;
        const defaults = {
            tree: {},
            onclick: null
        };
        this.options = $.extend({}, defaults, options, element.data());
        this._buildTree(element, this.options);

        // Go through "selected" locations and select them
        if (this.options.selected) {
            this.options.selected.forEach((item) => {
                const $checkbox = $('input[type="checkbox"][value="' + item + '"]');
                $checkbox.prop('checked', true);
                this._checkChildren($checkbox, true);
                this._checkParent($checkbox, true);
                this._checkSelectAll();
            });
        }
    }

    _buildSearch() {
        return '<div><input type="textbox" class="txt-search" /></div>';
    }

    _buildSelectAll() {
        return '<div><ins class="tree-icon right-down-caret"></ins><label><input type="checkbox" class="select-all" />Select All</label></div>';
    }

    _buildTree(element, options) {
        const html = [this._buildSearch(), this._buildSelectAll(), this._buildSubTree(options.tree)];
        element.addClass('simple-tree').html(html.join(''));
        element
            .find('.tree-icon')
            .off()
            .click(function () {
                const $ins = $(this),
                    $subtree = $ins.parent().children('ul');
                if ($subtree.is(':visible')) {
                    $ins.removeClass('right-down-caret').addClass('right-caret');
                    $subtree.hide();
                } else {
                    $ins.removeClass('right-caret').addClass('right-down-caret');
                    $subtree.show();
                }
            });
        element
            .find('input[type="checkbox"]')
            .off()
            .change((event) => {
                const $checkbox = $(event.target),
                    checked = $checkbox.prop('checked');
                this._checkChildren($checkbox, checked);
                this._checkParent($checkbox, checked);
                this._checkSelectAll();

                options.onclick && options.onclick();
            });
        element
            .find('.select-all')
            .off()
            .change(function () {
                element.find('input[type="checkbox"]').prop({
                    indeterminate: false,
                    checked: this.checked
                });
            });
        element
            .find('.txt-search')
            .off()
            .bind('input', function () {
                console.log(this.value);
            });
    }

    _buildSubTree(dataTree) {
        if (!dataTree || !dataTree.length) {
            return '';
        }

        const html = ['<ul class="subtree">'];
        dataTree.forEach((item) => {
            html.push('<li class="tree-node">');
            if (item.Children && item.Children.length) {
                html.push('<ins class="tree-icon right-down-caret"></ins>');
            } else {
                html.push('<ins class="tree-icon no-caret"></ins>');
            }
            html.push('<label><input type="checkbox" value="', item.Number, '"/>', item.Name, '</label>');
            html.push(this._buildSubTree(item.Children), '</li>');
        });
        html.push('</ul>');

        return html.join('');
    }

    _checkChildren($checkbox, checked) {
        $checkbox.closest('.tree-node').find('input[type="checkbox"]').prop({
            indeterminate: false,
            checked: checked
        });
    }

    _checkParent($checkbox, checked) {
        if (!$checkbox.length) {
            return;
        }

        let $parent = $checkbox.closest('.subtree');
        if (!$parent.length) {
            return;
        }

        const $allChildren = $parent.children('li').find('input:checkbox'),
            $uncheckedChildren = $allChildren.filter(':not(:checked)');

        let indeterminateChildren = false;
        $uncheckedChildren.each(function () {
            if (this.indeterminate) {
                indeterminateChildren = true;
            }
        });

        const allSelectedChildren = $uncheckedChildren.length === 0,
            someSelectedChildren = !allSelectedChildren && $uncheckedChildren.length !== $allChildren.length;
        $parent
            .prev()
            .children('input:checkbox')
            .prop({
                indeterminate: indeterminateChildren || someSelectedChildren,
                checked: allSelectedChildren
            });

        this._checkParent($parent.parent(), checked);
    }

    _checkSelectAll() {
        const $allChildren = this.element.children('.subtree').children('li').find('input:checkbox'),
            $uncheckedChildren = $allChildren.filter(':not(:checked)');
        const allSelectedChildren = $uncheckedChildren.length === 0,
            someSelectedChildren = !allSelectedChildren && $uncheckedChildren.length !== $allChildren.length;
        this.element.find('.select-all').prop({
            indeterminate: someSelectedChildren,
            checked: allSelectedChildren
        });
    }

    val() {
        const displayArray = [];
        this.element.find('li').each(function () {
            const li = $(this),
                parentLi = li.parent() && li.parent().parent() ? li.parent().parent() : null,
                parentLiIsChecked = parentLi ? parentLi.children('input').prop('checked') : false;

            if (!parentLiIsChecked && $(this).children('input').prop('checked')) {
                displayArray.push($(this).children('label').text());
            }
        });

        return displayArray;
    }
}
