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

// Ödeme sayfasını oluşturmak için rota
app.get('/checkout', isAuthenticated, (req, res) => {
    res.render('checkout', { user: req.session.user });
});

// Ödeme formu gönderimini işlemek için rota
app.post('/checkout', isAuthenticated, (req, res) => {
    const userId = req.session.user.username; // Assuming session stores user object
    const { address, creditCard, expiryDate, cvv } = req.body;

    // Validate and process payment details
    if (!address || !creditCard || !expiryDate || !cvv) {
        return res.status(400).send('All fields are required');
    }

    // Gerçek uygulamalar için, ödemeyi işleyin ve sipariş ayrıntılarını burada bir veritabanına kaydedin
    // Şimdilik sadece sepeti temizleyip bir başarı yanıtı gönder
    carts[userId] = []; // Ödeme yaptıktan sonra sepeti temizle

    // Bir onay sayfasına veya ana sayfaya yönlendirme
    res.redirect('/checkout'); // Ödeme sayfasına yönlendirme
});