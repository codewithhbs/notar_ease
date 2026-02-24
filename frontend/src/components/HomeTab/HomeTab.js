"use client";

import { motion } from "framer-motion";
import { User, Video, Calendar, Mail, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function HomeTab({ onTabChange, openMeetingModal }) {
  const router = useRouter();
  const [role, setRole] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    setRole(user.role);
  }, []);

  let actions = [];
  if (role === "advocate") {
    actions = [
      {
        icon: User,
        title: "Complete Your Profile",
        desc: "Ensure your profile is up-to-date.",
        btn: "Update Profile",
        tab: "profile",
      },
      {
        icon: Video,
        title: "Book a Meeting",
        desc: "Schedule your notary session.",
        btn: "Book Meeting",
        primary: true,
        tab: "meetings",
      },
      {
        icon: Calendar,
        title: "Check Available Timeslots",
        desc: "View all available notary slots.",
        btn: "Check Timeslots",
        tab: "slots",
      },
      {
        icon: Mail,
        title: "Contact Us",
        desc: "We're here to help!",
        btn: "hello@ommdocumentation.com",
        mail: true,
      },
    ];
  } else {
    actions = [
      {
        icon: User,
        title: "Complete Your Profile",
        desc: "Ensure your profile is up-to-date.",
        btn: "Update Profile",
        tab: "profile",
      },
      {
        icon: Video,
        title: "Book a Meeting",
        desc: "Schedule your notary session.",
        btn: "Book Meeting",
        primary: true,
        redirect: "/dashboard/create-meeting",
      },
      {
        icon: Calendar,
        title: "Check Available Timeslots",
        desc: "View all available notary slots.",
        btn: "Check Timeslots",
        tab: "slots",
      },
      {
        icon: Mail,
        title: "Contact Us",
        desc: "We're here to help!",
        btn: "hello@ommdocumentation.com",
        mail: true,
      },
    ];
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 font-sans"
    >
      {/* ── Header ── */}
      <div>
        <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-1">
          Dashboard
        </p>
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-gray-900"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Welcome Back
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Get started by completing your profile and booking a meeting.
        </p>
      </div>

      {/* ── Action Cards ── */}
      <div className="grid gap-5 md:grid-cols-2">
        {actions.map((action, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.45 }}
            className={`group bg-white rounded-3xl border overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200 ${
              action.primary
                ? "border-[#005F5A]/20"
                : "border-gray-100"
            }`}
          >
            {/* top stripe */}
            <div
              className={`h-1 ${
                action.primary
                  ? "bg-gradient-to-r from-[#005F5A] to-[#00A896]"
                  : action.mail
                  ? "bg-gradient-to-r from-[#C9A84C] to-[#E8C56A]"
                  : "bg-gradient-to-r from-gray-200 to-gray-300"
              }`}
            />

            <div className="p-6 sm:p-7 flex flex-col h-full">
              <div className="flex items-start gap-4 mb-5">
                {/* icon */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    action.primary
                      ? "bg-[#005F5A]"
                      : action.mail
                      ? "bg-[#FBF5E6]"
                      : "bg-[#E6F4F3]"
                  }`}
                >
                  <action.icon
                    size={20}
                    className={
                      action.primary
                        ? "text-white"
                        : action.mail
                        ? "text-[#C9A84C]"
                        : "text-[#005F5A]"
                    }
                  />
                </div>

                {/* text */}
                <div>
                  <h3
                    className="text-base font-bold text-gray-900 mb-1"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {action.desc}
                  </p>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={() => {
                  if (action.tab) onTabChange(action.tab);
                  if (action.redirect) router.push(action.redirect);
                  if (action.mail) window.location.href = `mailto:${action.btn}`;
                }}
                className={`mt-auto w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  action.primary
                    ? "bg-gradient-to-br from-[#005F5A] to-[#004845] text-white shadow-md shadow-[#005F5A]/20 hover:shadow-[#005F5A]/40"
                    : action.mail
                    ? "bg-[#FBF5E6] text-[#8B6914] border border-[#C9A84C]/30 hover:bg-[#C9A84C]/10"
                    : "bg-[#E6F4F3] text-[#005F5A] hover:bg-[#005F5A]/10"
                }`}
              >
                {action.mail ? (
                  <span className="truncate text-xs font-semibold">{action.btn}</span>
                ) : (
                  <>
                    {action.btn}
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}