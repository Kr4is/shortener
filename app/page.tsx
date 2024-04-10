'use client';

import { useState } from 'react';

export default function Home() {
  const [web, setWeb] = useState('');
  const [shortenedUrl, setShortenedUrl] = useState('');
  const [showShortenedUrl, setShowShortenedUrl] = useState(false);
  const [showInvalidUrl, setShowInvalidUrl] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('/api/url', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: web }),
      });

      if (res.ok) {
        var shortUrl = await res.json();
        setShortenedUrl(window.location.origin + '/api/' + shortUrl);
        setShowInvalidUrl(false);
        setShowShortenedUrl(true);
      } else {
        console.log('Oops! Something went wrong.');
        setShowShortenedUrl(false);
        setShowInvalidUrl(true);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 md:p-8">
      <div className="max-w-lg w-full mx-auto">
        <h1 className="text-2xl font-semibold text-center mb-8">Website URL Shortener</h1>
        <form className="w-full" onSubmit={handleSubmit}>
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              name="url"
              placeholder="Enter the URL"
              value={web}
              onChange={(e) => setWeb(e.target.value)}
              className="w-full md:w-2/3 border p-2 rounded focus:outline-none focus:border-blue-500 text-black"
            />
            <button
              type="submit"
              className="w-full md:w-auto bg-blue-500 text-white px-12 py-2 rounded-md hover:bg-blue-600 transition duration-300"
            >
              Shorten
            </button>
          </div>
        </form>
        {showShortenedUrl && (
          <div className="bg-white border-t border-b border-blue-500 text-blue-700 px-4 py-3 my-5">
            <p className="font-bold mb-2">Your shortened URL is:</p>
            <p className="text-sm break-all">{shortenedUrl}</p>
          </div>
        )}
        {showInvalidUrl && (
          <div className="bg-white border-t border-b border-red-500 text-red-700 px-4 py-3 my-5">
            <p className="font-bold mb-2">Your URL is not valid:</p>
            <p className="text-sm break-all">The accepted format is: https://url.extension or http://url.extension</p>
          </div>
        )}
      </div>
    </main>
  );
}
