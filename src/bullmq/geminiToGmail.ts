import { emailJob } from "../interfaces/email.interface";
import { Job, Queue, Worker } from 'bullmq';
import connection from '../redis/connection';
import { sendEmail } from "../gmail/gmailInteraction";
import { google } from "googleapis";

/**
 * Function to add an email object to the draftQueue
 * @param email of the type emailJob, having the metadata and the message of the email 
 */
const draftQueue = new Queue('draftQueue', { connection });
export const addToDraftQueue = async (email: emailJob) => {
    await draftQueue.add('email', email, { removeOnComplete: true, removeOnFail: true });
}


const gmailWorker = new Worker<emailJob>('draftQueue', async (job: Job<emailJob>) => {
    const authData = job.data.auth;
    const auth = new google.auth.OAuth2();
    auth.setCredentials(authData);

    const emailJobData = { ...job.data, auth };
    await sendEmail(emailJobData);

}, { connection });
