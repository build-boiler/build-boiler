#!/usr/bin/env bash

# Temporary fix for Node.js 5 to 6 aupdate error:
#   (node:14471) fs: re-evaluating native module sources is not supported. If you are using the graceful-fs module, please update it to a more recent version.
# Updates any package by package name, version number, if set,
#   or graceful-fs to 4.1.3 by default.
# By default runs npm dedupe after applying fixes
#
# Usage: bash ./slv.graceful-fs.sh [MODULE VERSION [noddp]]
#   where
#   MODULE  - module name
#   VERSION - version in format \d+\.\d+\.\d+ (read as Perl GegExp)
#   noddp   - no dedupe

# Copyright 2016 Denis Bondarenko (https://github.com/bondden)
# The MIT License (https://opensource.org/licenses/MIT)
#

#clear

pkg='graceful-fs'
ver='4.1.3'
ddp='yes'

if [ "$1" != '' ]
then
  t=$(echo "$1" | grep -Pv '[a-z0-9\-]')
  if [ "$t"  == '' ]
  then
    pkg="$1"
  fi
fi

if [ "$2" != '' ]
then
  t=$(echo "$2" | grep -P '\d+\.\d+\.\d+')
  if [ "$t" != '' ]
  then
    ver="$2"
  fi
fi

if [ "$3" == 'noddp' ]
then
  ddp='no'
fi

d=$PWD

for p in $(tree -iaNf -P 'package.json' | grep 'package.json')
do

  rp=$(realpath $p)

  isGflFs=$(cat $rp | grep -P '"'$pkg'"[\s\t]*:[\s\t]*')
  if [ "$isGflFs" != '' ]
  then

    p1=$(realpath $(dirname $p))

    echo "processing $p1"

    sed -i -r 's/("'$pkg'"[ 	]*:[ 	]*)"(.+)"/\1"^'$ver'"/' $rp

    cd "$p1"

    npm i $pkg@$ver
    npm prune

    cd $d

  fi

done

cd $d

npm prune

if [ "$ddp" == 'yes' ]
then
  npm ddp
fi

npm ls $pkg
