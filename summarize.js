const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

router.post('/', async (req, res) => {
  try {
    // Fetch todos
    const { data: todos, error } = await supabase.from('todos').select('*');
    if (error) throw new Error(error.message);

    // Generate summary with Cohere
    const todoList = todos.map(todo => todo.text).join('\n');
    const cohereResponse = await axios.post(
      'https://api.cohere.ai/v1/generate',
      {
        prompt: `Summarize the following to-do list in 2-3 sentences:\n${todoList}`,
        max_tokens: 100,
        temperature: 0.7
      },
      { headers: { Authorization: `Bearer ${process.env.COHERE_API_KEY}` } }
    );

    const summary = cohereResponse.data.generations[0].text;

    // Send to Slack
    await axios.post(process.env.SLACK_WEBHOOK_URL, {
      text: `Todo Summary:\n${summary}`
    });

    res.json({ summary, message: 'Summary sent to Slack successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;