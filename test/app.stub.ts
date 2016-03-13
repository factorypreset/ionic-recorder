// Stub out the @App decorator provided by Ionic
// This allows us to test app.ts (thus providing a full coverage report as app.ts must include everything)
// which otherwise blows up in the browser on "ion-app selector cannot be found"
//
// https://www.sitepen.com/blog/2015/10/20/typescript-decorators/
//

// Code from this article: 
//     http://lathonez.github.io/2016/ionic-2-unit-testing/
// and this github repository:
//     https://github.com/lathonez/clicker

export function App<TFunction extends Function>(target: TFunction): TFunction {
    let newConstructor = function () {
    	// no-op
    };

    return <any> newConstructor;
}
