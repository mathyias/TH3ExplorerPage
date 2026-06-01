const API = "https://api.th3chain.cloud";

async function loadNetwork() {

try {

    const response =
        await fetch(`${API}/api/network`);

    const data =
        await response.json();

    document.getElementById("height").textContent =
        data.height;

    document.getElementById("peers").textContent =
        data.peers;

    document.getElementById("difficulty").textContent =
        Number(data.difficulty).toExponential(2);

} catch(err) {

    console.error(err);

}

}

async function loadBlocks() {

try {

    const response =
        await fetch(`${API}/api/latest-blocks`);

    const blocks =
        await response.json();

    const container =
        document.getElementById("blocksContainer");

    container.innerHTML = "";

    blocks.forEach(block => {

        const card =
            document.createElement("div");

        card.className =
            "block-card";

        const shortHash =
            block.hash.substring(0,24) + "...";

        card.innerHTML = `
            <div class="block-height">
                Block #${block.height}
            </div>

            <div class="block-hash">
                ${shortHash}
            </div>

            <div class="block-tx">
                ${block.txs} transaction(s)
            </div>
        `;

        card.addEventListener(
            "click",
            () => loadBlock(block.height)
        );

        container.appendChild(card);

    });

} catch(err) {

    console.error(err);

}

}

async function loadBlock(height) {

try {

    const response =
        await fetch(
            `${API}/api/block-height/${height}`
        );

    const block =
        await response.json();

    document.getElementById(
        "blockDetails"
    ).innerHTML = `

        <h2 style="margin-bottom:20px;">
            Block #${block.height}
        </h2>

        <strong>Hash</strong>
        <br>
        ${block.hash}

        <br><br>

        <strong>Previous Block</strong>
        <br>
        ${block.previousblockhash || "Genesis"}

        <br><br>

        <strong>Transactions</strong>
        <br>
        ${block.tx.length}

        <br><br>

        <strong>Difficulty</strong>
        <br>
        ${block.difficulty}

        <br><br>

        <strong>Confirmations</strong>
        <br>
        ${block.confirmations}

        <br><br>

        <strong>Block Size</strong>
        <br>
        ${block.size}

        <br><br>

        <strong>Timestamp</strong>
        <br>
        ${new Date(
            block.time * 1000
        ).toLocaleString()}
    `;

} catch(err) {

    console.error(err);

}

}

document
.getElementById("searchBtn")
.addEventListener(
"click",
() => {

    const value =
        document
        .getElementById("searchInput")
        .value
        .trim();

    if(!value) return;

    loadBlock(value);

}

);

document
.getElementById("searchInput")
.addEventListener(
"keypress",
(e) => {

    if(e.key === "Enter") {

        const value =
            document
            .getElementById("searchInput")
            .value
            .trim();

        if(!value) return;

        loadBlock(value);

    }

}

);

loadNetwork();
loadBlocks();

setInterval(loadNetwork,10000);
setInterval(loadBlocks,10000);