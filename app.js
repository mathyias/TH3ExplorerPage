const API = "https://api.th3chain.cloud";

async function loadBlocks() {
    const res = await fetch(`${API}/api/latest-blocks`);
    const blocks = await res.json();
    const container = document.getElementById("blocksContainer");
    container.innerHTML = "<h3>LATEST</h3>";
    blocks.forEach(b => {
        const div = document.createElement("div");
        div.className = "block-card";
        div.innerHTML = `<strong>#${b.height}</strong><br><small style="opacity:0.6">${b.hash.substring(0,12)}...</small>`;
        div.onclick = () => loadBlock(b.height);
        container.appendChild(div);
    });
}

async function loadBlock(h) {
    const res = await fetch(`${API}/api/block-height/${h}`);
    const b = await res.json();
    document.getElementById("blockDetails").innerHTML = `
        <h2 style="margin-top:0;">Block #${b.height}</h2>
        <p><strong>Hash:</strong> ${b.hash}</p>
        <p><strong>Txs:</strong> ${b.tx.length}</p>
        <p><strong>Time:</strong> ${new Date(b.time * 1000).toLocaleString()}</p>
    `;
}

document.getElementById("searchBtn").onclick = () => loadBlock(document.getElementById("searchInput").value);
loadBlocks();