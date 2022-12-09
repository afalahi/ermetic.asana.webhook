import axios from 'axios';
import { IFinding } from './IFinding';
import { Context, APIGatewayProxyResult, APIGatewayEvent } from 'aws-lambda';

export async function lambdaHandler(
  event: APIGatewayEvent,
  ctx: Context
): Promise<APIGatewayProxyResult> {
  ctx;
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
  const finding: IFinding = JSON.parse(event.body);
  //Formatting the Finding to html_notes
  const labels = `
  <ul>
    ${finding.labels.map(label => `<li>${label}</li>`)}
  </ul>`;
  const resources = `
  <ul>
    ${finding.resources.map(resource => `<li>${resource}</li>`)}
  </ul>`;
  const htmlNotes = `
  <body>
  <h1>Finding Details</h1>
  <strong>Account ID</strong>: ${finding.accountId}
  <strong>Finding Type</strong>: ${finding.findingType}
  <strong>Link</strong>: <a href="${finding.link}" target="_blank"> ${finding.title}</a>
  <h3>Resources</h3>
  ${resources}
  </body>`;

  const payload = {
    data: {
      name: `${finding.title} | ${finding.severity} | ${finding.accountName} | `,
      projects: [process.env.ASANA_PROJECT_ID],
      workspace: process.env.ASANA_WORKSPACE_ID,
      html_notes: htmlNotes,
    },
  };
  try {
    const res = await axios.post(process.env.ASANA_URL, payload);
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
            message: error.response.data.message,
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
}
