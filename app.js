const API = "https://api.th3chain.cloud";

async function loadBlocks() {
    try {
        const res = await fetch(`${API}/api/latest-blocks`);
        const blocks = await res.json();
        const cont = document.getElementById("blocksContainer");
        cont.innerHTML = "<h3>LATEST_BLOCKS</h3>";
        blocks.forEach(b => {
            const el = document.createElement("div");
            el.className = "block-item";
            el.innerHTML = `BLOCK #${b.height} <br><small style="opacity:0.5">${b.hash.substring(0,20)}...</small>`;
            el.onclick = () => loadBlock(b.height);
            cont.appendChild(el);
        });
    } catch(e) { console.error("Load blocks error", e); }
}

async function loadBlock(h) {
    try {
        const res = await fetch(`${API}/api/block-height/${h}`);
        const b = await res.json();
        document.getElementById("blockDetails").innerHTML = `
            <h3>BLOCK_ID: ${b.height}</h3>
            <pre>${JSON.stringify(b, null, 2)}</pre>
        `;
    } catch(e) { console.error("Load block error", e); }
}

document.getElementById("searchBtn").onclick = () => {
    const val = document.getElementById("searchInput").value;
    if(val) loadBlock(val);
};

loadBlocks();