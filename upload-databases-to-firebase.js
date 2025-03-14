/**
 * Скрипт для загрузки баз данных комбинаций в Firebase Firestore
 * 
 * Для запуска:
 * 1. Установите Firebase Admin SDK: npm install firebase-admin
 * 2. Скачайте ключ сервисного аккаунта из консоли Firebase
 * 3. Запустите скрипт: node upload-databases-to-firebase.js
 */

const admin = require('firebase-admin');
const fs = require('fs');

// Путь к файлу с ключом сервисного аккаунта (скачайте из консоли Firebase)
const serviceAccount = require('./serviceAccountKey.json');

// Инициализация Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Получение экземпляра Firestore
const db = admin.firestore();

// Функция для загрузки комбинаций в Firestore
async function uploadCombinations(collectionName, filePath) {
  console.log(`Загрузка комбинаций из ${filePath} в коллекцию ${collectionName}...`);

  try {
    // Чтение файла JSON
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Максимальное количество операций в одном пакете (ограничение Firestore)
    const MAX_BATCH_SIZE = 500;
    let count = 0;
    let totalCount = 0;
    let batch = db.batch(); // Создаем новый пакет

    // Добавление комбинаций в пакет
    for (let i = 0; i < data.length; i++) {
      const combination = data[i];
      const docRef = db.collection(collectionName).doc();
      batch.set(docRef, combination);
      count++;
      totalCount++;

      // Если достигли максимального размера пакета, выполняем запись
      if (count >= MAX_BATCH_SIZE) {
        console.log(`Загружаем пакет ${Math.ceil(totalCount / MAX_BATCH_SIZE)}...`);
        await batch.commit();
        console.log(`Загружено ${totalCount} комбинаций`);

        // Создаем новый пакет для следующей порции данных
        batch = db.batch();
        count = 0;
      }
    }

    // Выполняем запись оставшихся комбинаций
    if (count > 0) {
      await batch.commit();
      console.log(`Загружено ${totalCount} комбинаций`);
    }

    console.log(`Загрузка в коллекцию ${collectionName} завершена успешно!`);
    return totalCount;
  } catch (error) {
    console.error(`Ошибка при загрузке комбинаций в ${collectionName}:`, error);
    throw error;
  }
}

// Основная функция
async function main() {
  try {
    // Загрузка баз данных для разных уровней сложности
    console.log('Начинаем загрузку баз данных в Firestore...');

    // Загружаем базы данных последовательно, чтобы избежать перегрузки
    console.log('\n=== Загрузка легкого уровня ===');
    const easyCount = await uploadCombinations('combinations_easy', 'valid-combinations.json');

    console.log('\n=== Загрузка среднего уровня ===');
    const mediumCount = await uploadCombinations('combinations_medium', 'medium-difficulty-combinations.json');

    console.log('\n=== Загрузка трудного уровня ===');
    const hardCount = await uploadCombinations('combinations_hard', 'hard-difficulty-combinations.json');

    console.log('\n=== Итоги загрузки ===');
    console.log(`Легкий уровень: ${easyCount} комбинаций`);
    console.log(`Средний уровень: ${mediumCount} комбинаций`);
    console.log(`Трудный уровень: ${hardCount} комбинаций`);
    console.log('\nВсе базы данных успешно загружены в Firestore!');
  } catch (error) {
    console.error('Произошла ошибка при загрузке баз данных:', error);
  } finally {
    // Завершаем процесс
    console.log('\nЗавершение работы скрипта...');
    process.exit(0);
  }
}

// Запуск основной функции
main();