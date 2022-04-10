export { Utils };

type Rect = {
  top: number;
  left: number;
  height: number;
  width: number;
}

class Utils {
  static getRect(sourceTarget: HTMLElement, currentTarget: HTMLElement):Rect {
    let rect: Rect = {
      top: -1,
      left: -1,
      height: -1,
      width: -1,
    };
    if (currentTarget === null) {
      debugger;
    }
    var srcPos = { left: sourceTarget.offsetLeft, top: sourceTarget.offsetTop };
    var curPos = { left: currentTarget.offsetLeft, top: currentTarget.offsetTop };

    if (srcPos.top <= curPos.top) {
      rect.top = srcPos.top;
      rect.height = curPos.top - srcPos.top + currentTarget.clientHeight;
    }
    else {
      rect.top = curPos.top;
      rect.height = srcPos.top - curPos.top + sourceTarget.clientHeight;
    }
    if (srcPos.left <= curPos.left) {
      rect.left = srcPos.left;
      rect.width = curPos.left - srcPos.left + currentTarget.clientWidth;
    }
    else {
      rect.left = curPos.left;
      rect.width = srcPos.left - curPos.left + sourceTarget.clientWidth;
    }
    //    console.log('srcPos.left: ' + srcPos.left + ', curPos.left: ' + curPos.left + ', srcPos.width: ' + sourceTarget[0].clientWidth + ', curPos.width: ' + currentTarget[0].clientWidth);
    //  console.log('top: ' + rect.top + ', left: ' + rect.left + ', height: ' + rect.height + ', width: ' + rect.width);
    return rect;
  };
  static getCell(event: Event, nodeName: string | null): HTMLElement | null {
    let i = 0;
    let { target  } = event;
    if (nodeName) {
      while ((target as HTMLElement).nodeName !== nodeName) {
        (target as HTMLElement) = ((event.target as HTMLElement).parentNode as HTMLElement);
        if (i++ > 2) {
          return null;
        }
      }
    }
    return (target as HTMLElement);
  }

  static arraySum(array: number[]):Number {
    return array.reduce(function (pv, cv) { return pv + cv; }, 0);
  }

  static arrayRangeSum(array: number[], start: number, stop: number):number {
    var _rv = 0;
    for (var i = start; i <= stop; i++) {
      _rv += array[i];
    }
    return _rv;
  };

  static arrayProgressiveSum(array: number[]): number[] {
    var _rv: number[] = [];
    var s = 0;
    for (var i = 0; i < array.length; i++) {
      s = s + array[i];
      _rv[i] = s;
    }
    return _rv;
  };

  static arrayFill(value: number, count: number): number[] {
    var _rv: number[] = [];
    for (var i = 0; i < count; i++) {
      _rv.push(value);
    }
    return _rv;
  };
  static assert(cond: boolean, msg: string) {
    if (cond) {
      // console.error(msg) 
      throw(new Error(msg))
    }
  }
}
