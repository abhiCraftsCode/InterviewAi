import React, { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import maleVideo from "../assets/videos/male-ai.mp4";
import femaleVideo from "../assets/videos/female-ai.mp4";
import Timer from "./Timer";
import Icon from "./Icons";
import axios from "axios";
import { ServerUrl } from "../App.jsx";

function Interview({ interviewData, onFinish }) {
  const { interviewId, questions, userName } = interviewData;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [isAiPlaying, setAiPlaying] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  const [isIntroPhase, setIntroPhase] = useState(true);
  const [micMuted, muteMic] = useState(false);
  const [selectedVoice, selectVoice] = useState(null);
  const [voiceGender, setVoiceGender] = useState("female");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [subtitle, setSubtitle] = useState("");
  const recognitionRef = useRef(null);
  const videoRef = useRef(null);
  const isListeningRef = useRef(false);
  const currentQuestion = questions[currentIndex];
  //loading voice
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;
      const femaleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("zira") ||
          v.name.toLowerCase().includes("samantha") ||
          v.name.toLowerCase().includes("female"),
      );
      if (femaleVoice) {
        selectVoice(femaleVoice);
        setVoiceGender("female");
        return;
      }
      const maleVoice = voices.find(
        (v) =>
          v.name.toLowerCase().includes("david") ||
          v.name.toLowerCase().includes("mark") ||
          v.name.toLowerCase().includes("male"),
      );
      if (maleVoice) {
        selectVoice(maleVoice);
        setVoiceGender("male");
        return;
      }
      selectVoice(voices[0]);
      setVoiceGender("female");
    };
    loadVoices();
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);
  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;
  //text to speech
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }
      window.speechSynthesis.cancel();
      const humanText = text.replace(/,/g, ", ... ").replace(/\./g, ". ... ");
      const utterance = new SpeechSynthesisUtterance(humanText);
      utterance.voice = selectedVoice;
      utterance.rate = 0.92;
      utterance.pitch = 1.05;
      utterance.volume = 1;
      utterance.onstart = () => {
        setAiPlaying(true);
        stopMic();
        videoRef.current?.play();
      };
      utterance.onend = () => {
        videoRef.current?.pause();
        videoRef.current.currentTime = 0;
        setAiPlaying(false);
        if (!micMuted) startMic();
        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };
      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };
  //speaking ai
  useEffect(() => {
    if (!selectedVoice) return;
    const runIntro = async () => {
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`,
        );
        await speakText(
          "I'll ask you a few questions. Just answer naturally, and take your time. Let's begin.",
        );
        setIntroPhase(false);
      } else if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));
        if (currentIndex === questions.length - 1) {
          await speakText("Alright, this one might be a bit more challengig.");
        }
        await speakText(currentQuestion.question);
        if (!micMuted) startMic();
      }
    };
    runIntro();
  }, [selectedVoice, isIntroPhase, currentIndex]);
  //reset timer
  useEffect(() => {
    if (!isIntroPhase && currentQuestion) {
      setTimeLeft(currentQuestion.timeLimit || 60);
    }
  }, [currentIndex]);
  //timer start
  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isIntroPhase, currentIndex]);
  //speech to answer
  useEffect(() => {
    if (!("webkitSpeechRecognition" in window)) return;
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setAnswer((prev) => prev + " " + transcript);
    };
    recognition.onend = () => {
      isListeningRef.current = false;
    };
    recognitionRef.current = recognition;
  }, []);
  const startMic = () => {
    if (recognitionRef.current && !isAiPlaying && !isListeningRef.current) {
      try {
        recognitionRef.current.start();
        isListeningRef.current = true;
      } catch (error) {
        console.error("start mic error");
      }
    }
  };
  const stopMic = () => {
    if (recognitionRef.current && isListeningRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        isListeningRef.current = false;
      }
    }
  };
  const toggleMic = () => {
    if (!micMuted) stopMic();
    else startMic();
    muteMic(!micMuted);
  };
  //submit answer to ai
  const submitAnswer = async () => {
    if (isSubmitting) return;
    stopMic();
    setSubmitting(true);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/submit-answer",
        {
          interviewId,
          questionIndex: currentIndex,
          answer,
          timeTaken: currentQuestion.timeLimit - timeLeft,
        },
        { withCredentials: true },
      );
      setFeedback(result.data.feedback);
      speakText(result.data.feedback);
      setSubmitting(false);
    } catch (error) {
      console.error("failed submitting answer.");
    }
  };
  //next question
  const handleNext = async () => {
    setAnswer("");
    setFeedback("");
    if (currentIndex >= questions.length - 1) {
      finishInterview();
      return;
    }
    await speakText("Alright, let's move to the next question.");
    setCurrentIndex(currentIndex + 1);
    setTimeout(() => {
      if (!micMuted) startMic();
    }, 500);
  };
  //finishing interview
  const finishInterview = async (params) => {
    stopMic();
    muteMic(true);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/finish",
        { interviewId },
        { withCredentials: true },
      );
      console.log(result.data);
      onFinish(result.data);
    } catch (error) {
      console.error("error while ending interview.");
    }
  };
  //minor edits/finishers
  useEffect(() => {
    if (isIntroPhase) return;
    if (!currentQuestion) return;
    if (timeLeft === 0 && !isSubmitting && !feedback) submitAnswer();
  }, [timeLeft]);
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      }
      window.speechSynthesis.cancel();
    };
  }, []);

  return (
    <div
      className="min-h-screen bg-linear-to-br from-emerald-100 via-white to-teal-100
  flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200
      flex flex-col lg:flex-row overflow-hidden"
      >
        {/*video section */}
        <div
          className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r
        border-gray-300"
        >
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl">
            <video
              src={videoSource}
              key={videoSource}
              ref={videoRef}
              muted
              playsInline
              preload="auto"
              className="w-full h-auto object-cover"
            />
          </div>
          {/*subtitle area*/}
          {subtitle && (
            <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
              <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
                {subtitle}
              </p>
            </div>
          )}
          {/*timer area */}
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">Interview Status</span>
              {isAiPlaying && (
                <span className="text-sm font-semibold text-green-700">
                  {isAiPlaying ? "AI speaking..." : ""}
                </span>
              )}
            </div>
            <div className="h-px bg-gray-300"></div>
            <div className="flex justify-center">
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit || 60}
              />
            </div>
            <div className="h-px bg-gray-300"></div>
            <div className="grid grid-cols-2 gap-6 text-center">
              <div>
                <span className="text-2xl text-emerald-600 font-bold">
                  {currentIndex + 1}
                </span>
                <span className="text-xs text-gray-500">current question</span>
              </div>
              <div>
                <span className="text-2xl text-emerald-600 font-bold ">
                  {questions.length}
                </span>
                <span className="text-xs text-gray-500">total question</span>
              </div>
            </div>
          </div>
        </div>
        {/* test section*/}
        <div className="flex-1 flex flex-col p-4 sm:p-6 md:p-8 relative">
          <h2 className="text-xl sm:text-2xl font-bold text-green-500 mb-6">
            AI Smart Interview
          </h2>
          {!isIntroPhase && (
            <div className="relative mb-6 bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-sm">
              <p className="text-xs sm:text-sm text-gray-500 mb-2">
                Question {currentIndex + 1} of {questions.length}
              </p>
              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </div>
            </div>
          )}
          <textarea
            placeholder="Type your answer here...."
            onChange={(e) => setAnswer(e.target.value)}
            value={answer}
            className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl resize-none outline-none border 
            border-gray-200 focus:ring-2 focus:ring-emerald-500 transition text-gray-800"
          />
          {!feedback ? (
            <div className="flex items-center gap-4 mt-6">
              <motion.button
                onClick={toggleMic}
                whileTap={{ scale: 0.9 }}
                className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center rounded-full
            bg-black text-white shadow-lg"
              >
                {micMuted ? (
                  <Icon name="muteMicrophone" />
                ) : (
                  <Icon name="microphone" size={20} />
                )}
              </motion.button>
              <motion.button
                onClick={submitAnswer}
                disabled={isSubmitting || isAiPlaying}
                whileTap={{ scale: 0.95 }}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-400 text-white py-3 sm:py-4 
            rounded-2xl shadow-lg hover:opacity-90 transititon font-semibold disabled:bg-gray-500"
              >
                {isSubmitting ? "Submitting..." : "Submit Answer"}
              </motion.button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 bg-emerald-50 border border-emerald-200 p-5
            rounded-2xl shadow-sm"
            >
              <p className="text-emerald-700 font-medium mb-4">{feedback}</p>
              <button
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white
              py-3 rounded-xl shadown-md hover:opacity-90 transition flex items-center justify-center gap-1"
              >
                <span>
                  {currentIndex === questions.length - 1
                    ? "Finish Interview"
                    : "Next question"}
                </span>
                <Icon name="rightArrow" size={16} />
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Interview;
