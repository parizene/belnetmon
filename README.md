# [belnetmon](https://belnetmon.com)

## db

```
cd db/
```

Create network:

```
docker network create belnetmon-network
```

Run docker container with database:

```
make up
```

Change to app directory:

```
cd ../app
```

Install Node.js:

```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm --version
nvm install --lts
nvm use --lts
```

Ensure the downloaded CSV files are placed in the `csv` folder.

Install dependencies:

```
npm install
```

Validate data in CSV files and fix errors:

```
npm run validate
```

Populate database with data from CSV files:

```
npm run migrate-db
npm run init-db
npm run populate-db
```

## app

Start the application:

```
cd app/
make up
```

## legacy

Change to legacy directory and start the legacy system:

```
cd legacy/
docker-compose up -d --build
```
