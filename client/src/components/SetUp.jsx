import React, { useState } from "react";
import { motion } from "motion/react";
import { ServerUrl } from "../App.jsx";
import axios from "axios";
import Icon from "./Icons.jsx";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "../redux/userSlice.js";
import { useNavigate } from "react-router-dom";

function SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analysing, setAnalysing] = useState(false);
  const handleResumeUpload = async () => {
    if (!resumeFile || analysing) return;
    setAnalysing(true);
    try {
      const formData = new FormData();
      formData.append("resume", resumeFile);
      const res = await axios.post(
        ServerUrl + "/api/interview/resume",
        formData,
        { withCredentials: true },
      );
      console.log(res.data);
      setRole(res.data.role || "");
      setExperience(res.data.experience || "");
      setProjects(res.data.projects || []);
      setSkills(res.data.skills || []);
      setResumeText(res.data.resumeText || "");
      setAnalysisDone(true);
      setAnalysing(false);
    } catch (error) {
      console.error(error);
      setAnalysing(false);
    }
  };
  const handleStart = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/generate-questions",
        { role, experience, mode, resumeText, projects, skills },
        { withCredentials: true },
      );
      console.log(result.data);
      if (userData) {
        dispatch(
          setUserData({ ...userData, credits: result.data.creditsLeft }),
        );
      }
      setLoading(false);
      onStart(result.data);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 px-4"
    >
      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl grid md:grid-cols-2 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, x: -80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="relative bg-gradient-to-br from-green-50 to-green-100 p-12 flex flex-col justify-center"
        >
          <div className="mb-10 w-full flex items-start gap-4 flex-wrap">
            <button
              className="p-3 rounded-full bg-white shadow hover:shadow-md transition"
              onClick={() => navigate("/")}
            >
              <Icon name="leftArrow" className="text-gray-600" />
            </button>
            <h2 className="text-4xl font-bold text-gray-800">
              Start Your AI Interview
            </h2>
            <p className="text-gray-600">
              Practice real interview scenarios powered by AI. Improve
              communication, technical skills, and confidence.
            </p>
          </div>
          <div className="space-y-5">
            {[
              {
                icon: (
                  <Icon name="userTie" className="text-green-600 text-xl" />
                ),
                text: "Choose Role & Experience",
              },
              {
                icon: (
                  <Icon name="microphone" className="text-green-600 text-xl" />
                ),
                text: "Smart Voice Interview",
              },
              {
                icon: (
                  <Icon name="chartLine" className="text-green-600 text-xl" />
                ),
                text: "Performance Analytics",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.15 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center space-x-4 bg-white p-4 rounded-xl shadow-sm cursor-pointer"
              >
                {item.icon}
                <span className="text-gray-700 font-medium">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
          className="p-12 bg-white"
        >
          <h2 className="text-3xl font-bold text-gray-800 mb-8">
            Interview SetUp
          </h2>
          <div className="space-y-6">
            <div className="relative">
              <Icon
                name="userTie"
                className="absolute top-4 left-4 text-gray-400"
              />
              <input
                type="text"
                placeholder="Enter role"
                className="w-full pl-12 pr-4 py-3 border border-gray-200
              rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                onChange={(e) => setRole(e.target.value)}
                value={role}
              />
            </div>
            <div className="relative">
              <Icon
                name="briefcase"
                className="absolute top-4 left-4 text-gray-400"
              />
              <input
                type="text"
                placeholder="Experience (e.g. 2 years)"
                className="w-full pl-12 pr-4 py-3 border border-gray-200
              rounded-xl focus:ring-2 focus:ring-green-500 outline-none transition"
                onChange={(e) => setExperience(e.target.value)}
                value={experience}
              />
            </div>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full px-3 py-4 border border-gray-200 rounded-xl
              focus:ring-1 focus:ring-green-500 outline-none transition"
            >
              <option value="" disabled>
                Select Interview Mode
              </option>
              <option value="Technical">Technical Interview</option>
              <option value="HR">HR Interview</option>
            </select>
            {!analysisDone && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                onClick={() => document.getElementById("resumeUpload").click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 
            text-center cursor-pointer hover:border-green-500 hover:bg-green-50 transition"
              >
                <Icon
                  name="fileUpload"
                  className="text-4xl mx-auto text-green-500 mb-3"
                />
                <input
                  type="file"
                  id="resumeUpload"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />
                <p className="text-gray-600 font-medium">
                  {resumeFile
                    ? resumeFile.name
                    : "Click to upload resume (Optional)"}
                </p>
                {resumeFile && (
                  <motion.button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleResumeUpload();
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-gray-900 text-white px-5 py-2  
                  rounded-lg hover:bg-gray-700 transition"
                  >
                    {analysing ? "Analysing..." : "Analyze Resume"}
                  </motion.button>
                )}
              </motion.div>
            )}

            {analysisDone && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-100 border border-gray-200 rounded-xl p-5 space-y-4 "
              >
                <h3 className="text-lg text-gray-800 font-semibold">
                  Resume Analysis Result
                </h3>
                {projects.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">
                      Projects:
                    </p>
                    <ul className="list-disc list-inside text-gray-600 space-y-1">
                      {projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {skills.length > 0 && (
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Skills:</p>
                    <div className="flex flex-wrap gap-1 text-gray-600">
                      {skills.map((p, i) => (
                        <span
                          key={i}
                          className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-sm 
                          whitespace-nowrap"
                        >
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <motion.button
              disabled={!role || !experience}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleStart}
              className="w-full disabled:bg-gray-600 bg-green-600 hover:bg-green-700 text-white py-3
              rounded-full text-lg font-semibold transition duration-300 shadow-md"
            >
              {loading ? "Starting..." : "Start Interview"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default SetUp;
