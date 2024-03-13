import { AwsClient } from "aws4fetch";
import { FormEventHandler, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;
function App() {
  const [msg, setMsg] = useState("");

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    // extract form data from the form
    const data = new FormData(e.currentTarget);
    const { id, secret, message } = Object.fromEntries(data) as {
      id: string;
      secret: string;
      message: string;
    };

    // create new AWS client
    const aws = new AwsClient({
      accessKeyId: id,
      secretAccessKey: secret,
      // Good to provide in case it fails to parse service and region from URL
      service: "execute-api",
      region: "us-east-1",
    });

    // use fetch from aws client instead of global fetch
    const res = await aws.fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    // update the message state
    setMsg(await res.text());
  };
  return (
    <>
      <form onSubmit={handleSubmit} className="form-container">
        <input name="id" required type="text" placeholder="Access Key ID" />
        <input
          name="secret"
          required
          type="password"
          placeholder="Secret Access Key"
        />
        <textarea
          name="message"
          required
          placeholder="Type your message"
          defaultValue="Hello from LearnAWS.io"
        ></textarea>
        <button type="submit">Submit</button>
      </form>
      <code>{msg}</code>
    </>
  );
}

export default App;
