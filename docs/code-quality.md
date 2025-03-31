# Налаштування контролю якості коду

## 1️⃣ Налаштування pre-commit хуків
Щоб автоматично запускати ESLint перед комітом, використовуємо `husky` та `lint-staged`.

### Встановлення залежностей
```sh
npm install --save-dev husky lint-staged
```

### Ініціалізація husky
```sh
npx husky install
```
Це створить `.husky/` каталог.

### Додавання pre-commit хука
```sh
npx husky add .husky/pre-commit "npx lint-staged"
```

### Налаштування lint-staged у package.json
Додайте секцію:
```json
"lint-staged": {
  "**/*.js": "eslint --fix",
  "**/*.ts": "eslint --fix",
  "**/*.py": "mypy --ignore-missing-imports"
}
```

Тепер перед комітом ESLint виправлятиме помилки у JavaScript/TypeScript, а mypy перевірятиме Python-код.

---

## 2️⃣ Інтеграція лінтингу у процес збірки
Щоб ESLint виконувався під час збірки, оновіть `package.json`:
```json
"scripts": {
  "build": "npm run lint && expo build",
  "lint": "eslint . --ext .js,.jsx,.ts,.tsx"
}
```

Тепер перед збіркою проєкт проходитиме перевірку ESLint.

---

## 3️⃣ Додавання статичної типізації

### **TypeScript (для JavaScript/React)**
```sh
npm install --save-dev typescript @types/react @types/react-native
```

Створіть `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "jsx": "react-native",
    "allowJs": true,
    "skipLibCheck": true
  }
}
```

### **mypy (для Python)**
```sh
pip install mypy
```
Додайте `mypy.ini`:
```ini
[mypy]
ignore_missing_imports = True
strict = True
```

---

## 4️⃣ Скрипт для комплексної перевірки коду
Щоб запускати лінтинг, типізацію та тести однією командою, додайте в `package.json`:
```json
"scripts": {
  "check": "npm run lint && npm run type-check && npm test",
  "type-check": "tsc --noEmit"
}
```
Запуск:
```sh
npm run check
```
Це виконає ESLint, TypeScript-аналізатор та тести.

---

## 5️⃣ Оновлення документації
Створіть файл `docs/code-quality.md`:

### **Git hooks**
Ми використовуємо `husky` та `lint-staged` для перевірки коду перед комітом.

```sh
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

Тепер перед комітом запускається ESLint та mypy.

### **Інтеграція з процесом збірки**
Перед збіркою проєкт проходить лінтинг:
```sh
npm run build
```
Якщо є помилки, збірка не розпочнеться.

### **Статична типізація**
Ми використовуємо TypeScript для JavaScript та mypy для Python:
```sh
npm run type-check
mypy .
```

