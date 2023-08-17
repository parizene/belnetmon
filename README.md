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
place downloaded csv files in `csv` folder

migrate to utf-8:
```
./unicode.sh
```
```
npm install
```
check for invalid data:
```
npm run validate
```
start docker:
```
make up-prod
```
populate with data from csv files:
```
npm run populate
```
view db in pgAdmin
```
http://localhost:5050/
```
