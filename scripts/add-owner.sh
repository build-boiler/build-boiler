#!/bin/bash

cwd=`pwd`
cd packages/
for d in $(ls -d *); do npm owner add "$1" "$d"; done
cd $cwd
