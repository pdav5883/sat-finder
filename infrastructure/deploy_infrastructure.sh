################
# This script deploys the AWS resources required for bowl-pickem using CloudFormation.
# The input to the script is the name of the JSON parameters file used to define
# parameter values in the CFN stack.
#
# When the CFN stack is deployed, any lambda functions that are created/updated are populated with placeholder
# code, so this scripts also calls the deploy scripts for each lambda to upload code.
################

STACK_NAME="sat-finder"
TEMPLATE_NAME="sat-finder-cfn.yaml"

echo "Deploying $STACK_NAME cloudformation with params from ${1}"

aws cloudformation deploy \
  --template-file $TEMPLATE_NAME \
  --stack-name $STACK_NAME \
  --parameter-overrides file://${1} \
  --capabilities CAPABILITY_NAMED_IAM \
  # --no-execute-changeset

cd ../lambdas
bash deploy_common.sh
bash deploy_lambdas.sh
cd ../infrastructure

