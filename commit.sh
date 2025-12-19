#!/bin/bash
# 用法: sh commit.sh "提交说明"


msg=$1
if [ -z "$msg" ]; then
  msg="auto: commit by commit.sh on $(date '+%Y-%m-%d %H:%M:%S')"
fi

git add .
git commit -m "$msg"
git pull --rebase
git push origin tiktok
