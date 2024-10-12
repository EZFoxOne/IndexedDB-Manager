class DatabaseManager {
    constructor(databaseName = 'ldb', version = 1, storeName = 's', keyPath = 'k') {
        this.db = null;
        this.ready = false;
        this.databaseName = databaseName;
        this.version = version;
        this.storeName = storeName;
        this.keyPath = keyPath;
    }

    /**
     * Initializes the IndexedDB connection and sets up the database.
     * @returns {Promise<void>}
     */
    init() {
        return new Promise((resolve, reject) => {
            const win = typeof window !== 'undefined' ? window : {};
            const indexedDB = win.indexedDB || win.mozIndexedDB || win.webkitIndexedDB || win.msIndexedDB;

            if (typeof window !== 'undefined' && !indexedDB) {
                reject(new Error('IndexedDB not supported'));
                return;
            }

            const request = indexedDB.open(this.databaseName, this.version);
            request.onsuccess = (evt) => {
                this.db = evt.target.result;
                this.ready = true;
                resolve();
            };

            request.onerror = (event) => {
                reject(new Error('IndexedDB request error', { cause: event }));
            };

            request.onupgradeneeded = (event) => {
                this.db = null;
                const store = event.target.result.createObjectStore(this.storeName, {
                    keyPath: this.keyPath,
                });

                store.transaction.oncomplete = (e) => {
                    this.db = e.target.db;
                    resolve();
                };
            };
        });
    }

    /**
     * Checks if the IndexedDB is supported in the current environment.
     * @returns {boolean}
     */
    static isSupported() {
        return typeof window !== 'undefined' && ('indexedDB' in window);
    }

    _waitForDB() {
        return new Promise((resolve) => {
            if (!this.db) {
                const interval = setInterval(() => {
                    if (this.db) {
                        clearInterval(interval);
                        resolve();
                    }
                }, 50);
            } else {
                resolve();
            }
        });
    }

    /**
     * Retrieves a value from the IndexedDB based on the provided key.
     * @param {string} key - The key to search for in the store.
     * @returns {Promise<any>} - A promise that resolves with the value or null.
     */
    async get(key) {
        await this._waitForDB();
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction('s');
            const request = transaction.objectStore('s').get(key);

            request.onsuccess = (event) => {
                const result = (event.target.result && event.target.result['v']) || null;
                resolve(result);
            };

            request.onerror = (event) => {
                reject(new Error('Error getting the value from IndexedDB', { cause: event }));
            };
        });
    }

    /**
     * Sets a key-value pair in the IndexedDB.
     * @param {string} key - The key for the entry.
     * @param {any} value - The value to store.
     * @returns {Promise<void>}
     */
    async set(key, value) {
        if (typeof key !== 'string' || key.trim() === '') {
            throw new Error('Invalid key');
        }
        if (value === undefined) {
            throw new Error('Value cannot be undefined');
        }

        await this._waitForDB();
        return new Promise((resolve, reject) => {
            const txn = this.db.transaction('s', 'readwrite');
            txn.oncomplete = () => resolve();

            txn.onerror = (event) => {
                reject(new Error('Error setting the value in IndexedDB', { cause: event }));
            };

            txn.objectStore('s').put({ k: key, v: value });
            txn.commit();
        });
    }

    /**
     * Deletes an entry from the IndexedDB based on the provided key.
     * @param {string} key - The key of the entry to delete.
     * @returns {Promise<void>}
     */
    async delete(key) {
        await this._waitForDB();
        return new Promise((resolve, reject) => {
            const request = this.db.transaction('s', 'readwrite').objectStore('s').delete(key);

            request.onsuccess = () => resolve();

            request.onerror = (event) => {
                reject(new Error('Error deleting the value from IndexedDB', { cause: event }));
            };
        });
    }

    /**
     * Lists all keys in the IndexedDB store.
     * @returns {Promise<string[]>} - A promise that resolves with an array of keys.
     */
    async list() {
        await this._waitForDB();
        return new Promise((resolve, reject) => {
            const request = this.db.transaction('s').objectStore('s').getAllKeys();

            request.onsuccess = (event) => resolve(event.target.result || []);

            request.onerror = (event) => {
                reject(new Error('Error listing keys from IndexedDB', { cause: event }));
            };
        });
    }

    /**
     * Retrieves all entries from the IndexedDB store.
     * @returns {Promise<any[]>} - A promise that resolves with an array of values.
     */
    async getAll() {
        await this._waitForDB();
        return new Promise((resolve, reject) => {
            const request = this.db.transaction('s').objectStore('s').getAll();

            request.onsuccess = (event) => resolve(event.target.result || []);

            request.onerror = (event) => {
                reject(new Error('Error getting all values from IndexedDB', { cause: event }));
            };
        });
    }

    /**
     * Clears all entries from the IndexedDB store.
     * @returns {Promise<void>}
     */
    async clear() {
        await this._waitForDB();
        return new Promise((resolve, reject) => {
            const request = this.db.transaction('s', 'readwrite').objectStore('s').clear();

            request.onsuccess = () => resolve();

            request.onerror = (event) => {
                reject(new Error('Error clearing the object store in IndexedDB', { cause: event }));
            };
        });
    }

    /**
     * Sets multiple key-value pairs in the IndexedDB.
     * @param {Array<{ key: string, value: any }>} entries - An array of key-value pairs.
     * @returns {Promise<void>}
     */
    // This is completely untested
    async setAll(entries) {
        await this._waitForDB();
        return new Promise((resolve, reject) => {
            const txn = this.db.transaction('s', 'readwrite');
            txn.oncomplete = () => resolve();

            txn.onerror = (event) => {
                reject(new Error('Error setting values in IndexedDB', { cause: event }));
            };

            const store = txn.objectStore('s');
            entries.forEach(({ key, value }) => {
                store.put({ k: key, v: value });
            });
            txn.commit();
        });
    }
}

// If using in a browser environment, attach to window
// NOTE: You might not want this and can just delete or comment this code out
if (typeof window !== 'undefined') {
    window.databaseManager = new DatabaseManager();
}

// If using in a Node.js environment, export the class
if (typeof module !== 'undefined') {
    module.exports = DatabaseManager;
}
