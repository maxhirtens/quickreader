import React, { useState, useEffect } from "react";
import QuickreaderApi from "../api";
import SummaryBox from "../components/SummaryBox";
import { Spinner } from "reactstrap";
import ChoicesForm from "../components/ChoicesForm";

const Home = () => {
  const [articles, setArticles] = useState(null);
  const [section, setSection] = useState("home");
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(null);

  function updateSection(section) {
    setSection(section);
  }

  // search articles from API.
  async function searchArticles(section) {
    let articles = await QuickreaderApi.getArticles(section);
    setArticles(articles);
    console.log(articles.message.results);
  }

  // summarize articles with ChatGPT.
  async function summarize(data) {
    let summary = await QuickreaderApi.summarize(data);
    setSummary(summary);
    setIsLoading(false);
  }

  // get articles from API on mount.
  useEffect(() => {
    console.log("useEffect on NYT Page");
    searchArticles(section);
  }, [section]);

  // helper to reset page.
  const resetPage = () => {
    console.log("cleaning up page");
    setSummary(null);
    setSection("home");
  };

  // loading spinner.
  if (!articles || isLoading) return <Spinner />;

  if (summary) {
    console.log("sending summary to summary box");
    return <SummaryBox summary={summary} resetPage={resetPage} />;
  }

  // parse out content from articles.
  let selects = articles.message.results;
  let top3 = selects.slice(3, 6);
  let top3Data = top3.map((c) => c.title + ": " + c.abstract);
  let top3joined = top3Data.join(". ");
  let time = articles.message.last_updated;
  let data = {
    prompt: top3joined,
    time: time,
  };

  return (
    <div className="container text-center">
      <h3>Welcome to Quickreader</h3>
      <h5>AI-Assisted Summaries for The New York Times</h5>
      <i>
        {section.toUpperCase() ?? "NYT"} content loaded and ready for summary...
      </i>
      <br></br>
      <br></br>
      <ChoicesForm
        updateSection={updateSection}
        summarize={summarize}
        setIsLoading={setIsLoading}
        data={data}
      />
    </div>
  );
};

export default Home;
