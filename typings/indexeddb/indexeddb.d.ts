// indexeddb.d.ts - locally added type definitions to avoid
// compiler warnings

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
    blob: Blob;
}