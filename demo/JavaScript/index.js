import { AwsClient } from "aws4fetch";

if (typeof crypto === "undefined") {
  throw Error("Subtle crypto is not defined, please use NodeJS v20+");
}
const { API_URL, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;

if (!API_URL) {
  throw Error("API_URL not found in env");
}

const aws = new AwsClient({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  // Good to provide incase it fails to parse service and region from URL
  service: "execute-api",
  region: "us-east-1",
});

const res = await aws.fetch(API_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ message: "Hello from LearnAWS.io" }),
});

console.log(await res.text());
