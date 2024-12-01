// script.js
const API_URL = "https://api.coingecko.com/api/v3/coins/markets";
const cryptoTableBody = document.getElementById("crypto-table-body");
const comparisonContainer = document.getElementById("comparison-container");
let selectedCryptos = JSON.parse(localStorage.getItem("selectedCryptos")) || [];
let sortValue = "market_cap_asc";

// Fetch data from CoinGecko API
async function fetchCryptoData() {
    console.log(sortValue);
    const value = sortValue
    let params = `?vs_currency=usd&order=${value}&per_page=10&page=1&sparkline=false`;

    const response = await fetch(`${API_URL}${params}`);
    const data = await response.json();
    console.log(data);

    displayCryptos(data);
}

// Display cryptocurrencies in the table
function displayCryptos(data) {
    cryptoTableBody.innerHTML = "";
    data.forEach((crypto) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${crypto.name}</td>
            <td>${crypto.symbol.toUpperCase()}</td>
            <td>$${crypto.current_price.toFixed(2)}</td>
            <td class="${crypto.price_change_percentage_24h > 0 ? 'positive' : 'negative'}">
                ${crypto.price_change_percentage_24h ? crypto.price_change_percentage_24h.toFixed(2) : 0}%
            </td>
            <td>$${crypto.market_cap.toLocaleString()}</td>
            <td><button onclick="addToComparison('${crypto.id}')">Compare</button></td>
        `;
        cryptoTableBody.appendChild(row);
    });
}

// Add cryptocurrency to comparison
function addToComparison(id) {
    if (selectedCryptos.length >= 5) {
        alert("You can only compare up to 5 cryptocurrencies.");
        return;
    }
    if (!selectedCryptos.includes(id)) {
        selectedCryptos.push(id);
        localStorage.setItem("selectedCryptos", JSON.stringify(selectedCryptos));
        updateComparison();
    }
}

// Update comparison section
async function updateComparison() {
    comparisonContainer.innerHTML = "";
    const promises = selectedCryptos.map((id) =>
        fetch(`https://api.coingecko.com/api/v3/coins/${id}`).then((res) => res.json())
    );
    const cryptos = await Promise.all(promises);
    cryptos.forEach((crypto) => {
        const div = document.createElement("div");
        div.classList.add("comparison-item");
        div.innerHTML = `
            <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
            <p>Price: $${crypto.market_data.current_price.usd.toFixed(2)}</p>
            <p>24h Change: ${crypto.market_data.price_change_percentage_24h ? crypto.market_data.price_change_percentage_24h.toFixed(2) : 0}%</p>
            <p>Market Cap: $${crypto.market_data.market_cap.usd.toLocaleString()}</p>
            <button onclick="removeFromComparison('${crypto.id}')">Remove</button>
        `;
        comparisonContainer.appendChild(div);
    });
}

// Remove cryptocurrency from comparison
function removeFromComparison(id) {
    selectedCryptos = selectedCryptos.filter((crypto) => crypto !== id);
    localStorage.setItem("selectedCryptos", JSON.stringify(selectedCryptos));
    updateComparison();
}

// Toggle font size function
const toggleFontSize = () => {
    document.body.classList.toggle("large-font");
    localStorage.setItem("font-size", document.body.classList.contains("large-font") ? "large" : "normal");
};

// Load saved theme and font size from local storage
document.addEventListener("DOMContentLoaded", () => {
    const savedFontSize = localStorage.getItem("font-size");

    if (savedFontSize === "large") {
        document.body.classList.add("large-font");
        document.getElementById("theme-toggle").value = "light"
    }
});

document.getElementById("font-size-toggle").addEventListener("change", toggleFontSize);

// Change Sorting Options

document.getElementById("sort-options").addEventListener("change", (event) => {
    sortValue = event.target.value;

    fetchCryptoData();
});

// Initialize app
fetchCryptoData();
updateComparison();
