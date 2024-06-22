scp -i "~/.ssh/daohook-prod.pem" .env_prod ec2-user@ec2-54-161-78-92.compute-1.amazonaws.com:/home/ec2-user/MercleIndexer/.env

ssh_run_server() {
    echo "ssh -i " $1 $2
ssh -i $1 $2 << EOF
  cd MercleIndexer
  pm2 reload all
EOF
}

ssh_run_server "~/.ssh/daohook-prod.pem" ec2-user@ec2-54-161-78-92.compute-1.amazonaws.com
