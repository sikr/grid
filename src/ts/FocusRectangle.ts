import { Trace } from './Trace';
import { Utils } from './Utils';

export { FocusRectangle };

class FocusRectangle {
  private top: number;
  private left: number;
  private height: number;
  private width: number;

  private ref: HTMLElement[];
  private domRef: HTMLElement;

  private focusElement: HTMLElement | null;

  trc: Trace;
  utils: Utils;

  constructor(domRef: HTMLElement) {

    this.trc = new Trace('FocusRectangle');

    this.utils = Utils.getInstance();

    this.top = 0;
    this.left = 0;
    this.height = 0;
    this.width = 0;
    this.focusElement = null;
    this.ref = [];
    this.domRef = domRef;
    this.create();
  }
  create() {
    this.ref[0] = document.createElement('div');
    this.ref[0].id = 'focus-rect-top';
    this.ref[0].className = 'focus-rect';
    this.domRef.append(this.ref[0]);

    this.ref[1] = document.createElement('div');
    this.ref[1].id = 'focus-rect-right';
    this.ref[1].className = 'focus-rect';
    this.domRef.append(this.ref[1]);

    this.ref[2] = document.createElement('div');
    this.ref[2].id = 'focus-rect-bottom';
    this.ref[2].className = 'focus-rect';
    this.domRef.append(this.ref[2]);

    this.ref[3] = document.createElement('div');
    this.ref[3].id = 'focus-rect-left';
    this.ref[3].className = 'focus-rect';
    this.domRef.append(this.ref[3]);
  }
  update(element: HTMLElement) {
    if (element) {
      this.focusElement = element;

      let position = this.utils.getRect(this.focusElement, this.focusElement);

      this.top = position.top - 1;
      this.left = position.left - 1;
      this.height = position.height;
      this.width = position.width;
      
      this.ref[0].style.top = `${this.top}px`;
      this.ref[0].style.left = `${this.left}px`;
      this.ref[0].style.height = `${0}px`;
      this.ref[0].style.width = `${this.width}px`;
      this.ref[0].style.display = 'block';
  
      this.ref[1].style.top = `${this.top}px`;
      this.ref[1].style.left = `${this.left + this.width}px`;
      this.ref[1].style.height = `${this.height}px`;
      this.ref[1].style.width = `${0}px`;
      this.ref[1].style.display = 'block';
  
      this.ref[2].style.top = `${this.top + this.height}px`;
      this.ref[2].style.left = `${this.left}px`;
      this.ref[2].style.height = `${0}px`;
      this.ref[2].style.width = `${this.width}px`;
      this.ref[2].style.display = 'block';
  
      this.ref[3].style.top = `${this.top}px`;
      this.ref[3].style.left = `${this.left}px`;
      this.ref[3].style.height = `${this.height}px`;
      this.ref[3].style.width = `${0}px`;
      this.ref[3].style.display = 'block';
    }
  };
  hide() {
    this.ref[0].style.display = 'none';
    this.ref[1].style.display = 'none';
    this.ref[2].style.display = 'none';
    this.ref[3].style.display = 'none';
  };
  show() {
    this.ref[0].style.display = 'block';
    this.ref[1].style.display = 'block';
    this.ref[2].style.display = 'block';
    this.ref[3].style.display = 'block';
  };
}