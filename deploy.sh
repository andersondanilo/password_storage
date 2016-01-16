#!/bin/sh

git checkout master

git branch -D gh-pages
git checkout gh-pages-production
git branch gh-pages
git filter-branch -f --subdirectory-filter client -- gh-pages

git checkout master
git branch -D heroku-master
git branch heroku-master
git filter-branch -f --subdirectory-filter api -- heroku-master

git push origin gh-pages
git push heroku heroku-master:master
