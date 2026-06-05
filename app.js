const API = 'https://api.th3chain.cloud';

const short = (value, left = 12, right = 8) => {
  if (!value) return '';
  if (value.length <= left + right) return value;
  return `${value.slice(0, left)}...${value.slice(-right)}`;
};

const th3 = (value) => `${Number(value || 0).toFixed(8)} TH3`;

const escapeHtml = (value) => String(value ?? '')
  .replaceAll('&','&amp;')
  .replaceAll('<','&lt;')
  .replaceAll('>','&gt;')
  .replaceAll('"','&quot;')
  .replaceAll("'",'&#039;');

function setDetails(html){document.getElementById('blockDetails').innerHTML = html}
function setSearch(value){document.getElementById('searchInput').value = value || ''}
function setRoute(path){history.replaceState(null,'',path)}

function txLink(txid){
  const clean = escapeHtml(txid);
  return `<span class="linkish" onclick="loadTx('${clean}')">${short(clean)}</span>`;
}

function addressLink(address){
  const clean = escapeHtml(address);
  return `<span class="linkish" onclick="loadAddress('${clean}')">${clean}</span>`;
}

async function loadNetwork(){
  try{
    const res = await fetch(`${API}/api/network`);
    const n = await res.json();

    document.getElementById('networkStatus').textContent = '● Online';
    document.getElementById('statHeight').textContent = n.height ?? '-';
    document.getElementById('statPeers').textContent = n.peers ?? '-';
    document.getElementById('statDifficulty').textContent = Number(n.difficulty || 0).toExponential(2);
  }catch{
    document.getElementById('networkStatus').textContent = '● API Offline';
    document.getElementById('networkStatus').className = 'status-bad';
  }
}

async function loadBlocks(){
  try{
    const res = await fetch(`${API}/api/latest-blocks`);
    const blocks = await res.json();
    const cont = document.getElementById('blocksContainer');

    cont.innerHTML = '<h3>Latest Blocks</h3>';

    blocks.forEach((b) => {
      const el = document.createElement('div');
      el.className = 'block-item';
      el.innerHTML = `
        <strong>#${b.height}</strong>
        <br>
        <small style="opacity:.55">${short(b.hash,18,8)}</small>
        <div class="mini-row">${b.txs} txs • ${new Date(b.time * 1000).toLocaleString()}</div>
      `;
      el.onclick = () => loadBlock(b.height);
      cont.appendChild(el);
    });
  }catch(e){console.error(e)}
}

async function loadBlock(height){
  try{
    setSearch(String(height));
    const res = await fetch(`${API}/api/block-height/${height}`);
    if(!res.ok) throw new Error();
    const b = await res.json();

    setDetails(`
      <div class="detail-head">
        <div><h3>Block #${b.height}</h3><div class="subtle">${short(b.hash,18,12)}</div></div>
        <div class="status-good">CONFIRMED</div>
      </div>

      <table class="data-table">
        <tr><td class="label">Height</td><td>${b.height}</td></tr>
        <tr><td class="label">TXS</td><td>${b.tx.length}</td></tr>
        <tr><td class="label">Time</td><td>${new Date(b.time * 1000).toLocaleString()}</td></tr>
        <tr><td class="label">Hash</td><td class="value">${escapeHtml(b.hash)}</td></tr>
        <tr><td class="label">Merkle</td><td class="value">${escapeHtml(b.merkleroot)}</td></tr>
      </table>

      <h3 style="margin-top:22px">Transactions</h3>
      ${b.tx.map((tx) => `
        <div class="block-item" onclick="loadTx('${escapeHtml(tx)}')">${escapeHtml(tx)}</div>
      `).join('')}
    `);

    setRoute(`/block/${b.hash}`);
  }catch{
    setDetails('<div class="empty-state">Block not found</div>');
  }
}

async function loadBlockByHash(hash){
  try{
    const res = await fetch(`${API}/api/block/${hash}`);
    if(!res.ok) throw new Error();
    const b = await res.json();
    await loadBlock(b.height);
  }catch{
    loadTx(hash);
  }
}

