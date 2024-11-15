// require('dotenv').config();
// const privateKey = process.env.PRIVATE_KEY;

const test1 = '1QA8YRYtg4rZZmFHs1jMfDWSzaXsrj4jcv'; // test1
const test2 = '1L2BqGYybxZHMmRJBJqA4Ztyfzv3TbPMw'; // test2
const txBox = document.getElementById("box");

// mainnet
const mainUrl = "https://api.koinos.io";
const koinId = "15DJN4a8SgrbGhhGksSBASiSYjGnMU8dGL";

// testnet
const testUrl = "https://harbinger-api.koinos.io";
const koinTestId = "1EdLyQ67LW6HVU1dWoceP4firtyz77e37Y";

(async () => {
  // define signer, provider, and contract
  const provider = new Provider([mainUrl]);
  const signer = Signer.fromWif(pk);
  signer.provider = provider;
  const koinContract = new Contract({
    id: koinId,
    abi: utils.tokenAbi,
    provider,
    signer,
  });

  const koin = koinContract.functions;

  let timerInterval; // To hold the interval ID for the timer
  let secondsElapsed = 0; // Counter for seconds elapsed

  // Show the loading bar and start the timer
  function showLoadingBar() {
    document.getElementById("loading-container").style.display = "block";
    document.getElementById("loading-bar").style.width = "0%";
    document.getElementById("timer").innerText = "Timer: 0s";
    secondsElapsed = 0; // Reset the counter
    timerInterval = setInterval(updateTimer, 1000); // Update every second
  }

  // Update the loading bar
  function updateLoadingBar(progress) {
    document.getElementById("loading-bar").style.width = progress + "%";
  }

  // Hide the loading bar and stop the timer
  function hideLoadingBar() {
    document.getElementById("loading-container").style.display = "none";
    clearInterval(timerInterval); // Stop the timer
  }

  // Update the timer display
  function updateTimer() {
    secondsElapsed++;
    document.getElementById("timer").innerText = `Timer: ${secondsElapsed}s`;
  }

  // Define the transferKoin function to handle the transfer
  window.transferKoin = async function transferKoin() {
    try {
      // Specify the recipient address (replace with the actual address)
      const recipient = document.getElementById("address").value; // Define recipient address here
      if (!recipient) {
        alert("Please enter a valid address.");
        return;
      }

      // Get the amount to send from the input box
      const amountInput = document.getElementById("amount").value;
      if (!amountInput || isNaN(amountInput) || parseFloat(amountInput) <= 0) {
        alert("Please enter a valid amount.");
        return;
      }

      // Convert the amount to the smallest unit (e.g., multiplying by 10^8 for 8 decimal places)
      const amountToSend = (parseFloat(amountInput) * 1e8).toFixed(0);

      modal.style.display = "none";

      // Show loading bar at the start of the transfer
      showLoadingBar();
      updateLoadingBar(25); // Set initial loading progress

      // Transfer funds using the koin.transfer method
      const { transaction, receipt } = await koin.transfer({
        from: await signer.getAddress(),  // Ensure getAddress is async if needed
        to: recipient,                    // Make sure `recipient` is defined
        value: amountToSend               // Value in smallest unit (e.g., 10.12345678 koin)
      });

      // Update loading bar to show progress
      updateLoadingBar(50);

      // Wait for the transaction to be mined
      const { blockNumber } = await transaction.wait();

      // Update loading bar to indicate nearing completion
      updateLoadingBar(75);

      // Display the block number in the div with ID 'tx'
      txBox.style.background = "#00800045";
      txBox.style.visibility = 'visible';
      document.getElementById('tx').innerText = `Transaction mined. Block number: ${blockNumber}`;
      console.log(`Transaction mined. Block number: ${blockNumber}`);

      // Read the balance of the owner after the transaction
      const { result } = await koin.balanceOf({
        owner: await signer.getAddress()
      });

      // Display the balance in the div with ID 'balance'
      document.getElementById('balance').innerText = `Balance: ${result.value}`;
      console.log("Balance:", result);

      // Finish the loading bar
      updateLoadingBar(100);
      setTimeout(hideLoadingBar, 500); // Give time for user to see full progress

    } catch (error) {
      // Handle any errors that occur during the transfer
      console.error("Transfer failed:", error);
      // Show the element
      txBox.style.background = "#ff00007a";
      txBox.style.visibility = 'visible';
      document.getElementById('tx').innerText = `Transfer failed: ${error.message}`;

      // Hide the loading bar on error
      hideLoadingBar();
    }
  }
})();

// Get the modal
const modal = document.getElementById("myModal");
// Get the <span> element that closes the modal
const span = document.getElementsByClassName("close")[0];

const showTx = () => {

  const recipient = document.getElementById("address").value;
  if (!recipient) {
    alert("Please enter a valid address.");
    return;
  }

  const amountInput = document.getElementById("amount").value;
  if (!amountInput || isNaN(amountInput) || parseFloat(amountInput) <= 0) {
    alert("Please enter a valid amount.");
    return;
  }

  let modelTx = document.getElementById("modal-tx");
  let modelAmount = document.getElementById("modal-amount");
  let mdButton = document.getElementById("md-button");
  modelTx.innerHTML = "";
  modelAmount.innerHTML = "";
  mdButton.innerHTML = "";

  if (modal) {
    let amountDiv = document.createElement("div");
    amountDiv.id = "amount-div";
    let txDiv = document.createElement("div");
    txDiv.id = "tx-div";
    amountDiv.innerText = `Send ${amountInput} koin`;
    txDiv.innerText = `To: ${recipient}`;

    let modalButton = document.createElement("button");
    modalButton.className = "btn--purple";
    modalButton.id = "send-confirm";
    modalButton.innerText = "Send";

    modelAmount.appendChild(amountDiv);
    modelTx.appendChild(txDiv);
    mdButton.appendChild(modalButton);
  }

  modal.style.display = "block";

  // Attach the transferKoin function to the button with ID 'send'
  const sendButton = document.getElementById('send-confirm');
  if (sendButton) {  // Check if element exists to avoid errors
    sendButton.addEventListener('click', transferKoin);
  } else {
    console.error("Send button not found");
  }
}

// Set up event listeners after the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {
  console.log("Document fully loaded and parsed!");

  document.getElementById("send").addEventListener("click", showTx);

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  }

  // When the user clicks on <span> (x), close the modal
  span.onclick = function () {
    modal.style.display = "none";
  }
});

