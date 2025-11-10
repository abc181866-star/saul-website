// Конфигурация - ЗАМЕНИТЕ ЭТИ ДАННЫЕ!
const BOT_CONFIG = {
    token: '8595705314:AAE3rgwRlEk9sLWk-Zyae2iYESdR_906bJw', // Например: '1234567890:ABCdef123...'
    chatId: '1768475384'           // Например: '123456789'
};

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
    setInterval(updateQuote, 15000);
    
    // Обработчик формы
    document.getElementById('booking-form').addEventListener('submit', handleBooking);
    
    // Проверяем конфигурацию
    checkBotConfig();
});

// Проверка настроек бота
function checkBotConfig() {
    if (BOT_CONFIG.token.includes('ВАШ_ТОКЕН') || BOT_CONFIG.chatId.includes('ВАШ_CHAT_ID')) {
        console.warn('⚠️ Настройте Telegram бота! Замените BOT_CONFIG в коде.');
    }
}

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

// Обработка формы записи
async function handleBooking(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const clientData = {
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email') || 'не указан',
        caseType: formData.get('case-type'),
        description: formData.get('description'),
        timestamp: new Date().toLocaleString('ru-RU'),
        ip: await getClientIP()
    };

    try {
        // Показываем загрузку
        const submitBtn = event.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '📨 Отправка Солу...';
        submitBtn.disabled = true;

        // Пытаемся отправить в Telegram
        const telegramSuccess = await sendToTelegram(clientData);
        
        if (telegramSuccess) {
            showSuccessMessage(clientData.name, true);
            // Сохраняем локально для истории
            saveToLocalStorage(clientData);
        } else {
            // Если Telegram не работает, сохраняем только локально
            saveToLocalStorage(clientData);
            showSuccessMessage(clientData.name, false);
        }
        
        // Очищаем форму
        event.target.reset();
        
    } catch (error) {
        console.error('Ошибка:', error);
        // Сохраняем локально при любой ошибке
        saveToLocalStorage(clientData);
        showSuccessMessage(clientData.name, false);
        event.target.reset();
    } finally {
        // Восстанавливаем кнопку
        const submitBtn = event.target.querySelector('.submit-btn');
        submitBtn.textContent = '📅 Записаться на консультацию';
        submitBtn.disabled = false;
    }
}

// Получение IP клиента (для информации)
async function getClientIP() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return 'не удалось определить';
    }
}

