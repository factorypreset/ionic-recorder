// locally added type definitions to avoid compiler warnings

//
// local-db.ts compiler warnings fixes:
//

interface IDBEventTarget extends EventTarget {
    result: number;
}

interface IDBEvent extends Event {
    target: IDBEventTarget;
}

interface IDBErrorEventTarget extends EventTarget {
    errorCode: number;
}

interface IDBErrorEvent extends Event {
    target: IDBErrorEventTarget;
}

interface DBItem {
    name: string;
    parentKey: number;
    date: number;
    data: any;
}

//
// record.ts compiler warnings fixes:
//

// needed to cast at onSliderChange() below to avoid type warnings
interface RangeInputEventTarget extends EventTarget {
    value: number;
}
