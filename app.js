const API = "https://api.th3chain.cloud";

async function loadBlocks() {
    try {
        const response = await fetch(`${API}/api/latest-blocks`);
        const blocks = await response.json();
        const container = document.getElementById("blocksContainer");
        container.innerHTML = ""; // Czyści obecne dane

        blocks.forEach(block => {
            const card = document.createElement("div");
            card.className = "block-card";
            card.innerHTML = `
                <div style="color: var(--accent)">#${block.height}</div>
                <div style="font-size: 12px; opacity: 0.6">${block.hash.substring(0,20)}...</div>
            `;
            card.onclick = () => loadBlock(block.height);
            container.appendChild(card);
        });
    } catch(err) { console.error(err); }
}

// Reszta Twoich funkcji: loadNetwork(), loadBlock() zostają bez zmian.
// Wywołujemy je na końcu:
loadNetwork();
loadBlocks();
setInterval(loadBlocks, 10000);