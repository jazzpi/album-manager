# Album Manager

An app for managing albums on Spotify. Instance available at
[albums.jazzpi.de](https://albums.jazzpi.de)

## Install

Clone the repository, run `yarn` and then `yarn run dev`.

For production, instead run

```sh
yarn run build
cd build
cp ../package.json ../yarn.lock .
yarn install --prod
```

Then, you can run the server with

```sh
cd /path/to/album-manager
node -r dotenv/config build
```
