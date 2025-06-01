install: # чистая установка зависимостей (устанавливает зависимости строго по package-lock.json)
	npm ci

link: # генерация ссылки
	npm link

# перед этим использовать make link (npm link)
publish: #отладка публикации
	npm publish --dry-run

lint: # запуск линтера
	npx eslint .

build: # сборка в директорию dist
	npm run build

serve: # сборка в браузере без сохранения в директорию dist
	npm run serve