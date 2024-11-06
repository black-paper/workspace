import { aws_lambda, Duration, Stack, StackProps } from "aws-cdk-lib";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import { Construct } from "constructs";

export class LambdaEdgeStack extends Stack {
  originRequestEdgeLambda: cloudfront.experimental.EdgeFunction;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const originRequestEdgeLambda = new cloudfront.experimental.EdgeFunction(
      this,
      "edge-origin-request",
      {
        code: aws_lambda.Code.fromAsset("/workspace/cdk/lambda/edge"),
        functionName: "OriginRequestLambda",
        handler: "rewrite-trailing-slash.handler",
        runtime: aws_lambda.Runtime.PYTHON_3_12,
        memorySize: 128,
        timeout: Duration.seconds(5),
      }
    );
    this.originRequestEdgeLambda = originRequestEdgeLambda;
  }
}
