
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

// Инициализация
document.addEventListener('DOMContentLoaded', function() {
    updateQuote();
    setInterval(updateQuote, 15000);
    document.getElementById('booking-form').addEventListener('submit', handleBooking);
});

// Обновление цитаты
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

// Обработка формы
async function handleBooking(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const clientData = {
        action: 'saveCase',
        name: formData.get('name'),
        phone: formData.get('phone'),
        email: formData.get('email') || 'не указан',
        caseType: formData.get('case-type'),
        description: formData.get('description'),
        timestamp: new Date().toLocaleString('ru-RU')
    };

    try {
        const submitBtn = event.target.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = '💾 Сохранение в базу...';
        submitBtn.disabled = true;

        const success = await saveCaseToDatabase(clientData);
        
        if (success) {
            showSuccessMessage(clientData.name, true);
        } else {
            showSuccessMessage(clientData.name, false);
        }
        
        event.target.reset();
        
    } catch (error) {
        showSuccessMessage(clientData.name, false);
        event.target.reset();
    } finally {
        const submitBtn = event.target.querySelector('.submit-btn');
        submitBtn.textContent = '📅 Записаться на консультацию';
        submitBtn.disabled = false;
    }
}

// Сохранение дела в базу данных
async function saveCaseToDatabase(clientData) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(clientData)
        });

        const result = await response.json();
        return result.success;
        
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        return false;
    }
}

// Получить ВСЕ дела (для админа)
async function getAllCases() {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({action: 'getCases'})
        });

        const result = await response.json();
        return result.success ? result.cases : [];
        
    } catch (error) {
        console.error('Ошибка получения дел:', error);
        return [];
    }
}

// Получить дела по телефону (для клиентов)
async function getCasesByPhone(phone) {
    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                action: 'getCasesByPhone',
                phone: phone
            })
        });

        const result = await response.json();
        return result.success ? result.cases : [];
        
    } catch (error) {
        console.error('Ошибка поиска:', error);
        return [];
    }
}

// Поиск дел
async function searchCases() {
    const phone = document.getElementById('search-phone').value.trim();
    const resultsElement = document.getElementById('cases-results');
    
    if (!phone) {
        resultsElement.innerHTML = '<p style="color: #F39C12;">Введите номер телефона</p>';
        return;
    }
    
    resultsElement.innerHTML = '<p>🔍 Поиск в общей базе...</p>';
    
    const cases = await getCasesByPhone(phone);
    
    if (cases.length === 0) {
        resultsElement.innerHTML = `<p>Дела для телефона <strong>${phone}</strong> не найдены.</p>`;
        return;
    }
    
    displayCases(cases, resultsElement);
}

// Показать ВСЕ дела (для админа)
async function showAllCases() {
    const resultsElement = document.getElementById('cases-results');
    resultsElement.innerHTML = '<p>📋 Загрузка всех дел из базы...</p>';
    
    const allCases = await getAllCases();
    
    if (allCases.length === 0) {
        resultsElement.innerHTML = '<p>В базе пока нет дел.</p>';
        return;
    }
    
    displayCases(allCases, resultsElement, true);
}

// Отображение дел
function displayCases(cases, element, showAll = false) {
    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
            <h4 style="color: #27AE60; margin: 0;">
                ${showAll ? '📊 ВСЕ ДЕЛА В БАЗЕ' : '👤 НАЙДЕННЫЕ ДЕЛА'}: ${cases.length}
            </h4>
            <button onclick="exportToCSV(cases)" style="
                background: #27AE60; 
                color: white; 
                border: none; 
                padding: 5px 10px; 
                border-radius: 5px; 
                cursor: pointer;
            ">📥 Экспорт</button>
        </div>
    `;
    
    cases.forEach((caseItem, index) => {
        html += `
            <div class="case-item" style="
                background: rgba(52, 73, 94, 0.7);
                padding: 15px;
                margin: 10px 0;
                border-radius: 8px;
                border-left: 4px solid #3498DB;
            ">
                <strong>Дело #${index + 1}</strong>
                <span style="float: right; background: #E74C3C; color: white; padding: 2px 8px; border-radius: 10px; font-size: 12px;">
                    ${caseItem.status}
                </span><br>
                <strong>ID:</strong> ${caseItem.id}<br>
                <strong>Клиент:</strong> ${caseItem.name}<br>
                <strong>Телефон:</strong> ${caseItem.phone}<br>
                <strong>Email:</strong> ${caseItem.email || 'не указан'}<br>
                <strong>Тип дела:</strong> ${caseItem.caseType}<br>
                <strong>Дата:</strong> ${new Date(caseItem.timestamp).toLocaleString('ru-RU')}<br>
                <strong>Описание:</strong> ${caseItem.description}
            </div>
        `;
    });
    
    element.innerHTML = html;
}

// Экспорт в CSV
function exportToCSV(cases) {
    let csv = 'Имя,Телефон,Email,Тип дела,Дата,Статус\n';
    
    cases.forEach(caseItem => {
        csv += `"${caseItem.name}","${caseItem.phone}","${caseItem.email}","${caseItem.caseType}","${caseItem.timestamp}","${caseItem.status}"\n`;
    });
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'дела_сола_' + new Date().toISOString().split('T')[0] + '.csv';
    a.click();
}

// Сообщение об успехе
function showSuccessMessage(clientName, success) {
    const message = success ? 
        `✅ Заявка сохранена в общей базе!\n\nСпасибо, ${clientName}! Сол Гудман свяжется с вами.\n\nПомните: лучше позвонить Солу!` :
        `✅ Заявка принята!\n\nСпасибо, ${clientName}! Ваша заявка сохранена.\n\nПомните: лучше позвонить Солу!`;

    alert(message);
}

// Остальные функции
function emergencyHelp() {
    alert('🚨 СРОЧНАЯ ПОМОЩЬ! Звоните: 505-123-HELP');
}

function makeCall() {
    alert('📞 Набор 505-503-4455...');
}

// Тест базы данных
async function testDatabase() {
    const testData = {
        action: 'saveCase',
        name: 'Тестовый Клиент',
        phone: '+79990001122',
        email: 'test@example.com',
        caseType: 'Тест',
        description: 'Тест общей базы данных',
        timestamp: new Date().toLocaleString('ru-RU')
    };
    
    try {
        const success = await saveCaseToDatabase(testData);
        if (success) {
            alert('✅ Тест базы пройден! Данные сохранены.');
        } else {
            alert('❌ Ошибка базы данных.');
        }
    } catch (error) {
        alert('❌ Ошибка: ' + error.message);
    }
}
