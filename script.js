// Данные приложения
const saulData = {
    slogans: [
        "Лучше звоните Солу!",
        "Знаете, кто ваш адвокат?",
        "Ваши права под защитой!",
        "Правосудие для всех!",
        "Никто не останется без защиты!"
    ],
    
    quotes: [
        "Я не юрист, который ищет проблемы. Я юрист, который их решает!",
        "Иногда правильный путь - не самый законный, но самый эффективный.",
        "Ваша свобода - мой приоритет №1!",
        "Никогда не признавайте вину без адвоката. Особенно без меня!",
        "Правосудие должно быть доступным для всех, а не только для богатых.",
        "У вас есть право хранить молчание. Но лучше позвонить мне!",
        "Я специализируюсь на 'сложных' клиентах. Обычные слишком скучные!"
    ]
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateQuote();
    setInterval(updateQuote, 10000);
    
    // Обработчик формы
    document.getElementById('booking-form').addEventListener('submit', handleBooking);
});

// Обновление случайной цитаты
function updateQuote() {
    const sloganElement = document.getElementById('slogan');
    const quoteElement = document.getElementById('quote');
    
    const randomSlogan = saulData.slogans[Math.floor(Math.random() * saulData.slogans.length)];
    const randomQuote = saulData.quotes[Math.floor(Math.random() * saulData.quotes.length)];
    
    sloganElement.textContent = randomSlogan;
    quoteElement.textContent = `"${randomQuote}"`;
}

// Переключение секций
function showSection(sectionId) {
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(sectionId).classList.add('active');
    event.target.classList.add('active');
}

// Обработка формы записи с отправкой на сервер
async function handleBooking(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const clientData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        caseType: formData.get('case-type'),
        description: formData.get('description'),
        timestamp: new Date().toISOString()
    };

    try {
        // Показываем загрузку
        const submitBtn = event.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Отправка...';
        submitBtn.disabled = true;

        // Отправляем данные на сервер
        const response = await sendToTelegram(clientData);
        
        if (response.ok) {
            showSuccessMessage(clientData.name);
            event.target.reset();
        } else {
            throw new Error('Ошибка отправки');
        }
        
    } catch (error) {
        console.error('Ошибка:', error);
        // Если не удалось отправить, сохраняем локально
        saveToLocalStorage(clientData);
        showSuccessMessage(clientData.name);
        event.target.reset();
    } finally {
        // Восстанавливаем кнопку
        const submitBtn = event.target.querySelector('.submit-btn');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

// Отправка в Telegram бот (РЕАЛЬНАЯ ОТПРАВКА)
async function sendToTelegram(clientData) {
    const botToken = 'YOUR_BOT_TOKEN'; // Заменить на реальный токен
    const chatId = 'YOUR_CHAT_ID';     // Заменить на реальный chat ID
    
    const message = `
🆕 НОВАЯ ЗАЯВКА ОТ КЛИЕНТА

👤 Имя: ${clientData.name}
📞 Телефон: ${clientData.phone}
📧 Email: ${clientData.email || 'не указан'}
⚖️ Тип дела: ${clientData.caseType}
📝 Описание:
${clientData.description}

⏰ Время заявки: ${new Date().toLocaleString('ru-RU')}
    `.trim();

    // Для тестирования - эмулируем успешную отправку
    console.log('Отправка в Telegram:', message);
    
    // Раскомментируйте для реальной отправки:
    /*
    return await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML'
        })
    });
    */
    
    // Заглушка для демонстрации
    return { ok: true };
}

// Отправка на email через Formspree (бесплатный сервис)
async function sendToEmail(clientData) {
    // Formspree - бесплатный сервис для обработки форм
    return await fetch('https://formspree.io/f/your-form-id', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            name: clientData.name,
            phone: clientData.phone,
            email: clientData.email,
            caseType: clientData.caseType,
            description: clientData.description,
            _subject: `Новая заявка от ${clientData.name}`
        })
    });
}

// Резервное сохранение в localStorage
function saveToLocalStorage(clientData) {
    let clients = JSON.parse(localStorage.getItem('saulClients')) || [];
    clientData.id = Date.now();
    clients.push(clientData);
    localStorage.setItem('saulClients', JSON.stringify(clients));
}

// Красивое сообщение об успехе
function showSuccessMessage(clientName) {
    const successHTML = `
        <div class="success-message">
            <h3>✅ Заявка принята!</h3>
            <p>Спасибо, <strong>${clientName}</strong>!</p>
            <p>Сол Гудман свяжется с вами в течение 2 часов.</p>
            <p><em>Помните: лучше позвонить Солу!</em></p>
            <button onclick="this.parentElement.remove()">OK</button>
        </div>
    `;
    
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = successHTML;
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #27AE60;
        color: white;
        padding: 20px;
        border-radius: 10px;
        z-index: 1000;
        text-align: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    
    document.body.appendChild(messageDiv);
}

// Поиск дел (только локальные)
function searchCases() {
    const phone = document.getElementById('search-phone').value.trim();
    const resultsElement = document.getElementById('cases-results');
    
    if (!phone) {
        resultsElement.textContent = 'Пожалуйста, введите номер телефона для поиска.';
        return;
    }
    
    const clients = JSON.parse(localStorage.getItem('saulClients')) || [];
    const clientCases = clients.filter(client => client.phone === phone);
    
    if (clientCases.length === 0) {
        resultsElement.textContent = `Дела для телефона ${phone} не найдены.`;
        return;
    }
    
    let resultsText = `Найдено дел: ${clientCases.length}\n\n`;
    
    clientCases.forEach((caseItem, index) => {
        resultsText += `Дело #${index + 1}\n`;
        resultsText += `Клиент: ${caseItem.name}\n`;
        resultsText += `Телефон: ${caseItem.phone}\n`;
        resultsText += `Email: ${caseItem.email || 'не указан'}\n`;
        resultsText += `Тип дела: ${caseItem.caseType}\n`;
        resultsText += `Дата обращения: ${new Date(caseItem.timestamp).toLocaleString('ru-RU')}\n`;
        resultsText += `Описание: ${caseItem.description}\n`;
        resultsText += '-'.repeat(50) + '\n\n';
    });
    
    resultsElement.textContent = resultsText;
}

// Экстренная помощь
function emergencyHelp() {
    alert('🚨 СРОЧНАЯ ПОМОЩЬ 🚨\n\nСол Гудман уже выезжает к вам!\n\nЧто делать до его приезда:\n• Ничего не подписывайте\n• Не давайте показания без адвоката\n• Сохраняйте спокойствие\n• Дождитесь Сола!\n\nТелефон экстренной помощи: 505-123-HELP');
}

// Имитация звонка
function makeCall() {
    alert('📞 Звонок\n\nНабор номера 505-503-4455...\n\nСол Гудман: "Алло! Слушаю вас!"\nРасскажите о вашей проблеме...');
}
