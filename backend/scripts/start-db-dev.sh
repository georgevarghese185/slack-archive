#!/bin/bash

set -e

. ./.env

EXISTING=$(docker ps -a --filter "name=$DOCKER_PG_NAME" --format="{{.ID}}" | wc -l)

if [[ $EXISTING -gt 0 ]]
then
    docker start $DOCKER_PG_NAME
else
    docker run -d --name $DOCKER_PG_NAME \
        -e POSTGRES_USER="$DOCKER_PG_USER" \
        -e POSTGRES_PASSWORD="$DOCKER_PG_PASSWORD" \
        -e POSTGRES_DB="$DOCKER_PG_DB" \
        -p 127.0.0.1:$DOCKER_PG_PORT:5432/tcp \
        postgres:12.3
fi