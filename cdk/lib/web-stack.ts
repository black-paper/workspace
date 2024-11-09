import {
  aws_lambda,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import { Construct } from "constructs";

export class WebStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
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

    const originBucket = new s3.Bucket(this, "OriginBucket", {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL, // バケットを非公開に設定
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    originBucket.grantRead(originAccessIdentity); // CloudFrontからのアクセスを許可

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new origins.S3Origin(originBucket, {
          originAccessIdentity: originAccessIdentity,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        edgeLambdas: [
          {
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
            functionVersion: originRequestEdgeLambda.currentVersion,
          },
        ],
      },
    });

    new s3deploy.BucketDeployment(this, "Deploy", {
      sources: [s3deploy.Source.asset("/workspace/frontend/out")],
      destinationBucket: originBucket,
      distribution: distribution,
      distributionPaths: ["/*"],
    });
  }
}
