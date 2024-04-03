const https = require('https');
const url = require('url');

exports.handler = async (event, context) => {
  const payload = JSON.stringify({
    text: `Issue Created: ${event.issue.html_url}`,
  });

  // Extracting the SLACK_URL from environment variables
  const webhookUrl = process.env.SLACK_URL;
  const parsedUrl = url.parse(webhookUrl);

  const options = {
    hostname: parsedUrl.hostname,
    port: 443,
    path: parsedUrl.path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  // Create a promise to handle the HTTPS request
  const sendSlackNotification = new Promise((resolve, reject) => {
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
    const response = await sendSlackNotification;
    return response;
  } catch (error) {
    console.error('Failed to send notification:', error);
    throw new Error('Failed to send Slack notification');
  }
};