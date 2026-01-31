package main

import (
	"context"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"io"
	"log"
	"mime"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cloudfront"
	cfTypes "github.com/aws/aws-sdk-go-v2/service/cloudfront/types"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
)

func main() {
	buildDir := env("BUILD_DIR", "dist")
	s3Bucket := os.Getenv("S3_BUCKET")
	region := env("AWS_REGION", "us-east-1")
	cfDist := os.Getenv("CLOUDFRONT_DISTRIBUTION_ID")

	if s3Bucket == "" {
		log.Fatal("S3_BUCKET secret is required")
	}

	ctx := context.Background()
	cfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(region))
	if err != nil {
		log.Fatalf("AWS config error: %v", err)
	}
	s3Client := s3.NewFromConfig(cfg)

	uploaded := 0
	err = filepath.Walk(buildDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}

		key := filepath.ToSlash(strings.TrimPrefix(path, buildDir))
		if strings.HasPrefix(key, "/") {
			key = key[1:]
		}

		f, err := os.Open(path)
		if err != nil {
			return err
		}
		defer f.Close()

		// detect content type
		ct := mime.TypeByExtension(filepath.Ext(path))
		if ct == "" {
			buf := make([]byte, 512)
			n, _ := f.Read(buf)
			ct = httpDetectContentType(buf[:n])
			if _, err := f.Seek(0, io.SeekStart); err != nil {
			}
		}

		cacheControl := "public, max-age=31536000"
		if strings.HasSuffix(path, "index.html") {
			cacheControl = "no-cache"
		}

		// compute ETag
		h := sha1.New()
		if _, err := io.Copy(h, f); err != nil {
			return err
		}
		etag := hex.EncodeToString(h.Sum(nil))
		if _, err := f.Seek(0, io.SeekStart); err != nil {
			return err
		}

		_, err = s3Client.PutObject(ctx, &s3.PutObjectInput{
			Bucket:       &s3Bucket,
			Key:          &key,
			Body:         f,
			ContentType:  &ct,
			CacheControl: &cacheControl,
			Metadata:     map[string]string{"ETag": etag},
			ACL:          types.ObjectCannedACLPrivate,
		})
		if err != nil {
			return fmt.Errorf("upload %s: %w", key, err)
		}
		uploaded++
		log.Printf("Uploaded: %s (%s)", key, ct)
		return nil
	})
	if err != nil {
		log.Fatal(err)
	}
	log.Printf("Total uploaded: %d files", uploaded)

	if cfDist != "" {
		cf := cloudfront.NewFromConfig(cfg)
		caller := fmt.Sprintf("deploy-%d", os.Getpid())
		_, err := cf.CreateInvalidation(ctx, &cloudfront.CreateInvalidationInput{
			DistributionId: &cfDist,
			InvalidationBatch: &cfTypes.InvalidationBatch{
				CallerReference: &caller,
				Paths: &cfTypes.Paths{
					Quantity: 1,
					Items:    []string{"/*"},
				},
			},
		})
		if err != nil {
			log.Fatalf("CloudFront invalidation error: %v", err)
		}
		log.Println("CloudFront invalidation requested: /*")
	} else {
		log.Println("CLOUDFRONT_DISTRIBUTION_ID not set; skipped invalidation")
	}
}

// Minimal content-type detection fallback
func httpDetectContentType(b []byte) string {
	// replicate http.DetectContentType without importing net/http to keep binary lean
	// Note: In practice you can use net/http.DetectContentType.
	return detectContentType(b)
}

// detectContentType mirrors http.DetectContentType signature using net/http
// but we keep it simple to avoid extra imports.
func detectContentType(b []byte) string {
	// very small heuristic
	if len(b) >= 4 && string(b[:4]) == "\x89PNG" {
		return "image/png"
	}
	if len(b) >= 3 && string(b[:3]) == "GIF" {
		return "image/gif"
	}
	if len(b) >= 2 && b[0] == 0xFF && b[1] == 0xD8 {
		return "image/jpeg"
	}
	return "application/octet-stream"
}
