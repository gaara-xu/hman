#!/bin/bash
# 自动化构建脚本，适用于 book 分支
set -e
git pull origin hman
# 清理旧的构建目录
rm -rf dist
rm -rf node_modules
rm -rf /gaara/Code/staticPage/*

# 拷贝当前目录所有文件到 /gaara/Code/staticPage
cp -r ./* /gaara/Code/staticPage/


# 安装依赖
echo "==> 执行 npm install"
docker exec node2 npm install

# 执行构建
echo "==> 执行 npm run build"
docker exec node2 npm run build


# 迁移dist
mv /gaara/Code/staticPage/dist /gaara/Code/hman/
# 重载 Nginx
echo "==> 重载 Nginx 配置"
nginx -s reload

# 构建完成后删除文件
rm -rf /gaara/Code/staticPage/*
