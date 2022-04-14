// basic table interface describing public methods
export interface IGridMethods {
  getCell(row: number, column: number): HTMLElement | null
}

// external table properties struct for consumers
export interface IGridProperties {
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
  renderStyle: GridRenderStyle;
  // data
  data: object;
  // data model
  model: string[];
}

// internal table properties struct
export interface IGridPropertiesInternal extends IGridProperties {
  columnPositions: number[],
  scrollbarSize: number;
  visibleRows: number;
}

export interface IGridContainer {
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
export interface IGridFragment {
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
  focusHandlerRef: Function | null;
}

// html container skeleton
export interface IGridSkeleton {
  c: IGridContainer,         // container
    rchc: IGridContainer,    // row column header container
      rchg: IGridContainer,  // row column header grid
    chc: IGridContainer,     // column header container
      chg: IGridContainer,   // column header grid
    rhc: IGridContainer,     // row header container
      rhg: IGridContainer,   // row header grid
    bc: IGridContainer,      // body container

      // ltc: IGridContainer,   // left top body container
      //   ltg: IGridContainer, // left top body grid
      // ctc: IGridContainer,   // center top body container
      //   ctg: IGridContainer, // center top body grid
      // rtc: IGridContainer,   // right top body container
      //   rtg: IGridContainer, // right top body grid

      // lmc: IGridContainer,   // left middle body container
      //   lmg: IGridContainer, // left middle body grid
      cmc: IGridContainer,   // center middle body container
        cmg: IGridContainer, // center middle body grid
      // rmc: IGridContainer,   // right middle body container
      //   rmg: IGridContainer, // right middle body grid

      // lbc: IGridContainer,   // left bottom body container
      //   lbg: IGridContainer, // left bottom body grid
      // cbc: IGridContainer,   // center bottom body container
      //   cbg: IGridContainer, // center bottom body grid
      // rbc: IGridContainer,   // right bottom body container
      //   rbg: IGridContainer, // right bottom body grid

    sc: IGridContainer,  // scroll container
      scs: IGridContainer    // scroll container shim
};

export enum Orientation {
  'horizontal' = 'horizontal',
  'vertical' = 'vertical'
}

export enum GridRenderStyle {
  'table' = 'table',
  'div' = 'div'
}
