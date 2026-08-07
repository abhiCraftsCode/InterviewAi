import React from "react";
import {
  FaUser,
  FaTimes,
  FaUserTie,
  FaChartLine,
  FaCheckCircle,
} from "react-icons/fa";
import { AiOutlineLogout } from "react-icons/ai";
import {
  VscRobot,
  VscClockface,
  VscArrowRight,
  VscArrowLeft,
} from "react-icons/vsc";
import {
  BsCashCoin,
  BsMic,
  BsFileEarmarkText,
  BsMicMute,
} from "react-icons/bs";
import { GiSparkles } from "react-icons/gi";
import { FcGoogle, FcBarChart, FcBriefcase } from "react-icons/fc";
import { MdOutlineFileUpload, MdOutlineFileDownload } from "react-icons/md";

// Map string names to icon components
const iconMap = {
  user: FaUser,
  userTie: FaUserTie,
  logout: AiOutlineLogout,
  coin: BsCashCoin,
  robot: VscRobot,
  sparkle: GiSparkles,
  google: FcGoogle,
  cross: FaTimes,
  microphone: BsMic,
  muteMicrophone: BsMicMute,
  clock: VscClockface,
  chart: FcBarChart,
  chartLine: FaChartLine,
  file: BsFileEarmarkText,
  fileDownload: MdOutlineFileDownload,
  fileUpload: MdOutlineFileUpload,
  briefcase: FcBriefcase,
  leftArrow: VscArrowLeft,
  rightArrow: VscArrowRight,
  check: FaCheckCircle,
};

const Icon = ({ name, size = 20, className, ...props }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return <IconComponent size={size} className={className} {...props} />;
};

export default Icon;
