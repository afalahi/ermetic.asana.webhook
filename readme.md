# DISCLAIMER

This code is provided to you expressly as an example (“Sample Code”). It is the responsibility of the individual recipient user, in his/her sole discretion, to diligence such Sample Code for accuracy, completeness, security, and final determination for appropriateness of use.

ANY SAMPLE CODE IS PROVIDED ON AN “AS IS” IS BASIS, WITHOUT WARRANTY OF ANY KIND. FORGEROCK AND ITS LICENSORS EXPRESSLY DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WITHOUT LIMITATION, THE IMPLIED WARRANTIES OF MERCHANTABILITY, OR FITNESS FOR A PARTICULAR PURPOSE.

Ermetic SHALL NOT HAVE ANY LIABILITY ARISING OUT OF OR RELATING TO ANY USE, IMPLEMENTATION, INTEGRATION, OR CONFIGURATION OF ANY SAMPLE CODE IN ANY PRODUCTION ENVIRONMENT OR FOR ANY COMMERCIAL DEPLOYMENT(S).

## Asana Lambda Webhook

Clone the project

```console
git clone https://github.com/afalahi/ermetic.asana.webhook.git
```

Install dependencies

```console
npm install
```

To build the zip run

```console
npm run build
```

this will create a `dist` directory with transpiled code and zips the content.

## Upload to Lambda

- Create a lambda execution role per aws documentation
- Create a new SSM securestring ssm parameter named ASANA_TOKEN and have your token as it's value
- Run the following command from the `dist` folder to create the lambda with the created role

```console
aws lambda create-function --function-name Ermetic-Asana-Webhook --runtime "nodejs18.x" --role arn:aws:iam::<AWS_ACCOUNT>:role/<ROLE_NAME> --zip-file "fileb://ermetic.asana.webhook.zip" --handler index.handler
```

- Add an API gateway trigger to the function
- Create an SSM parameter for the access token named `ASANA_TOKEN`
- Add the following environment variables to your functions `ASANA_URL`, `ASANA_PROJECT_ID`, `ASANA_WORKSPACE_ID` and update them with their respective values
  - [How to get Asana Access Token](https://developers.asana.com/docs/authenticating)
  - Asana tasks API url: `https://app.asana.com/api/1.0/tasks?opt_pretty=true&opt_fields=followers,assignee` the query parameters reduces the response fields to followers and assignee, modify as you see fit
  - To get your workspace ID navigate [here](https://app.asana.com/api/1.0/workspaces), but first ensure you're already logged in to ASANA
  - Your project ID can be obtained from the url when you're in an Asana's project, right after the `https://app.asana.com/0/<PROJECT_ID>/list`
- Test your function from PostMan, the lambda built-in test will not yield any results since it's expecting an API Gateway event
