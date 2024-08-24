import { emailJob } from "../interfaces/email.interface";
import { Job, Queue, Worker } from 'bullmq';
import connection from '../redis/connection';
import { getAIResponse } from "../geminiAI/ai.request";
import { addToDraftQueue } from "./geminiToGmail";

const inboxQueue = new Queue('inboxQueue', { connection });

/**
 * Function to add an email object to the inboxQueue
 * @param email of the type emailJob, having the metadata and the message of the email 
 */
export const addToInboxQueue = async (email: emailJob) => {
    const credentials = email.auth.credentials;
    await inboxQueue.add('email', {...email, auth: credentials}, { removeOnComplete: true, removeOnFail: true });
}

// Worker to send email content to Gemini for generating a draft
const geminiWorker = new Worker<emailJob>('inboxQueue', async (job: Job<emailJob>) => {
    const emailText = job.data.emailPrompt;
    const reply: string = await getAIResponse(emailText);
    const emailObject: emailJob = {
        threadId: job.data.threadId,
        messageId: job.data.messageId,
        emailFrom: job.data.emailFrom,
        emailSubject: job.data.emailSubject,
        emailPrompt: reply,
        auth: job.data.auth
    };
    await addToDraftQueue(emailObject);
}, { connection });

