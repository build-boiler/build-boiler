#!/bin/bash
echo "Publish";
export NPM_V=`sed -n 's/.*"version":.*\([0-9]\{1,\}\.[0-9]\{1,\}\.[0-9]\{1,\}.*\)/\1/p' package.json`;
echo "Package Version: ${NPM_V}"
echo "Tag: ${TRAVIS_TAG}"
if [[ ${TRAVIS_TAG} == ${NPM_V} ]]
	then
		echo "Publishing package ${TRAVIS_TAG}";
		echo "//registry.npmjs.org/:_password=${NPM_PASSWORD}" > ~/.npmrc
    echo "//registry.npmjs.org/:_authToken=${NPM_AUTH}" >> ~/.npmrc
		echo "//registry.npmjs.org/:username=dtothefp" >> ~/.npmrc
		echo "//registry.npmjs.org/:email=dtothefp@gmail.com" >> ~/.npmrc
    ls -la
		npm publish ./ --tag plus
		echo "Success"
	else
		echo "Publishing package ${TRAVIS_TAG} failed (versions not in alignment with ${NPM_V})"
		exit 1
fi
