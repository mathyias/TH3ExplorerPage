const API = "https://api.th3chain.cloud";

async function updateUI(elementId, value) {
    const el = document.getElementById(elementId);
    if (el.textContent !== String(value)) {
        el.style.opacity = 0;
        setTimeout(() => {
            el.textContent = value;
            el.style.opacity = 1;
        }, 200);
    }
}

// Reszta Twojego kodu logiki API zostaje bez zmian, 
// tylko zamień document.getElementById(...).textContent = ... 
// na wywołanie funkcji: updateUI('height', data.height);

// Dodaj też obsługę błędów z ładnym komunikatem:
function showLoader(id) {
    document.getElementById(id).innerHTML = '<div class="spinner"></div>';
}