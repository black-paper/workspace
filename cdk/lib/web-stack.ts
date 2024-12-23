import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { create_frontend } from "./cloudfront";

export class WebStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    create_frontend(this);
  }
}
