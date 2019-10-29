if [ $TRAVIS_PULL_REQUEST == false ]; then
  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis CI"

  git checkout master
  git stash

  mkdir -p projects/ngx-translate-module-loader/.git
  git remote set-url origin "https://${GITHUB_USERNAME}:${GITHUB_API_TOKEN}@github.com/${GITHUB_USERNAME}/ngx-translate-module-loader.git"

  # By default use npm version patch
  version="patch"

  if [ $TRAVIS_COMMIT_MESSAGE == *"[Minor]"* ]; then
    version="minor"
  fi

  if [ $TRAVIS_COMMIT_MESSAGE == *"[Major]"* ]; then
    version="major"
  fi

  npm version $version --prefix projects/ngx-translate-module-loader -m "[Travis] - #${TRAVIS_BUILD_NUMBER} - ${TRAVIS_COMMIT_MESSAGE}"

  sleep 1

  git push --follow-tags
fi
