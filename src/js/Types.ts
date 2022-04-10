import { TableContainer } from "./TableContainer";

// basic table interface describing public methods
export interface ITableMethods {
  getCell(row: number, column: number): HTMLElement | null
}

// external table properties struct for consumers
export interface ITableProperties {
  // 
  id: string;
  // number of columns
  columns: number;
  // 
  columnWidths: number[];
  // number of rows
  rows: number;
  // 
  rowHeight: number;
  // width of the selection column
  rowHeaderWidth: number;
  // initial horizontal scroll position snapped to certain column
  firstVisibleColumn: number;
  // initial vertical scroll position snapped to certain row
  firstVisibleRow: number;
  // not implemented
  fixedColumns: number;
  // not implemented
  fixedRows: number;
  // height of the sourrounding container
  height: number;
  // width of the sourrounding container
  width: number;
  // initial horizontal scroll position in px
  scrollLeft: number;
  // initial vertical scroll position in px
  scrollTop: number;
  // snap to column or scroll pixel for pixel
  scrollToSnap: Boolean;
  // render using HTML table or div
  renderStyle: TableRenderStyle;
}

// internal table properties struct
export interface ITablePropertiesInternal extends ITableProperties {
  columnPositions: number[],
  scrollbarSize: number;
  visibleRows: number;
}

export interface ITableContainer {
  domRef: HTMLElement;
  addClassName(className: string): unknown;
  addEventListener(name: string, listener: EventListener, options?: boolean | EventListenerOptions): unknown;
  append(domRef: HTMLElement): unknown;
  appendTo(domRef: HTMLElement): unknown;
  getClientHeight(): number;
  getClientWidth(): number;
  getDomRef(): HTMLElement;
  getOffsetHeight(): number;
  getOffsetLeft(): number;
  getOffsetWidth(): number;
  getScrollLeft() : number;
  getScrollTop(): number;
  getScrollWidth(): number;
  getWidth(): number;
  removeEventListener(name: string, listener: EventListener, options?: boolean | EventListenerOptions): unknown;
  setHeight(height: number | string): unknown;
  setId(id: string): unknown;
  setLeft(left: number | string): unknown;
  setScrollLeft(scrollTop: number): unknown;
  setScrollTop(scrollTop: number): unknown;
  setTop(top: number | string): unknown;
  setWidth(width: number | string): unknown;
}

// internal table fragment properties struct
export interface ITableFragment {
  id: string;
  startRow: number;
  stopRow: number;
  startColumn: number;
  stopColumn: number;
  columnWidths: number[];
  rowHeight: number;
  cellType: string;
  cellClass: string;
  cellIdPrefix: string;
  enumerate: number | string | null;
  focusHandler: Function | null;
}

// html container skeleton
export interface ITableSkeleton {
  oc: ITableContainer,         // outer container
    ic: ITableContainer,       // inner container
      rchc: ITableContainer,   // row column header container
        rcht: ITableContainer, // row column header table
      chc: ITableContainer,    // column header container
        cht: ITableContainer,  // column header table
      rhc: ITableContainer,    // row header container
        rht: ITableContainer,  // row header table
      bc: ITableContainer,     // body container
        bt: ITableContainer,   // body table
      sc: ITableContainer,     // scroll container
        scs: ITableContainer   // scroll container shim
};

export enum Orientation {
  'horizontal' = 'horizontal',
  'vertical' = 'vertical'
}

export enum TableRenderStyle {
  'table' = 'table',
  'div' = 'div'
}
