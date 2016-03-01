import {Page, Platform} from 'ionic-framework/ionic';
import {IndexedDB} from '../../providers/indexed-db';

// we could just store keys in this tree.... 

// then we just pick up what we need from the store

// this is mellow on memory (if the tree gets very large)

// this is scalable to when we start using the cloud

// you must always ask: how large can the tree really get: maybe it won't get
// that large, ever.  can the tree have several thousand items?  ok and if so...
// several thousand is not much for computers.  it won't have 100,000 items. 
// if it does have 100,000 files (recordings) then perhaps we need to worry.

// at first, we don't need to worry about this.  by the time we'll need to worry
// about this, the software will have been refactored 1000 times...


const MOCK_DATA = {
    name: 'Root',
    content: [{
        name: 'Funk',
        content: [
            {
                name: '',
                size: 100,
                type: 'ogg',
                duration: 1000,
                date: 123456789
            }, {
                name: '',
                size: 200,
                type: 'ogg',
                duration: 2000,
                date: 123456788
            }, {
                name: '',
                size: 300,
                type: 'ogg',
                duration: 3000,
                date: 123456787
            }, {
                name: 'Band practice',
                content: [
                    {
                        name: '',
                        size: 400,
                        type: 'ogg',
                        duration: 4000,
                        date: 123456786
                    }, {
                        name: '',
                        size: 500,
                        type: 'ogg',
                        duration: 5000,
                        date: 123456785
                    }, {
                        name: '',
                        size: 600,
                        type: 'ogg',
                        duration: 6000,
                        date: 123456784
                    }
                ]
            }
        ]
    }]
};

// here's what it looks like by just getting indices: an array of arrays
// this is better 
const MOCK_DATA = {
    name: 'Root',
    content: [
        {
            name: 'Funk',
            content: [
                1, 2, 3,
                {
                    name: 'band practice',
                    content: [4, 5, 6]
                },
                7
            ]
        }
    ]
};

class BlobData {
    title: string;
    duration: number;
    timestamp: number;
    blob: Blob;
}

class Folder {
    title: string;
    content: Array<BlobData>
}

@Page({
    templateUrl: 'build/pages/library/library.html'
})
export class LibraryPage {
    private currentFolder: 
    constructor(private platform: Platform, private indexedDB: IndexedDB) {
        
    }
    
    getFolderItems() {
        
    }
}