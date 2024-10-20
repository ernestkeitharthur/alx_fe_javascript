// Initialize quotes from local storage or default array
let quotes = JSON.parse(localStorage.getItem('quotes')) || [];

// Simulate a server endpoint using JSONPlaceholder
const SERVER_URL = 'https://jsonplaceholder.typicode.com/posts';

// Load last selected category filter from local storage
const lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';

// When the page loads, initialize the app
window.onload = function () {
  populateCategories();
  filterQuotes();
  fetchQuotesFromServer(); // Sync data on load
  setInterval(fetchQuotesFromServer, 60000); // Periodic sync every 60 seconds
};

// Function to fetch quotes from the "server" (mock API)
async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const serverQuotes = await response.json();
    
    // Simulate using 'title' and 'body' from server data as quote properties
    const formattedQuotes = serverQuotes.map(item => ({
      text: item.title,
      category: item.body.substring(0, 15) // Use part of 'body' as category
    }));

    // Conflict resolution: Server data takes precedence
    quotes = formattedQuotes;
    saveQuotes(); // Update local storage with server data
    populateCategories();
    filterQuotes();

    alert('Quotes synchronized with the server.');
  } catch (error) {
    console.error('Error fetching data from server:', error);
  }
}

// Function to post new quotes to the server
async function syncNewQuoteWithServer(quote) {
  try {
    const response = await fetch(SERVER_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quote)
    });

    if (response.ok) {
      console.log('Quote successfully synced with server:', quote);
    } else {
      console.warn('Failed to sync quote with server.');
    }
  } catch (error) {
    console.error('Error syncing quote with server:', error);
  }
}

// Function to add a new quote
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText === '' || newQuoteCategory === '') {
    alert('Please enter both a quote and a category.');
    return;
  }

  const newQuote = { text: newQuoteText, category: newQuoteCategory };
  
  // Add new quote locally and sync with server
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

// Populate categories dynamically
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

// Filter and display quotes based on the selected category
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

// Create the 'Add Quote' form dynamically
function createAddQuoteForm() {
  const formContainer = document.getElementById('addQuoteForm');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

// Export quotes as a JSON file
document.getElementById('exportJson').addEventListener('click', function() {
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

// Initialize the form and populate categories
createAddQuoteForm();
