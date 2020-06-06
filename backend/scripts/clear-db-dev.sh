#!/bin/bash

set -e

. ./.env

PGPASSWORD=$DOCKER_PG_PASSWORD psql \
    -U $DOCKER_PG_USER \
    -d $DOCKER_PG_DB \
    -h 127.0.0.1 \
    -p $DOCKER_PG_PORT \
    -c 'DELETE FROM backups;
        DELETE FROM messages;
        DELETE FROM members;
        DELETE FROM conversations;'