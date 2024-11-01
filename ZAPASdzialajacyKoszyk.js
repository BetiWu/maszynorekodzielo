let cart = JSON.parse(localStorage.getItem('cart')) || [];
const shippingCost = 9.99;

// Funkcja do wyświetlania zawartości koszyka
function displayCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Czyści kontener na produkty w koszyku
    let total = 0; // Zmienna do przechowywania kosztu produktów
    const orderButtonContainer = document.getElementById('order-button-container');
    orderButtonContainer.innerHTML = ''; // Czyści kontener z przyciskami

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
        
        // Ustawienie wartości w ukrytych polach formularza
        document.getElementById('cartContent').value = JSON.stringify(cart);
        document.getElementById('totalAmount').value = (total + shippingCost).toFixed(2); // Wysyłamy jako liczba

        // Przygotowanie przycisku do wypełnienia formularza zamówienia
        const fillFormButton = document.createElement('button');
        fillFormButton.id = 'fill-form-button';
        fillFormButton.innerText = 'Wypełnij formularz zamówienia';
        fillFormButton.onclick = function() {
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
document.getElementById('order-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Zatrzymuje domyślne działanie formularza

    // Potwierdzenie użytkownika o wysyłce formularza
    const confirmed = confirm("Czy na pewno chcesz złożyć zamówienie?");
    if (!confirmed) {
        return; // Nie kontynuuj, jeśli użytkownik odrzuci
    }

    // Zbieranie danych formularza
    const formData = new FormData(this);

    // Zbieranie personalizacji
    cart.forEach((_, index) => {
        const customText = document.getElementById(`customText-${index}`)?.value || '';
        formData.append(`customText-${index}`, customText); // Dodanie personalizacji do formData
    });

    // Sprawdzenie poprawności danych przed wysłaniem
    console.log('Dane formularza przed wysłaniem:', Array.from(formData.entries()));

    // Wysyłanie formularza do Netlify
    fetch(this.action, {
        method: 'POST',
        body: formData,
    })
    .then(response => {
        if (response.ok) {
            // Po złożeniu zamówienia, resetujemy formularz i ukrywamy go
            alert('Zamówienie zostało złożone pomyślnie!');
            this.reset(); // Resetuje formularz
            this.style.display = 'none'; // Ukrywa formularz po złożeniu zamówienia
            
            // Resetowanie koszyka
            cart = [];
            localStorage.removeItem('cart');
            displayCart();
        } else {
            alert('Wystąpił błąd podczas składania zamówienia.');
        }
    })
    .catch(error => {
        console.error('Błąd podczas wysyłania formularza:', error);
        alert('Wystąpił problem z połączeniem. Spróbuj ponownie później.');
    });
});

// Po załadowaniu strony
document.addEventListener('DOMContentLoaded', displayCart);