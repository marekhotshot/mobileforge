#!/bin/bash

# MobileForge Kubernetes Deployment Script
# This script deploys MobileForge to the user's K3s cluster

set -e

echo "🚀 Starting MobileForge deployment to K3s cluster..."

# Configuration
KUBECONFIG_PATH="/home/ubuntu/mobileforge-kubeconfig.yaml"
NAMESPACE="mobileforge"
DOMAIN="mobileforge.dev"  # Change this to your actual domain

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "📦 Installing kubectl..."
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    chmod +x kubectl
    sudo mv kubectl /usr/local/bin/
fi

# Set kubeconfig
export KUBECONFIG=$KUBECONFIG_PATH

echo "🔍 Checking cluster connectivity..."
kubectl cluster-info

echo "📁 Creating namespace..."
kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -

echo "🏗️ Building frontend production build..."
cd /home/ubuntu/mobileforge-frontend
pnpm run build

echo "📦 Creating frontend ConfigMap..."
kubectl create configmap mobileforge-frontend-build \
  --from-file=dist/ \
  --namespace=$NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

echo "📦 Creating backend ConfigMap..."
cd /home/ubuntu/mobileforge-backend
kubectl create configmap mobileforge-backend-code \
  --from-file=. \
  --namespace=$NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

echo "🔐 Creating secrets (you'll need to update with real API keys)..."
kubectl create secret generic mobileforge-secrets \
  --from-literal=openai-api-key="your-openai-api-key-here" \
  --namespace=$NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -

echo "🚀 Deploying MobileForge to Kubernetes..."
cd /home/ubuntu
kubectl apply -f mobileforge-k8s-deployment.yaml

echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/mobileforge-frontend -n $NAMESPACE
kubectl wait --for=condition=available --timeout=300s deployment/mobileforge-backend -n $NAMESPACE

echo "📊 Checking deployment status..."
kubectl get pods -n $NAMESPACE
kubectl get services -n $NAMESPACE
kubectl get ingress -n $NAMESPACE

echo "🎉 MobileForge deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Update DNS to point $DOMAIN to your cluster IP"
echo "2. Update the OpenAI API key in the secret:"
echo "   kubectl patch secret mobileforge-secrets -n $NAMESPACE -p '{\"data\":{\"openai-api-key\":\"<base64-encoded-key>\"}}'"
echo "3. Access MobileForge at: https://$DOMAIN"
echo ""
echo "🔧 Useful commands:"
echo "  kubectl logs -f deployment/mobileforge-frontend -n $NAMESPACE"
echo "  kubectl logs -f deployment/mobileforge-backend -n $NAMESPACE"
echo "  kubectl get pods -n $NAMESPACE"
echo "  kubectl describe ingress mobileforge-ingress -n $NAMESPACE"

