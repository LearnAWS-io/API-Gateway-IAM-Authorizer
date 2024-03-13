import { APIGatewayProxyHandlerV2 } from "aws-lambda";

export const handler: APIGatewayProxyHandlerV2 = async (e) => {
  if (e.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 204,
    };
  }

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify(
      {
        method: e.requestContext.http.method,
        path: e.requestContext.http.path,
        body: e.body ? JSON.parse(e.body) : "",
      },
      null,
      4,
    ),
  };
};
