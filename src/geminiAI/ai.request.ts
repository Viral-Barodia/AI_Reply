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
    const prompt = emailBody;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    return text;
}