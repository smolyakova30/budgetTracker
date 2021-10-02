let db;
// establish a connection 
const request = indexedDB.open('budget_tracker', 1);

// emit changes
request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore('new_transaction', { autoIncrement: true });
};

// successful request
request.onsuccess = function(event) {
    // when db is successfully created with object 
    db = event.target.result;
    // app is online or not
    if (navigator.onLine) {
      uploadTransaction();
    }
  };
  
request.onerror = function(event) {
    //error
console.log(event.target.errorCode);
};

// run if transaction is attemotedand and we have no internet connection
function saveRecord(record) {
    // open a new transaction with the database with read and write permissions 
    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    // access the object store for transaction
    const budgetObjectStore = transaction.objectStore('new_transaction');
  
    // add record to your store with add method
    budgetObjectStore.add(record);
};

// collect all data 
function uploadTransaction() {
    // open transaction on your db
    const transaction = db.transaction(['new_transaction'], 'readwrite');
  
    // access object store
    const budgetObjectStore = transaction.objectStore('new_transaction');
  
    // get transactions set to a variable
    const getAll = budgetObjectStore.getAll();
  
    // upon a successful .getAll() execution
    getAll.onsuccess = function() {
    // if w hve data, send API
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
        .then(response => response.json())
        .then(serverResponse => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          // open another transaction
          const transaction = db.transaction(['new_transaction'], 'readwrite');
          // access the object store
          const budgetObjectStore = transaction.objectStore('new_transaction');
          // clear all items in your store
          budgetObjectStore.clear();

          alert('All saved transactions has been submitted!');
        })
        .catch(err => {
          console.log(err);
        });
    }
  }
}

// listen for app coming back online
window.addEventListener('online', uploadTransaction);