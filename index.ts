import axios from 'axios';
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm';

import { IFinding } from './IFinding';

export const handler = async (
  event: APIGatewayEvent,
  ctx: Context
): Promise<APIGatewayProxyResult> => {
  //Function to return the APIGatewayProxyResult response for cleaner code
  const response = (
    message: string | unknown,
    statusCode: number
  ): APIGatewayProxyResult => {
    return {
      statusCode,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    };
  };

  // Return early if body or variables are null
  if (!event.body) {
    return response('The Event body was null', 404);
  }
  if (!process.env.ASANA_PROJECT_ID || !process.env.ASANA_WORKSPACE_ID) {
    return response(
      'Please check the project and workspace env variables. Variable empty or null',
      400
    );
  }
  if (!process.env.ASANA_URL) {
    return response('The env variable ASANA_URL is empty or null', 400);
  }
  // Parse the finding from the event
  const finding: IFinding = JSON.parse(event.body);

  //instantiate SSM client and command to get the token from the parameter store
  const ssmClient = new SSMClient({ region: process.env.AWS_REGION });
  const ssmCommand = new GetParameterCommand({
    Name: 'ASANA_TOKEN',
    WithDecryption: true,
  });

  // Formatting the Finding to html_notes. The new lines and spaces affect the formatting of the task details
  const resources = `<ul>${finding.resources.map(
    resource => `<li>${resource}</li>`
  )}</ul>`;

  const htmlNotes = `<body><h1>Finding Details</h1><strong>Finding Status</strong>: ${finding.status}
<strong>Account ID</strong>: ${finding.accountId}
<strong>Finding Type</strong>: ${finding.findingType}
<strong>Link</strong>: <a href="${finding.link}" target="_blank"> ${finding.title}</a>
<h1>Resources</h1>${resources}
</body>`;

  // Asana payload
  const payload = {
    data: {
      name: `${finding.title} | ${finding.severity} | ${finding.accountName}`,
      projects: [process.env.ASANA_PROJECT_ID],
      workspace: process.env.ASANA_WORKSPACE_ID,
      html_notes: htmlNotes,
    },
  };
  try {
    const asanaToken = await ssmClient.send(ssmCommand);

    const res = await axios.post(process.env.ASANA_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${asanaToken.Parameter?.Value}`,
      },
    });
    return response('Success', res.status);
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return response(error.response.data, error.response.status);
      } else {
        return response(
          'Something went wrong, we made a request but no response from Asana',
          500
        );
      }
    }
    return response(error, 500);
  }
};
