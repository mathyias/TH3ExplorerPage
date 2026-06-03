const API="https://api.th3chain.cloud";

async function loadBlocks(){
try{
const res=await fetch(`${API}/api/latest-blocks`);
const blocks=await res.json();

const cont=document.getElementById("blocksContainer");
cont.innerHTML="<h3>LATEST_BLOCKS</h3>";

blocks.forEach(b=>{
const el=document.createElement("div");
el.className="block-item";
el.innerHTML=`<strong>#${b.height}</strong><br><small style="opacity:.5">${b.hash.substring(0,20)}...</small>`;
el.onclick=()=>loadBlock(b.height);
cont.appendChild(el);
});
}catch(e){
console.error(e);
}
}

async function loadBlock(height){
try{
const res=await fetch(`${API}/api/block-height/${height}`);
const b=await res.json();

document.getElementById("blockDetails").innerHTML=`
<h3>BLOCK #${b.height}</h3>

<table class="data-table">
<tr><td class="label">HEIGHT</td><td>${b.height}</td></tr>
<tr><td class="label">TXS</td><td>${b.tx.length}</td></tr>
<tr><td class="label">TIME</td><td>${new Date(b.time*1000).toLocaleString()}</td></tr>
<tr><td class="label">HASH</td><td style="word-break:break-all">${b.hash}</td></tr>
<tr><td class="label">MERKLE</td><td style="word-break:break-all">${b.merkleroot}</td></tr>
</table>

<h3 style="margin-top:20px">TRANSACTIONS</h3>

${b.tx.map(tx=>`
<div class="block-item" onclick="loadTx('${tx}')">
${tx}
</div>
`).join("")}
`;
}catch(e){
console.error(e);
}
}

async function loadBlockByHash(hash){
try{
const res=await fetch(`${API}/api/block/${hash}`);

if(!res.ok) throw new Error();

const b=await res.json();

document.getElementById("blockDetails").innerHTML=`
<h3>BLOCK #${b.height}</h3>

<table class="data-table">
<tr><td class="label">HEIGHT</td><td>${b.height}</td></tr>
<tr><td class="label">TXS</td><td>${b.tx.length}</td></tr>
<tr><td class="label">TIME</td><td>${new Date(b.time*1000).toLocaleString()}</td></tr>
<tr><td class="label">HASH</td><td style="word-break:break-all">${b.hash}</td></tr>
<tr><td class="label">MERKLE</td><td style="word-break:break-all">${b.merkleroot}</td></tr>
</table>

<h3 style="margin-top:20px">TRANSACTIONS</h3>

${b.tx.map(tx=>`
<div class="block-item" onclick="loadTx('${tx}')">
${tx}
</div>
`).join("")}
`;
}catch{
loadTx(hash);
}
}

async function loadTx(txid){
try{
const res=await fetch(`${API}/api/tx/${txid}`);

if(!res.ok) throw new Error();

const tx=await res.json();

document.getElementById("blockDetails").innerHTML=`
<h3>TRANSACTION</h3>

<table class="data-table">
<tr><td class="label">TXID</td><td style="word-break:break-all">${tx.txid}</td></tr>
<tr><td class="label">CONFIRMATIONS</td><td>${tx.confirmations||0}</td></tr>
<tr><td class="label">SIZE</td><td>${tx.size}</td></tr>
<tr><td class="label">OUTPUTS</td><td>${tx.vout.length}</td></tr>
</table>
`;
}catch{
document.getElementById("blockDetails").innerHTML="<h3>NOT FOUND</h3>";
}
}

async function loadAddress(address){
try{
const [infoRes,txsRes,utxoRes]=await Promise.all([
fetch(`${API}/api/address/${address}`),
fetch(`${API}/api/address/${address}/txs`),
fetch(`${API}/api/address/${address}/utxos`)
]);

const info=await infoRes.json();
const txs=await txsRes.json();
const utxos=await utxoRes.json();

document.getElementById("blockDetails").innerHTML=`
<h3>ADDRESS</h3>

<table class="data-table">
<tr><td class="label">ADDRESS</td><td style="word-break:break-all">${address}</td></tr>
<tr><td class="label">BALANCE</td><td>${info.balance} TH3</td></tr>
<tr><td class="label">RECEIVED</td><td>${info.received} TH3</td></tr>
<tr><td class="label">TX COUNT</td><td>${txs.length}</td></tr>
<tr><td class="label">UTXOS</td><td>${utxos.length}</td></tr>
</table>

<h3 style="margin-top:20px">TRANSACTIONS</h3>

${txs.map(tx=>`
<div class="block-item" onclick="loadTx('${tx}')">
${tx}
</div>
`).join("")}
`;
}catch(e){
console.error(e);
document.getElementById("blockDetails").innerHTML="<h3>ADDRESS NOT FOUND</h3>";
}
}

document.getElementById("searchBtn").onclick=()=>{
const value=document.getElementById("searchInput").value.trim();

if(!value) return;

if(/^\d+$/.test(value)){
loadBlock(value);
return;
}

if(/^[RT][a-zA-Z0-9]{25,40}$/.test(value)){
loadAddress(value);
return;
}

if(/^[a-fA-F0-9]{64}$/.test(value)){
loadBlockByHash(value);
return;
}

document.getElementById("blockDetails").innerHTML="<h3>INVALID INPUT</h3>";
};

document.getElementById("searchInput").addEventListener("keypress",e=>{
if(e.key==="Enter"){
document.getElementById("searchBtn").click();
}
});

loadBlocks();