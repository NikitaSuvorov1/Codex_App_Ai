import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import OpenAI from 'openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseApiUrl: 'https://api.openai.com/v1',
  dangerouslyAllowBrowser: true,
});

const app = express();

// Используем morgan для логирования в консоль
app.use(morgan('dev'));
const corsOptions = {
  origin: 'http://localhost:5173', // Замените на ваш домен
  methods: ['GET', 'POST'], // Разрешенные HTTP-методы
  allowedHeaders: ['Content-Type', 'Authorization'], // Разрешенные заголовки
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/', async (req, res) => {
  res.status(200).send({
    message: 'Hello from CodeX!',
  });
});

app.post('/', async (req, res) => {
  try {
    const { prompt } = req.body;

    const response = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: prompt,
      temperature: 0.7,
      max_tokens: 3900,
    });

    console.log("Response from OpenAI:", response);

    if (response && response.choices && response.choices.length > 0) {
      res.status(200).send({
        bot: response.choices[0].text
      });
    } else {
      console.error("Invalid response from OpenAI:", response);
      res.status(500).send('Empty or undefined response from the model');
    }

  } catch (error) {
    console.error("Error processing request:", error);
    res.status(500).send(error || 'Something went wrong');
  }
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`AI server started on http://localhost:${PORT}`));
