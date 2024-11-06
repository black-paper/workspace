import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as iam from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

interface WebStackProps extends StackProps {
  originRequestEdgeLambda: cloudfront.experimental.EdgeFunction;
}

export class WebStack extends Stack {
  constructor(scope: Construct, id: string, props: WebStackProps) {
    super(scope, id, props);

    // TODO: 403エラーが出る。DLのS3設定と比較してみる
    const originBucket = new s3.Bucket(this, "OriginBucket", {
      websiteIndexDocument: "index.html",
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    const originAccessIdentify = new cloudfront.OriginAccessIdentity(
      this,
      "OriginAccessIdentify"
    );
    const originBucketPolicyStatement = new iam.PolicyStatement({
      actions: ["s3:GetObject"],
      effect: iam.Effect.ALLOW,
      principals: [
        new iam.CanonicalUserPrincipal(
          originAccessIdentify.cloudFrontOriginAccessIdentityS3CanonicalUserId
        ),
      ],
      resources: [`${originBucket.bucketArn}/*`],
    });
    originBucket.addToResourcePolicy(originBucketPolicyStatement);

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new origins.S3StaticWebsiteOrigin(originBucket, {
          originAccessControlId: originAccessIdentify.originAccessIdentityId,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        edgeLambdas: [
          {
            eventType: cloudfront.LambdaEdgeEventType.VIEWER_REQUEST,
            functionVersion: props.originRequestEdgeLambda.currentVersion,
          },
        ],
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: "/index.html",
          ttl: Duration.minutes(5),
        },
      ],
    });

    new s3deploy.BucketDeployment(this, "Deploy", {
      sources: [s3deploy.Source.asset("/workspace/frontend/out")],
      destinationBucket: originBucket,
      distribution: distribution,
      distributionPaths: ["/*"],
    });
  }
}
