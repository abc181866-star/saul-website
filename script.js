
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxT7BpMCibxAvtqYmCsvaHHWrwifqdN0daX4iwYH2JtrJ_OY1DZs-IpcWGC2qo4spAi/exec';

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
    // Скрыть все секции
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Убрать активный класс со всех кнопок
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранную секцию
    document.getElementById(sectionId).classList.add('active');
    
    // Активировать соответствующую кнопку
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
        timestamp: new Date().toLocaleString('ru-RU')
    };

    try {
        // Показываем загрузку
        const submitBtn = event.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '📨 Отправка Солу...';
        submitBtn.disabled = true;

        // Отправляем данные в Google Script
        const success = await sendToTelegram(clientData);
        
        if (success) {
            showSuccessMessage(clientData.name, true);
        } else {
            showSuccessMessage(clientData.name, false);
        }
        
        // Сохраняем локально в любом случае
        saveToLocalStorage(clientData);
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

// Отправка данных в Google Apps Script
async function sendToTelegram(clientData) {
    try {
        console.log('📨 Отправляем данные в Google Script...', clientData);
        
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(clientData)
        });

        console.log('✅ Данные отправлены в Google Script');
        return true;
        
    } catch (error) {
        console.error('❌ Ошибка отправки в Google Script:', error);
        return false;
    }
}

// Сохранение в localStorage
function saveToLocalStorage(clientData) {
    try {
        let clients = JSON.parse(localStorage.getItem('saulClients')) || [];
        clientData.id = Date.now();
        clients.push(clientData);
        localStorage.setItem('saulClients', JSON.stringify(clients));
        console.log('💾 Данные сохранены локально');
    } catch (error) {
        console.error('Ошибка сохранения:', error);
    }
}

// Сообщение об успехе
function showSuccessMessage(clientName, telegramSent) {
    const message = telegramSent ? 
        `✅ Заявка отправлена Солу!\n\nСпасибо, ${clientName}! Сол Гудман свяжется с вами в течение 2 часов.\n\nПомните: лучше позвонить Солу!` :
        `✅ Заявка принята!\n\nСпасибо, ${clientName}! Мы сохранили вашу заявку.\n\nПомните: лучше позвонить Солу!`;

    alert(message);
}

// Поиск дел по телефону
function searchCases() {
    const phone = document.getElementById('search-phone').value.trim();
    const resultsElement = document.getElementById('cases-results');
    
    if (!phone) {
        resultsElement.innerHTML = '<p style="color: #F39C12;">Введите номер телефона для поиска.</p>';
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
                <strong>Email:</strong> ${caseItem.email || 'не указан'}<br>
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

// Функция для тестирования Google Script
async function testGoogleScript() {
    const testData = {
        name: 'Тестовый Клиент',
        phone: '+79990001122',
        email: 'test@example.com',
        caseType: 'Тестовая заявка',
        description: 'Это тестовое сообщение для проверки Google Script',
        timestamp: new Date().toLocaleString('ru-RU')
    };
    
    try {
        const success = await sendToTelegram(testData);
        if (success) {
            alert('✅ Тест пройден! Данные отправлены в Google Script.');
        } else {
            alert('❌ Тест не пройден. Проверьте консоль браузера (F12).');
        }
    } catch (error) {
        alert('❌ Ошибка теста: ' + error.message);
    }
}
