$(document).ready(function () {
    // Initialize the Multi Selects
    const mul = new MultiSelect('#dynamic', {
        data: [
            {
                value: 'opt1',
                text: 'Option 1'
            },
            {
                value: 'opt2',
                html: '<strong>Option 2 with HTML!</strong>'
            },
            {
                value: 'opt3',
                text: 'Option 3',
                selected: true
            },
            {
                value: 'opt4',
                text: 'Option 4'
            },
            {
                value: 'opt5',
                text: 'Option 5'
            }
        ],
        placeholder: 'Select an option',
        search: true,
        selectAll: true,
        listAll: false,
        max: 2,
        onChange: function (value, text, element) {
            console.log('Change:', value, text, element);
        },
        onSelect: function (value, text, element) {
            console.log('Selected:', value, text, element);
        },
        onUnselect: function (value, text, element) {
            console.log('Unselected:', value, text, element);
        },
        dropdownWidth: '300px',
        dropdownHeight: '500px'
    });

    // Create tree object
    var demoTreeData = [
        {
            Number: 'WA-775-99',
            Name: 'Main House',
            Children: [
                { Number: 'JI-105-09', Name: 'Downstairs', Children: [] },
                {
                    Number: 'TR-883-66',
                    Name: 'Upstairs',
                    Children: [
                        {
                            Number: 'SS-002-99',
                            Name: 'Bedrooms',
                            Children: [
                                {
                                    Number: 'JI-656-09',
                                    Name: 'Master Bedroom',
                                    Children: []
                                },
                                {
                                    Number: 'ZZ-654-66',
                                    Name: 'Guest Bedroom',
                                    Children: []
                                }
                            ]
                        },
                        {
                            Number: 'SS-001-99',
                            Name: 'Other Rooms',
                            Children: [
                                {
                                    Number: 'JI-898-09',
                                    Name: 'Great Room',
                                    Children: []
                                },
                                {
                                    Number: 'ZZ-493-66',
                                    Name: 'Bonus Room',
                                    Children: []
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        { Number: 'QQ-542-10', Name: 'Garage', Children: [] }
    ];
    const treePicker = new TreePicker($('#tree-1'), {
        tree: demoTreeData,
        onclick: function () {
            var selected = treePicker.val();
            $('#selected-1').html(!!selected.length ? selected.toString().replace(/,/g, ', ') : 'Nothing Selected');
        },
        //selected: ['ZZ-654-66', 'SS-001-99'],
        selected: ['ZZ-654-66', 'JI-898-09', 'ZZ-493-66']
    });
});
