const quoteElement = document.getElementById("quote");
const authorElement = document.getElementById("author");
const historyElement = document.getElementById("history");

const newQuoteBtn = document.getElementById("newQuoteBtn");
const favoriteBtn = document.getElementById("favoriteBtn");
const copyBtn = document.getElementById("copyBtn");

let currentQuote = "";
let currentAuthor = "";

// Fetch a random quote
async function getQuote() {
    try {
        quoteElement.textContent = "Loading...";
        authorElement.textContent = "";

        const response = await fetch("/api/quote");
        const data = await response.json();

        currentQuote = data.quote;
        currentAuthor = data.author;

        quoteElement.textContent = `"${currentQuote}"`;
        authorElement.textContent = `— ${currentAuthor}`;

    } catch (error) {
        quoteElement.textContent = "Unable to load quote.";
        authorElement.textContent = "";
        console.error(error);
    }
}

// Add quote to favorites
async function addFavorite() {

    if (!currentQuote) {
        alert("Please get a quote first!");
        return;
    }

    try {
        const response = await fetch("/api/favorites", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                quote: currentQuote,
                author: currentAuthor
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert("❤️ Quote added to favorites!");
            loadFavorites();
        } else {
            alert(data.error);
        }

    } catch (error) {
        console.error(error);
        alert("Could not save favorite.");
    }
}

// Load favorite history
async function loadFavorites() {

    try {
        const response = await fetch("/api/favorites");
        const favorites = await response.json();

        historyElement.innerHTML = "";

        if (favorites.length === 0) {
            historyElement.innerHTML =
                '<p class="empty">No favorite quotes yet.</p>';
            return;
        }

        favorites.forEach((favorite) => {

            const item = document.createElement("div");
            item.className = "history-item";

            item.innerHTML = `
                <p>"${favorite.quote}"</p>
                <strong>— ${favorite.author}</strong>

                <div class="history-buttons">
                    <button class="delete-btn"
                        onclick="deleteFavorite(${favorite.id})">
                        🗑️ Delete
                    </button>
                </div>
            `;

            historyElement.appendChild(item);
        });

    } catch (error) {
        console.error(error);
        historyElement.innerHTML =
            '<p class="empty">Unable to load history.</p>';
    }
}

// Delete favorite
async function deleteFavorite(id) {

    try {
        const response = await fetch(`/api/favorites/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            loadFavorites();
        }

    } catch (error) {
        console.error(error);
    }
}

// Copy quote
copyBtn.addEventListener("click", async () => {

    if (!currentQuote) {
        alert("Please get a quote first!");
        return;
    }

    const textToCopy = `"${currentQuote}" — ${currentAuthor}`;

    try {
        await navigator.clipboard.writeText(textToCopy);
        alert("📋 Quote copied!");
    } catch (error) {
        alert("Could not copy quote.");
    }
});

// Button events
newQuoteBtn.addEventListener("click", getQuote);
favoriteBtn.addEventListener("click", addFavorite);

// Load first quote and history
getQuote();
loadFavorites();