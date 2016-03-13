// Code from this article: 
//     http://lathonez.github.io/2016/ionic-2-unit-testing/
// and this github repository:
//     https://github.com/lathonez/clicker

'use strict';

export class TestUtils {

  // http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript
  public static eventFire(el: any, etype: string): void {
    if (el.fireEvent) {
      el.fireEvent('on' + etype);
    } else {
      let evObj: any = document.createEvent('Events');
      evObj.initEvent(etype, true, false);
      el.dispatchEvent(evObj);
    }
  }
}
