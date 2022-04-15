import { DragDrop as Dragdrop } from './DragDrop';
import { Orientation } from './Types';
import { Trace } from './Trace';

export { Resizer };

export interface ResizerConfig {
  orientation: Orientation;
  overflowContainer: HTMLElement;
  positions: number[];
  resizerContainer: HTMLElement;
  scrollContainer: HTMLElement;
  size: number[];
  start: number;
  stop: number;
  ref: HTMLElement;
}

class Resizer extends EventTarget {
  active: boolean;
  delta: number;
  domRefHandle: HTMLElement;
  domRefLine: HTMLElement;
  dragdrop: Dragdrop;
  orientation: Orientation;
  overflowContainer: HTMLElement;
  positions: number[];
  resizerContainer: HTMLElement;
  scrollContainer: HTMLElement;
  size: number[];
  start: number;
  stop: number;

  mousemoveHandle: EventListener;
  mousedownHandle: EventListener;
  mouseleaveHandle: EventListener;

  trc: Trace;

  constructor(o: ResizerConfig) {
    super();
    this.trc = new Trace('Resizer');
    this.active = false;
    this.delta = 0;
    this.dragdrop = new Dragdrop();
    this.orientation = o.orientation;
    this.overflowContainer = o.overflowContainer;
    this.positions = o.positions;
    this.resizerContainer = o.resizerContainer;
    this.scrollContainer = o.scrollContainer;
    this.size = o.size;
    this.start = o.start;
    this.stop = o.stop;

    this.mousemoveHandle = <EventListener>this.containerMousemoveHandler.bind(this);
    this.mousedownHandle = <EventListener>this.startResizerSession.bind(this);
    this.mouseleaveHandle = <EventListener>this.mouseleaveHandler.bind(this);

    this.domRefHandle = document.createElement('div');
    this.domRefHandle.className = `${this.orientation}-resizer`;
    this.domRefHandle.id = 'resizer';
    this.domRefHandle.style.top = `0px`
    this.domRefHandle.style.left = `0px`
    this.domRefHandle.style.height = `${this.size[1]}px`
    this.domRefHandle.style.width = `${this.size[0]}px`
    o.ref.append(this.domRefHandle);

    this.domRefLine = document.createElement('div');
    this.domRefLine.className = `${this.orientation}-resizer-line`;
    this.domRefLine.id = `resizer-line`;
    this.domRefLine.style.top = `25px`;
    this.domRefLine.style.left = `0px`;
    // this.domRefLine.style.height = `${this.overflowContainer.offsetHeight}px`;
    // this.domRefLine.style.height = `${50}px`;
    this.domRefLine.style.height = `${parseInt(this.scrollContainer.style.height, 10)}px`;
    this.domRefLine.style.width = `1px`;
    o.ref.append(this.domRefLine);

    // register event handler
    this.resizerContainer.addEventListener('mousemove', this.mousemoveHandle);
    this.domRefHandle.addEventListener('mousedown', this.mousedownHandle);
    this.domRefHandle.addEventListener('mouseleave', this.mouseleaveHandle);
  }

  startResizerSession(event: MouseEvent) {
    this.active = true;
    this.show();
    this.dragdrop.startSession(event, 'DIV');

    this.dragdrop.addEventListener('drag', ((e: CustomEvent) => {
      this.resize(event);
    }) as EventListener)
    this.dragdrop.addEventListener('release', ((e: CustomEvent) => {
      this.stopResizerSession(event);
    }) as EventListener);

    if (this.domRefHandle) {
      this.domRefHandle.removeEventListener('mouseleave', this.mouseleaveHandle);
    }
  }

  resize(event: MouseEvent) {
    let pos: number = -1;
    if (this.orientation == Orientation.horizontal) {
      this.delta = this.dragdrop.getDeltaX();
      pos = this.dragdrop.getStartX() + this.dragdrop.getDeltaX() - this.overflowContainer.offsetLeft;
      // this.trc.log(`pos: ${pos}`);
      // this.trc.log(`deltaX = ${this.dragdrop.getDeltaX()}`);
    }
    if (this.orientation == Orientation.vertical) {
      pos = this.dragdrop.getStartY() + this.dragdrop.getDeltaY() - this.overflowContainer.offsetTop;
    }
    if (pos > -1) {
      if (pos < this.start) {
        pos = this.start;
      }
      else if (pos > this.stop) {
        pos = this.stop;
      }
      this.move(pos);
      this.dispatchEvent(new CustomEvent('resize', { detail: { delta: this.delta } }));
    }
  }

  stopResizerSession(event: MouseEvent) {
    if (this.domRefHandle) {
      this.domRefHandle.addEventListener('mouseleave', this.mouseleaveHandle);
    }
    this.active = false;
    this.hide();

    this.dispatchEvent(new CustomEvent('release', { detail: {} }));
  }
  //
  // track mouse movement on the table row/column header and display a resizer
  // when hovering over a cell border
  //
  containerMousemoveHandler(event: WheelEvent) {
    let found = false;
    if (!this.active) {
      for (var i = 0; i < this.positions.length; i++) {
        if (event.clientX + this.scrollContainer.scrollLeft -
          this.resizerContainer.offsetLeft >
          this.positions[i] - 3 && event.clientX + this.scrollContainer.scrollLeft -
          this.resizerContainer.offsetLeft <
          this.positions[i] + 3) {
          this.show();
          this.move(this.positions[i] - this.scrollContainer.scrollLeft + this.resizerContainer.offsetLeft);
          found = true;
          break;
        }
      }
      if (!found) {
        this.hide();
      }
    }
  }
  mouseleaveHandler(event: MouseEvent) {
    this.hide();
  }
  move(pos: number) {
    // this.trc.log('ResizeHandle move');
    if (this.orientation == Orientation.horizontal) {
      this.domRefHandle.style.left = `${pos - this.size[0] / 2}px`;
      this.domRefLine.style.left = `${pos}px`;
    }
    else if (this.orientation == Orientation.vertical) {
      this.domRefHandle.style.top = `${pos}px`;
      this.domRefLine.style.top = `${pos}px`;
    }
  }
  hide() {
    // this.trc.log('ResizeHandle hide');
    if (this.domRefHandle && this.domRefLine) {
      this.domRefHandle.style.display = 'none';
      this.domRefLine.style.display = 'none';
    }
  }
  show() {
    // this.trc.log('ResizeHandle show');
    this.domRefHandle.style.display = 'block';
    if (this.active) {
      this.domRefLine.style.display = 'block';
    }
  }
}