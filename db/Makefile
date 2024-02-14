DC=docker compose

up-m1:
	$(DC) -f docker-compose.yml -f docker-compose.m1.yml up -d --build

up:
	$(DC) -f docker-compose.yml up -d --build

down:
	$(DC) -f docker-compose.yml down

clean:
	$(DC) -f docker-compose.yml down -v
