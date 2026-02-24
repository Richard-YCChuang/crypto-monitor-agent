import * as dotenv from "dotenv";
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { get_price } from "./tools.js";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash-lite",
  systemInstruction: "你是一個加密貨幣助理，工具回傳結果後請用繁體中文回答使用者的問題。",
  tools: [
    {
      functionDeclarations: [
        {
          name: "get_price",
          description: "取得指定加密貨幣的目前美元價格",
          parameters: {
            type: SchemaType.OBJECT,
            properties: {
              coin: {
                type: SchemaType.STRING,
                description: "CoinGecko 的幣種 ID，例如 bitcoin、ethereum",
              },
            },
            required: ["coin"],
          },
        },
      ],
    },
  ],
});

async function main() {
  const chat = model.startChat();

  const userMessage = "BTC 現在多少錢？";
  console.log(`使用者：${userMessage}`);

  const result = await chat.sendMessage(userMessage);
  const response = result.response;
  const call = response.functionCalls()?.[0];

  if (!call) {
    console.log("Agent 沒有呼叫工具，直接回答：", response.text());
    return;
  }

  console.log(`Agent 呼叫工具：${call.name}，參數：`, call.args);

  const priceData = await get_price((call.args as { coin: string }).coin);
  console.log(`工具回傳：$${priceData.price}，價格更新時間：${priceData.lastUpdated}`);

  const finalResult = await chat.sendMessage([
    {
      functionResponse: {
        name: call.name,
        response: priceData,
      },
    },
  ]);

  console.log(`Agent 最終回答：${finalResult.response.text()}`);
}

main().catch(console.error);