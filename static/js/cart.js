document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    let total = 0;

    cart.forEach(item => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.classList.add('cart-item');
        cartItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <h2>${item.name}</h2>
            <p>Fiyat: ${item.price}TL</p>
            <button onclick="removeFromCart(${item.id})">Remove</button>
        `;
        cartContainer.appendChild(cartItemDiv);
        total += item.price;
    });

    cartTotal.textContent = total;

    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Your cart is empty.</p>';
    }
});

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    location.reload(); // Değişiklikleri yansıtmak için sayfayı yeniden yükle
}

// Sepeti temizleme işlevi
function clearCart() {
    localStorage.removeItem('cart');
    location.reload(); // Sepet kullanıcı arayüzünü güncellemek için sayfayı yeniden yükle
}

// Ödeme fonksiyonu
function checkout() {
    fetch('/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            address: document.getElementById('address').value,
            creditCard: document.getElementById('credit-card').value,
            expiryDate: document.getElementById('expiry-date').value,
            cvv: document.getElementById('cvv').value
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.removeItem('cart'); // Yerel sepeti temizle
            alert('Checkout successful!');
            window.location.href = '/order-confirmation'; // Onay sayfasına yönlendir
        } else {
            console.log('Checkout failed:', data.message);
            alert('Checkout failed: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error during checkout:', error);
        alert('An error occurred during checkout.');
    });
}