# Stage 1: Build
FROM golang:1.25.1 AS builder 

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -a -o main .

# Stage 2: Run
FROM alpine:latest

RUN apk --no-cache add ca-certificates curl

WORKDIR /root
COPY --from=builder /app/main .   

ENTRYPOINT ["./main"]
