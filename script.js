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
    ],
    
    clients: JSON.parse(localStorage.getItem('saulClients')) || []
};

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    updateQuote();
    setInterval(updateQuote, 10000); // Меняем цитату каждые 10 секунд
    
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
function handleBooking(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const clientData = {
        id: Date.now(),
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        caseType: formData.get('case-type'),
        description: formData.get('description'),
        status: 'новая',
        createdDate: new Date().toLocaleString('ru-RU')
    };
    
    // Сохраняем в localStorage
    saulData.clients.push(clientData);
    localStorage.setItem('saulClients', JSON.stringify(saulData.clients));
    
    // Показываем подтверждение
    alert(`Спасибо, ${clientData.name}! Ваша заявка принята.\nСол Гудман свяжется с вами в течение 2 часов.\n\nПомните: лучше позвонить Солу!`);
    
    // Очищаем форму
    event.target.reset();
}

// Поиск дел
function searchCases() {
    const phone = document.getElementById('search-phone').value.trim();
    const resultsElement = document.getElementById('cases-results');
    
    if (!phone) {
        resultsElement.textContent = 'Пожалуйста, введите номер телефона для поиска.';
        return;
    }
    
    const clientCases = saulData.clients.filter(client => client.phone === phone);
    
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
        resultsText += `Статус: ${caseItem.status}\n`;
        resultsText += `Дата обращения: ${caseItem.createdDate}\n`;
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

// Генерация рекламных материалов (дополнительная функция)
function generateMarketingMaterials() {
    const slogan = saulData.slogans[Math.floor(Math.random() * saulData.slogans.length)];
    const quote = saulData.quotes[Math.floor(Math.random() * saulData.quotes.length)];
    
    const materials = `
⚖️ Джимми МакГилл (Сол Гудман) ⚖️

${slogan}

Специализации:
• Уголовные дела
• Гражданские споры
• Банкротство
• ДТП и страховые случаи
• Мелкие правонарушения
• Консультации по правовым вопросам

${quote}

💼 Условия оплаты:
• Единовременный платеж
• Рассрочка
• Процент от выигрыша

📞 Звоните прямо сейчас: 505-503-4455
📍 Офис: Аллея Монстров, Альбукерке, Нью-Мексико

Помните: лучше позвонить Солу, чем потом жалеть!
    `;
    
    return materials;
}