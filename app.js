const API = 'https://api.th3chain.cloud';

const short = (value, left = 12, right = 8) => {
  if (!value) return '';
  if (value.length <= left + right) return value;
  return `${value.slice(0, left)}...${value.slice(-right)}`;
};

const th3 = (value) => {
  const n = Number(value || 0);
  return `${n.toFixed(8)} TH3`;
};

function setDetails(html) {
  document.getElementById('blockDetails').innerHTML = html;
}

function setSearch(value) {
  const input = document.getElementById('searchInput');
  if (input) input.value = value;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function txLink(txid) {
  const clean = escapeHtml(txid);
  return `<span class="linkish" onclick="loadTx('${clean}')">${short(clean)}</span>`;
}

function addressLink(address) {
  const clean = escapeHtml(address);
  return `<span class="linkish" onclick="loadAddress('${clean}')">${clean}</span>`;
}

function setRoute(path) {
  history.replaceState(null, '', path);
}

async function loadBlocks() {
  try {
    const res = await fetch(`${API}/api/latest-blocks`);
    const blocks = await res.json();

    const cont = document.getElementById('blocksContainer');
    cont.innerHTML = '<h3>LATEST_BLOCKS</h3>';

    blocks.forEach((b) => {
      const el = document.createElement('div');
      el.className = 'block-item';
      el.innerHTML = `
        <strong>#${b.height}</strong>
        <br>
        <small style="opacity:.5">${short(b.hash, 18, 8)}</small>
        <div class="mini-row">${b.txs} txs</div>
      `;
      el.onclick = () => loadBlock(b.height);
      cont.appendChild(el);
    });
  } catch (e) {
    console.error(e);
  }
}

async function loadBlock(height) {
  try {
    setSearch(String(height));

    const res = await fetch(`${API}/api/block-height/${height}`);
    const b = await res.json();

    setDetails(`
      <h3>BLOCK #${b.height}</h3>

      <table class="data-table">
        <tr><td class="label">HEIGHT</td><td>${b.height}</td></tr>
        <tr><td class="label">TXS</td><td>${b.tx.length}</td></tr>
        <tr><td class="label">TIME</td><td>${new Date(b.time * 1000).toLocaleString()}</td></tr>
        <tr><td class="label">HASH</td><td class="value">${escapeHtml(b.hash)}</td></tr>
        <tr><td class="label">MERKLE</td><td class="value">${escapeHtml(b.merkleroot)}</td></tr>
      </table>

      <h3 style="margin-top:22px">TRANSACTIONS</h3>

      ${b.tx.map((tx) => `
        <div class="block-item" onclick="loadTx('${escapeHtml(tx)}')">
          ${escapeHtml(tx)}
        </div>
      `).join('')}
    `);

    setRoute(`/block/${b.hash}`);
  } catch (e) {
    console.error(e);
    setDetails('<h3>BLOCK NOT FOUND</h3>');
  }
}

async function loadBlockByHash(hash) {
  try {
    const res = await fetch(`${API}/api/block/${hash}`);

    if (!res.ok) throw new Error();

    const b = await res.json();
    await loadBlock(b.height);
  } catch {
    loadTx(hash);
  }
}

async function loadTx(txid) {
  try {
    setSearch(txid);

    const res = await fetch(`${API}/api/tx/${txid}`);

    if (!res.ok) throw new Error();

    const tx = await res.json();

    const outputs = tx.vout || [];
    const inputs = tx.vin || [];
    const totalOut = outputs.reduce((sum, out) => sum + Number(out.value || 0), 0);
    const confirmed = Number(tx.confirmations || 0) > 0;

    setDetails(`
      <div class="detail-head">
        <div>
          <h3>TRANSACTION</h3>
          <div class="subtle">${short(tx.txid, 18, 12)}</div>
        </div>

        <div class="${confirmed ? 'status-good' : 'status-wait'}">
          ${confirmed ? 'CONFIRMED' : 'PENDING'}
        </div>
      </div>

      <table class="data-table">
        <tr><td class="label">TXID</td><td class="value">${escapeHtml(tx.txid)}</td></tr>
        <tr><td class="label">CONFIRMATIONS</td><td>${tx.confirmations || 0}</td></tr>
        <tr><td class="label">SIZE</td><td>${tx.size || 0} bytes</td></tr>
        <tr><td class="label">VERSION</td><td>${tx.version ?? '-'}</td></tr>
        <tr><td class="label">LOCKTIME</td><td>${tx.locktime ?? 0}</td></tr>
        <tr><td class="label">TOTAL OUT</td><td>${th3(totalOut)}</td></tr>
        ${tx.blockhash ? `<tr><td class="label">BLOCK</td><td class="value">${escapeHtml(tx.blockhash)}</td></tr>` : ''}
        ${tx.time ? `<tr><td class="label">TIME</td><td>${new Date(tx.time * 1000).toLocaleString()}</td></tr>` : ''}
      </table>

      <h3 style="margin-top:22px">INPUTS</h3>

      ${inputs.length ? inputs.map((input, index) => `
        <div class="tx-card">
          <div class="tx-card-title">Input #${index}</div>

          ${input.coinbase ? `
            <div class="subtle">Coinbase reward</div>
          ` : `
            <table class="data-table compact">
              <tr><td class="label">PREV TX</td><td>${txLink(input.txid)}</td></tr>
              <tr><td class="label">VOUT</td><td>${input.vout}</td></tr>
              <tr><td class="label">SEQUENCE</td><td>${input.sequence ?? '-'}</td></tr>
            </table>
          `}
        </div>
      `).join('') : '<div class="empty-state">No inputs</div>'}

      <h3 style="margin-top:22px">OUTPUTS</h3>

      ${outputs.length ? outputs.map((out) => {
        const addresses = out.scriptPubKey?.addresses || [];
        const scriptType = out.scriptPubKey?.type || 'unknown';

        return `
          <div class="tx-card">
            <div class="tx-card-title">Output #${out.n}</div>

            <table class="data-table compact">
              <tr><td class="label">VALUE</td><td>${th3(out.value)}</td></tr>
              <tr><td class="label">TYPE</td><td>${escapeHtml(scriptType)}</td></tr>
              <tr>
                <td class="label">ADDRESS</td>
                <td>
                  ${addresses.length
                    ? addresses.map(addressLink).join('<br>')
                    : '<span class="subtle">No address</span>'}
                </td>
              </tr>
              <tr><td class="label">SCRIPT</td><td class="value">${escapeHtml(out.scriptPubKey?.hex || '')}</td></tr>
            </table>
          </div>
        `;
      }).join('') : '<div class="empty-state">No outputs</div>'}
    `);

    setRoute(`/tx/${tx.txid}`);
  } catch {
    setDetails('<h3>TRANSACTION NOT FOUND</h3>');
  }
}

async function loadAddress(address) {
  try {
    setSearch(address);

    const [infoRes, txsRes, utxoRes] = await Promise.all([
      fetch(`${API}/api/address/${address}`),
      fetch(`${API}/api/address/${address}/txs`),
      fetch(`${API}/api/address/${address}/utxos`)
    ]);

    const info = await infoRes.json();
    const txs = await txsRes.json();
    const utxos = await utxoRes.json();

    setDetails(`
      <div class="detail-head">
        <div>
          <h3>ADDRESS</h3>
          <div class="subtle">${short(address, 14, 10)}</div>
        </div>

        <div class="status-good">ACTIVE</div>
      </div>

      <table class="data-table">
        <tr><td class="label">ADDRESS</td><td class="value">${escapeHtml(address)}</td></tr>
        <tr><td class="label">BALANCE</td><td>${th3(info.balance)}</td></tr>
        <tr><td class="label">RECEIVED</td><td>${th3(info.received)}</td></tr>
        <tr><td class="label">TX COUNT</td><td>${Array.isArray(txs) ? txs.length : 0}</td></tr>
        <tr><td class="label">UTXOS</td><td>${Array.isArray(utxos) ? utxos.length : 0}</td></tr>
      </table>

      <h3 style="margin-top:22px">UTXOS</h3>

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

      <h3 style="margin-top:22px">TRANSACTIONS</h3>

      ${Array.isArray(txs) && txs.length ? txs.slice().reverse().map((tx) => `
        <div class="block-item" onclick="loadTx('${escapeHtml(tx)}')">
          ${escapeHtml(tx)}
        </div>
      `).join('') : '<div class="empty-state">No transactions yet</div>'}
    `);

    setRoute(`/address/${address}`);
  } catch (e) {
    console.error(e);
    setDetails('<h3>ADDRESS NOT FOUND</h3>');
  }
}

function runSearch() {
  const value = document.getElementById('searchInput').value.trim();

  if (!value) return;

  if (/^\d+$/.test(value)) {
    loadBlock(value);
    return;
  }

  if (/^[RT][a-zA-Z0-9]{25,40}$/.test(value)) {
    loadAddress(value);
    return;
  }

  if (/^[a-fA-F0-9]{64}$/.test(value)) {
    loadBlockByHash(value);
    return;
  }

  setDetails('<h3>INVALID INPUT</h3>');
}

function handleRoute() {
  const parts = window.location.pathname.split('/').filter(Boolean);

  if (parts[0] === 'tx' && parts[1]) {
    loadTx(parts[1]);
    return true;
  }

  if (parts[0] === 'address' && parts[1]) {
    loadAddress(parts[1]);
    return true;
  }

  if (parts[0] === 'block' && parts[1]) {
    loadBlockByHash(parts[1]);
    return true;
  }

  return false;
}

document.getElementById('searchBtn').onclick = runSearch;

document.getElementById('searchInput').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    runSearch();
  }
});

loadBlocks();
handleRoute();