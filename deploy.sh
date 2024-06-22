#!/bin/bash

# current_branch=$(git branch | grep "*")
# if [ "$current_branch" != "* master" ]; then
#   echo "Not in master"
#   exit 1
# fi

echo "In $current_branch"

mv .env* ..
mv .git* ..
mv node_modules ..
mv .vscode ..
cd ..
tar cvzf MercleIndexer.tar MercleIndexer/
scp -i "~/.ssh/daohook-prod.pem" MercleIndexer.tar ec2-user@ec2-54-161-78-92.compute-1.amazonaws.com:/home/ec2-user/

mv .git* MercleIndexer
mv node_modules MercleIndexer
mv .vscode MercleIndexer
mv .env* MercleIndexer

ssh_run_server() {
    echo "ssh -i " $1 $2
ssh -i $1 $2 << EOF
  rm -rf _MercleIndexer
  mv MercleIndexer _MercleIndexer
  tar xvzf MercleIndexer.tar
  cp _MercleIndexer/.env* MercleIndexer/
  rm MercleIndexer.tar
  cd MercleIndexer
  npm i
  cd ..
  cd MercleIndexer
  pm2 reload all
EOF
}

ssh_run_server "~/.ssh/daohook-prod.pem" ec2-user@ec2-54-161-78-92.compute-1.amazonaws.com
