class TreePicker {
    constructor() {
        const element = $('#tree-1');
        this.element = element;
        element
            .find('.tree-icon:not(.no-caret)')
            .off()
            .click(function () {
                const $ins = $(this),
                    $subtree = $ins.siblings('.subtree');
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
                    checked = $checkbox.is(':checked');
                this._checkChildren($checkbox, checked);
                this._checkParent($checkbox, checked);
                this._checkSelectAll();

                //options.onclick && options.onclick();
            });
        element
            .find('.expand-all')
            .off()
            .click(function () {});
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

        ['ZZ-654-66', 'JI-898-09', 'ZZ-493-66'].forEach((item) => {
            const $checkbox = $('input[type="checkbox"][value="' + item + '"]');
            $checkbox.prop('checked', true);
            this._checkChildren($checkbox, true);
            this._checkParent($checkbox, true);
            this._checkSelectAll();
        });
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

        const $parent = $checkbox.closest('.subtree');
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

$(document).ready(function () {
    new TreePicker();
});
