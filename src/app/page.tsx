"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const RSS_FEEDS = [
  {
    name: "Cointelegraph",
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://cointelegraph.com/rss",
  },
  {
    name: "Coindesk",
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://www.coindesk.com/arc/outboundfeeds/rss/",
  },
  {
    name: "Bitcoin.com",
    url: "https://api.rss2json.com/v1/api.json?rss_url=https://news.bitcoin.com/feed/"
  },
];

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState("All");
  useEffect(() => {
    async function fetchAll() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let allNews: any[] = [];
      for (const feed of RSS_FEEDS) {
        try {
          const res = await fetch(feed.url);
          const data = await res.json();
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const items = (data.items || []).map((item: any) => ({
            ...item,
            source: feed.name,
            image:
              item.enclosure?.link || item.thumbnail || "/default-news.jpg", // fallback image
          }));
          allNews = [...allNews, ...items];
        } catch (err) {
          console.error("Error fetching", feed.name, err);
        }
      }

      allNews.sort(
        (a, b) =>
          new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime()
      );
      setNews(allNews);
      setLoading(false);
    }

    fetchAll();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading news...</p>;

  // Filter logic
  const filteredNews =
    selectedSource === "All"
      ? news
      : news.filter((item) => item.source === selectedSource);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        📰 Blockchain News Aggregator
      </h1>

      {/* Filter dropdown */}
      <div className="flex justify-center mb-6">
        <select
          value={selectedSource}
          onChange={(e) => setSelectedSource(e.target.value)}
          className="border px-3 py-2 rounded-lg shadow-sm"
        >
          <option value="All">All Sources</option>
          {RSS_FEEDS.map((feed) => (
            <option key={feed.name} value={feed.name}>
              {feed.name}
            </option>
          ))}
        </select>
      </div>

      {/* News grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNews.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block border rounded-xl shadow hover:shadow-lg transition bg-white overflow-hidden"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-40 object-cover"
            />
            <div className="p-4">
              <h2 className="text-lg font-semibold line-clamp-2">
                {item.title}
              </h2>
              <p className="text-sm text-gray-500 mb-2">
                {new Date(item.pubDate).toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}{" "}
                {new Date(item.pubDate).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                — <strong className="text-black">{item.source}</strong>
              </p>
              <p className="text-sm text-gray-700 line-clamp-3">
                {item.description?.replace(/<[^>]+>/g, "") || "No description"}
              </p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
