import { ErrorMessages } from "../constants/App.constants";

require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
* Function to get response from Gemini Model
* @param: String (body of the email)
* @returns: String (Response from the AI Model)
*/
export async function getAIResponse(emailBody: string) {
    try {
        const prompt = `I want you to write a reply to an email. Generate a professional sounding reply, as if it is ready to be sent, so that I have to make least number of ammendments to it before sending. If the email mentions they are interested to know more, your reply should ask them if they are willing to hop on to a demo call by suggesting a time. Here's the body of the email: ${emailBody}`;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return text;
    } catch(err) {
        console.log(`${ErrorMessages.AI_MODEL_ERROR} with error`, err);
    }
}