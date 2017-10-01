#!/bin/zsh

CURRENT=$(pwd)
echo $CURRENT
cd $CURRENT/typescript

echo "Compiling App"
tsc --experimentalDecorators --emitDecoratorMetadata --lib es6 --target es5 --outDir ../dest web.ts
