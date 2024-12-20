let cart = JSON.parse(localStorage.getItem('cart')) || [];
const shippingCost = 9.99;

// Funkcja do wyświetlania zawartości koszyka
function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = '';
    let total = 0;
    const orderButtonContainer = document.getElementById('order-button-container');
    orderButtonContainer.innerHTML = '';

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Koszyk jest pusty</p>';
        document.getElementById('total-price').style.display = 'none';

        const fillFormButton = document.createElement('button');
        fillFormButton.id = 'fill-form-button';
        fillFormButton.innerText = 'Dodaj produkty';
        fillFormButton.onclick = function () {
            window.location.href = 'produkty.html';
        };
        orderButtonContainer.appendChild(fillFormButton);
    } else {
        cart.forEach((item, index) => {
            const itemElement = document.createElement('div');
            itemElement.classList.add('cart-item');
            itemElement.innerHTML = `
                <span>${index + 1}. ${item.name} - ${item.price.toFixed(2).replace('.', ',')} zł</span>
                <div>
                    <label for="customText-${index}">Personalizacja:</label>
                    <input type="text" name="customText-${index}" id="customText-${index}" placeholder="np. Wzór: choinka, Imię: Kamil" />
                    <button type="button" onclick="removeItem(${index})">Usuń</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            total += item.price;
        });

        const totalAmount = (total + shippingCost).toFixed(2).replace('.', ',') + ' zł';
        document.getElementById('total-amount').innerText = totalAmount;
        document.getElementById('total-price').style.display = 'block';

        const fillFormButton = document.createElement('button');
        fillFormButton.id = 'fill-form-button';
        fillFormButton.innerText = 'ZAMÓW';
        fillFormButton.onclick = function () {
            const orderForm = document.getElementById('order-form');
            orderForm.style.display = orderForm.style.display === 'none' ? 'block' : 'none';
        };
        orderButtonContainer.appendChild(fillFormButton);
    }
}

function removeItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    displayCart();
}

// Obsługuje wysyłanie formularza zamówienia
document.getElementById('order-form').addEventListener('submit', function (event) {
    event.preventDefault();

    // Walidacja i przygotowanie danych
    const hiddenCartContent = document.getElementById('cartContent');
    const totalAmountField = document.getElementById('totalAmount');

    // Opis koszyka
    hiddenCartContent.value = cart.map((item, index) => {
        const customText = document.getElementById(`customText-${index}`)?.value || '';
        return `${item.name} - ${item.price.toFixed(2).replace('.', ',')} zł${customText ? ` (Personalizacja: ${customText})` : ''}`;
    }).join(', ');

    totalAmountField.value = (cart.reduce((acc, item) => acc + item.price, 0) + shippingCost).toFixed(2).replace('.', ',');

    const confirmed = confirm("Czy na pewno chcesz złożyć zamówienie?");
    if (!confirmed) {
        return;
    }

    // Zbieranie personalizacji
    const formData = new FormData(this);
    cart.forEach((_, index) => {
        const customText = document.getElementById(`customText-${index}`)?.value || '';
        formData.append(`customText-${index}`, customText);
    });

    // Wysyłanie formularza do Netlify
    fetch(this.action, {
        method: 'POST',
        body: formData,
    })
        .then(response => {
            if (response.ok) {
                alert('Zamówienie zostało złożone pomyślnie!');
                this.reset(); // Resetowanie formularza po pomyślnym złożeniu zamówienia
                this.style.display = 'none'; // Ukrycie formularza
                cart = [];
                localStorage.removeItem('cart');
                displayCart();
            } else {
                return response.text().then(text => {
                    alert('Wystąpił błąd podczas składania zamówienia: ' + text);
                });
            }
        })
        .catch(error => {
            console.error('Błąd podczas wysyłania formularza:', error);
            alert('Wystąpił problem z połączeniem. Spróbuj ponownie później.');
        });
});

// Po załadowaniu strony
document.addEventListener('DOMContentLoaded', displayCart);