const API = "https://api.th3chain.cloud";

async function loadNetwork() {

    const response = await fetch(`${API}/api/network`);
    const data = await response.json();

    document.getElementById("height").textContent = data.height;
    document.getElementById("peers").textContent = data.peers;
    document.getElementById("difficulty").textContent =
        Number(data.difficulty).toExponential(2);
}

async function loadBlocks() {

    const response = await fetch(`${API}/api/latest-blocks`);
    const blocks = await response.json();

    const table = document.getElementById("blocksTable");

    table.innerHTML = "";

    blocks.forEach(block => {

        table.innerHTML += `
            <tr>
                <td>${block.height}</td>
                <td class="hash">${block.hash}</td>
                <td>${block.txs}</td>
            </tr>
        `;
    });
}

loadNetwork();
loadBlocks();

setInterval(loadNetwork, 15000);
setInterval(loadBlocks, 15000);
