/**
 * Скрипт для фильтрации базы данных комбинаций для высокого уровня сложности.
 * Критерии:
 * 1. Используются только цифры от 2 до 9 (нет цифры 1)
 * 2. Цифры в задании не повторяются (все 4 цифры разные)
 * 3. В решении не может быть двух плюсов, двух минусов или плюса и минуса
 *    (т.е. можно использовать максимум один плюс или один минус)
 */

const fs = require('fs');

// Загружаем базу данных
console.log('Загрузка базы данных...');
const validCombinations = JSON.parse(fs.readFileSync('valid-combinations.json', 'utf8'));
console.log(`Загружено ${validCombinations.length} комбинаций`);

// Фильтруем комбинации для высокого уровня сложности
console.log('\nФильтрация комбинаций для высокого уровня сложности...');
const hardDifficultyCombinations = validCombinations.filter(combo => {
    // Критерий 1: Используются только цифры от 2 до 9 (нет цифры 1)
    if (combo.numbers.includes(1)) {
        return false;
    }
    
    // Критерий 2: Цифры в задании не повторяются (все 4 цифры разные)
    const uniqueDigits = new Set(combo.numbers);
    if (uniqueDigits.size !== 4) {
        return false;
    }
    
    // Критерий 3: В решении не может быть двух плюсов, двух минусов или плюса и минуса
    const plusCount = combo.operators.filter(op => op === '+').length;
    const minusCount = combo.operators.filter(op => op === '-').length;
    
    // Проверяем, что сумма плюсов и минусов не больше 1
    if (plusCount + minusCount > 1) {
        return false;
    }
    
    return true;
});

console.log(`Найдено ${hardDifficultyCombinations.length} комбинаций для высокого уровня сложности`);

// Сохраняем результаты в JSON файл
fs.writeFileSync('hard-difficulty-combinations.json', JSON.stringify(hardDifficultyCombinations, null, 2));
console.log('Результаты сохранены в файл hard-difficulty-combinations.json');

// Выводим несколько примеров
console.log('\nПримеры комбинаций для высокого уровня сложности:');
for (let i = 0; i < Math.min(5, hardDifficultyCombinations.length); i++) {
    const combo = hardDifficultyCombinations[i];
    console.log(`${i + 1}. Числа: [${combo.numbers.join(', ')}], Выражение: ${combo.expression} = ${combo.result}`);
}

// Анализируем результаты
analyzeResults(hardDifficultyCombinations);

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
    
    // Анализируем типы выражений
    const expressionPatterns = {};
    
    for (const combo of combinations) {
        const pattern = combo.operators.join('');
        expressionPatterns[pattern] = (expressionPatterns[pattern] || 0) + 1;
    }
    
    console.log('\nЧастота шаблонов выражений:');
    for (const pattern in expressionPatterns) {
        console.log(`${pattern}: ${expressionPatterns[pattern]} раз`);
    }
    
    // Проверяем, сколько комбинаций не используют плюс или минус вообще
    const noAddSubCombos = combinations.filter(combo => 
        !combo.operators.includes('+') && !combo.operators.includes('-')
    );
    
    console.log(`\nКомбинаций без сложения и вычитания: ${noAddSubCombos.length} (${Math.floor(noAddSubCombos.length / combinations.length * 100)}%)`);
    
    // Проверяем, сколько комбинаций используют только умножение
    const onlyMulCombos = combinations.filter(combo => 
        combo.operators.every(op => op === '*')
    );
    
    console.log(`Комбинаций только с умножением: ${onlyMulCombos.length} (${Math.floor(onlyMulCombos.length / combinations.length * 100)}%)`);
    
    // Проверяем, сколько комбинаций используют деление
    const withDivCombos = combinations.filter(combo => 
        combo.operators.includes('/')
    );
    
    console.log(`Комбинаций с делением: ${withDivCombos.length} (${Math.floor(withDivCombos.length / combinations.length * 100)}%)`);
}