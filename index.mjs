// Importing the necessary modules using ES module syntax
import https from 'node:https'; // Note: Ensure your Node.js version supports this syntax
import { URL } from 'node:url';

export async function handler(event) {
  // Check if the event has the 'issue' property to avoid TypeError
  if (!event.issue) {
    console.error('Event does not contain an issue property:', event);
    throw new Error('Event does not contain an issue property.');
  }
    
  const payload = JSON.stringify({
    text: `Issue Created: ${event.issue.html_url}`,
  });

  // Extracting the SLACK_URL from environment variables
  const webhookUrl = process.env.SLACK_URL;
  if (!webhookUrl) {
    console.error('SLACK_URL environment variable is not set.');
    throw new Error('SLACK_URL environment variable is not set.');
  }

  const parsedUrl = new URL(webhookUrl);

  const options = {
    hostname: parsedUrl.hostname,
    port: parsedUrl.port || 443, // Use the port from the URL or default to 443
    path: parsedUrl.pathname + parsedUrl.search, // Ensure query strings are included
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  // Create a promise to handle the HTTPS request
  const sendSlackNotification = () => new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let result = '';

      res.on('data', (chunk) => {
        result += chunk;
      });

      res.on('end', () => {
        console.log('Successfully sent message to Slack:', result);
        resolve(result);
      });
    });

    req.on('error', (err) => {
      console.error('Error calling Slack API:', err);
      reject(err);
    });

    req.write(payload);
    req.end();
  });

  // Wait for the HTTPS request to complete
  try {
    const response = await sendSlackNotification();
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw new Error('Failed to send Slack notification');
  }
}
