import { Utils } from './Utils';
export { DragDrop };

class DragDrop extends EventTarget {
  domRef: HTMLElement | null;
  currentTarget: HTMLElement | null;

  deltaX: number;
  deltaY: number;
  startX: number;
  startY: number;

  mousemoveHandlerRef: EventListener | null;
  mouseupHandlerRef: EventListener | null;

  constructor() {
    super();
    this.domRef = null;
    this.deltaX = -1;
    this.deltaY = -1;
    this.startX = -1;
    this.startY = -1;
    this.currentTarget = null;

    this.mousemoveHandlerRef = null;
    this.mouseupHandlerRef = null;
  };

  getStartX(): number {
    return this.startX;
  }
  getStartY(): number {
    return this.startY;
  }
  getDeltaX(): number {
    return this.deltaX;
  }
  getDeltaY(): number {
    return this.deltaY;
  }

  startSession(event: MouseEvent, nodeName: string | null) {
    this.domRef = Utils.getCell(event, nodeName);
    this.startX = event.clientX;
    this.startY = event.clientY;

    this.mouseupHandlerRef = <EventListener>this.stopSession.bind(this);
    window.addEventListener('mouseup', this.mouseupHandlerRef);

    this.mousemoveHandlerRef = <EventListener>this.drag.bind(this);
    window.addEventListener('mousemove', this.mousemoveHandlerRef);
  };

  drag(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();

    this.deltaX = event.clientX - this.startX;
    this.deltaY = event.clientY - this.startY;

    // only notify the subscriber when the target element has changed; should
    // probably be made selectable by the subscriber, e. g. property "filter"
    // if (this.currentTarget !== event.target) {
      this.dispatchEvent(new CustomEvent('drag', { detail: { deltaX: this.deltaX, deltaY: this.deltaY, target: event.target } }));
      this.currentTarget = <HTMLElement>event.target;
    // }
  };

  stopSession(event: MouseEvent) {
    if (this.mousemoveHandlerRef) {
      window.removeEventListener('mousemove', this.mousemoveHandlerRef);
    }
    if (this.mouseupHandlerRef) {
      window.removeEventListener('mouseup', this.mouseupHandlerRef);
    }
    this.dispatchEvent(new CustomEvent('release', { detail: {} }));
  };
}
