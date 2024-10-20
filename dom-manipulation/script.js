// Array of quotes with text and category, initialized from local storage if available
let quotes = JSON.parse(localStorage.getItem('quotes')) || [
  { text: "The best way to predict the future is to create it.", category: "Inspiration" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" }
];

// Load the last viewed quote from session storage (if any)
window.onload = function() {
  const lastViewedQuote = sessionStorage.getItem('lastViewedQuote');
  if (lastViewedQuote) {
    document.getElementById('quoteDisplay').innerHTML = lastViewedQuote;
  }
};

// Function to display a random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const quoteDisplay = `<p>"${quote.text}"</p><p><strong>Category:</strong> ${quote.category}</p>`;
  document.getElementById('quoteDisplay').innerHTML = quoteDisplay;

  // Save the displayed quote in session storage
  sessionStorage.setItem('lastViewedQuote', quoteDisplay);
}

// Event listener for the 'Show New Quote' button
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

// Function to add a new quote and save it to local storage
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

  // Clear the input fields and provide feedback
  document.getElementById('newQuoteText').value = '';
  document.getElementById('newQuoteCategory').value = '';
  alert('New quote added successfully!');
}

// Save the quotes array to local storage
function saveQuotes() {
  localStorage.setItem('quotes', JSON.stringify(quotes));
}

// Function to export quotes as a JSON file
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

// Function to import quotes from a JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function(e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
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

// Initialize the application
createAddQuoteForm();
