import { Trace } from './Trace';
import { Utils } from './Utils';

export { SelectRectangle };

class SelectRectangle {
  private top: number = 0;
  private left: number = 0;
  private height: number = 0;
  private width: number = 0;

  private from: HTMLElement | null = null;
  private to: HTMLElement | null = null;

  private ref: HTMLElement;
  private borderRef: HTMLElement[] = [];
  private resizerRef: HTMLElement;

  private scrollLeft = 0;
  private scrollTop = 0;
  
  private changed: boolean = false;
  private visible: boolean = false;

  trc: Trace;
  utils: Utils;

  constructor(domRef: HTMLElement) {
    this.trc = new Trace('SelectRectangle');
    this.utils = Utils.getInstance();

    this.ref = document.createElement('div');
    this.ref.id = 'select-rect';
    this.ref.className = 'select-rect';
    domRef.append(this.ref);
    
    this.resizerRef = document.createElement('div');
    this.resizerRef.id = 'select-rect-resizer';
    this.resizerRef.className = 'select-rect-resizer';
    domRef.append(this.resizerRef);
    
    this.borderRef[0] = document.createElement('div');
    this.borderRef[0].id = 'select-rect-border-top';
    this.borderRef[0].className = 'select-rect-border';
    domRef.append(this.borderRef[0]);

    this.borderRef[1] = document.createElement('div');
    this.borderRef[1].id = 'select-rect-border-right';
    this.borderRef[1].className = 'select-rect-border';
    domRef.append(this.borderRef[1]);

    this.borderRef[2] = document.createElement('div');
    this.borderRef[2].id = 'select-rect-border-bottom';
    this.borderRef[2].className = 'select-rect-border';
    domRef.append(this.borderRef[2]);

    this.borderRef[3] = document.createElement('div');
    this.borderRef[3].id = 'select-rect-border-left';
    this.borderRef[3].className = 'select-rect-border';

    domRef.append(this.borderRef[3]);
  }

  update(from: HTMLElement | null, to: HTMLElement | null) {
    let changed = false;
    if (from || to) {
      if (from) {
        let h = document.getElementById(from.id);
        if (h) {
          this.setFrom(h);
        }
        let f = document.getElementById((<HTMLElement>this.from).id);
        if (f !== this.getFrom()) {
          this.setFrom(f);
          changed = true;
          this.trc.log(`from = ${(<HTMLElement>this.from).id}`);
        }
      }
      if (to) {
        let h = document.getElementById(to.id);
        if (h) {
          this.setTo(h);
        }
        let t = document.getElementById((<HTMLElement>this.to).id);
        if (t !== this.getTo()) {
          this.setTo(t);
          changed = true;
          this.trc.log(`to = ${(<HTMLElement>this.to).id}`);
        }
      }
      else {
        this.setTo(this.getFrom());
        this.trc.log(`from = to`);
      }
    }
  // this.trc.log(`changed: ${changed}, from: ${from}, to: ${to}`);
  if (this.changed/* && this.getFrom() !== undefined && this.getTo() !== undefined*/) {
  // if (this.getFrom() !== undefined && this.getTo() !== undefined) {
    from = this.getFrom();
    to = this.getTo();
    
    if (from && to) {
      // this.trc.log(`from = ${from.id}, to = ${to.id}`);
      var position = this.utils.getRect(from, to);

      this.top = position.top;
      this.left = position.left;
      this.height = position.height;
      this.width = position.width;

      if (from.getAttribute('id') === to.getAttribute('id')) {
        this.ref.style.display = 'none';
      }
      else {
        this.ref.style.top = `${this.top}px`;
        this.ref.style.left = `${this.left}px`;
        this.ref.style.height = `${this.height}px`;
        this.ref.style.width = `${this.width}px`;
        this.ref.style.display = 'block';
        this.show();

      }
      this.borderRef[0].style.top = `${(this.top - 1 < this.scrollTop) ? this.top : this.top - 1}px`;
      this.borderRef[0].style.left = `${this.left}px`;
      this.borderRef[0].style.height = `1px`;
      this.borderRef[0].style.width = `${this.width}px`;
      this.borderRef[0].style.display = 'block';

      this.borderRef[1].style.top = `${this.top}px`;
      this.borderRef[1].style.left = `${this.left + this.width}px`;
      this.borderRef[1].style.height = `${this.height}px`;
      this.borderRef[1].style.width = `${1}px`;
      this.borderRef[1].style.display = 'block';

      this.borderRef[2].style.top = `${this.top + this.height}px`;
      this.borderRef[2].style.left = `${this.left}px`;
      this.borderRef[2].style.height = `${1}px`;
      this.borderRef[2].style.width = `${this.width}px`;
      this.borderRef[2].style.display = 'block';

      this.borderRef[3].style.top = `${this.top}px`;
      this.borderRef[3].style.left = `${(this.left - 1 < this.scrollLeft) ? this.left : this.left - 1}px`;
      this.borderRef[3].style.height = `${this.height}px`;
      this.borderRef[3].style.width = `${1}px`;
      this.borderRef[3].style.display = 'block';

      this.resizerRef.style.top = `${this.top + this.height - 3}px`;
      this.resizerRef.style.left = `${this.left + this.width - 3}px`;
      this.resizerRef.style.display = 'block';
    }
  }
};
hide() {
  // this.ref.style.display = 'none';
  this.borderRef[0].style.display = 'none';
  this.borderRef[1].style.display = 'none';
  this.borderRef[2].style.display = 'none';
  this.borderRef[3].style.display = 'none';
  this.visible = false;
};
show() {
  // this.ref.display = 'block';
  this.borderRef[0].style.display = 'block';
  this.borderRef[1].style.display = 'block';
  this.borderRef[2].style.display = 'block';
  this.borderRef[3].style.display = 'block';
  this.visible = true;
};
getFrom(): HTMLElement | null {
  return this.from;
}
setFrom(from: HTMLElement | null) {
  if (from !== this.getFrom()) {
    this.from = from;
    this.changed = true;
    if (from) this.trc.log(`setFrom: ${from.id}, changed`);
  }
  else {
    this.changed = false;
  }
  // this.trc.log(`from = ${this.from.id}, changed = ${this.changed}`);
}
getTo(): HTMLElement | null {
  return this.to;
}
setTo(to: HTMLElement | null) {
  if (to !== this.getTo()) {
    this.to = to;
    this.changed = true;
  }
  else {
    this.changed = false;
  }
  // this.trc.log(`to = ${this.to.id}, changed = ${this.changed}`);
}
setScrollPosition(position: {top: number, left: number}) {
  this.scrollTop = position.top;
  this.scrollLeft = position.left;
};
}
