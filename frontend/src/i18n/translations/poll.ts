import type { Translations } from '../I18nContext';

export const poll: Translations = {
  pollQuestion: {
    fa: 'آیا از توسعه اکوسیستم Night و کاربردهای واقعی NTP حمایت می‌کنید؟',
    en: 'Do you support the development of the Night ecosystem and real NTP utilities?',
    tr: 'Night ekosisteminin gelişimini ve NTP’nin gerçek kullanım alanlarını destekliyor musunuz?',
    zh: '您是否支持 Night 生态系统的发展以及 NTP 的真实用途？',
    hi: 'क्या आप Night इकोसिस्टम के विकास और NTP के वास्तविक उपयोगों का समर्थन करते हैं?',
    ar: 'هل تدعم تطوير منظومة Night والاستخدامات الحقيقية لرمز NTP؟',
  },

  pollDescription: {
    fa: 'این رأی‌گیری یک نمونه اولیه برای سنجش مشارکت جامعه است. هر کاربر واردشده با Pi فقط یک رأی می‌تواند ثبت کند.',
    en: 'This poll is an early prototype to measure community participation. Each Pi-authenticated user can submit only one vote.',
    tr: 'Bu anket, topluluk katılımını ölçmek için erken bir prototiptir. Pi ile doğrulanan her kullanıcı yalnızca bir oy kullanabilir.',
    zh: '这是一个用于衡量社区参与的早期原型。每位通过 Pi 认证的用户只能投一票。',
    hi: 'यह मतदान समुदाय की भागीदारी मापने के लिए एक प्रारंभिक प्रोटोटाइप है। प्रत्येक Pi-प्रमाणित उपयोगकर्ता केवल एक वोट दे सकता है।',
    ar: 'هذا التصويت نموذج أولي لقياس مشاركة المجتمع. يمكن لكل مستخدم موثق عبر Pi تسجيل صوت واحد فقط.',
  },

  pollYes: {
    fa: 'بله، حمایت می‌کنم',
    en: 'Yes, I support it',
    tr: 'Evet, destekliyorum',
    zh: '是的，我支持',
    hi: 'हाँ, मैं समर्थन करता हूँ',
    ar: 'نعم، أؤيد ذلك',
  },

  pollNo: {
    fa: 'خیر، فعلاً نه',
    en: 'No, not for now',
    tr: 'Hayır, şimdilik değil',
    zh: '不，暂时不',
    hi: 'नहीं, फिलहाल नहीं',
    ar: 'لا، ليس الآن',
  },

  yesLabel: { fa: 'بله', en: 'Yes', tr: 'Evet', zh: '是', hi: 'हाँ', ar: 'نعم' },
  noLabel: { fa: 'خیر', en: 'No', tr: 'Hayır', zh: '否', hi: 'नहीं', ar: 'لا' },

  pollLoading: {
    fa: 'در حال دریافت نتایج رأی‌گیری...',
    en: 'Loading poll results...',
    tr: 'Anket sonuçları yükleniyor...',
    zh: '正在加载投票结果...',
    hi: 'मतदान परिणाम लोड हो रहे हैं...',
    ar: 'جارٍ تحميل نتائج التصويت...',
  },

  pollLoginRequired: {
    fa: 'برای ثبت رأی باید ابتدا با Pi وارد شوید.',
    en: 'You must login with Pi before voting.',
    tr: 'Oy vermeden önce Pi ile giriş yapmalısınız.',
    zh: '投票前必须使用 Pi 登录。',
    hi: 'मतदान से पहले आपको Pi से लॉगिन करना होगा।',
    ar: 'يجب تسجيل الدخول باستخدام Pi قبل التصويت.',
  },

  pollAlreadyVoted: {
    fa: 'شما قبلاً در این رأی‌گیری شرکت کرده‌اید.',
    en: 'You have already voted in this poll.',
    tr: 'Bu ankette zaten oy kullandınız.',
    zh: '您已经在此投票中投过票。',
    hi: 'आप इस मतदान में पहले ही वोट कर चुके हैं।',
    ar: 'لقد قمت بالتصويت في هذا الاستطلاع من قبل.',
  },

  pollVoteSuccess: {
    fa: 'رأی شما با موفقیت ثبت شد.',
    en: 'Your vote has been recorded successfully.',
    tr: 'Oyunuz başarıyla kaydedildi.',
    zh: '您的投票已成功记录。',
    hi: 'आपका वोट सफलतापूर्वक दर्ज कर लिया गया है।',
    ar: 'تم تسجيل صوتك بنجاح.',
  },

  totalVotes: {
    fa: 'مجموع رأی‌ها',
    en: 'Total votes',
    tr: 'Toplam oy',
    zh: '总票数',
    hi: 'कुल वोट',
    ar: 'إجمالي الأصوات',
  },

  yourVote: {
    fa: 'رأی شما',
    en: 'Your vote',
    tr: 'Oyunuz',
    zh: '您的投票',
    hi: 'आपका वोट',
    ar: 'صوتك',
  },

  voteDate: {
    fa: 'تاریخ رأی',
    en: 'Vote date',
    tr: 'Oy tarihi',
    zh: '投票日期',
    hi: 'मतदान तिथि',
    ar: 'تاريخ التصويت',
  },

  voteHistory: {
    fa: 'تاریخچه رأی شما',
    en: 'Your vote history',
    tr: 'Oy geçmişiniz',
    zh: '您的投票历史',
    hi: 'आपका मतदान इतिहास',
    ar: 'سجل تصويتك',
  },

  pollConnectionError: {
    fa: 'خطا در ارتباط با سرور رأی‌گیری.',
    en: 'Error connecting to poll server.',
    tr: 'Anket sunucusuna bağlanırken hata oluştu.',
    zh: '连接投票服务器时出错。',
    hi: 'मतदान सर्वर से कनेक्ट करने में त्रुटि।',
    ar: 'حدث خطأ أثناء الاتصال بخادم التصويت.',
  },
};
