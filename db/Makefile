DC=docker compose
PROJECT_NAME=belnetmon

up-m1:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml -f docker-compose.m1.yml up -d --build

up:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml up -d --build

down:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml down

clean:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml down -v

.PHONY: up-m1 up down clean