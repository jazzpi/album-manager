#!/usr/bin/env sh

set -e

# We can't run the build step during the image build because it requires
# configuration variables from the environment.
yarn run build
cd build
cp ../package.json ../yarn.lock .
yarn install --production
cd ..

node -r dotenv/config build
