window.PORTAL_CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbx5uyXdaP-dhKnCdicvsRcnF5cZe1N-iKyWKEcGFWAa4MQXFEDw1_Y8BTch_Dgd2VoPug/exec",

  APP: {
    nameBn: "à¦“à¦¯à¦¼à§‡à¦¸à§à¦Ÿà¦¾à¦°à§à¦¨ à¦¸à§à¦•à§à¦² à¦à¦¨à§à¦¡ à¦•à¦²à§‡à¦œ à¦¸à§à¦Ÿà§à¦¡à§‡à¦¨à§à¦Ÿ à¦ªà§‹à¦°à§à¦Ÿà¦¾à¦²",
    nameEn: "Western School & College Student Portal",
    shortName: "WSC Portal",
    descriptionBn: "à¦¶à¦¿à¦•à§à¦·à¦¾à¦°à§à¦¥à§€à¦° à¦ªà§à¦°à§‹à¦«à¦¾à¦‡à¦², à¦«à¦¿, à¦°à§‡à¦œà¦¾à¦²à§à¦Ÿ, à¦¨à§‹à¦Ÿà¦¿à¦¶, à¦®à§‡à¦¸à§‡à¦œ à¦“ à¦à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦¬à§à¦¯à¦¬à¦¸à§à¦¥à¦¾à¦ªà¦¨à¦¾",
    descriptionEn: "Student profile, fees, result, notice, message and account management portal",
    logoUrl: "https://res.cloudinary.com/do1dejkkk/image/upload/v1778605133/western_logo_hg9fji_1_vojrqz_1_zjiw5m.png",
    localIcon: "https://res.cloudinary.com/do1dejkkk/image/upload/v1778605133/western_logo_hg9fji_1_vojrqz_1_zjiw5m.png",
    themeColor: "#ffffff",
    backgroundColor: "#ffffff"
  },

  SEO: {
    title: "à¦“à¦¯à¦¼à§‡à¦¸à§à¦Ÿà¦¾à¦°à§à¦¨ à¦¸à§à¦•à§à¦² à¦à¦¨à§à¦¡ à¦•à¦²à§‡à¦œ | Student Portal",
    keywords: "student portal, western school and college, result, fees, notice",
    author: "Western School & College",
    ogImage: "https://res.cloudinary.com/do1dejkkk/image/upload/v1778605133/western_logo_hg9fji_1_vojrqz_1_zjiw5m.png"
  },

  CONTACT: {
    helplineTitleBn: "à¦¹à§‡à¦²à§à¦ªà¦²à¦¾à¦‡à¦¨",
    helplineTitleEn: "Helpline",
    numbers: [
      { label: "à¦¹à§‡à¦²à§à¦ªà¦²à¦¾à¦‡à¦¨ à§§", number: "01632426120" },
      { label: "à¦¹à§‡à¦²à§à¦ªà¦²à¦¾à¦‡à¦¨ à§¨", number: "01820716529" }
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
    { key: "home", labelBn: "à¦¹à§‹à¦®", labelEn: "Home", icon: "fa-house", route: "index.html" },
    { key: "fees", labelBn: "à¦«à¦¿", labelEn: "Fees", icon: "fa-wallet", route: "fee.html" },
    { key: "result", labelBn: "à¦°à§‡à¦œà¦¾à¦²à§à¦Ÿ", labelEn: "Result", icon: "fa-chart-simple", route: "result.html" },
    { key: "notice", labelBn: "à¦¨à§‹à¦Ÿà¦¿à¦¶", labelEn: "Notice", icon: "fa-bullhorn", route: "notice.html", dot: "notice" },
    { key: "message", labelBn: "à¦®à§‡à¦¸à§‡à¦œ", labelEn: "Message", icon: "fa-envelope", route: "message.html", dot: "message" },
    { key: "account", labelBn: "à¦à¦•à¦¾à¦‰à¦¨à§à¦Ÿ à¦¸à§‡à¦Ÿà¦¿à¦‚à¦¸", labelEn: "Account Settings", icon: "fa-user-gear", route: "account.html" }
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
    notificationTitle: "à¦¨à¦¤à§à¦¨ à¦¨à§‹à¦Ÿà¦¿à¦¶",
    notificationBody: "à¦¨à¦¤à§à¦¨ à¦à¦•à¦Ÿà¦¿ à¦¨à§‹à¦Ÿà¦¿à¦¶ à¦à¦¸à§‡à¦›à§‡à¥¤"
  }
};

