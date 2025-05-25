import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  const fetchTodos = async () => {
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/todos`);
    setTodos(response.data);
  };

  const addTodo = async (e) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    await axios.post(`${process.env.REACT_APP_API_URL}/todos`, { text: newTodo });
    setNewTodo('');
    fetchTodos();
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${process.env.REACT_APP_API_URL}/todos/${id}`);
    fetchTodos();
  };

  const summarizeTodos = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/summarize`);
      setMessage(response.data.message);
    } catch (error) {
      setMessage('Failed to send summary to Slack');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Todo Summary Assistant</h1>
      
      <form onSubmit={addTodo} className="mb-4">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          className="border p-2 mr-2"
          placeholder="Add a new todo"
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Todo
        </button>
      </form>

      <ul className="mb-4">
        {todos.map((todo) => (
          <li key={todo.id} className="flex justify-between items-center mb-2">
            <span>{todo.text}</span>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="bg-red-500 text-white p-1 rounded"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <button
        onClick={summarizeTodos}
        className="bg-green-500 text-white p-2 rounded"
      >
        Summarize and Send to Slack
      </button>

      {message && <p className="mt-4 text-green-600">{message}</p>}
    </div>
  );
}

export default App;