// Initialize quotes from local storage or use an empty array
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

// Simulate a server endpoint using JSONPlaceholder
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Retrieve last selected category from local storage
const lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';

// On page load, initialize app components
window.onload = function () {
  populateCategories();
  filterQuotes();
  syncQuotes(); // Initial sync with the server
  setInterval(syncQuotes, 60000); // Periodic sync every 60 seconds
};

// Function to sync local data with server data
async function syncQuotes() {
  try {
    console.log('Syncing quotes with the server...');
    const serverQuotes = await fetchQuotesFromServer();

    // Conflict resolution: Merge and prioritize server quotes
    const mergedQuotes = mergeQuotes(quotes, serverQuotes);

    // Save merged quotes to local storage
    quotes = mergedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();

    console.log('Quotes synced with server!'); // Notification message
    alert('Quotes synced with server!');
  } catch (error) {
    console.error('Error during quote sync:', error);
  }
}

// Fetch quotes from the server
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();

    // Map server data to match the quote structure
    return data.map(item => ({
      text: item.title,
      category: item.body.substring(0, 15), // Use part of body text as category
    }));
  } catch (error) {
    console.error('Error fetching quotes from server:', error);
    return [];
  }
}

// Merge local and server quotes, giving priority to server data
function mergeQuotes(localQuotes, serverQuotes) {
  const allQuotes = [...serverQuotes, ...localQuotes];

  // Filter out duplicate quotes based on their text
  const uniqueQuotes = Array.from(
    new Map(allQuotes.map(quote => [quote.text, quote])).values()
  );

  return uniqueQuotes;
}

// Add a new quote and sync it with the server
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText === '' || newQuoteCategory === '') {
    alert('Please enter both a quote and a category.');
    return;
  }

  const newQuote = { text: newQuoteText, category: newQuoteCategory };

  // Add the new quote locally and sync with the server
  quotes.push(newQuote);
  saveQuotes();
  syncNewQuoteWithServer(newQuote);

  populateCategories();
  alert('New quote added and synced with the server!');
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Sync a newly added quote with the server
async function syncNewQuoteWithServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote),
    });

    if (response.ok) {
      console.log('New quote synced with the server:', quote);
    } else {
      console.warn('Failed to sync new quote with the server.');
    }
  } catch (error) {
    console.error('Error syncing new quote with the server:', error);
  }
}

// Populate category options dynamically
function populateCategories() {
  const categories = [...new Set(quotes.map(quote => quote.category))];
  const categoryFilter = document.getElementById('categoryFilter');

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  categoryFilter.value = lastSelectedCategory;
}

// Filter quotes based on the selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(quote => quote.category === selectedCategory);

  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = '';

  filteredQuotes.forEach(quote => {
    const quoteElem = document.createElement('p');
    quoteElem.innerHTML = `"${quote.text}" <strong>(${quote.category})</strong>`;
    quoteDisplay.appendChild(quoteElem);
  });

  localStorage.setItem('lastSelectedCategory', selectedCategory);
}

// Create the 'Add Quote' form
function createAddQuoteForm() {
  const formContainer = document.getElementById('addQuoteForm');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

// Export quotes as a JSON file
document.getElementById('exportJson').addEventListener('click', function () {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'quotes.json';
  a.click();
  URL.revokeObjectURL(url);
});

// Import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format.');
      }
    } catch (error) {
      alert('Error reading JSON file.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize the form on page load
createAddQuoteForm();
