const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

let todos = [];

app.get('/todos', (req, res) => res.json(todos));

app.post('/todos', (req, res) => {
  const todo = { id: Date.now(), text: req.body.text };
  todos.push(todo);
  res.status(201).json(todo);
});

app.delete('/todos/:id', (req, res) => {
  todos = todos.filter(t => t.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.post('/summarize', async (req, res) => {
  const todoTexts = todos.map(t => t.text).join(', ');
  const prompt = `Summarize the following todos: ${todoTexts}`;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const summary = response.data.choices[0].text;

    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `📝 Todo Summary:\n${summary}`,
    });

    res.status(200).json({ message: 'Summary sent to Slack successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to summarize or send to Slack' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

