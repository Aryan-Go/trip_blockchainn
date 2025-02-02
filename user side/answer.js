document.getElementById('loadDataBtn').addEventListener('click', async function() {
    try {
        // 1. Show the loading spinner
        document.getElementById('loading').style.display = 'block';
        
        // 2. Add loading state to body (for blurring background)
        document.body.classList.add('loading-state');

        // 3. Connect to Ethereum (MetaMask)
        if (typeof window.ethereum === 'undefined') {
            alert("Please install MetaMask!");
            return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Request user's accounts
        const signer = provider.getSigner();

        // 4. Define your contract's ABI and address
        const contractABI = [
            // Define contract ABI for fetching the minimum prices
            "function getMinimumPrices() public view returns (uint256, uint256, uint256)"
        ];
        const contractAddress = "YOUR_CONTRACT_ADDRESS"; // Replace with your contract address

        // 5. Create a contract instance
        const contract = new ethers.Contract(contractAddress, contractABI, signer);

        // 6. Fetch the minimum prices from the contract
        const [minFoodPrice, minTravelPrice, minHotelPrice] = await contract.getMinimumPrices();

        // Calculate the total price
        const totalPrice = parseFloat(minFoodPrice) + parseFloat(minTravelPrice) + parseFloat(minHotelPrice);

        // 7. Display the result
        document.getElementById('displayFoodPrice').textContent = minFoodPrice.toFixed(2);
        document.getElementById('displayTravelPrice').textContent = minTravelPrice.toFixed(2);
        document.getElementById('displayHotelPrice').textContent = minHotelPrice.toFixed(2);
        document.getElementById('totalPrice').textContent = totalPrice.toFixed(2);

        // 8. Hide the loading spinner and show the result section
        document.getElementById('loading').style.display = 'none';
        document.getElementById('result').style.display = 'block';

        // 9. Remove loading state from body (restore normal background)
        document.body.classList.remove('loading-state');

        // 10. Show confirmation buttons (only once the result is displayed)
        document.getElementById('confirmSection').style.display = 'block';

        // 11. Handle payment confirmation (ensure only one event listener is attached)
        document.getElementById('confirmPaymentBtn').onclick = async function() {
            try {
                // Proceed with payment (we assume the user is paying the total price)
                const tx = await signer.sendTransaction({
                    to: contractAddress,
                    value: ethers.utils.parseEther(totalPrice.toFixed(18)) // Send total price as ETH
                });

                await tx.wait(); // Wait for the transaction to be mined

                // Show thank you message
                document.getElementById('result').style.display = 'none';
                document.getElementById('thankYou').style.display = 'block';

            } catch (error) {
                console.error(error);
                alert("An error occurred during payment.");
            }
        };

        // 12. Handle payment cancellation
        document.getElementById('cancelPaymentBtn').onclick = function() {
            document.getElementById('confirmSection').style.display = 'none';
            alert("You have canceled the payment.");
        };

    } catch (error) {
        console.error(error);
        alert("An error occurred while fetching data from the blockchain.");
        
        // Hide loading spinner in case of error
        document.getElementById('loading').style.display = 'none';

        // Remove the loading state in case of error
        document.body.classList.remove('loading-state');
    }
});
