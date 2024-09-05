document.addEventListener('DOMContentLoaded', () => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    renderCart(cart); // İlk render

    // Açılır menü değiştiğinde sepeti sıralama
    const sortSelect = document.getElementById('sort');
    sortSelect.addEventListener('change', sortCart); // Fonksiyonu doğrudan buraya aktarıyoruz
});

// Sepet öğelerini işleme fonksiyonu
function renderCart(cart) {
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    cartContainer.innerHTML = ''; // Önceki öğeleri temizle
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

    // Toplam fiyatı güncelle
    if (cartTotal) {
        cartTotal.textContent = total;
    }

    // Gerekirse boş sepet mesajı göster
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p>Sepetiniz boş.</p>';
    }
}

// Sepet öğelerini kullanıcının seçimine göre sıralama işlevi
function sortCart() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const sortValue = document.getElementById('sort').value;

    // Kullanıcı seçimine göre sıralama mantığı
    if (sortValue === 'priciest') {
        cart.sort((a, b) => b.price - a.price); // En pahalıdan en ucuza doğru sırala
    } else {
        cart.sort((a, b) => a.price - b.price); // En ucuzdan en pahalıya doğru sıralayın
    }

    // Sepeti sıralanmış öğelerle yeniden oluşturma
    renderCart(cart);
}

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

// Ödeme işlevi
function checkout() {
    fetch('/cart/checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            localStorage.removeItem('cart'); // Yerel sepeti temizleyin
            window.location.href = 'checkout'; // Ödeme sayfasına yönlendirme
        } else {
            alert('Ödeme başarısız oldu. Lütfen tekrar deneyin.');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Ödeme sırasında bir hata oluştu.');
    });
}

