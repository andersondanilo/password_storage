#!/bin/sh

git branch -D gh-pages
git branch -D heroku-master

git branch gh-pages
git branch heroku-master

git filter-branch -f --subdirectory-filter client -- gh-pages
git filter-branch -f --subdirectory-filter api -- heroku-master

git push origin --delete gh-pages
git push heroku --delete master

git push origin gh-pages
git push heroku heroku-master:master
