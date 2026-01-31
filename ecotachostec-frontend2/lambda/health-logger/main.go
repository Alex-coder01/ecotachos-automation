package main

import (
	"context"
	"encoding/json"
	"io"
	"log"
	"net/http"
	"os"

	"github.com/aws/aws-lambda-go/lambda"
)

type Health struct {
	Status    string `json:"status"`
	Message   string `json:"message"`
	Timestamp string `json:"timestamp"`
}

func handler(ctx context.Context) (string, error) {
	url := os.Getenv("HEALTH_URL")
	if url == "" {
		url = "https://example.com/api/ia/health"
	}
	resp, err := http.Get(url)
	if err != nil {
		log.Printf("health fetch error: %v", err)
		return "error", nil
	}
	defer resp.Body.Close()
	b, _ := io.ReadAll(resp.Body)
	var h Health
	_ = json.Unmarshal(b, &h)
	log.Printf("health: %s %s", h.Status, h.Message)
	return string(b), nil
}

func main() { lambda.Start(handler) }
