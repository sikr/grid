import { DragDrop }               from './DragDrop';
import { FocusRectangle }         from './FocusRectangle';
import { SelectRectangle }        from './SelectRectangle';
import { Resizer }                from './Resizer';
import { Trace }                  from './Trace';
import { Utils }                  from './Utils';
// import { GridKeyboard } from './GridKeyboard.js';
// import { GridFocusRect } from './GridGridFocusRect.js';
// import { GridSelectRect } from './GridGridSelectRect.js';
// import { GridResizer } from './GridGridResizer.js';

import { IGridMethods }            from './Types';
import { IGridPropertiesInternal } from './Types';
import { GridRenderStyle }         from './Types';
import { Orientation }             from './Types';
import { IGridProperties }         from './Types';
import { IGridFragment }           from './Types';
import { IGridSkeleton }           from './Types';
import { GridContainer }           from './GridContainer';
import { GridTable }               from './GridContainer';

export { Grid };

class Grid implements IGridMethods {


  private t: IGridSkeleton = {
    c: null!,
      rchc: null!,
        rchg: null!,
      chc: null!,
        chg: null!,
      rhc: null!,
        rhg: null!,
      bc: null!,
        // ltc: null!
        //   ltg: null!
        // ctc: null!
        //   ctg: null!
        // rtc: null!
        //   rtg: null!

        // lmc: null!
        //   lmg: null!
        cmc: null!,
          cmg: null!,
        // rmc: mull!,
        //   rmg: mull!,

        // lbc: mull!,
        //   lbg: mull!,
        // cbc: mull!,
        //   cbg: mull!,
        // rbc: mull!,
        //   rbg: mull!,
      sc: null!,
        scs: null!
  };

  private config: IGridPropertiesInternal;

  private dragdrop: DragDrop;
  private focusRect: FocusRectangle;
  private selectRect: SelectRectangle;
  private focusElement: HTMLElement | null;
  
  // todo: redundant; also defined in config...
  private firstVisibleColumn: number;
  // private firstVisibleRow: number;

  static scrollTimerId: number;

  scrollHandlerRef: EventListener | null = null;
  resizeHandlerRef: EventListener | null = null;
  mousewheelHandlerRef: EventListener | null = null;
  keydownHandlerRef: EventListener | null = null;
  mousedownHandlerRef: EventListener | null = null;
  selectDragHandlerRef: EventListener | null = null;
  selectReleaseHandlerRef: EventListener | null = null;
  focusHandlerRef: EventListener | null = null;

