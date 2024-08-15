DC=docker compose
PROJECT_NAME=belnetmon

# Development
up-dev:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml up -d --build

down-dev:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml down

clean-dev:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml down -v

# Production
up-prod:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml -f docker-compose.traefik.yml up -d --build

down-prod:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml -f docker-compose.traefik.yml down

clean-prod:
	$(DC) -p $(PROJECT_NAME) -f docker-compose.yml -f docker-compose.traefik.yml down -v

.PHONY: up-dev down-dev clean-dev up-prod down-prod clean-prod
