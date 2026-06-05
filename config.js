window.PORTAL_CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbxM0plDdS6eRQQvbzS5fDvCUiAnjiUbWHes9GCfkG-n6Glbq_37OUdR5YXJi5Gmuee8aA/exec",

  APP: {
    nameBn: "ওয়েস্টার্ন স্কুল এন্ড কলেজ স্টুডেন্ট পোর্টাল",
    nameEn: "Western School & College Student Portal",
    shortName: "WSC Portal",
    descriptionBn: "শিক্ষার্থীর প্রোফাইল, ফি, রেজাল্ট, নোটিশ, মেসেজ ও একাউন্ট ব্যবস্থাপনা",
    descriptionEn: "Student profile, fees, result, notice, message and account management portal",
    logoUrl: "https://res.cloudinary.com/do1dejkkk/image/upload/v1778605133/western_logo_hg9fji_1_vojrqz_1_zjiw5m.png",
    localIcon: "https://res.cloudinary.com/do1dejkkk/image/upload/v1778605133/western_logo_hg9fji_1_vojrqz_1_zjiw5m.png",
    themeColor: "#ffffff",
    backgroundColor: "#ffffff"
  },

  SEO: {
    title: "ওয়েস্টার্ন স্কুল এন্ড কলেজ | Student Portal",
    keywords: "student portal, western school and college, result, fees, notice",
    author: "Western School & College",
    ogImage: "https://res.cloudinary.com/do1dejkkk/image/upload/v1778605133/western_logo_hg9fji_1_vojrqz_1_zjiw5m.png"
  },

  CONTACT: {
    helplineTitleBn: "হেল্পলাইন",
    helplineTitleEn: "Helpline",
    numbers: [
      { label: "হেল্পলাইন ১", number: "01632426120" },
      { label: "হেল্পলাইন ২", number: "01820716529" }
    ],
    email: ""
  },

  SOCIAL: {
    facebook: "#",
    youtube: "#",
    website: "#",
    whatsapp: "https://wa.me/8801632426120"
  },

  ROUTES: {
    home: "index.html",
    fees: "fee.html",
    result: "result.html",
    notice: "notice.html",
    message: "message.html",
    account: "account.html"
  },

  MENU: [
    { key: "home", labelBn: "হোম", labelEn: "Home", icon: "fa-house", route: "index.html" },
    { key: "fees", labelBn: "ফি", labelEn: "Fees", icon: "fa-wallet", route: "fee.html" },
    { key: "result", labelBn: "রেজাল্ট", labelEn: "Result", icon: "fa-chart-simple", route: "result.html" },
    { key: "notice", labelBn: "নোটিশ", labelEn: "Notice", icon: "fa-bullhorn", route: "notice.html", dot: "notice" },
    { key: "message", labelBn: "মেসেজ", labelEn: "Message", icon: "fa-envelope", route: "message.html", dot: "message" },
    { key: "account", labelBn: "একাউন্ট সেটিংস", labelEn: "Account Settings", icon: "fa-user-gear", route: "account.html" }
  ],

  STORAGE: {
    session: "wsc_student_session_v3",
    dashboard: "wsc_dashboard_cache_v3",
    noticeSeen: "wsc_seen_notice_ids_v3",
    noticeDot: "wsc_notice_dot_v3",
    messageDot: "wsc_message_dot_v3",
    installPrompt: "wsc_install_prompt_v3"
  },

  API_ACTIONS: {
    login: "login",
    dashboard: "dashboard",
    uploadFile: "uploadFile",
    submitProfileUpdate: "submitProfileUpdate",
    getNotices: "getNotices",
    getStudentMessages: "getStudentMessages"
  },

  NOTICE: {
    autoRefreshSeconds: 60,
    notificationTitle: "নতুন নোটিশ",
    notificationBody: "নতুন একটি নোটিশ এসেছে।"
  }
};