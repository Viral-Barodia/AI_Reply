const {google} = require('googleapis');

let threadId='', messageId='', emailFrom='', emailSubject='';

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
export async function listLabels(auth: any) {
    const gmail = google.gmail({version: 'v1', auth});
    const res = await gmail.users.labels.list({
      userId: 'me',
    });
    const labels = res.data.labels;
    if (!labels || labels.length === 0) {
      console.log('No labels found.');
      return;
    }
    console.log('Labels:');
    labels.forEach((label: { name: any; }) => {
      console.log(`- ${label.name}`);
    });
}

// https://developers.google.com/gmail/api/reference/rest/v1/users.messages/get
/**
* Function to get the first email from all the emails
* @param: {auth} To identify the user succesfully
* @returns: The body of the first email
*/
export async function getFirstMessage(auth: any) {
  const gmail = google.gmail({ version: 'v1', auth });
  const messageList = await gmail.users.messages.list({
    userId: 'me'
  });
  messageId = ((messageList.data.messages[0].id));
  threadId = ((messageList.data.messages[0].threadId));
  const res = await gmail.users.messages.get({
    userId: 'me',
    id: messageId
  });
  emailFrom = res.data.payload.headers.find((header: { name: string; value: string }) => header.name==='From').value;
  emailSubject = res.data.payload.headers.find((header: { name: string; value: string }) => header.name==='Subject').value;
  return res.data.snippet;
}

/**
* Function to send the response from AI model as a reply to the received email
* @param: {auth} To identify the user succesfully
* @returns: The body of the first email
*/
export async function sendEmail(auth: any, emailBody: string) {
  const gmail = google.gmail({ version: 'v1', auth });
  const messageToSend = [
    `To: ${emailFrom}`,
    `Subject: Re: ${emailSubject}`,
    ``,
    emailBody
  ].join('\n');
  const buffString = Buffer.from(messageToSend, 'utf-8');
  const base64Message = buffString.toString('base64');

  const createdDraft = await gmail.users.drafts.create({
    userId: 'me',
    requestBody: {
      message: {
        id: messageId,
        threadId: threadId,
        labelIds: ['DRAFT'],
        raw: base64Message
      }
    }
  });
  console.log(createdDraft);
}