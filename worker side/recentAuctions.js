// Variables to hold auction data
let minPrice = 100;  // Starting minimum price
let timerDuration = 10;  // Auction timer in seconds (10 minutes)
let auctionEnded = false; // Variable to track if the auction has ended

// DOM Elements
const timerElement = document.getElementById('timer');
const minPriceElement = document.getElementById('min-price');
const placeBidButton = document.getElementById('place-bid');
const bidAmountInput = document.getElementById('bid-amount');
const bidsList = document.getElementById('bids-list');
const errorMessage = document.getElementById('error-message'); // Add an element to show error messages

// Function to update the timer
function updateTimer() {
    if (timerDuration <= 0) {
        auctionEnded = true;
        timerElement.textContent = "Auction Ended!";
        placeBidButton.disabled = true;  // Disable the "Place Bid" button when auction ends
        placeBidButton.classList.add('disabled'); // Add a class to show visual cue for disabled state
        
        return;  // Exit the function to stop further execution
    }

    const minutes = Math.floor(timerDuration / 60);
    const seconds = timerDuration % 60;
    timerElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Decrease the timer by 1 second
    timerDuration--;
}

// Function to place a bid
function placeBid() {
    // If the auction has ended, don't allow placing a bid
    if (auctionEnded) {
        showErrorMessage("The auction has ended. Bidding is no longer allowed.");
        return;  // Prevent placing the bid
    }

    const bidAmount = parseFloat(bidAmountInput.value);

    // If input is empty or invalid
    if (isNaN(bidAmount) || bidAmount <= 0) {
        alert("Please enter a valid bid amount.");
        return;
    }

    // Check if the bid is greater than or equal to the current minimum price
    if (bidAmount >= minPrice) {
        showErrorMessage("Bid must be less than the current minimum price.");
        return;  // Prevent placing the bid if it's greater than or equal to the minimum price
    }

    // Clear any previous error message
    hideErrorMessage();

    // If the bid is lower than the current minimum price, update the minimum price
    minPrice = bidAmount;
    minPriceElement.textContent = `Minimum Price: $${minPrice.toFixed(2)}`;

    // Add the bid to the list of bids
    const listItem = document.createElement('li');
    listItem.innerHTML = `Bid: $${bidAmount.toFixed(2)} <span>(by You)</span>`;
    listItem.classList.add('bid-entry');  // Add a class to style bids with transitions
    bidsList.appendChild(listItem);

    // Trigger a smooth fade-in effect for new bids
    setTimeout(() => {
        listItem.classList.add('visible');
    }, 50);  // Small delay to allow the class to be added for transition

    // Clear the bid input field
    bidAmountInput.value = '';
}

// Show error message
function showErrorMessage(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';  // Make error message visible
    errorMessage.classList.add('visible');  // Add class for transition effects (fade-in)
}

// Hide error message
function hideErrorMessage() {
    errorMessage.style.display = 'none';  // Hide error message
    errorMessage.classList.remove('visible');  // Remove transition class
}

// Event listener for placing a bid
placeBidButton.addEventListener('click', placeBid);

// Start the auction timer (update every second)
setInterval(updateTimer, 1000);
