const API = "https://api.th3chain.cloud";

async function loadBlocks() {
    const res = await fetch(`${API}/api/latest-blocks`);
    const blocks = await res.json();
    const cont = document.getElementById("blocksContainer");
    cont.innerHTML = "<h3>LATEST_BLOCKS</h3>";
    blocks.forEach(b => {
        const el = document.createElement("div");
        el.className = "block-item";
        el.innerHTML = `<strong>#${b.height}</strong><br><small style="opacity:0.5">${b.hash.substring(0,16)}...</small>`;
        el.onclick = () => loadBlock(b.height);
        cont.appendChild(el);
    });
}

async function loadBlock(h) {
    const res = await fetch(`${API}/api/block-height/${h}`);
    const b = await res.json();
    // Tutaj zostawiłem Twój styl, ale poprawiłem formatowanie JSON-a dla czytelności
    document.getElementById("blockDetails").innerHTML = `
        <h3>BLOCK_DATA: #${b.height}</h3>
        <pre>${JSON.stringify(b, null, 2)}</pre>
    `;
}

document.getElementById("searchBtn").onclick = () => {
    const val = document.getElementById("searchInput").value;
    if(val) loadBlock(val);
};

loadBlocks();