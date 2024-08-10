DC=docker compose
PROJECT_NAME=belnetmon

up:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml up -d --build

down:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml down

clean:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml down -v

.PHONY: up down clean