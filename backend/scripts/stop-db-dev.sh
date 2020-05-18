#!/bin/bash

set -e

. ./.env

docker stop $DOCKER_PG_NAME