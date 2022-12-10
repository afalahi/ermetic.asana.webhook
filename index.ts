import axios from 'axios';
import { IFinding } from './IFinding';
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

export const handler = async (
  event: APIGatewayEvent,
  ctx: Context
): Promise<APIGatewayProxyResult> => {
  // Return early if body or variables are null
  if (!event.body) {
    return {
      statusCode: 404,
      body: JSON.stringify({
        message: 'The Event body was null',
      }),
    };
  }
  if (!process.env.ASANA_PROJECT_ID || !process.env.ASANA_WORKSPACE_ID) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message:
          'Please check the project and workspace env variables. Variable empty or null',
      }),
    };
  }
  if (!process.env.ASANA_URL) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        message: 'The env variable ASANA_URL is empty or null',
      }),
    };
  }
  // Parse the finding from the event
  const finding: IFinding = JSON.parse(event.body);

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
    const res = await axios.post(process.env.ASANA_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${process.env.ASANA_TOKEN}`,
      },
    });
    return {
      statusCode: res.status,
      body: JSON.stringify({
        message: 'Success',
      }),
    };
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          statusCode: error.response.status,
          body: JSON.stringify({
            message: error.response.data,
            payload: payload,
          }),
        };
      } else {
        return {
          statusCode: 500,
          body: JSON.stringify({
            message:
              'Something went wrong, we made a request but no response from Asana',
          }),
        };
      }
    }
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error,
      }),
    };
  }
};