async function loadTx(txid){
  try{
    setSearch(txid);
    const res = await fetch(`${API}/api/tx/${txid}`);
    if(!res.ok) throw new Error();
    const tx = await res.json();

    const inputs = tx.vin || [];
    const outputs = tx.vout || [];
    const totalOut = outputs.reduce((sum,out) => sum + Number(out.value || 0), 0);
    const confirmed = Number(tx.confirmations || 0) > 0;

    setDetails(`
      <div class="detail-head">
        <div><h3>Transaction</h3><div class="subtle">${short(tx.txid,18,12)}</div></div>
        <div class="${confirmed ? 'status-good' : 'status-wait'}">${confirmed ? 'CONFIRMED' : 'PENDING'}</div>
      </div>

      <table class="data-table">
        <tr><td class="label">TXID</td><td class="value">${escapeHtml(tx.txid)}</td></tr>
        <tr><td class="label">Confirmations</td><td>${tx.confirmations || 0}</td></tr>
        <tr><td class="label">Size</td><td>${tx.size || 0} bytes</td></tr>
        <tr><td class="label">Total Out</td><td>${th3(totalOut)}</td></tr>
        ${tx.time ? `<tr><td class="label">Time</td><td>${new Date(tx.time * 1000).toLocaleString()}</td></tr>` : ''}
        ${tx.blockhash ? `<tr><td class="label">Block</td><td class="value">${escapeHtml(tx.blockhash)}</td></tr>` : ''}
      </table>

      <h3 style="margin-top:22px">Inputs</h3>
      ${inputs.length ? inputs.map((input,index) => `
        <div class="tx-card">
          <div class="tx-card-title">Input #${index}</div>
          ${input.coinbase ? '<div class="subtle">Coinbase / mining reward</div>' : `
            <table class="data-table compact">
              <tr><td class="label">Prev TX</td><td>${txLink(input.txid)}</td></tr>
              <tr><td class="label">VOUT</td><td>${input.vout}</td></tr>
              <tr><td class="label">Sequence</td><td>${input.sequence ?? '-'}</td></tr>
            </table>
          `}
        </div>
      `).join('') : '<div class="empty-state">No inputs</div>'}

      <h3 style="margin-top:22px">Outputs</h3>
      ${outputs.length ? outputs.map((out) => {
        const addresses = out.scriptPubKey?.addresses || [];
        return `
          <div class="tx-card">
            <div class="tx-card-title">Output #${out.n}</div>
            <table class="data-table compact">
              <tr><td class="label">Value</td><td>${th3(out.value)}</td></tr>
              <tr><td class="label">Type</td><td>${escapeHtml(out.scriptPubKey?.type || 'unknown')}</td></tr>
              <tr><td class="label">Address</td><td>${addresses.length ? addresses.map(addressLink).join('<br>') : '<span class="subtle">No address</span>'}</td></tr>
              <tr><td class="label">Script</td><td class="value">${escapeHtml(out.scriptPubKey?.hex || '')}</td></tr>
            </table>
          </div>
        `;
      }).join('') : '<div class="empty-state">No outputs</div>'}
    `);

    setRoute(`/tx/${tx.txid}`);
  }catch{
    setDetails('<div class="empty-state">Transaction not found</div>');
  }
}

async function loadAddress(address){
  try{
    setSearch(address);

    const [infoRes, historyRes, utxoRes] = await Promise.all([
      fetch(`${API}/api/address/${address}`),
      fetch(`${API}/api/address/${address}/history?limit=50`),
      fetch(`${API}/api/address/${address}/utxos`)
    ]);

    const info = await infoRes.json();
    const history = await historyRes.json();
    const utxos = await utxoRes.json();

    setDetails(`
      <div class="detail-head">
        <div><h3>Address</h3><div class="subtle">${short(address,14,10)}</div></div>
        <div class="status-good">ACTIVE</div>
      </div>

      <table class="data-table">
        <tr><td class="label">Address</td><td class="value">${escapeHtml(address)}</td></tr>
        <tr><td class="label">Balance</td><td>${th3(info.balance)}</td></tr>
        <tr><td class="label">Received</td><td>${th3(info.received)}</td></tr>
        <tr><td class="label">TX Count</td><td>${Array.isArray(history) ? history.length : 0}</td></tr>
        <tr><td class="label">UTXO</td><td>${Array.isArray(utxos) ? utxos.length : 0}</td></tr>
      </table>

      <h3 style="margin-top:22px">UTXO</h3>
      ${Array.isArray(utxos) && utxos.length ? utxos.map((u) => `
        <div class="tx-card">
          <div class="tx-card-title">${th3(u.amount)}</div>
          <table class="data-table compact">
            <tr><td class="label">TXID</td><td>${txLink(u.txid)}</td></tr>
            <tr><td class="label">VOUT</td><td>${u.vout}</td></tr>
            <tr><td class="label">CONF</td><td>${u.confirmations}</td></tr>
          </table>
        </div>
      `).join('') : '<div class="empty-state">No spendable UTXO</div>'}

      <h3 style="margin-top:22px">History</h3>
      ${Array.isArray(history) && history.length ? history.map((h) => `
        <div class="block-item" onclick="loadTx('${escapeHtml(h.txid)}')">
          <strong>${escapeHtml(h.type || 'related')}</strong>
          <span style="float:right;color:${Number(h.amount || 0) >= 0 ? 'var(--green)' : 'var(--red)'}">${th3(h.amount)}</span>
          <div class="mini-row">${short(h.txid)} • ${h.confirmations || 0} confirmations</div>
          ${Number(h.fee || 0) > 0 ? `<div class="mini-row">Fee ${th3(h.fee)}</div>` : ''}
        </div>
      `).join('') : '<div class="empty-state">No transactions yet</div>'}
    `);

    setRoute(`/address/${address}`);
  }catch(e){
    console.error(e);
    setDetails('<div class="empty-state">Address not found</div>');
  }
}

function runSearch(){
  const value = document.getElementById('searchInput').value.trim();
  if(!value) return;

  if(/^\d+$/.test(value)) return loadBlock(value);
  if(/^T[a-zA-Z0-9]{25,40}$/.test(value)) return loadAddress(value);
  if(/^[a-fA-F0-9]{64}$/.test(value)) return loadBlockByHash(value);

  setDetails('<div class="empty-state">Invalid input</div>');
}

function handleRoute(){
  const parts = window.location.pathname.split('/').filter(Boolean);

  if(parts[0] === 'tx' && parts[1]) return loadTx(parts[1]);
  if(parts[0] === 'address' && parts[1]) return loadAddress(parts[1]);
  if(parts[0] === 'block' && parts[1]) return loadBlockByHash(parts[1]);
}

document.getElementById('searchBtn').onclick = runSearch;
document.getElementById('searchInput').addEventListener('keypress',(e) => {
  if(e.key === 'Enter') runSearch();
});

loadNetwork();
loadBlocks();
handleRoute();
setInterval(loadNetwork, 15000);
setInterval(loadBlocks, 15000);