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

Populate database with data from csv files:
```
npm install
npm run populate
```

Url to view database in pgAdmin:
```
http://localhost:5051/
```

## app
```
cd app/
make up
```

Url to view app:
```
http://localhost:5000/
```

## legacy
```
cd legacy/
docker-compose up -d
```
