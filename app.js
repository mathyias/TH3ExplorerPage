const API = "https://api.th3chain.cloud";

// Funkcja do obsługi mobilnego menu
function toggleMenu() {
    document.getElementById("navMenu").classList.toggle("active");
}

async function loadBlocks() {
    try {
        const res = await fetch(`${API}/api/latest-blocks`);
        const blocks = await res.json();
        const cont = document.getElementById("blocksContainer");
        cont.innerHTML = "<h3>LATEST_BLOCKS</h3>";
        
        blocks.forEach(b => {
            const el = document.createElement("div");
            el.className = "block-item";
            el.innerHTML = `<strong>#${b.height}</strong><br><small style="opacity:0.5">${b.hash.substring(0,20)}...</small>`;
            el.onclick = () => loadBlock(b.height);
            cont.appendChild(el);
        });
    } catch(e) { console.error("Error loading blocks:", e); }
}

async function loadBlock(h) {
    try {
        const res = await fetch(`${API}/api/block-height/${h}`);
        const b = await res.json();
        
        document.getElementById("blockDetails").innerHTML = `
            <h3>BLOCK_DATA: #${b.height}</h3>
            <table class="data-table">
                <tr><td class="label">HEIGHT</td><td class="value">${b.height}</td></tr>
                <tr><td class="label">TXS</td><td class="value">${b.tx.length}</td></tr>
                <tr><td class="label">HASH</td><td class="value" style="word-break:break-all">${b.hash}</td></tr>
                <tr><td class="label">MERKLE</td><td class="value" style="word-break:break-all">${b.merkleroot}</td></tr>
            </table>
        `;
    } catch(e) { console.error("Error loading block details:", e); }
}

// Obsługa przycisku wyszukiwania
document.getElementById("searchBtn").onclick = () => {
    const val = document.getElementById("searchInput").value;
    if(val) loadBlock(val);
};

// Inicjalizacja listy bloków
loadBlocks();