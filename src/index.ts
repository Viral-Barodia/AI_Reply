import { authorize } from './gmail/authorize';
import { getFirstMessage, sendEmail } from './gmail/gmailInteraction';
import { getAIResponse } from './geminiAI/ai.request';
import { ErrorMessages } from './constants/App.constants';

/**
* Function to authorize our app to read email and create drafts, and send and receive reply from Google Gemini 1.5 AI Model
* @params none
* @returns none (Sends AI generated response to draft)
*/
async function logEmailBody() {
    try {
        const auth = await authorize();
        const emailBody = await getFirstMessage(auth);
        const ai_response = await getAIResponse(emailBody);
        if(ai_response !== null)
            sendEmail(auth, ai_response);
        else
            console.error(ErrorMessages.AI_MODEL_ERROR);
    } catch(err) {
        console.log(err);
    }
}

// Function call
logEmailBody();