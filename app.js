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
    blocks.forEach(block => {
        const div = document.createElement("div");
        div.className = "block-card";
        div.innerHTML = `<strong>#${block.height}</strong><br><small>${block.hash.substring(0,20)}...</small>`;
        div.onclick = () => loadBlock(block.height);
        container.appendChild(div);
    });
}

async function loadBlock(h) {
    const res = await fetch(`${API}/api/block-height/${h}`);
    const b = await res.json();
    document.getElementById("blockDetails").innerHTML = `<pre>${JSON.stringify(b, null, 2)}</pre>`;
}

document.getElementById("searchBtn").onclick = () => loadBlock(document.getElementById("searchInput").value);

loadNetwork();
loadBlocks();
setInterval(loadBlocks, 10000);