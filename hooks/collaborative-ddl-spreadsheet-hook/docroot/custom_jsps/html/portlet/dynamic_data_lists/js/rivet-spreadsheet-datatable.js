AUI.add(
    'rivet-spreadsheet-datatable',
    function(A) {
        
        var HIGHLIGHTED_CELL = '.cell-highlight.current-user.table-cell';

        var RivetSpreadSheet = A.Component.create({
            ATTRS: {
                highlightColor: {
                    value: '#3FC51B'
                }
            },
            
            CSS_PREFIX: 'table',
            
            EXTENDS: Liferay.SpreadSheet,
            
            NAME: A.DataTable.Base.NAME,
            
            prototype: {
                initializer: function() {
                    this.bindSpreadSheet();
                },
                
                /*
                * Attaches all the events to the spreadsheet table
                * 
                *
                */
                bindSpreadSheet: function() {
                    var instance = this;
                    instance.after('highlightColorChange', A.bind(instance._highlightColorChanged, instance));
                    
                    instance.delegate(instance.get('editEvent'), function(e) {
                        var activeCell = instance.get('activeCell'),
                        alignNode = event.alignNode || activeCell,
                        column = instance.getColumn(alignNode),
                        record = instance.getRecord(alignNode),
                        editor = instance.getEditor(record, column);
                        if (!(editor instanceof Liferay.RivetInlineCellEditor)) {
                            return;
                        }
                        e.stopPropagation();
                        editor.editInlineCell({
                            activeCell: activeCell,
                            record: record,
                            column: column,
                            table: instance
                        });
                    }, '.' + instance.CLASS_NAMES_CELL_EDITOR_SUPPORT.cell, this);
                    
                    // highlight
                    instance.delegate('click', function(e) {
                        var cellList = instance.get('boundingBox').all(HIGHLIGHTED_CELL);
                        cellList.setStyle('border-color', '');
                        cellList.removeClass('cell-highlight').removeClass('current-user');
                        var cell = e.currentTarget;
                        instance._updateHighlightCellColor(cell);
                        instance._publishCellHighlight(cell);
                    }, '.' + instance.CLASS_NAMES_CELL_EDITOR_SUPPORT.cell, this);
                },
                
                /*
                * Triggers event with the give selected cell data
                * 
                *
                */
                _publishCellHighlight: function(cell) {
                    this.fire('cellHighlighted', this.getCellData(cell));
                },
                
                /*
                * Retrieves cell information such as record id and col name
                * 
                *
                */
                getCellData: function(cell) {
                    var col = cell.getDOMNode().className.match(/(^|\s)(table\-col\-[^\s]*)/)[0];
                    var record = cell.ancestor('tr').getAttribute('data-yui3-record');
                    return {col: col, record: record};
                },
                
                /*
                * Listens the highlight color value changes
                * 
                *
                */
                _highlightColorChanged: function() {
                    if (this.get('boundingBox').one(HIGHLIGHTED_CELL)) {
                        this._updateHighlightCellColor(this.get('boundingBox').one(HIGHLIGHTED_CELL));
                    }
                },
                
                /*
                * Updates cell color
                * 
                *
                */
                _updateHighlightCellColor: function(cell) {
                    cell.addClass('cell-highlight').addClass('current-user');
                    cell.setStyle('border-color', this.get('highlightColor'));
                },
                
                /*
                * Updates cell color by give color parameter and puts title over the 
                * cell
                * 
                *
                */
                _updateTitledHighlightCellByClasses: function(data) {
                    if (data.cell) {
                        this.get('boundingBox').all('.' + data.refClass + ' .cell-highlight-title').remove();
                        var cells = this.get('boundingBox').all('.' + data.refClass);
                        cells.setStyle('border-color', '');
                        cells.removeClass(data.refClass).removeClass('cell-highlight');
                        data.cell.addClass(data.refClass).addClass('cell-highlight');
                        data.cell.setStyle('border-color', data.color);
                        data.cell.append('<span style="background-color: ' + data.color + 
                            ';" class="cell-highlight-title">' + data.title + '</span>')
                    }
                }
            }
        });
            
        RivetSpreadSheet.EXTENDS.TYPE_EDITOR = {
            'checkbox': A.CheckboxCellEditor,
            'ddm-date': A.DateCellEditor,
            'ddm-decimal': A.TextCellEditor,
            'ddm-integer': A.TextCellEditor,
            'ddm-number': A.TextCellEditor,
            'radio': A.RadioCellEditor,
            'select': A.DropDownCellEditor,
            'text': Liferay.RivetInlineCellEditor,
            'textarea': A.TextAreaCellEditor
        };

        Liferay.RivetSpreadSheet = RivetSpreadSheet;

        },
        '1.0',
        {
            requires: ['rivet-inline-cell', 'aui-arraysort', 'aui-datatable', 'datatable-sort', 'json', 'liferay-portlet-url', 'liferay-util-window', 'liferay-portlet-dynamic-data-lists']
        })
