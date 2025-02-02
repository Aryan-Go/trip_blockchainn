// Handle form submission
document.getElementById('travelForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    // Get the input values
    const place = document.getElementById('place').value;
    const foodPrice = parseFloat(document.getElementById('foodPrice').value);
    const travelPrice = parseFloat(document.getElementById('travelPrice').value);
    const hotelPrice = parseFloat(document.getElementById('hotelPrice').value);

    // Check if all inputs are valid
    if (place && foodPrice > 0 && travelPrice > 0 && hotelPrice > 0) {
        try {
            // 1. Check if MetaMask is installed and connected to the site
            if (typeof window.ethereum === 'undefined') {
                alert("Please install MetaMask!");
                return;
            }

            // 2. Connect to Ethereum (MetaMask)
            const provider = new ethers.BrowserProvider(window.ethereum);
            await provider.send("eth_requestAccounts", []); // Request MetaMask accounts
            const signer = provider.getSigner();

            // 3. Define your contract's ABI and address
            const contractABI = [
                // Replace with your contract's ABI
                "function planTrip(string memory _place, uint256 _foodPrice, uint256 _travelPrice, uint256 _hotelPrice) public"
            ];
            const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your contract address

            // 4. Create a contract instance
            const contract = new ethers.Contract(contractAddress, contractABI, signer);

            // 5. Send transaction to the contract
            const totalPrice = foodPrice + travelPrice + hotelPrice;

            // Call the contract function
            const tx = await contract.planTrip(place, foodPrice, travelPrice, hotelPrice);
            await tx.wait(); // Wait for the transaction to be mined

            // 6. Display result message on success
            const resultMessage = `You're planning to visit <strong>${place}</strong> with a food cost of <strong>${foodPrice}</strong>, travel cost of <strong>${travelPrice}</strong>, and hotel cost of <strong>${hotelPrice}</strong>. The transaction has been sent to the blockchain.`;

            // Display the result on the current page
            document.getElementById('resultMessage').innerHTML = resultMessage;
            document.getElementById('result').style.display = 'block';

            // After the result is shown, redirect to answer.html
            setTimeout(() => {
                window.location.href = "answer.html"; // Redirect to answer.html
            }, 5000); // Redirect after 5 seconds

        } catch (err) {
            console.error(err);
            alert("An error occurred while sending data to the blockchain.");
        }
    } else {
        alert("Please fill in all fields with valid values.");
    }
});
