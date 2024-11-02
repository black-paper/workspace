# WebAPI

## 概要

- API を AWS で作成し、Next.js で作成したフロントエンドから使用する
- この構成はメインの仕事で使用することが多いが、**新しい技術や手法のキャッチアップ目的で新しい試みを行っていく**

## インフラ

- AWS CDK を使用し、AWS 環境を構築する

## バックエンド

- API Gateway をエンドポイントとする
- 基本的に、API Gateway から Lambda に接続する構成を検討している

## フロントエンド

- Next.js を使用し、フロントエンドを構築する

## 参考

- https://aws.amazon.com/jp/builders-flash/202411/operate-infrastructure-with-cdk/
- https://catalog.us-east-1.prod.workshops.aws/workshops/10141411-0192-4021-afa8-2436f3c66bd8/en-US/2000-typescript-workshop/200-create-project/210-cdk-init