// Отправка в Telegram бот
async function sendToTelegram(clientData) {
    // Проверяем настройки
    if (BOT_CONFIG.token.includes('ВАШ_ТОКЕН') || BOT_CONFIG.chatId.includes('ВАШ_CHAT_ID')) {
        console.warn('Telegram бот не настроен');
        return false;
    }

    const message = `
🆕 *НОВАЯ ЗАЯВКА ОТ КЛИЕНТА*

👤 *Имя:* ${clientData.name}
📞 *Телефон:* ${clientData.phone}
📧 *Email:* ${clientData.email}
⚖️ *Тип дела:* ${clientData.caseType}

📝 *Описание:*
${clientData.description}

🌐 *IP:* ${clientData.ip}
⏰ *Время:* ${clientData.timestamp}
    `.trim();

    try {
        const response = await fetch(`https://api.telegram.org/bot${BOT_CONFIG.token}/sendMessage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: BOT_CONFIG.chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        const result = await response.json();
        console.log('Telegram ответ:', result);
        
        return result.ok;
        
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error);
        return false;
    }
}

// Резервное сохранение в localStorage
function saveToLocalStorage(clientData) {
    try {
        let clients = JSON.parse(localStorage.getItem('saulClients')) || [];
        clientData.id = Date.now();
        clients.push(clientData);
        localStorage.setItem('saulClients', JSON.stringify(clients));
        console.log('Сохранено локально:', clientData);
    } catch (error) {
        console.error('Ошибка сохранения:', error);
    }
}

// Красивое сообщение об успехе
function showSuccessMessage(clientName, telegramSent) {
    const message = telegramSent ? 
        `✅ *Заявка отправлена Солу!*\n\nСпасибо, ${clientName}! Сол Гудман свяжется с вами в течение 2 часов.\n\n*Помните: лучше позвонить Солу!*` :
        `✅ *Заявка принята!*\n\nСпасибо, ${clientName}! Мы сохранили вашу заявку. Сол свяжется с вами в ближайшее время.\n\n*Помните: лучше позвонить Солу!*`;

    // Создаем красивый popup
    const popup = document.createElement('div');
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: ${telegramSent ? '#27AE60' : '#F39C12'};
        color: white;
        padding: 30px;
        border-radius: 15px;
        z-index: 10000;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
        border: 3px solid white;
        max-width: 400px;
        font-family: Arial, sans-serif;
    `;
    
    popup.innerHTML = `
        <div style="font-size: 48px; margin-bottom: 15px;">${telegramSent ? '✅' : '📝'}</div>
        <h3 style="margin: 0 0 15px 0; color: white;">${telegramSent ? 'Заявка отправлена!' : 'Заявка принята!'}</h3>
        <p style="margin: 10px 0; line-height: 1.5;">Спасибо, <strong>${clientName}</strong>!</p>
        <p style="margin: 10px 0; line-height: 1.5;">${telegramSent ? 
            'Сол Гудман свяжется с вами в течение 2 часов.' : 
            'Мы сохранили вашу заявку. Сол свяжется с вами в ближайшее время.'
        }</p>
        <p style="margin: 15px 0; font-style: italic; font-size: 14px;">Помните: лучше позвонить Солу!</p>
        <button onclick="this.parentElement.remove()" style="
            background: white;
            color: ${telegramSent ? '#27AE60' : '#F39C12'};
            border: none;
            padding: 10px 25px;
            border-radius: 25px;
            font-weight: bold;
            cursor: pointer;
            margin-top: 10px;
        ">OK</button>
    `;
    
    // Затемнение фона
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.7);
        z-index: 9999;
    `;
    overlay.onclick = function() {
        document.body.removeChild(overlay);
        document.body.removeChild(popup);
    };
    
    document.body.appendChild(overlay);
    document.body.appendChild(popup);
}

// Поиск дел (только локальные)
function searchCases() {
    const phone = document.getElementById('search-phone').value.trim();
    const resultsElement = document.getElementById('cases-results');
    
    if (!phone) {
        resultsElement.innerHTML = '<p style="color: #F39C12;">Пожалуйста, введите номер телефона для поиска.</p>';
        return;
    }
    
    const clients = JSON.parse(localStorage.getItem('saulClients')) || [];
    const clientCases = clients.filter(client => client.phone === phone);
    
    if (clientCases.length === 0) {
        resultsElement.innerHTML = `<p>Дела для телефона <strong>${phone}</strong> не найдены.</p>`;
        return;
    }
    
    let resultsHTML = `<h4 style="color: #27AE60;">Найдено дел: ${clientCases.length}</h4>`;
    
    clientCases.forEach((caseItem, index) => {
        resultsHTML += `
            <div class="case-item" style="
                background: rgba(52, 73, 94, 0.7);
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid #3498DB;
            ">
                <strong>Дело #${index + 1}</strong><br>
                <strong>Клиент:</strong> ${caseItem.name}<br>
                <strong>Телефон:</strong> ${caseItem.phone}<br>
                <strong>Email:</strong> ${caseItem.email}<br>
                <strong>Тип дела:</strong> ${caseItem.caseType}<br>
                <strong>Дата обращения:</strong> ${caseItem.timestamp}<br>
                <strong>Описание:</strong> ${caseItem.description}
            </div>
        `;
    });
    
    resultsElement.innerHTML = resultsHTML;
}

// Экстренная помощь
function emergencyHelp() {
    alert('🚨 СРОЧНАЯ ПОМОЩЬ 🚨\n\nСол Гудман уже выезжает к вам!\n\nЧто делать до его приезда:\n• Ничего не подписывайте\n• Не давайте показания без адвоката\n• Сохраняйте спокойствие\n• Дождитесь Сола!\n\n📞 Телефон экстренной помощи: 505-123-HELP');
}

// Имитация звонка
function makeCall() {
    alert('📞 Звонок\n\nНабор номера 505-503-4455...\n\nСол Гудман: "Алло! Слушаю вас!"\nРасскажите о вашей проблеме...');
}

// Тест бота (для проверки)
async function testBot() {
    if (confirm('Отправить тестовое сообщение в Telegram?')) {
        const testData = {
            name: 'Тестовый Клиент',
            phone: '+79990001122',
            email: 'test@example.com',
            caseType: 'Тестовая заявка',
            description: 'Это тестовая заявка для проверки бота',
            timestamp: new Date().toLocaleString('ru-RU'),
            ip: '127.0.0.1'
        };
        
        const success = await sendToTelegram(testData);
        if (success) {
            alert('✅ Тестовое сообщение отправлено! Проверьте Telegram.');
        } else {
            alert('❌ Ошибка отправки. Проверьте настройки бота.');
        }
    }
}

