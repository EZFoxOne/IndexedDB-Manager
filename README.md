# DatabaseManager

A simple class to manage IndexedDB operations.

## Features

- Initialize the IndexedDB.
- Set, get, delete, and list key-value pairs.
- Bulk operations for setting multiple entries.
- Retrieve all entries or clear the store.

## Example Usage

### 1. Basic Initialization

*NOTE*: If using in an HTML file, just simply include the <script src=""> tag with the appropriate location of the file

```javascript
const DatabaseManager = require('./DatabaseManager'); //

const dbManager = new DatabaseManager('myDatabase', 1, 'myStore', 'id');

dbManager.init().then(() => {
    console.log('Database initialized and ready to use');
}).catch(err => {
    console.error('Error initializing the database:', err);
});
```
### 2. Set a value in the store
```javascript
dbManager.set('username', 'johnDoe').then(() => {
    console.log('Value set successfully');

    // Get the value from the store
    return dbManager.get('username');
}).then(value => {
    console.log('Retrieved value:', value);
}).catch(err => {
    console.error('Error setting or getting the value:', err);
});
```
### 3. Delete a value in the store
```javascript
dbManager.delete('username').then(() => {
    console.log('Value deleted successfully');
}).catch(err => {
    console.error('Error deleting the value:', err);
});
```
### 4. List all keys in the store
```javascript
dbManager.list().then(keys => {
    console.log('Keys in the store:', keys);
}).catch(err => {
    console.error('Error listing keys:', err);
});
```
### 5. Retrieve all entries from the store
```javascript
dbManager.getAll().then(entries => {
    console.log('All entries:', entries);
}).catch(err => {
    console.error('Error retrieving all entries:', err);
});
```
### 6. Clear all entries from the store
```javascript
dbManager.clear().then(() => {
    console.log('Store cleared successfully');
}).catch(err => {
    console.error('Error clearing the store:', err);
});
```
### 7. Bulk Setting values in the store
```javascript
dbManager.setAll([
    { key: 'name', value: 'Alice' },
    { key: 'age', value: 30 },
    { key: 'job', value: 'Developer' }
]).then(() => {
    console.log('All values set successfully');
}).catch(err => {
    console.error('Error setting multiple values:', err);
});
```
