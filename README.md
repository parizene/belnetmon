# [belnetmon](https://belnetmon.bn.by)

## legacy
```
cd legacy/
docker-compose up -d
```

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

Run docker container with database:
```
make up-prod
```

Populate database with data from csv files:
```
npm install
npm run populate
```

Url to view database in pgAdmin:
```
http://localhost:5050/
```
