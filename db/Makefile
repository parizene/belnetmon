DC=docker compose
PROJECT_NAME=belnetmon

up-arm64:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml -f docker-compose.arm64.yml up -d --build

down-arm64:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml -f docker-compose.arm64.yml down

clean-arm64:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml -f docker-compose.arm64.yml down -v

up:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml up -d --build

down:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml down

clean:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml down -v

.PHONY: up-arm64 down-arm64 clean-arm64 up down clean