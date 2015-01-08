sudo apt-get -y update
sudo apt-get -y install git

git clone https://github.com/nnance/devops.git

sh ./devops/ubuntu-aws/install-mongodb.sh
sh ./devops/ubuntu-aws/install-nodejs.sh
sh ./devops/ubuntu-aws/install-nodejs-build-tools.sh
