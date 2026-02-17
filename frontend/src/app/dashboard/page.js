"use client";
// app/dashboard/page.js 
import { Home, Calendar, Video, User, LogOut, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import CreateMeetingModal from "@/components/CreateMeetingModal/CreateMeetingModal";
import MeetingsTab from "@/components/MeetingsTab/MeetingsTab";
import SlotsTab from "@/components/SlotsTab/SlotsTab";
import HomeTab from "@/components/HomeTab/HomeTab";
import api from "@/utils/api";
import ProfileUpdate from "@/components/Profile/ProfileUpdate";
import TimeSlot from "@/components/TimeSlot/TimeSlot";

export default function Page() {
  const [activeTab, setActiveTab] = useState("home");
  const [modalOpen, setModalOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // const [me,setMe] = useState(JSON.parse(sessionStorage.getItem('user')));
  const [user, setUser] = useState({});

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    // const token = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      // sessionStorage.removeItem('user');
      window.location.href = "/login";
    }
    setUser(user);

  }, [])

  // console.log("me",me)

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleMobileTabChange = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      await api.post("/api/auth/logout", {
        refreshToken,
      });
    } catch (err) {
      console.warn("Logout API failed, forcing logout");
    } finally {
      // 🔥 Always clear client state
      localStorage.removeItem("user");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("sessionId");

      window.location.href = "/login";
    }
  };

  // console.log("user", user)

  return (
    <>
      <div className="h-[89vh] bg-gray-50 flex overflow-hidden">
        {/* Mobile Sidebar - Slide-over */}
        <div
          className={`fixed inset-0 z-40 md:hidden ${sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
            }`}
        >
          {/* Overlay */}
          <div
            className={`absolute inset-0 bg-black/40 transition-opacity ${sidebarOpen ? "opacity-100" : "opacity-0"
              }`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Drawer */}
          <aside
            className={`relative w-72 max-w-full bg-white h-full shadow-xl transform transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
              }`}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h1 className="text-xl font-bold text-indigo-900">OD®</h1>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-sm"
              >
                Close
              </button>
            </div>

            <nav className="p-4 space-y-2">
              <button
                onClick={() => handleMobileTabChange("home")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm ${activeTab === "home"
                  ? "bg-indigo-100 text-indigo-900 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <Home className="w-5 h-5" /> Dashboard
              </button>
              <button
                onClick={() => handleMobileTabChange("meetings")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm ${activeTab === "meetings"
                  ? "bg-indigo-100 text-indigo-900 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <Video className="w-5 h-5" /> Meetings
              </button>
              <button
                onClick={() => handleMobileTabChange("slots")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm ${activeTab === "slots"
                  ? "bg-indigo-100 text-indigo-900 font-semibold"
                  : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <Calendar className="w-5 h-5" /> Available Slots
              </button>
              {user?.role === "notary" && (
                <>
                  <button
                    onClick={() => handleMobileTabChange("time-slots")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm ${activeTab === "profile"
                      ? "bg-indigo-100 text-indigo-900 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    <User className="w-5 h-5" /> Time Slots
                  </button>
                  {/* <button
                    onClick={() => handleMobileTabChange("profile")}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-sm ${activeTab === "profile"
                      ? "bg-indigo-100 text-indigo-900 font-semibold"
                      : "hover:bg-gray-100 text-gray-700"
                      }`}
                  >
                    <User className="w-5 h-5" /> Logbook
                  </button> */}
                </>
              )}
            </nav>

            <div className="border-t mt-4 pt-4 px-4 space-y-2">
              <button onClick={() => handleTabChange("profile")} className="w-full flex items-center gap-3 text-black px-4 py-3 rounded-lg hover:bg-gray-100 text-sm">
                <User className="w-5 h-5" /> Profile
              </button>
              <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-red-600 text-sm">
                <LogOut className="w-5 h-5" /> Logout
              </button>
            </div>
          </aside>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 bg-white shadow-lg">
          <div className="p-4 border-b">
            <h1 className="text-2xl font-bold text-indigo-900">OD®</h1>
          </div>
          <nav className="p-4 space-y-2">
            <button
              onClick={() => handleTabChange("home")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "home"
                ? "bg-indigo-100 text-indigo-900 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              <Home className="w-5 h-5" /> Dashboard
            </button>
            <button
              onClick={() => handleTabChange("meetings")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "meetings"
                ? "bg-indigo-100 text-indigo-900 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              <Video className="w-5 h-5" /> Meetings
            </button>
            <button
              onClick={() => handleTabChange("slots")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "slots"
                ? "bg-indigo-100 text-indigo-900 font-semibold"
                : "hover:bg-gray-100 text-gray-700"
                }`}
            >
              <Calendar className="w-5 h-5" /> Available Slots
            </button>
            {user?.role === "notary" && (
              <>
                <button
                  onClick={() => handleTabChange("time-slots")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "time-slots"
                    ? "bg-indigo-100 text-indigo-900 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  <Calendar className="w-5 h-5" /> Time Slots
                </button>
                {/* <button
                  onClick={() => handleTabChange("slots")}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${activeTab === "slots"
                    ? "bg-indigo-100 text-indigo-900 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  <Calendar className="w-5 h-5" /> Logbook
                </button> */}
              </>
            )}
          </nav>
          <div className="border-t mt-6 pt-4 px-4 space-y-2">
            <button onClick={() => handleTabChange("profile")} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-black hover:bg-gray-100">
              <User className="w-5 h-5" /> Profile
            </button>
            <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 text-red-600">
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-linear-to-r from-indigo-900 to-blue-900 text-white px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
            <div className="flex flex-col justify-between items-center md:flex-row-reverse gap-3">
              {/* Top row: logo + hamburger + user (mobile), user only (desktop) */}
              <div className="flex items-center justify-between w-full md:w-auto">
                <div className="flex items-center gap-3 md:hidden">
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                  <span className="text-lg font-semibold">OD®</span>
                </div>
                <div className="hidden md:flex" /> {/* spacer for desktop */}

                <div className="flex items-center gap-3 sm:gap-4">
                  <span className="text-sm sm:text-base">
                    Welcome, {user?.name || 'User'}!
                  </span>
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                </div>
              </div>

              {/* Info text */}
              <p className="text-xs sm:text-sm max-w-4xl text-center md:text-start">
                If you have any feedback or problems, contact us at{" "}
                <a
                  href="mailto:hello@ommdocumentation.com"
                  className="underline font-medium"
                >
                  hello@ommdocumentation.com
                </a>
                . We are happy to help!
              </p>
            </div>
          </header>

          <main className="h-82 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            {/* Tabs */}
            {/* <div className="flex gap-4 sm:gap-8 border-b mb-6 sm:mb-8 overflow-x-auto">
              {["home", "meetings", "slots"].map((tab) => (
                <button
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 sm:pb-4 px-1 sm:px-2 font-medium capitalize transition border-b-4 whitespace-nowrap ${activeTab === tab
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                >
                  {tab === "home"
                    ? "Home"
                    : tab === "meetings"
                      ? "Meetings"
                      : "Available Slots"}
                </button>
              ))}
            </div> */}

            {/* Tab Content */}
            {activeTab === "home" && <HomeTab />}
            {activeTab === "meetings" && (
              <MeetingsTab openModal={() => setModalOpen(true)} />
            )}
            {activeTab === "slots" && <SlotsTab />}
            {activeTab === "profile" && <ProfileUpdate />}
            {activeTab === "time-slots" && <TimeSlot />}
          </main>
        </div>
      </div>

      <CreateMeetingModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
