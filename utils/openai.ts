import { Configuration, OpenAIApi } from "openai";
const configuration = new Configuration({
    organization: "",
    apiKey: "",
});
const openai = new OpenAIApi(configuration);

export const getCompletion = async (prompt: string) => {
    return await openai.createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 50,
        temperature: 0.7,
    });
};
