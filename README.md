# [belnetmon](https://belnetmon.bn.by)

## db
```
cd db/
```

Place downloaded csv files in `csv` folder.

Migrate csv files to utf-8, validate data:
```
cd scripts
./unicode.sh

pip install pandas
python validate.py
```

Create network:
```
docker network create belnetmon-network
```

Run docker container with database:
```
make up
```

Install Node.js
```
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm --version
nvm install --lts
nvm use --lts
```

Populate database with data from csv files:
```
npm install
npm run populate
```

## app
```
cd app/
make up
```

## legacy
```
cd legacy/
docker-compose up -d --build
```
