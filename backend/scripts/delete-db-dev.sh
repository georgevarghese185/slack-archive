#!/bin/bash

set -e

. ./.env

docker stop $DOCKER_PG_NAME && docker rm $DOCKER_PG_NAME

echo "Deleted Development DB docker container"