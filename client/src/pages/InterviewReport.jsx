import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ServerUrl } from "../App";
import Report from "../components/Report";

function InterviewReport() {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  useEffect(() => {
    const getReport = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/interview/report/" + id,
          { withCredentials: true },
        );
        console.log(result.data);
        setReport(result.data);
      } catch (error) {
        console.error("error fetching report card.");
      }
    };
    getReport();
  }, []);
  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg text-gray-800">Loading Report...</p>
      </div>
    );
  }
  return <Report report={report} />;
}

export default InterviewReport;
