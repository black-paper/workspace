#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { WebStack } from "../lib/web-stack";

const app = new cdk.App();

new WebStack(app, "web-api", {
  env: { region: "us-east-1" },
});
