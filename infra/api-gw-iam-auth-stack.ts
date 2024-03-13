import * as cdk from "aws-cdk-lib";
import {
  CorsHttpMethod,
  HttpApi,
  HttpMethod,
  HttpNoneAuthorizer,
} from "aws-cdk-lib/aws-apigatewayv2";
import { HttpIamAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";

export class ApiGwIamAuthStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const apiHandlerFn = new NodejsFunction(this, "apigw-handler", {
      runtime: Runtime.NODEJS_20_X,
      bundling: {
        format: OutputFormat.ESM,
        target: "esnext",
        banner: `import { createRequire } from 'module';const require = createRequire(import.meta.url);`,
      },
      entry: `${__dirname}/api-handler-fn.ts`,
      timeout: cdk.Duration.seconds(10),
    });

    const lambdaFnIntegration = new HttpLambdaIntegration(
      "api-handler",
      apiHandlerFn,
    );

    // The code that defines your stack goes here
    const api = new HttpApi(this, "humbleinvestor-blogs-api", {
      corsPreflight: {
        allowMethods: [CorsHttpMethod.ANY],
        // add your production url
        allowOrigins: ["http://localhost:5173"],
        allowHeaders: [
          "Authorization",
          "X-Amz-Date",
          "Content-Type",
          "x-requested-with",
        ],
        maxAge: cdk.Duration.days(1),
      },
      defaultAuthorizer: new HttpIamAuthorizer(),
      defaultIntegration: lambdaFnIntegration,
    });

    api.addRoutes({
      path: "/{proxy+}",
      methods: [HttpMethod.OPTIONS],
      authorizer: new HttpNoneAuthorizer(),
      integration: lambdaFnIntegration,
    });

    new cdk.CfnOutput(this, "API_URL", {
      value: api.url!,
    });
  }
}
