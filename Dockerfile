# syntax=docker/dockerfile:1
FROM mcr.microsoft.com/devcontainers/typescript-node:0-20

# Install specific Node.js version
RUN npm install -g n && n 20.18.0

ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get update && apt-get install -y \
    python3.10\
    python3-pip

RUN echo -n '\n\
    alias python="python3"\n\
    alias pip="pip3"\n\
    \n\
    ' >> /root/.bashrc

COPY ./requirements.txt /tmp/

RUN python3 -m pip install -r /tmp/requirements.txt

# Install AWS CLI
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" && \
    unzip awscliv2.zip && \
    ./aws/install && \
    rm -rf awscliv2.zip aws

# Install AWS CDK
RUN npm install -g aws-cdk

WORKDIR /workspace/