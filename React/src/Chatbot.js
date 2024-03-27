import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Chatbot.css';

function Chatbot() {
  const [paragraph, setParagraph] = useState('');
  const [tempParagraph, setTempParagraph] = useState('');
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const chatEndRef = useRef(null); 

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await axios.post('http://localhost:5000/upload_pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setParagraph(response.data.paragraph);
      setChatHistory([]);
      setError('');
      setAnswer('');
    } catch (error) {
      setError('Error uploading PDF or extracting text.');
    }
  };

  const handleAskQuestion = async () => {
    try {
      const response = await axios.post('http://localhost:5000/ask_question', { question });
      const newChatEntry = { question, answer: response.data.answer };
      setChatHistory([...chatHistory, newChatEntry]);
      setQuestion('');
      setError('');
    } catch (error) {
      setError('Error asking question.');
    }
  };

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  return (
    <>
      <div className="chatbot-container">
        {paragraph ?
          <div className="paragraph-section">
            <h2>Paragraph</h2>
            <div className="paragraph-content">{paragraph}</div>
          </div> :
          <div className="input-section">
            <input type="file" onChange={handleFileChange} accept=".pdf" />
            <button onClick={handleUpload}>Upload PDF</button>
          </div>
        }
        <div className="chat-section">
          <h2>Chat</h2>
          {error && <p className="error">{error}</p>}
          {chatHistory.map((entry, index) => (
            <div key={index} className="chat-entry">
              <div className="question-bubble">{entry.question}</div>
              <div className="answer-bubble">{entry.answer}</div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>
      <div className="fixed-bottom input-section">
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder='Type your question here' />
        <button onClick={handleAskQuestion}>Ask Question</button>
      </div>
    </>
  );
}

export default Chatbot;
