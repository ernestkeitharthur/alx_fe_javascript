// Initialize quotes from local storage or default array
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Load last selected category from local storage
const lastSelectedCategory = localStorage.getItem('lastSelectedCategory') || 'all';

// Populate categories when the page loads
window.onload = function() {
  populateCategories();
  filterQuotes(); // Display quotes based on the saved category filter
};

// Function to populate unique categories in the dropdown
function populateCategories() {
  const categories = [...new Set(quotes.map(quote => quote.category))];
  const categoryFilter = document.getElementById('categoryFilter');

  // Clear existing options and add default "All Categories"
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  // Add unique categories as options
  categories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Set the dropdown to the last selected category
  categoryFilter.value = lastSelectedCategory;
}

// Function to filter and display quotes based on the selected category
function filterQuotes() {
  const selectedCategory = document.getElementById('categoryFilter').value;
  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(quote => quote.category === selectedCategory);

  const quoteDisplay = document.getElementById('quoteDisplay');
  quoteDisplay.innerHTML = '';

  // Display the filtered quotes
  filteredQuotes.forEach(quote => {
    const quoteElem = document.createElement('p');
    quoteElem.innerHTML = `"${quote.text}" <strong>(${quote.category})</strong>`;
    quoteDisplay.appendChild(quoteElem);
  });

  // Save the selected category to local storage
  localStorage.setItem('lastSelectedCategory', selectedCategory);
}

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const quoteDisplay = `<p>"${quote.text}"</p><p><strong>Category:</strong> ${quote.category}</p>`;
  document.getElementById('quoteDisplay').innerHTML = quoteDisplay;

  // Save the displayed quote to session storage
  sessionStorage.setItem('lastViewedQuote', quoteDisplay);
}

// Event listener for 'Show New Quote' button
document.getElementById('newQuote').addEventListener('click', showRandomQuote);

// Function to dynamically create the 'Add Quote' form
function createAddQuoteForm() {
  const formContainer = document.getElementById('addQuoteForm');
  formContainer.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button onclick="addQuote()">Add Quote</button>
  `;
}

// Function to add a new quote and update storage
function addQuote() {
  const newQuoteText = document.getElementById('newQuoteText').value;
  const newQuoteCategory = document.getElementById('newQuoteCategory').value;

  if (newQuoteText === '' || newQuoteCategory === '') {
    alert('Please enter both a quote and a category.');
    return;
  }

  // Add the new quote to the array and update local storage
  quotes.push({ text: newQuoteText, category: newQuoteCategory });
  saveQuotes();

  // Clear input fields and refresh the categories
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  populateCategories(); // Refresh dropdown
  alert('New quote added successfully!');
}

// Save the quotes array to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
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
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories(); // Refresh categories
        alert('Quotes imported successfully!');
      } else {
        alert('Invalid JSON format. Please upload a valid quotes file.');
      }
    } catch (error) {
      alert('Error reading JSON file. Please try again.');
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize the app by creating the form and populating categories
createAddQuoteForm();
