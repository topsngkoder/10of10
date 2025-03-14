/**
 * Скрипт для фильтрации базы данных комбинаций для среднего уровня сложности.
 * Критерии:
 * 1. Нет цифры 1
 * 2. Обязательно есть умножение или деление
 * 3. Нет двух плюсов или двух минусов подряд
 */

const fs = require('fs');

// Загружаем базу данных
console.log('Загрузка базы данных...');
const validCombinations = JSON.parse(fs.readFileSync('valid-combinations.json', 'utf8'));
console.log(`Загружено ${validCombinations.length} комбинаций`);

// Фильтруем комбинации для среднего уровня сложности
console.log('\nФильтрация комбинаций для среднего уровня сложности...');
const mediumDifficultyCombinations = validCombinations.filter(combo => {
    // Критерий 1: Нет цифры 1
    if (combo.numbers.includes(1)) {
        return false;
    }
    
    // Критерий 2: Обязательно есть умножение или деление
    const hasMulOrDiv = combo.operators.includes('*') || combo.operators.includes('/');
    if (!hasMulOrDiv) {
        return false;
    }
    
    // Критерий 3: Нет двух плюсов или двух минусов
    const hasDoublePlus = combo.operators.filter(op => op === '+').length >= 2;
    const hasDoubleMinus = combo.operators.filter(op => op === '-').length >= 2;
    if (hasDoublePlus || hasDoubleMinus) {
        return false;
    }
    
    return true;
});

console.log(`Найдено ${mediumDifficultyCombinations.length} комбинаций для среднего уровня сложности`);

// Сохраняем результаты в JSON файл
fs.writeFileSync('medium-difficulty-combinations.json', JSON.stringify(mediumDifficultyCombinations, null, 2));
console.log('Результаты сохранены в файл medium-difficulty-combinations.json');

// Выводим несколько примеров
console.log('\nПримеры комбинаций для среднего уровня сложности:');
for (let i = 0; i < Math.min(5, mediumDifficultyCombinations.length); i++) {
    const combo = mediumDifficultyCombinations[i];
    console.log(`${i + 1}. Числа: [${combo.numbers.join(', ')}], Выражение: ${combo.expression} = ${combo.result}`);
}

// Анализируем результаты
analyzeResults(mediumDifficultyCombinations);

/**
 * Анализирует найденные комбинации и выводит статистику
 * @param {Array} combinations - Массив комбинаций для анализа
 */
function analyzeResults(combinations) {
    console.log('\nАнализ результатов:');
    
    // Подсчитываем, сколько комбинаций содержат каждую цифру
    const digitCounts = {};
    for (let i = 2; i <= 9; i++) {
        digitCounts[i] = 0;
    }
    
    for (const combo of combinations) {
        for (const num of combo.numbers) {
            digitCounts[num]++;
        }
    }
    
    console.log('Частота встречаемости цифр:');
    for (let i = 2; i <= 9; i++) {
        console.log(`${i}: ${digitCounts[i]} раз`);
    }
    
    // Подсчитываем, сколько комбинаций используют каждый оператор
    const operatorCounts = {
        '+': 0,
        '-': 0,
        '*': 0,
        '/': 0
    };
    
    for (const combo of combinations) {
        for (const op of combo.operators) {
            operatorCounts[op]++;
        }
    }
    
    console.log('\nЧастота использования операторов:');
    for (const op in operatorCounts) {
        console.log(`${op}: ${operatorCounts[op]} раз`);
    }
    
    // Подсчитываем комбинации с уникальными цифрами
    const uniqueDigitCombos = combinations.filter(combo => {
        const uniqueDigits = new Set(combo.numbers);
        return uniqueDigits.size === 4;
    });
    
    console.log(`\nКомбинаций с уникальными цифрами: ${uniqueDigitCombos.length} (${Math.floor(uniqueDigitCombos.length / combinations.length * 100)}%)`);
    
    // Сохраняем комбинации с уникальными цифрами в отдельный файл
    fs.writeFileSync('medium-difficulty-unique-combinations.json', JSON.stringify(uniqueDigitCombos, null, 2));
    console.log('Комбинации с уникальными цифрами сохранены в файл medium-difficulty-unique-combinations.json');
}