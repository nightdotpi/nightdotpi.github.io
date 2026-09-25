// frontend/src/i18n/translations/signin.ts
// Namespace lowercase to match SignIn.tsx keys: signin.*
export const signin = {
  title: {
    fa: 'ورود',
    en: 'Sign In',
    tr: 'Giriş',
    zh: '登录',
    ar: 'تسجيل الدخول',
  },
  description: {
    fa: 'برای استفاده از امکانات Night، با Pi وارد شوید.',
    en: 'To use Night features, sign in with Pi.',
    tr: 'Night özelliklerini kullanmak için Pi ile giriş yapın.',
    zh: '要使用 Night 功能，请使用 Pi 登录。',
    ar: 'لاستخدام ميزات Night، سجّل الدخول باستخدام Pi.',
  },
  button: {
    login: {
      fa: 'ورود با Pi',
      en: 'Login with Pi',
      tr: 'Pi ile Giriş',
      zh: '使用 Pi 登录',
      ar: 'تسجيل الدخول باستخدام Pi',
    },
  },
  status: {
    initializing: {
      fa: 'در حال راه‌اندازی...',
      en: 'Initializing...',
      tr: 'Başlatılıyor...',
      zh: '正在初始化...',
      ar: 'جارٍ التهيئة...',
    },
    ready: {
      fa: 'آماده',
      en: 'Ready',
      tr: 'Hazır',
      zh: '就绪',
      ar: 'جاهز',
    },
    authenticating: {
      fa: 'در حال احراز هویت...',
      en: 'Authenticating...',
      tr: 'Kimlik doğrulanıyor...',
      zh: '正在认证...',
      ar: 'جارٍ المصادقة...',
    },
    success: {
      fa: 'ورود موفق',
      en: 'Login successful',
      tr: 'Giriş başarılı',
      zh: '登录成功',
      ar: 'تم تسجيل الدخول بنجاح',
    },
    redirecting: {
      fa: 'در حال انتقال...',
      en: 'Redirecting...',
      tr: 'Yönlendiriliyor...',
      zh: '正在跳转...',
      ar: 'جارٍ إعادة التوجيه...',
    },
  },
  errors: {
    sdkNotFound: {
      fa: 'Pi SDK پیدا نشد. لطفاً در Pi Browser باز کنید.',
      en: 'Pi SDK not found. Please open in Pi Browser.',
      tr: 'Pi SDK bulunamadı. Lütfen Pi Browser’da açın.',
      zh: '未找到 Pi SDK。请在 Pi Browser 中打开。',
      ar: 'لم يتم العثور على Pi SDK. افتح في Pi Browser.',
    },
    authContextMissing: {
      fa: 'Auth context در دسترس نیست.',
      en: 'Auth context is missing.',
      tr: 'Auth context eksik.',
      zh: '缺少 Auth context。',
      ar: 'سياق المصادقة غير متوفر.',
    },
    incompletePayment: {
      fa: 'پرداخت ناتمام پیدا شد.',
      en: 'Incomplete payment found.',
      tr: 'Tamamlanmamış ödeme bulundu.',
      zh: '发现未完成的支付。',
      ar: 'تم العثور على دفعة غير مكتملة.',
    },
    loginFailed: {
      fa: 'ورود ناموفق.',
      en: 'Login failed.',
      tr: 'Giriş başarısız.',
      zh: '登录失败。',
      ar: 'فشل تسجيل الدخول.',
    },
  },
  footer: {
    piBrowserOnly: {
      fa: 'این برنامه فقط داخل Pi Browser کار می‌کند.',
      en: 'This app works only inside Pi Browser.',
      tr: 'Bu uygulama yalnızca Pi Browser içinde çalışır.',
      zh: '本应用仅在 Pi Browser 内运行。',
      ar: 'يعمل هذا التطبيق فقط داخل Pi Browser.',
    },
  },
};
