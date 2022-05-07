/*
 * TableComponents are the separate HTML Tables of the Grid, containing the
 *  row and column header as well as the content/body cells. These components
 *  are joined togehter in the Skeleton.
 *
 */

import { GridContainer } from "./GridContainer";
import { ITableComponent } from "./Types";
import { IGridPropertiesInternal } from './Types';
import { GridRenderStyle } from './Types';
import { GridTable } from './GridContainer';
import { Trace } from './Trace';
import { Utils } from './Utils';

export class TableComponent {

  trc: Trace;
  utils: Utils;
  config: IGridPropertiesInternal;
  table: GridContainer;

  constructor(o: ITableComponent, config: IGridPropertiesInternal) {
    let row;
    let cell;
    let r;
    let c;

    this.trc = new Trace('Grid');
    this.utils = Utils.getInstance();
    this.config = config;

    this.table = this.createTableHTML(o);
  
    let tbody = this.createTableBodyHTML(o);
    this.table.append(tbody);
  
    for (r = o.startRow; r <= o.stopRow; r++) {
      row = this.createRowHTML(o);
      tbody.append(row);
      for (c = o.startColumn; c <= o.stopColumn; c++) {
        cell = this.createCellHTML(o, r, c);
        row.append(cell);
      }
    }
    // return table;
  }
  public getDomRef(): GridContainer {
    return this.table;
  }

  private createTableHTML(o: ITableComponent): GridContainer {
    let table;
    let tbody;
    let colgroup;
    let col;
    // let width = this.utils.arrayRangeSum(o.columnWidths, o.startColumn, o.stopColumn);
    let width = o.columnWidths.reduce((p, c, i)  => (i >= o.startColumn && i <= o.stopColumn) ? p + c : p, 0);
    let r, c;
    
    if (this.config.renderStyle == GridRenderStyle.table) {
      table = new GridTable()
      .setId(o.id)
      .addClassName(`grid-table`)
      .setWidth(width)
      .setHeight(((o.stopRow - o.startRow + 1) * o.rowHeight));
      
      colgroup = document.createElement('colgroup');
      table.append(colgroup);
      
      for (c = o.startColumn; c <= o.stopColumn; c++) {
        col = document.createElement('col');
        if (o.columnWidths[c] !== 100) {
          col.style.width = o.columnWidths[c] + 'px';
        }
        colgroup.append(col);
      }
    }
    else// if (this.config.renderStyle == GridRenderStyle.div) 
    {
      table = new GridContainer()
      .setId(o.id)
      .addClassName(`grid-table`)
      .setWidth(width)
      .setHeight(((o.stopRow - o.startRow + 1) * o.rowHeight));
    }
    return table;
  }
  private createTableBodyHTML(o: ITableComponent): HTMLElement {
    let tbody;
    if (this.config.renderStyle == GridRenderStyle.table) {
      tbody = document.createElement('tbody');
    }
    else {
      tbody = document.createElement('div');
    }
    tbody.classList.add('grid-body')
    return tbody;
  }
  private createRowHTML(o: ITableComponent): HTMLElement {
    let row;
    if (this.config.renderStyle == GridRenderStyle.table) {
      row = document.createElement('tr');
    }
    else {
      row = document.createElement('div');
      // net yet needed due to cascading
      // row.className = 'grid-row';
    }
    return row;
  }
  private createCellHTML(o: ITableComponent, row: number, column: number): HTMLElement {
    let enumerate: number | string = 1;
    let textContent = '';
    let cell;
    let id;
    let div;

    // number or chars for row column header
    if (typeof o.enumerate == 'number') {
      enumerate = row;
      (textContent = (enumerate++).toString()).toString();
    }
    else if (typeof o.enumerate == 'string') {
      enumerate = o.enumerate.charCodeAt(0)+column-1;
      textContent = String.fromCharCode((<number>enumerate));
    }
    else if (row > 0) {
      let dataRow = this.config.data[row-1 as keyof typeof this.config.data];
      let key = this.config.model[column-1];
      textContent = dataRow[key]
      this.config.data
    }

    if (this.config.renderStyle == GridRenderStyle.table) {
      cell = document.createElement(o.cellType);
    }
    else {
      cell = document.createElement('div');
      if (o.cellType === 'th') {
        cell.className = 'grid-header-cell';

      }
      else if (o.cellType === 'td') {
        // not yet needed due to cascading
        // cell.className = 'grid-cell';

      }
      // the width only need to be set in the first row due to display: table-cell
      // < 2 to cover header & body cells which are in different containers...
      if (column > 0 && row < 2 && this.config.columnWidths[column - 1] !== 100) {
        cell.style.width = `${this.config.columnWidths[column - 1]}px`;
      }
    }

    cell.id = `${o.cellIdPrefix}-${row.toString()}-${column.toString()}`;

    cell.setAttribute('tabindex', '0');
    if (this.config.renderStyle === GridRenderStyle.table) {
      div = document.createElement('div');
      div.innerText = textContent;
      cell.append(div)
    }
    else {
      cell.innerText = textContent;
    }
    if (o.focusHandlerRef) {
      cell.addEventListener('focus', <EventListener>o.focusHandlerRef);
    }
    return cell;
  }
}