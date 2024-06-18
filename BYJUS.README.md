# Byjus

## Commands

### Build the server (Original)

```shell
cd ./dev/
rush docker:build
```

### Run the server (Custom)

```shell
cd ./dev/
docker compose -f docker-compose.platform.byjus.onl.yaml up -d --force-recreate
```