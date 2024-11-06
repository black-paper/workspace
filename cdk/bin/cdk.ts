#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { WebStack } from "../lib/web-stack";
import { LambdaEdgeStack } from "../lib/lambdaedge-stack";

const app = new cdk.App();

const lambdaEdgeStack = new LambdaEdgeStack(app, "lambda-edge-stack", {
  env: { region: "us-east-1" },
  crossRegionReferences: true,
});
const webStack = new WebStack(app, "web-api", {
  env: { region: "ap-northeast-1" },
  originRequestEdgeLambda: lambdaEdgeStack.originRequestEdgeLambda,
  crossRegionReferences: true,
});

webStack.addDependency(lambdaEdgeStack);
