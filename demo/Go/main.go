package main

import (
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"time"

	v4 "github.com/aws/aws-sdk-go-v2/aws/signer/v4"
	config "github.com/aws/aws-sdk-go-v2/config"
)

func main() {
	ctx := context.Background()
	signer := v4.NewSigner()

	// Load default AWS config from ENV or file
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion("us-east-1"),
	)
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	// Retrieve credentials of AWS (Access Key, Secret)
	credentials, err := cfg.Credentials.Retrieve(context.TODO())

	// create JSON body
	body := map[string]interface{}{
		"message": "Hello from LearnAWS.io",
	}

	jsonBody, _ := json.Marshal(body)

	// Get API URL from env
	apiUrl := os.Getenv("API_URL")

	if apiUrl == "" {
		log.Fatal("API_URL not found in env")
	}

	httpReq, err := http.NewRequest("POST", apiUrl, bytes.NewReader(jsonBody))

	httpReq.Header.Add("Content-Type", "application/json")

	// Generate sha256 of json body
	payloadSha := sha256.Sum256([]byte(jsonBody))

	// Sign the HTTP request
	signer.SignHTTP(
		ctx,
		credentials,
		httpReq,
		// encode payload Sha256 into hex
		hex.EncodeToString(payloadSha[:]),
		"execute-api", "us-east-1", time.Now(),
	)

	client := &http.Client{}

	resp, err := client.Do(httpReq)
	bodyBytes, err := io.ReadAll(resp.Body)
	resp.Body.Close()

	fmt.Print(string(bodyBytes))

}
