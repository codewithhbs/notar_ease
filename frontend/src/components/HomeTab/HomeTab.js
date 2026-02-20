"use client";

import { motion } from "framer-motion";
import { User, Video, Calendar, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

const actions = [
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

export default function HomeTab({ onTabChange, openMeetingModal }) {
  const router = useRouter();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 sm:space-y-12"
    >
      <div className="bg-linear-to-r from-indigo-50 to-blue-50 rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 text-center mb-6 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
          Welcome to Omm Documentation
        </h2>
        <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
          Get started by completing your profile and booking a meeting.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {actions.map((action, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md p-5 sm:p-7 lg:p-8 hover:shadow-xl transition"
          >
            <div className="flex gap-4 sm:gap-5 items-start">
              <div
                className={`p-3 sm:p-4 rounded-full ${action.primary ? "bg-indigo-100" : "bg-gray-100"
                  }`}
              >
                <action.icon
                  className={`w-6 h-6 sm:w-8 sm:h-8 ${action.primary ? "text-indigo-900" : "text-gray-700"
                    }`}
                />
              </div>
              <div className="flex-1">
                <h3 className="text-lg text-black sm:text-xl font-semibold mb-1 sm:mb-2">
                  {action.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                  {action.desc}
                </p>
                <button
                  onClick={() => {
                    if (action.tab) onTabChange(action.tab);
                    if (action.redirect) router.push(action.redirect);
                    if (action.mail) window.location.href = `mailto:${action.btn}`;
                  }}
                  className={`w-full py-2.5 sm:py-3 rounded-lg font-medium text-sm sm:text-base transition ${action.primary
                    ? "bg-indigo-600 text-white hover:bg-indigo-700"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                    }`}
                >
                  {action.btn}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
