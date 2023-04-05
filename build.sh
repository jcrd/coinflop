#!/bin/bash

pushd frontend
npm ci
npm run build
popd

pushd backend
npm ci
ln -s ../frontend/build frontend
