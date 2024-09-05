document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.querySelector('.products');
    
    // Henüz yapılmadıysa ürünleri başlat
    if (!window.products) {
        window.products = []; // Temin edilmemişse ürünleri tanımlayın
    }

    productContainer.innerHTML = ''; // Mevcut içeriği temizle

    window.products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product-card');
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h2>${product.name}</h2>
            <p>Fiyat: ${product.price}TL</p>
            <button onclick="addToCart(${product.id})">Sepete Ekle</button>
        `;
        productContainer.appendChild(productDiv);
    });
});

function addToCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const product = window.products.find(p => p.id === productId);

    if (product) {
        // Ürünün zaten sepette olup olmadığını kontrol et
        if (!cart.some(item => item.id === productId)) {
            cart.push(product);
            localStorage.setItem('cart', JSON.stringify(cart));
            alert(`${product.name} sepete eklendi!`);
        } else {
            alert(`${product.name} sepette zaten mevcut.`);
        }
    } else {
        alert('Ürün bulunamadı.');
    }
}

// Ödeme sayfasını oluştur
app.get('/checkout', isAuthenticated, (req, res) => {
    res.render('checkout', { user: req.session.user });
});

// Ödeme formu gönderimini işleme
app.post('/checkout', isAuthenticated, (req, res) => {
    const userId = req.session.user.username; // Oturumun kullanıcı nesnesini sakladığını varsayarsak
    const { address, creditCard, expiryDate, cvv } = req.body;

    // Ödeme ayrıntılarını doğrula ve işle
    if (!address || !creditCard || !expiryDate || !cvv) {
        console.log('Missing required fields');
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        // Ödeme yapıldıktan sonra kullanıcının sepetini temizle
        carts[userId] = [];

        // Başarılı olursa, başarı yanıtını gönder
        res.json({ success: true });
    } catch (error) {
        console.error('Error during checkout:', error);
        res.status(500).json({ success: false, message: 'An error occurred during checkout' });
    }
});


