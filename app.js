const API = "https://api.th3chain.cloud";

async function loadNetwork() {
    const res = await fetch(`${API}/api/network`);
    const data = await res.json();
    document.getElementById("height").textContent = data.height;
    document.getElementById("peers").textContent = data.peers;
    document.getElementById("difficulty").textContent = Number(data.difficulty).toExponential(2);
}

async function loadBlocks() {
    const res = await fetch(`${API}/api/latest-blocks`);
    const blocks = await res.json();
    const container = document.getElementById("blocksContainer");
    container.innerHTML = "";
    blocks.forEach(b => {
        const div = document.createElement("div");
        div.className = "block-card";
        div.innerHTML = `<strong>#${b.height}</strong><br><small style="color:var(--muted)">${b.hash.substring(0,16)}...</small>`;
        div.onclick = () => loadBlock(b.height);
        container.appendChild(div);
    });
}

async function loadBlock(h) {
    const res = await fetch(`${API}/api/block-height/${h}`);
    const b = await res.json();
    document.getElementById("blockDetails").innerHTML = `
        <h3 style="margin-bottom:20px;">Block #${b.height}</h3>
        <div class="details-grid">
            <div class="detail-item"><span>HASH</span><p>${b.hash.substring(0,12)}...</p></div>
            <div class="detail-item"><span>TXS</span><p>${b.tx.length}</p></div>
            <div class="detail-item"><span>SIZE</span><p>${b.size} B</p></div>
            <div class="detail-item"><span>DIFFICULTY</span><p>${Number(b.difficulty).toExponential(2)}</p></div>
        </div>
    `;
}

document.getElementById("searchBtn").onclick = () => loadBlock(document.getElementById("searchInput").value);
loadNetwork();
loadBlocks();
setInterval(loadBlocks, 10000);