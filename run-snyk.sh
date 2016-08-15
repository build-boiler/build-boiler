#! /bin/bash

if [[ "$#" != 1 || $1 != "wizard" && $1 != "test" ]]
then
    echo "Usage: ./run-snyk.sh (wizard|test)"
    exit 0
fi

for directory in packages/*
do
    (echo "Checking vulnerabilities in $directory" && cd $directory && snyk $1)
done
