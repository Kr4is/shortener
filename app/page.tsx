'use client';

import { useState } from 'react';

export default function Home() {
  const [web, setWeb] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [showShortenedUrl, setShowShortenedUrl] = useState(false);
  const [showInvalidUrl, setShowInvalidUrl] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setShowInvalidUrl(false);
    setShowShortenedUrl(false);
    setCopied(false);

    try {
      const res = await fetch('/api/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: web }),
      });

      if (res.ok) {
        const shortKey = await res.json();
        setShortenedUrl(`${window.location.origin}/s/${shortKey}`);
        setShowShortenedUrl(true);
      } else {
        const errorData = await res.json().catch(() => null);
        setErrorMessage(
          errorData?.detail || 'Something went wrong. Please try again.'
        );
        setShowInvalidUrl(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Network error. Please try again.');
      setShowInvalidUrl(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortenedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <div className="max-w-lg w-full mx-auto">
        <h1 className="text-2xl font-semibold text-center mb-8">
          Website URL Shortener
        </h1>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="url"
              placeholder="Enter the URL"
              value={web}
              onChange={(e) => setWeb(e.target.value)}
              disabled={isLoading}
              className="w-full md:w-2/3 border p-2 rounded focus:outline-none focus:border-blue-500 text-black disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={isLoading || !web.trim()}
              className="w-full md:w-auto bg-blue-500 text-white px-12 py-2 rounded-md hover:bg-blue-600 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Shortening...' : 'Shorten'}
            </button>
          </div>
        </form>
        {showShortenedUrl && (
          <div className="bg-white border-t border-b border-blue-500 text-blue-700 px-4 py-3 my-5">
            <p className="font-bold mb-2">Your shortened URL is:</p>
            <p className="text-sm break-all mb-3">{shortenedUrl}</p>
            <button
              type="button"
              onClick={handleCopy}
              className="text-sm bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 transition duration-300"
            >
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
          </div>
        )}
        {showInvalidUrl && (
          <div className="bg-white border-t border-b border-red-500 text-red-700 px-4 py-3 my-5">
            <p className="font-bold mb-2">Error:</p>
            <p className="text-sm break-all">{errorMessage}</p>
          </div>
        )}
      </div>
    </main>
  );
}
