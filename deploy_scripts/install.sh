#!/bin/bash

# Install procedure for all the dependencies
# required for both `functions` directory
# and `frontend` directory

### Installation procedure for functions
cd functions
nvm use 7
npm Install # Can't use Yarn with functions :( 

cd ..

### Installation procedure for front end stuff
cd frontend

### Running `yarn` for frontend, will probably add caching too
yarn
