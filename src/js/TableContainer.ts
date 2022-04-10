import { ITableContainer } from './Types';

export { TableContainer, TableTable };

class TableContainer implements ITableContainer {
  domRef;
  constructor() {
    this.domRef = document.createElement('div');
  }
  addClassName(className: string): TableContainer {
    this.domRef.className = this.domRef.classList + className;
    return this;
  }
  addEventListener(name: string, listener: EventListener, options?: boolean | EventListenerOptions): TableContainer {
    this.domRef.addEventListener(name, listener, options);
    return this;
  }
  append(domRef: HTMLElement): TableContainer {
    this.domRef.append(domRef);
    return this;
  }
  appendTo(domRef: HTMLElement): TableContainer {
    domRef.append(this.domRef);
    return this;
  }
  getClientHeight(): number {
    return this.domRef.clientHeight;
  }
  getClientWidth(): number {
    return this.domRef.clientWidth;
  }
  getDomRef() : HTMLElement {
    return this.domRef;
  }
  getOffsetHeight(): number {
    return this.domRef.offsetHeight;
  }
  getOffsetLeft() : number {
    return this.domRef.offsetLeft;
  }
  getOffsetWidth() : number {
    return this.domRef.offsetWidth;
  }
  getScrollLeft(): number {
    return this.domRef.scrollLeft;
  }
  getScrollTop(): number {
    return this.domRef.scrollTop;
  }
  getScrollWidth(): number {
    return this.domRef.scrollWidth;
  }
  getWidth(): number {
    return parseInt(this.domRef.style.width, 10);
  }
  removeEventListener(name: string, listener: EventListener, options?: boolean | EventListenerOptions): TableContainer {
    this.domRef.removeEventListener(name, listener, options);
    return this;
  }
  setHeight(height: number | string): TableContainer {
    this.domRef.style.height = this.pixelOrPercentOrAuto(height);
    return this;
  }
  setId(id: string): TableContainer {
    this.domRef.id = id;
    return this;
  }
  setLeft(left: number | string): TableContainer {
    this.domRef.style.left = this.pixel(left);
    return this;
  }
  setScrollLeft(scrollLeft: number): TableContainer {
    this.domRef.scrollLeft = scrollLeft;
    return this;
  }
  setScrollTop(scrollTop: number): TableContainer {
    this.domRef.scrollTop = scrollTop;
    return this;
  }
  setTop(top: number | string): TableContainer {
    this.domRef.style.top = this.pixel(top);
    return this;
  }
  setWidth(width: number | string): TableContainer {
    this.domRef.style.width = this.pixelOrPercentOrAuto(width);
    return this;
  }
  private pixel(prop: number | string): string {
    if (typeof prop === 'number') {
      return `${prop}px`;
    }
    else if (typeof prop === 'string' && prop.indexOf('px') === prop.length - 2) {
      return prop;
    }
    else {
      throw new Error(`Invalid type or format: ${prop}.`);
    }
  }
  private pixelOrPercent(prop: number | string): string {
    if (typeof prop === 'number') {
      return `${prop}px`;
    }
    else if (prop.indexOf('px') === prop.length - 2 || prop.indexOf('%') === prop.length -1) {
      return prop;
    }
    else {
      throw new Error(`Invalid type or format: ${prop}.`);
    }
  }
  private pixelOrPercentOrAuto(prop: number | string): string {
    if (typeof prop === 'number') {
      return `${prop}px`;
    }
    else if (prop.indexOf('px') === prop.length - 2 || prop.indexOf('%') === prop.length -1 || prop === 'auto') {
      return prop;
    }
    else {
      throw new Error(`Invalid type or format: ${prop}.`);
    }
  }
}

class TableTable extends TableContainer {
  constructor() {
    super()
    this.domRef = document.createElement('table');
  }
}