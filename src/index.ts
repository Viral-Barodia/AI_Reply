import { authorize } from './gmail/authorize';
import { getMessages } from './gmail/gmailInteraction';

/**
* Function to authorize our app to read email and create drafts, and send and receive reply from Google Gemini 1.5 AI Model
* @params none
* @returns none (Sends AI generated response to draft)
*/
async function logEmailBody() {
    try {
        const auth = await authorize();
        await getMessages(auth);
    } catch(err) {
        console.log(err);
    }
}

// Function call
logEmailBody();