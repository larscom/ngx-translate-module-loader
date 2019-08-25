#!/bin/bash

# exit on error
set -e

# allowed versions
declare -a versions
versions=(patch minor major)

if [ "$1" ] && [ "$2" ]; then
  # create .git directory
  mkdir -p projects/ngx-translate-module-loader/.git

  if [[ ! "${versions[@]}" =~ "$1" ]]; then
    echo "$1 is not valid. Try one of the following: ${versions[*]}"
    exit 1
  fi

  #run test
  npm run test -- --watch=false

  #update projects/ngx-translate-module-loader/package.json
  npm version "$1" --prefix projects/ngx-translate-module-loader -m "$2"

  #push changes
  git push --follow-tags
  echo "publishing in progress..."
else
  echo "provide version type and a commit message as argument! e.g.: ./publish.sh patch \"my commit message\" "
  exit 1
fi
