import { Utils }                  from './Utils';
import { DragDrop }               from './DragDrop';
import { FocusRectangle }         from './FocusRectangle';
import { SelectRectangle }        from './SelectRectangle';
import { Resizer, ResizerConfig } from './Resizer';
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

  private t: IGridSkeleton;

  private config: IGridPropertiesInternal;

  private dragdrop: DragDrop;
  private focusRect: FocusRectangle;
  private selectRect: SelectRectangle;
  private focusElement: HTMLElement | null;
  
  // todo: redundant; also defined in config...
  private firstVisibleColumn: number;
  // private firstVisibleRow: number;

  static scrollTimerId: number;

  scrollHandlerRef: EventListener | null;
  resizeHandlerRef: EventListener | null;
  mousewheelHandlerRef: EventListener | null;
  keydownHandlerRef: EventListener | null;
  mousedownHandlerRef: EventListener | null;
  selectDragHandlerRef: EventListener | null;
  selectReleaseHandlerRef: EventListener | null;
  focusHandlerRef: EventListener | null;
  /*
   *  C O N S T R U C T O R
   */
  constructor(o: IGridProperties) {
    
    // References to the event listeners
    this.scrollHandlerRef = null;
    this.resizeHandlerRef = null;
    this.mousewheelHandlerRef = null;
    this.keydownHandlerRef = null;
    this.mousedownHandlerRef = null;
    this.selectDragHandlerRef = null;
    this.selectReleaseHandlerRef = null;
    this.focusHandlerRef = null;

    this.config = {
      columns: o.columns || 20,
      columnWidths: o.columnWidths.length > 0? o.columnWidths : Utils.arrayFill(100, o.columns || 20),
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
      renderStyle: o.renderStyle || GridRenderStyle.table
    };

    let columnPositions: number[] = Utils.arrayProgressiveSum(this.config.columnWidths);
    this.config.columnPositions = columnPositions;
    this.config.visibleRows = Math.floor((this.config.height - this.config.scrollbarSize) / this.config.rowHeight - 1),

    this.t = {
      oc: null!,
        rchc: null!,
          rcht: null!,
        chc: null!,
          cht: null!,
        rhc: null!,
          rht: null!,
        bc: null!,
          bt: null!,
        sc: null!,
          scs: null!
    };
    this.dragdrop = new DragDrop();
    this.focusRect = null!;
    this.focusElement = null!;
    this.selectRect = null!;
    
    this.firstVisibleColumn = this.config.firstVisibleColumn;
  }
  public appendTo(ref: HTMLElement) {
    ref.append(this.t.oc.getDomRef());
    let body: HTMLElement = <HTMLElement>document.getElementById('body');
    if (body) {
      this.t.scs.setWidth(parseInt(body.style.width, 10) + 12);
      this.t.scs.setHeight(parseInt(body.style.height, 10) + 12);
    }
    else {
      console.error('HTMLElement body should not be null');
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
    // this.t.oc.addEventListener('resize', <EventListener>this.resizeHandlerRef);
    window.addEventListener('resize', <EventListener>this.resizeHandlerRef);
    this.t.bc.addEventListener('wheel', <EventListener>this.mousewheelHandlerRef, supportsPassive ? ({ passive: true } as EventListenerOptions) : false );
    this.t.bt.addEventListener('keydown', <EventListener>this.keydownHandlerRef);
    this.t.bt.addEventListener('mousedown', <EventListener>this.mousedownHandlerRef);
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
    let resizerConfig: ResizerConfig = {
      orientation: Orientation.horizontal,
      ref: this.t.oc.getDomRef(),
      start: this.t.oc.getOffsetLeft() + this.config.rowHeaderWidth,
      stop: this.t.oc.getOffsetLeft() + this.config.rowHeaderWidth + this.t.bc.getWidth(),
      // id: 'resi',
      size: [6, this.config.rowHeight],
      resizerContainer: this.t.chc.getDomRef(),
      overflowContainer: this.t.oc.getDomRef(),
      scrollContainer: this.t.sc.getDomRef(),
      positions: this.config.columnPositions,
      // columns: this.config.columns
    }
    let resizer = new Resizer(resizerConfig);
    resizer.addEventListener('resize', ((e: CustomEvent) => {
      // console.log(`Resize: resize, delta = ${e.detail.delta}`)
    }) as EventListener)
    resizer.addEventListener('release', ((e: CustomEvent) => {
        // console.log(`Resize: release`)
    }) as EventListener);
  }
  createSelectRect() {
    this.selectRect = new SelectRectangle(this.t.bc.getDomRef());
  }
  createSkeleton() {
    this.t.oc = new GridContainer()
    .setId(`${this.config.id}-outer-container`)
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
    .appendTo(this.t.oc.getDomRef());

    this.t.chc = new GridContainer()
    .setId(`${this.config.id}-column-header-container`)
    .addClassName(`column-header-container`)
    .setLeft(this.config.rowHeaderWidth)
    .setHeight(this.config.rowHeight)
    .setWidth(this.config.width - this.config.scrollbarSize - this.config.rowHeaderWidth)
    .appendTo(this.t.oc.getDomRef())

    this.t.rhc = new GridContainer()
    .setId(`${this.config.id}-row-header-container`)
    .addClassName(`row-header-container`)
    .setTop(this.config.rowHeight)
    // .setHeight(this.config.visibleRows * this.config.rowHeight)
    .setHeight(this.config.height - this.config.rowHeight - this.config.scrollbarSize)
    .setWidth(this.config.rowHeaderWidth)
    .appendTo(this.t.oc.getDomRef());

    this.t.bc = new GridContainer()
    .setId(`${this.config.id}-body-container`)
    .addClassName(`body-container`)
    .setTop(this.config.rowHeight)
    .setLeft(this.config.rowHeaderWidth)
    // .setHeight(this.config.visibleRows * this.config.rowHeight)
    .setHeight(this.config.height - this.config.rowHeight - this.config.scrollbarSize)
    .setWidth(this.config.width - this.config.scrollbarSize - this.config.rowHeaderWidth)
    .appendTo(this.t.oc.getDomRef());

    this.t.sc = new GridContainer()
    .setId(`${this.config.id}-scroll-container`)
    .addClassName(`scroll-container`)
    .setTop(this.config.rowHeight)
    .setLeft(this.config.rowHeaderWidth)
    // .setHeight(this.config.visibleRows * this.config.rowHeight + this.config.scrollbarSize)
    .setHeight(this.config.height - this.config.rowHeight)
    .setWidth(this.config.width - this.config.rowHeaderWidth)
    .appendTo(this.t.oc.getDomRef());

    this.t.scs = new GridContainer()
    .setId(`${this.config.id}-scroll-container-shim`)
    .addClassName(`scroll-container-shim`)
    .appendTo(this.t.sc.getDomRef());
  
    (this.t.oc as GridContainer)
    .setHeight(`100%`)
    .setWidth(`100%`)
}
  createGridFragment(o: IGridFragment): GridContainer {
    let table;
    let colgroup;
    let col;
    let row;
    let cell;
    let div;
    let r;
    let c;
    let id;
    let width = Utils.arrayRangeSum(o.columnWidths, o.startColumn, o.stopColumn);
    let enumerate: number | string = 1;
    let enumerationText = '';
    let style: GridRenderStyle = this.config.renderStyle;

    if (style == GridRenderStyle.table) {
      table = new GridTable()
      .setId(o.id)
      .addClassName(`table`)
      .setWidth(width)
      .setHeight(((o.stopRow - o.startRow + 1) * o.rowHeight));
      
      colgroup = document.createElement('colgroup');
      table.append(colgroup);
      
      for (c = o.startColumn; c <= o.stopColumn; c++) {
        col = document.createElement('col');
        col.style.width = o.columnWidths[c] + 'px';
        colgroup.append(col);
      }
    }
    else if (style == GridRenderStyle.div) {
      table = new GridContainer()
      .setId(o.id)
      .addClassName(`tbody`)
      .setWidth(width)
      .setHeight(((o.stopRow - o.startRow + 1) * o.rowHeight));
    }
    else {
      throw(new Error(`Grid: render style undefined`));
    }

    if (typeof o.enumerate == 'number') {
      enumerate = o.enumerate;
    }
    else if (typeof o.enumerate == 'string') {
      enumerate = o.enumerate.charCodeAt(0);
    }
    for (r = o.startRow; r <= o.stopRow; r++) {
      if (style == GridRenderStyle.table) {
        row = document.createElement('tr');
        table.append(row);
      }
      else {
        row = document.createElement('div');
        row.className = 'tr';
        table.append(row);
      }
      for (c = o.startColumn; c <= o.stopColumn; c++) {
        if (typeof o.enumerate == 'string') {
          enumerationText = String.fromCharCode((<number>enumerate)++);
        }
        else if (typeof o.enumerate == 'number') {
          (enumerationText = (enumerate++).toString()).toString();
        }
        id = o.cellIdPrefix + '-' + r.toString() + '-' + c.toString();
        if (style == GridRenderStyle.table) {
          cell = document.createElement(o.cellType);
        }
        else {
          cell = document.createElement('div');
          cell.className = o.cellType;
          cell.style.width = `${this.config.columnWidths[c-1]}px`;
        }
        cell.id = id;
        cell.setAttribute('tabindex', '0');
        if (style === GridRenderStyle.table) {
          div = document.createElement('div');
          div.innerText = enumerationText;
          div.setAttribute('draggable', 'false');
          cell.append(div)
        }
        else {
          cell.innerText = enumerationText;
        }
        if (o.focusHandler) {
          cell.addEventListener('focus', o.focusHandler.bind(this));
        }
        row.append(cell);
      }
    }
    return table;
  }
  createGridFragments() {
    this.t.rcht = this.createGridFragment({
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
      focusHandler: null
    });
    this.t.rchc.append(this.t.rcht.getDomRef());

    this.t.cht = this.createGridFragment({
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
      focusHandler: null
    });
    this.t.chc.append(this.t.cht.getDomRef());

    this.t.rht = this.createGridFragment({
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
      focusHandler: null
    });
    this.t.rhc.append(this.t.rht.getDomRef());

    this.t.bt = this.createGridFragment({
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
      focusHandler: this.focusHandler
    });
    this.t.bc.append(this.t.bt.getDomRef());
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
        // console.log(`code: ${event.code}`)
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

    let width = this.t.oc.getOffsetWidth();
    let height = this.t.oc.getClientHeight();
    console.log(`width: ${width}, height: ${height}`);

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
    console.log(width - this.config.rowHeaderWidth);
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
    console.log('focus');
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
        // console.log(`scrollLeft = ${this.t.sc.scrollLeft}`);
      }
      Grid.scrollTimerId = window.setTimeout(this.scrollRight.bind(this), 200, true);
      // console.log('new scrollTimerId: ' + Grid.scrollTimerId);
    }
  }
  selectDragHandler(event: Event) {
    // console.log('Select: drag');
    if (Grid.scrollTimerId > 0) {
      clearTimeout(Grid.scrollTimerId);
    }
    let cell = Utils.getCell((<CustomEvent>event).detail, this.config.renderStyle === GridRenderStyle.table? 'TD' : 'DIV');
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
    // console.log(`Select: release`)
    this.dragdrop.removeEventListener('drag', this.selectDragHandlerRef);
    this.dragdrop.removeEventListener('release', this.selectReleaseHandlerRef);
    clearTimeout(Grid.scrollTimerId);
  }
  mousedownHandler(event: MouseEvent) {
    // console.log('Mousedown');
    let cell: HTMLElement | null = Utils.getCell(event, this.config.renderStyle === GridRenderStyle.table? 'TD' : 'DIV');
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
  //     this.t.bt.removeEventListener('focus', <EventListener>this.focusHandlerRef);
  //     if (this.focusElement) {
  //       this.focusElement.focus();
  //     }
  //     this.t.bt.addEventListener('focus', <EventListener>this.focusHandlerRef);
  //   }, 0);
  // }
}
