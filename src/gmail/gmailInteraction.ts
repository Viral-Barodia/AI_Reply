import { google } from 'googleapis';
import { addToInboxQueue } from '../bullmq/gmailToGemini';
import { emailJob } from '../interfaces/email.interface';

/**
 * Prepares an email-bundle and adds it to queue
 * @param messageList => list of all messages
 * @param gmail => gmail object constructed using google.gmail
 */
const prepareEmailAndAddToQueue = async (messageList: any, gmail: any, auth: any) => {
  const processedMessages = new Set<string>();

  if (messageList.data.messages && messageList.data.messages.length > 0) {
    for (const message of messageList.data.messages) {
      const messageId = message.id;
      const threadId = message.threadId;
      if (processedMessages.has(messageId)) {
        continue;
      }

      try {
        const res = await gmail.users.messages.get({
          userId: 'me',
          id: messageId,
        });
        const emailFrom = res?.data?.payload?.headers?.find((header: { name: string }) => header.name === 'From')?.value || null;
        const emailSubject = res?.data?.payload?.headers?.find((header: { name: string }) => header.name === 'Subject')?.value || null;
        const emailPrompt = await getEmailText(res.data.payload) || '';
        if (messageId && threadId && emailFrom && emailSubject && emailPrompt) {
          await addToInboxQueue({ messageId, threadId, emailFrom, emailSubject, emailPrompt, auth });
          processedMessages.add(messageId);
        }
      } catch (error) {
        console.error(`Error processing email with ID ${messageId}:`, error);
      }
    }
  }
}

/**
 * Gets email Text from the body
 * @param payload
 * @returns a Promise containing the content of the email received
 */
async function getEmailText(payload: any): Promise<string | null> {
  let emailbody = '';

  if (payload && payload.parts && payload.parts.length > 0) {
    const firstPart = payload.parts[0];
    if (firstPart.body && firstPart.body.data) {
      emailbody = Buffer.from(
        firstPart.body.data.replace(/-/g, '+').replace(/_/g, '/'),
        'base64'
      ).toString('utf-8');
    } else {
      console.log('No text/plain data found in the first part.');
    }
  } else {
    console.log('No parts found in email payload.');
  }

  return emailbody || null;
}

/**
* Function to get the first email from all the emails
* @param auth To identify the user succesfully
* @returns Null. Pushes the email content to a queue.
*/
export async function getMessages(auth: any) {
  try {
    const gmail = google.gmail({ version: 'v1', auth });
    const messageList = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 10
    });
    await prepareEmailAndAddToQueue(messageList, gmail, auth);
  } catch(err) {
    console.error(`The error while getting messages is`, err);
  } finally {
    setTimeout(() => getMessages(auth), 30000);
  }
}

/**
* Function to send the response from AI model as a reply to the received email
* @param: {auth} To identify the user succesfully
* @returns: Null. Sends the response as a draft
*/
export async function sendEmail(emailObject: emailJob) {
  const { emailFrom, emailSubject, threadId, messageId, emailPrompt, auth } = emailObject;
  const gmail = google.gmail({ version: 'v1', auth });
  const messageToSend = [
    `To: ${emailFrom}`,
    `Subject: Re: ${emailSubject}`,
    ``,
    emailPrompt
  ].join('\n');
  const base64Message = Buffer.from(messageToSend).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  try {
    await gmail.users.drafts.create({
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
  } catch (err) {
    console.log(`Error while sending message`, err);
  }
}