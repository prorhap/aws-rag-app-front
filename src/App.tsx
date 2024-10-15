// App.tsx
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

interface Citation {
  text: string;
  uri: string;
}

const App: React.FC = () => {
  const [message, setMessage] = useState<string>('');
  const [response, setResponse] = useState<string>('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [session, setSession] = useState<string>(''); // Session state with default value as null

  const apiUrl = process.env.REACT_APP_LAMBDA_URL || 'https://localhost/';

  const handleSubmit = async () => {
    if (!message) return;

    setLoading(true);
    try {
      // Sending user input and session in the GET request
      const result = await axios.get(apiUrl, {
        params: {
          query: message,
          session: session || '', // Include session if available, otherwise null
        },
        timeout: 60000,
      });

      const data = result.data;

      // Extract text output, citations, and session from the response
      setResponse(data.output.text);
      setSession(data.sessionId); // Set session from response

      const formattedCitations = data.citations.map((citation: any) => ({
        text: citation.generatedResponsePart.textResponsePart.text,
        uri: citation.retrievedReferences[0].location.s3Location.uri,
      }));
      setCitations(formattedCitations);
    } catch (error) {
      setResponse('Error: Could not fetch the data.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Resetting all states to their initial values
    setMessage('');
    setResponse('');
    setCitations([]);
    setSession('');
    setLoading(false);
  };

  return (
    <div className="app-container">
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter a message (max 100 characters)"
          maxLength={120}
        />
        <button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
        <button onClick={handleReset} disabled={loading}>
          Reset
        </button>
      </div>
      {response && (
        <div className="response-container">
          <div className="chatgpt-response">
            <p>{response}</p>
          </div>
          {citations.length > 0 && (
            <div className="citations-container">
              <h4>데이터 소스:</h4>
              <ul>
                {citations.map((citation, index) => (
                  <li key={index}>
                    <div className="citation-text">
                      {`"${citation.text}"`}
                    </div>
                    <div className="file-name">
                      {`File: ${citation.uri.split('/').pop()}`}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;