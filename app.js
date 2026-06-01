const API = "https://api.th3chain.cloud";

async function loadBlocks() {
    try {
        const res = await fetch(`${API}/api/latest-blocks`);
        const blocks = await res.json();
        const cont = document.getElementById("blocksContainer");
        // Zachowujemy strukturę nagłówka
        cont.innerHTML = "<h3>LATEST_BLOCKS</h3>";
        blocks.forEach(b => {
            const el = document.createElement("div");
            el.className = "block-item";
            el.innerHTML = `<strong>#${b.height}</strong> <br><small style="opacity:0.5">${b.hash.substring(0,20)}...</small>`;
            el.onclick = () => loadBlock(b.height);
            cont.appendChild(el);
        });
    } catch(e) { console.error("Load blocks error", e); }
}

async function loadBlock(h) {
    try {
        const res = await fetch(`${API}/api/block-height/${h}`);
        const b = await res.json();
        
        // Renderowanie danych w formie ładnych kart zamiast surowego JSON-a
        document.getElementById("blockDetails").innerHTML = `
            <h3>BLOCK_DATA: #${b.height}</h3>
            <div class="detail-grid">
                <div class="detail-card">
                    <span style="font-size:10px; opacity:0.6">HEIGHT</span>
                    <p style="font-weight:bold; margin:0">${b.height}</p>
                </div>
                <div class="detail-card">
                    <span style="font-size:10px; opacity:0.6">TRANSACTIONS</span>
                    <p style="font-weight:bold; margin:0">${b.tx.length}</p>
                </div>
                <div class="detail-card" style="grid-column: span 2;">
                    <span style="font-size:10px; opacity:0.6">HASH</span>
                    <p style="font-family:monospace; font-size:12px; margin:0; word-break:break-all">${b.hash}</p>
                </div>
                <div class="detail-card" style="grid-column: span 2;">
                    <span style="font-size:10px; opacity:0.6">MERKLE ROOT</span>
                    <p style="font-family:monospace; font-size:12px; margin:0; word-break:break-all">${b.merkleroot}</p>
                </div>
            </div>
        `;
    } catch(e) { console.error("Load block error", e); }
}

document.getElementById("searchBtn").onclick = () => {
    const val = document.getElementById("searchInput").value;
    if(val) loadBlock(val);
};

loadBlocks();