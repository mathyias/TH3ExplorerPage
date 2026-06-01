const API = "https://api.th3chain.cloud";

async function loadNetwork() {

```
try {

    const response = await fetch(`${API}/api/network`);
    const data = await response.json();

    document.getElementById("height").textContent =
        data.height;

    document.getElementById("peers").textContent =
        data.peers;

    document.getElementById("difficulty").textContent =
        Number(data.difficulty).toExponential(2);

} catch (err) {
    console.error(err);
}
```

}

async function loadBlocks() {

```
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

        card.innerHTML = `
            <div class="block-height">
                #${block.height}
            </div>

            <div class="block-hash">
                ${block.hash}
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

} catch (err) {

    console.error(err);

}
```

}

async function loadBlock(height) {

```
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

        <h2>
            Block #${block.height}
        </h2>

        <br>

        <b>Hash</b><br>
        ${block.hash}

        <br><br>

        <b>Previous Block</b><br>
        ${block.previousblockhash || "Genesis"}

        <br><br>

        <b>Transactions</b><br>
        ${block.tx.length}

        <br><br>

        <b>Difficulty</b><br>
        ${block.difficulty}

        <br><br>

        <b>Time</b><br>
        ${new Date(
            block.time * 1000
        ).toLocaleString()}
    `;

} catch (err) {

    console.error(err);

}
```

}

document
.getElementById("searchBtn")
.addEventListener(
"click",
async () => {

```
    const value =
        document
        .getElementById("searchInput")
        .value
        .trim();

    if (!value) return;

    loadBlock(value);
}
```

);

loadNetwork();
loadBlocks();

setInterval(loadNetwork, 15000);
setInterval(loadBlocks, 15000);