  trc: Trace;
  utils: Utils;
  /*
   *  C O N S T R U C T O R
   */
  constructor(o: IGridProperties) {
    this.trc = new Trace('Grid');
    this.utils = Utils.getInstance();
    
    this.config = {
      columns: o.columns || 20,
      columnWidths: o.columnWidths.length > 0? o.columnWidths : this.utils.arrayFill(100, o.columns || 20),
      firstVisibleColumn: o.firstVisibleColumn || 1,
      firstVisibleRow: o.firstVisibleRow || 1,
      fixedColumns: o.fixedColumns || 0,
      fixedRows: o.fixedRows || 0,
      height: o.height || 500,
      // height: 0,
      id: o.id || 'a',
      rowHeaderWidth: o.rowHeaderWidth || 50,
      rowHeight: o.rowHeight || 21,
      rows: o.rows || 20,
      // scrollbarSize: /*o.scrollbarSize ||*/ (navigator.userAgent.indexOf('Chrome') != -1) ? 12 : 16,
      scrollbarSize: 16,
      scrollLeft: o.scrollLeft || 0,
      scrollTop: o.scrollTop || 0,
      scrollToSnap: o.scrollToSnap || true,
      width: o.width || 500,
      // width: 0,
      columnPositions: null!,
      visibleRows: 0,
      renderStyle: o.renderStyle || GridRenderStyle.table,
      data: o.data,
      model: o.model
    };
    let columnPositions: number[] = this.utils.arrayProgressiveSum(this.config.columnWidths);
    this.config.columnPositions = columnPositions;
    this.config.visibleRows = Math.floor((this.config.height - this.config.scrollbarSize) / this.config.rowHeight - 1),

    this.dragdrop = new DragDrop();
    this.focusRect = null!;
    this.focusElement = null!;
    this.selectRect = null!;
    
    this.firstVisibleColumn = this.config.firstVisibleColumn;
  }
  public appendTo(ref: HTMLElement) {
    ref.append(this.t.c.getDomRef());
    let body: HTMLElement = <HTMLElement>document.getElementById('body');
    if (body) {
      this.t.scs.setWidth(parseInt(body.style.width, 10) + 12);
      this.t.scs.setHeight(parseInt(body.style.height, 10) + 12);
    }
    else {
      this.trc.error('HTMLElement body should not be null');
    }
  };
  private initializeEventHandlers() {
    this.scrollHandlerRef = <EventListener>this.scrollHandler.bind(this);
    this.resizeHandlerRef = <EventListener>this.resizeHandler.bind(this);
    this.mousewheelHandlerRef = <EventListener>this.mousewheelHandler.bind(this);
    this.keydownHandlerRef = <EventListener>this.keydownHandler.bind(this);
    this.mousedownHandlerRef = <EventListener>this.mousedownHandler.bind(this);
    this.focusHandlerRef = <EventListener>this.focusHandler.bind(this);
  }
  private attachEventHandlers() {
    // Test via a getter in the options object to
    // see if the passive property is accessed.
    let supportsPassive: boolean = false;
    try {
      var opts: EventListenerOptions = Object.defineProperty({}, 'passive', {
        get: function () {
          supportsPassive = true;
        }
      });
      window.addEventListener("testPassive", null!, opts);
      window.removeEventListener("testPassive", null!, opts);
    }
    catch (e) { }

    let passive = 

    this.t.sc.addEventListener('scroll', <EventListener>this.scrollHandlerRef);
    // this.t.c.addEventListener('resize', <EventListener>this.resizeHandlerRef);
    window.addEventListener('resize', <EventListener>this.resizeHandlerRef);
    this.t.bc.addEventListener('wheel', <EventListener>this.mousewheelHandlerRef, supportsPassive ? ({ passive: true } as EventListenerOptions) : false );
    this.t.bc.addEventListener('keydown', <EventListener>this.keydownHandlerRef);
    this.t.bc.addEventListener('mousedown', <EventListener>this.mousedownHandlerRef);
    this.t.bc.addEventListener('focus', <EventListener>this.focusHandlerRef);
  }
  create() {
    this.init();
    this.initializeEventHandlers();
    this.createSkeleton();
    this.createGridFragments();
    this.createResizer();
    this.attachEventHandlers();
    this.createFocusRect();
    this.createSelectRect();
    return this;
  };
  createFocusRect() {
    this.focusRect = new FocusRectangle(this.t.bc.getDomRef());
  }
  createResizer() {
    let resizer = new Resizer("grid-resizer", Orientation.horizontal, this.config, this.t);

    resizer.addEventListener('resize', ((e: CustomEvent) => {
      // this is called while the resizer is dragged
      // this.trc.log(`Resize: resize, delta = ${e.detail.delta}`)
    }) as EventListener)
    
    resizer.addEventListener('release', ((e: CustomEvent) => {
      // this is called after the resizer has been released
      // this.trc.log(`Resize: release`)
    }) as EventListener);
  }
  createSelectRect() {
    this.selectRect = new SelectRectangle(this.t.bc.getDomRef());
  }
  createSkeleton() {
    this.t.c = new GridContainer()
    .setId(`${this.config.id}-container`)
    .addClassName('container')
    .setHeight(this.config.height)
    .setWidth(this.config.width)
    // .setHeight('100%')
    // .setWidth('100%');
    .setHeight(`100%`)
    .setWidth(`100%`);

    this.t.rchc = new GridContainer()
    .setId(`${this.config.id}-row-column-header-container`)
    .addClassName(`row-column-header-container`)
    .setHeight(this.config.rowHeight)
    .setWidth(this.config.rowHeaderWidth)
    .appendTo(this.t.c.getDomRef());

    this.t.chc = new GridContainer()
    .setId(`${this.config.id}-column-header-container`)
    .addClassName(`column-header-container`)
    .setLeft(this.config.rowHeaderWidth)
    .setHeight(this.config.rowHeight)
    .setWidth(this.config.width - this.config.scrollbarSize - this.config.rowHeaderWidth)
    .appendTo(this.t.c.getDomRef())

    this.t.rhc = new GridContainer()
    .setId(`${this.config.id}-row-header-container`)
    .addClassName(`row-header-container`)
    .setTop(this.config.rowHeight)
    // .setHeight(this.config.visibleRows * this.config.rowHeight)
    .setHeight(this.config.height - this.config.rowHeight - this.config.scrollbarSize)
    .setWidth(this.config.rowHeaderWidth)
    .appendTo(this.t.c.getDomRef());

    this.t.bc = new GridContainer()
    .setId(`${this.config.id}-body-container`)
    .addClassName(`body-container`)
    .setTop(this.config.rowHeight)
    .setLeft(this.config.rowHeaderWidth)
    // .setHeight(this.config.visibleRows * this.config.rowHeight)
    .setHeight(this.config.height - this.config.rowHeight - this.config.scrollbarSize)
    .setWidth(this.config.width - this.config.scrollbarSize - this.config.rowHeaderWidth)
    .appendTo(this.t.c.getDomRef());

    this.t.cmc = new GridContainer()
    .setId(`${this.config.id}-center-middle-body-container`)
    .addClassName(`center-middle-body-container`)
    .setTop(this.config.rowHeight)
    .setLeft(this.config.rowHeaderWidth)
    // .setHeight(this.config.visibleRows * this.config.rowHeight)
    .setHeight(this.config.height - this.config.rowHeight - this.config.scrollbarSize)
    .setWidth(this.config.width - this.config.scrollbarSize - this.config.rowHeaderWidth)
    .appendTo(this.t.bc.getDomRef());

    this.t.sc = new GridContainer()
    .setId(`${this.config.id}-scroll-container`)
    .addClassName(`scroll-container`)
    .setTop(this.config.rowHeight)
    .setLeft(this.config.rowHeaderWidth)
    // .setHeight(this.config.visibleRows * this.config.rowHeight + this.config.scrollbarSize)
    .setHeight(this.config.height - this.config.rowHeight)
    .setWidth(this.config.width - this.config.rowHeaderWidth)
    .appendTo(this.t.c.getDomRef());

    this.t.scs = new GridContainer()
    .setId(`${this.config.id}-scroll-container-shim`)
    .addClassName(`scroll-container-shim`)
    .appendTo(this.t.sc.getDomRef());
  
    (this.t.c as GridContainer)
    .setHeight(`100%`)
    .setWidth(`100%`)
}
  createGridFragment(o: IGridFragment): GridContainer {
    let table: GridContainer;
    let row;
    let cell;
    let r;
    let c;

    table = this.createTableHTML(o);

    let tbody = this.createTableBodyHTML(o);
    table.append(tbody);

    for (r = o.startRow; r <= o.stopRow; r++) {
      row = this.createRowHTML(o);
      tbody.append(row);
      for (c = o.startColumn; c <= o.stopColumn; c++) {
        cell = this.createCellHTML(o, r, c);
        row.append(cell);
      }
    }
    return table;
  }
  createTableBodyHTML(o: IGridFragment): HTMLElement {
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
  createTableHTML(o: IGridFragment): GridContainer {
    let table;
    let tbody;
    let colgroup;
    let col;
    let width = this.utils.arrayRangeSum(o.columnWidths, o.startColumn, o.stopColumn);
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
  createRowHTML(o: IGridFragment): HTMLElement {
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
  createCellHTML(o: IGridFragment, row: number, column: number): HTMLElement {
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
  createGridFragments() {
    this.t.rchg = this.createGridFragment({
      id: 'row-column-header',
      startRow: 0,
      stopRow: 0,
      startColumn: 0,
      stopColumn: 0,
      columnWidths: [this.config.rowHeaderWidth],
      rowHeight: this.config.rowHeight,
      cellType: 'th',
      cellClass: '',
      cellIdPrefix: 'rc',
      enumerate: null,
      focusHandlerRef: null
    });
    this.t.rchc.append(this.t.rchg.getDomRef());

    this.t.chg = this.createGridFragment({
      id: 'column-header',
      startRow: 0,
      stopRow: 0,
      startColumn: 1,
      stopColumn: this.config.columns,
      columnWidths: [0].concat(this.config.columnWidths),
      rowHeight: this.config.rowHeight,
      cellType: 'th',
      cellClass: 'foo',
      cellIdPrefix: 'c',
      enumerate: 'A',
      focusHandlerRef: null
    });
    this.t.chc.append(this.t.chg.getDomRef());

    this.t.rhg = this.createGridFragment({
      id: 'row-header',
      startRow: 1,
      stopRow: this.config.rows,
      startColumn: 0,
      stopColumn: 0,
      columnWidths: [this.config.rowHeaderWidth],
      rowHeight: this.config.rowHeight,
      cellType: 'th',
      cellClass: 'bar',
      cellIdPrefix: 'r',
      enumerate: 1,
      focusHandlerRef: null
    });
    this.t.rhc.append(this.t.rhg.getDomRef());

    this.t.cmg = this.createGridFragment({
      id: 'body',
      startRow: 1,
      stopRow: this.config.rows,
      startColumn: 1,
      stopColumn: this.config.columns,
      columnWidths: [0].concat(this.config.columnWidths),
      rowHeight: this.config.rowHeight,
      cellType: 'td',
      cellClass: '',
      cellIdPrefix: 'g',
      enumerate: null,
      focusHandlerRef: this.focusHandlerRef
    });
    this.t.cmc.append(this.t.cmg.getDomRef());
  }
  getCell(row: number, column: number): HTMLElement | null {
    // ...
    return document.getElementById('g-1-1');
  }
  init() {
    // ...
  }
  arrowKey(e: KeyboardEvent, r: number, c: number) {
    let cell: HTMLElement | null = null;
    let id: string[];
    let to;
    if (e.shiftKey) {
      to = this.selectRect.getTo();
    }
      
    if (to) {
      id = to.id.split('-');
      r = parseInt(id[1], 10);
      c = parseInt(id[2], 10);
    }
    switch (e.code) {
      case 'ArrowUp': cell = this.arrowUpKey(r, c); break;
      case 'ArrowDown': cell = this.arrowDownKey(r, c); break;
      case 'ArrowLeft': cell = this.arrowLeftKey(r, c); break;
      case 'ArrowRight': cell = this.arrowRightKey(r, c); break;
    }
    if (e.shiftKey) {
      this.selectRect.update(null, cell);
      cell = null;
      // _e = null;
    }
    this.focusElement = cell;
    return cell;
  }
  arrowUpKey(r: number, c: number): HTMLElement | null {
    return document.getElementById(`g-${r - 1}-${c}`);
  }
  arrowDownKey(r: number, c: number): HTMLElement | null {
    return document.getElementById(`g-${r + 1}-${c}`);
  }
  arrowLeftKey(r: number, c: number): HTMLElement | null {
    return document.getElementById(`g-${r}-${c - 1}`)
  }
  arrowRightKey(r: number, c: number): HTMLElement | null {
    return document.getElementById(`g-${r}-${c + 1}`)
  }
  keydownHandler(event: KeyboardEvent) {
    var cell: HTMLElement | null = null;
    var div: HTMLElement;
    if (event.target) {
      var cellId = (<HTMLElement>event.target).id.split('-');
      var row = parseInt(cellId[1], 10);
      var column = parseInt(cellId[2], 10);
      //
      // arrow keys
      //
      switch (event.code) {
        case 'ArrowUp':
        case 'ArrowDown':
        case 'ArrowLeft':
        case 'ArrowRight':
          cell = this.arrowKey(event, row, column);
          break;
        case 'PageUp':
          row -= this.config.visibleRows;
          if (row < 1) {
            row = 1;
          }
          cell = document.getElementById(`g-${row}-${column}`)
          break;
        case 'PageDown':
          row += this.config.visibleRows;
          if (row > this.config.rows) {
            row = this.config.rows;
          }
          cell = document.getElementById(`g-${row}-${column}`)
          break;
        case 'Tab':
          if (event.shiftKey) {
            var _c = column - 1;
            if (_c < 1) {
              if (row > 1) {
                let parent = (<HTMLElement>event.target).parentNode;
                if (parent) {
                  cell = document.getElementById(`g-${row - 1}-${parent.childNodes.length}`);
                }
              }
            }
            else {
              cell = document.getElementById(`g-${row}-${column - 1}`);
            }
          }
          else {
            cell = document.getElementById(`g-${row}-${column + 1}`);
            if (!cell) {
              cell = document.getElementById(`g-${row + 1}-1`);
            }
          }
          event.preventDefault();
          this.focusElement = cell;
          break;
        case 'Delete':
          cell = document.getElementById(`g-${row}-${column}`);
          if (cell) {
            cell.innerHTML = '';
          }
          this.focusElement = null; // focus already set
          break;
        case "F2":
          cell = document.getElementById(`g-${row}-${column}`);
          if (cell && event.target) {
            div = (<HTMLElement>cell.childNodes[0]);
            var textContent = div.innerText;
            div.innerText = '';
            var input = document.createElement('input');
            input.id = 'ti';
            input.type = 'text';
            input.textContent;
            div.style.display = 'none';
            cell.append(input);
            this.focusElement = input;

            let keydownEventListener = (event: KeyboardEvent) => {
              if (event.code === 'Enter' || event.code === 'ArrowUp' || event.code === 'ArrowDown') {
                event.stopPropagation();
                var value = (<HTMLInputElement>event.target).value;
                document.removeEventListener('keydown', keydownEventListener);
                let target: ParentNode = (<ParentNode>event.target);
                let parentNode: ParentNode | null = target.parentNode;
                if (parentNode) {
                  var cell = document.getElementById((<HTMLElement>parentNode).id);
                  if (cell) {
                    // cell.removeChild(this);
                    div = (<HTMLElement>cell.childNodes[0]);
                    div.innerText = value;
                    div.style.display = 'block';
                    // focusRef = cell[0].id;
                    this.focusElement = cell;
                  }
                }
              }
            };
            input.addEventListener('keydown', keydownEventListener);
          }
        default:
        // this.trc.log(`code: ${event.code}`)
      }
      if (cell) {
        if (this.t.sc.getScrollTop() > cell.offsetTop) {
          this.t.sc.setScrollTop(cell.offsetTop);
        }
        if (this.t.bc.getScrollTop() + this.t.bc.getOffsetHeight() < cell.offsetTop + cell.offsetHeight) {
          this.t.sc.setScrollTop(cell.offsetTop - this.t.bc.getOffsetHeight() + cell.offsetHeight);
        }
        if (this.t.sc.getScrollLeft() > cell.offsetLeft) {
          this.t.sc.setScrollLeft(cell.offsetLeft);
        }
        if (this.t.bc.getScrollLeft() + this.t.bc.getOffsetWidth() < cell.offsetLeft + cell.offsetWidth) {
          this.t.sc.setScrollLeft(cell.offsetLeft + cell.offsetWidth - this.t.bc.getOffsetWidth());
        }
        if (cell) {
          this.focusRect.update(cell);
          this.selectRect.update(cell, null);
          this.setFocus();
        }
      }

    }
  }
  scrollHandler() {
    let left;
    let top;
    let scrollLeft;

    if (this.config.scrollToSnap) {
      top = this.config.rowHeight *
        Math.floor(this.t.sc.getScrollTop() / this.config.rowHeight);
      left = 0;
      scrollLeft = this.t.sc.getScrollLeft();
      if (scrollLeft === 0) {
        left = 0;
        this.firstVisibleColumn = 1;
      }
      else if (scrollLeft > this.t.sc.getScrollWidth() - this.t.sc.getOffsetWidth()) {
        left = this.t.sc.getScrollWidth() - this.t.sc.getClientWidth();
        this.firstVisibleColumn = this.config.columns;
      }
      else {
        for (var i = 0; i < this.config.columnPositions.length; i++) {
          if (scrollLeft >= this.config.columnPositions[i] &&
            scrollLeft < this.config.columnPositions[i + 1]) {
            left = this.config.columnPositions[i];
            this.firstVisibleColumn = i + 1;
            break;
          }
        }
      }
    }
    else {
      left = this.t.sc.getScrollLeft();
      top = this.t.sc.getScrollTop();
    }
    this.config.scrollTop = top;
    this.config.scrollLeft = left;
    this.t.bc.setScrollTop(top);
    this.t.rhc.setScrollTop(top);
    this.t.bc.setScrollLeft(left);
    this.t.chc.setScrollLeft(left);
    this.selectRect.setScrollPosition({ top: top, left: left });
    this.selectRect.update(null, null);
  }
  resizeHandler(event: Event) {

    let width = this.t.c.getOffsetWidth();
    let height = this.t.c.getClientHeight();
    this.trc.log(`width: ${width}, height: ${height}`);

    // this.t.chc
    //   width: this.config.width - this.config.scrollbarSize - this.config.rowHeaderWidth
    this.t.chc.setWidth(width - this.config.scrollbarSize - this.config.rowHeaderWidth);
    
    // this.t.rhc
    //  height: this.config.height - this.config.rowHeight - this.config.scrollbarSize
    this.t.rhc.setHeight(height - this.config.scrollbarSize - this.config.rowHeight);
    
    // this.t.bc 
    //   width: this.config.width - this.config.scrollbarSize - this.config.rowHeaderWidth
    //   height: this.config.height - this.config.rowHeight - this.config.scrollbarSize
    this.t.bc.setWidth(width - this.config.rowHeaderWidth - this.config.scrollbarSize);
    this.t.bc.setHeight(height - this.config.rowHeight - this.config.scrollbarSize);
    
    // this.t.sc 
    //   width: this.config.width - this.config.rowHeaderWidth
    //   height: this.config.height - this.config.rowHeight
    this.trc.log(width - this.config.rowHeaderWidth);
    this.t.sc.setWidth(width - this.config.rowHeaderWidth);
    this.t.sc.setHeight(height - this.config.rowHeight);
    
    // this.t.scs
    //   width: this.bc.style.width + 12
    //   height: this.bc.style.width + 12
    // this.t.scs.setWidth(this.t.bc.getOffsetWidth() + 12);
    // this.t.scs.setHeight(this.t.bc.getOffsetHeight() + 12);
  }
  mousewheelHandler(event: WheelEvent) {
    this.t.sc.setScrollTop(this.t.sc.getScrollTop() - (event.deltaY * -1 / 100) * 3 * this.config.rowHeight);
  }
  focusHandler(event: FocusEvent) {
    this.trc.log('focus');
    if (event.target) {
      let h: EventTarget = event.target;
      if ((<HTMLElement>h).id && (<HTMLElement>h).id.indexOf('g-') === 0) {
        this.focusRect.update(<HTMLElement>h);
        this.selectRect.update(<HTMLElement>h, null);
      }
    }
  }
  scrollRight(immediately: boolean) {
    if (this.firstVisibleColumn < this.config.columns) {
      if (immediately) {
        this.t.sc.setScrollLeft(this.config.columnPositions[this.firstVisibleColumn++]);
        // this.trc.log(`scrollLeft = ${this.t.sc.scrollLeft}`);
      }
      Grid.scrollTimerId = window.setTimeout(this.scrollRight.bind(this), 200, true);
      // this.trc.log('new scrollTimerId: ' + Grid.scrollTimerId);
    }
  }
  selectDragHandler(event: Event) {
    // this.trc.log('Select: drag');
    if (Grid.scrollTimerId > 0) {
      clearTimeout(Grid.scrollTimerId);
    }
    let cell = this.utils.getCell((<CustomEvent>event).detail, this.config.renderStyle === GridRenderStyle.table? 'TD' : 'DIV');
    // if (cell) {
    //   this.trc.log(`cell: ${cell.id}`)
    // }
    // else {
    //   this.trc.log('cell is undefined')
    // }
    if (cell && cell.id.indexOf('g-') === 0) {
      this.selectRect.update(null, cell);
    }
    else {
      if ((<MouseEvent>event).clientX > (this.t.bc.getOffsetWidth() + this.t.bc.getOffsetLeft())) {
        this.scrollRight(false);
      }
    }
  }
  selectReleaseHandler(event: Event) {
    // this.trc.log(`Select: release`)
    this.dragdrop.removeEventListener('drag', this.selectDragHandlerRef);
    this.dragdrop.removeEventListener('release', this.selectReleaseHandlerRef);
    clearTimeout(Grid.scrollTimerId);
  }
  mousedownHandler(event: MouseEvent) {
    // this.trc.log('Mousedown');
    let cell: HTMLElement | null = this.utils.getCell(event, this.config.renderStyle === GridRenderStyle.table? 'TD' : 'DIV');
    if (cell && cell.id.indexOf('g-') === 0) {
      this.selectRect.hide();
      this.dragdrop.startSession(event, this.config.renderStyle === GridRenderStyle.table? 'TD' : 'DIV');

      this.selectDragHandlerRef = <EventListener>this.selectDragHandler.bind(this);
      this.dragdrop.addEventListener('drag', this.selectDragHandlerRef);
      
      this.selectReleaseHandlerRef = <EventListener>this.selectReleaseHandler.bind(this);
      this.dragdrop.addEventListener('release', this.selectReleaseHandlerRef);
    }
  }
  setFocus() {
    setTimeout(() => {
      if (this.focusElement) {
        this.focusElement.focus();
      }
    }, 0);
  }
  // setFocusSilently() {
  //   setTimeout(() => {
  //     this.t.bc.removeEventListener('focus', <EventListener>this.focusHandlerRef);
  //     if (this.focusElement) {
  //       this.focusElement.focus();
  //     }
  //     this.t.bc.addEventListener('focus', <EventListener>this.focusHandlerRef);
  //   }, 0);
  // }
}
