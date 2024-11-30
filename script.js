const apiUrl = 'https://api.coingecko.com/api/v3/coins/markets';
const vsCurrency = 'usd';
let selectedCryptos = JSON.parse(localStorage.getItem('selectedCryptos')) || [];

document.getElementById('sort-options').addEventListener('change', fetchCryptos);

function fetchCryptos() {
    const sortBy = document.getElementById('sort-options').value;
    console.log(`${apiUrl}?vs_currency=${vsCurrency}`);

    fetch(`${apiUrl}?vs_currency=${vsCurrency}&order=${sortBy}&per_page=10&page=1`)
        .then(response => response.json())
        .then(data => displayCryptos(data))
        .catch(error => console.error('Error fetching data:', error));
}

function displayCryptos(cryptos) {
    const cryptoList = document.getElementById('crypto-list');
    cryptoList.innerHTML = cryptos.map(crypto => `
        <div class="crypto-item">
          <h3>${crypto.name} (${crypto.symbol.toUpperCase()})</h3>
          <p>Price: $${crypto.current_price}</p>
          <p>24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%</p>
          <p>Market Cap: $${crypto.market_cap.toLocaleString()}</p>
          <button onclick="addToComparison('${crypto.id}', '${crypto.name}', '${crypto.current_price}')">Add to Compare</button>
        </div>
      `).join('');
}

function addToComparison(id, name, price) {
    if (selectedCryptos.length < 5 && !selectedCryptos.find(crypto => crypto.id === id)) {
        selectedCryptos.push({ id, name, price });
        localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
        updateComparisonSection();
    }
}

function updateComparisonSection() {
    const comparisonDiv = document.getElementById('selected-cryptos');
    comparisonDiv.innerHTML = selectedCryptos.map(crypto => `
        <div class="crypto-item">
          <h3>${crypto.name}</h3>
          <p>Price: $${crypto.price}</p>
          <button onclick="removeFromComparison('${crypto.id}')">Remove</button>
        </div>
      `).join('');
}

function removeFromComparison(id) {
    selectedCryptos = selectedCryptos.filter(crypto => crypto.id !== id);
    localStorage.setItem('selectedCryptos', JSON.stringify(selectedCryptos));
    updateComparisonSection();
}

// Initial data fetch and comparison update
fetchCryptos();
updateComparisonSection();

// Auto-update data every 60 seconds
setInterval(fetchCryptos, 60000);