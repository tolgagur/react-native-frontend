export default {
  common: {
    loading: 'Yükleniyor...',
    error: 'Hata',
    success: 'Başarılı',
    retry: 'Tekrar Dene',
    logout: 'Çıkış Yap',
    save: 'Kaydet',
    cancel: 'İptal',
    add: 'Ekle',
    delete: 'Sil',
    edit: 'Düzenle',
    create: 'Oluştur',
    update: 'Güncelle',
    user: 'Dostum',
    continue: 'Devam Et'
  },
  auth: {
    login: {
      title: 'Giriş Yap',
      subtitle: 'Hesabınıza giriş yapın',
      username: 'Kullanıcı Adı',
      password: 'Şifre',
      forgotPassword: 'Şifremi Unuttum?',
      loginButton: 'Giriş Yap',
      noAccount: 'Hesabınız yok mu?',
      register: 'Kayıt Ol',
      or: 'veya',
      errors: {
        requiredFields: 'Kullanıcı adı ve şifre gerekli',
        usernameLength: 'Kullanıcı adı en az 3 karakter olmalı',
        passwordLength: 'Şifre en az 6 karakter olmalı',
        invalidCredentials: 'Kullanıcı adı veya şifre hatalı',
      },
    },
    register: {
      title: 'Kayıt Ol',
      subtitle: 'Yeni bir hesap oluşturun',
      username: 'Kullanıcı Adı',
      email: 'E-posta',
      password: 'Şifre',
      firstName: 'Ad',
      lastName: 'Soyad',
      registerButton: 'Kayıt Ol',
      haveAccount: 'Zaten hesabınız var mı?',
      login: 'Giriş Yap',
      or: 'veya',
      errors: {
        requiredFields: 'Lütfen tüm zorunlu alanları doldurun',
        usernameLength: 'Kullanıcı adı 3-50 karakter arasında olmalı',
        invalidEmail: 'Geçerli bir e-posta adresi girin',
        passwordLength: 'Şifre en az 6 karakter olmalı',
      },
    },
    forgotPassword: {
      title: 'Şifremi Unuttum',
      subtitle: 'E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim',
      email: 'E-posta',
      sendButton: 'Gönder',
      backToLogin: 'Giriş sayfasına dön',
      success: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi',
      error: 'Şifre sıfırlama işlemi başarısız',
    },
  },
  profile: {
    title: 'Profil',
    settings: 'Ayarlar',
    personalInfo: 'Kişisel Bilgiler',
    notificationSettings: 'Bildirimler',
    languageSettings: 'Dil Ayarları',
    changePassword: 'Şifre Değiştir',
    changePasswordDescription: 'Hesap güvenliğiniz için şifrenizi değiştirin',
    currentPassword: 'Mevcut Şifre',
    newPassword: 'Yeni Şifre',
    confirmPassword: 'Yeni Şifre (Tekrar)',
    enterCurrentPassword: 'Mevcut şifrenizi girin',
    enterNewPassword: 'Yeni şifrenizi girin',
    enterConfirmPassword: 'Yeni şifrenizi tekrar girin',
    passwordUpdateSuccess: 'Şifreniz başarıyla güncellendi',
    passwordUpdateError: 'Şifre güncellenirken bir hata oluştu',
    passwordRequiredFields: 'Lütfen tüm alanları doldurun',
    passwordTooShort: 'Yeni şifre en az 6 karakter olmalıdır',
    passwordsDoNotMatch: 'Yeni şifreler eşleşmiyor',
    guestUser: 'Misafir Kullanıcı',
    showProfile: 'Profili Görüntüle',
    username: 'Kullanıcı Adı',
    email: 'E-posta',
    firstName: 'Ad',
    lastName: 'Soyad',
    enterFirstName: 'Adınızı girin',
    enterLastName: 'Soyadınızı girin',
    level: 'Seviye',
    experiencePoints: 'Deneyim Puanı',
    totalFlashcards: 'Toplam Flash Kart',
    studyTime: 'Çalışma Süresi',
    minutes: 'dakika',
    successRate: 'Başarı Oranı',
    fetchError: 'Bilgiler yüklenirken bir hata oluştu',
    updateSuccess: 'Bilgileriniz başarıyla güncellendi',
    updateError: 'Bilgileriniz güncellenirken bir hata oluştu',
  },
  languages: {
    turkish: 'Türkçe',
    english: 'İngilizce',
  },
  messages: {
    languageUpdated: 'Dil ayarı güncellendi',
    languageError: 'Dil değiştirilemedi',
    logoutError: 'Çıkış yapılırken bir hata oluştu',
  },
  categories: {
    title: 'Kategoriler',
    addNew: 'Yeni Kategori',
    addNewSubtitle: 'Kategori oluştur',
    empty: 'Henüz kategori oluşturmadınız',
    emptySubtext: 'Yeni kategori eklemek için + butonuna tıklayın',
    name: 'Kategori Adı',
    description: 'Açıklama',
    color: 'Renk',
    appearance: {
      title: 'Görünüm',
      description: 'Kategoriniz için bir renk ve ikon seçebilirsiniz (Opsiyonel)',
      colorSelection: 'Renk Seçimi',
      iconSelection: 'İkon Seçimi',
      clearSelection: 'Seçimi Temizle'
    },
    steps: {
      name: {
        title: 'Kategori Adı',
        description: 'Kategoriniz için akılda kalıcı bir isim belirleyin',
        placeholder: 'Örn: İngilizce Kelimeler'
      },
      description: {
        title: 'Kategori Açıklaması',
        description: 'Kategorinizin amacını ve içeriğini açıklayın',
        placeholder: 'Örn: İngilizce öğrenirken öğrendiğim yeni kelimeler'
      },
      appearance: {
        title: 'Görünüm',
        description: 'Kategoriniz için bir renk ve ikon seçebilirsiniz (Opsiyonel)',
        colorSelection: 'Renk Seçimi',
        iconSelection: 'İkon Seçimi',
        clearSelection: 'Seçimi Temizle'
      }
    },
    colors: {
      lightBlue: 'Açık Mavi',
      lightOrange: 'Açık Turuncu',
      lightGreen: 'Açık Yeşil',
      lightPurple: 'Açık Mor',
      lightRed: 'Açık Kırmızı',
      gray: 'Gri'
    },
    icons: {
      book: 'Kitap',
      school: 'Okul',
      language: 'Dil',
      math: 'Matematik',
      science: 'Bilim',
      art: 'Sanat'
    },
    buttons: {
      continue: 'Devam',
      create: 'Kategori Oluştur',
      creating: 'Oluşturuluyor...'
    },
    studySetCount: '{{count}} çalışma seti',
    noStudySet: 'Çalışma seti yok',
    oneStudySet: '1 çalışma seti',
    errors: {
      nameRequired: 'Kategori adı zorunludur',
      nameTooShort: 'Kategori adı en az 3 karakter olmalıdır',
      descriptionRequired: 'Açıklama zorunludur',
      descriptionTooShort: 'Açıklama en az 10 karakter olmalıdır',
      fieldsRequired: 'Lütfen gerekli alanları doldurun',
      createError: 'Kategori oluşturulurken bir hata oluştu',
    },
    success: {
      created: 'Kategori başarıyla oluşturuldu',
      updated: 'Kategori başarıyla güncellendi',
      deleted: 'Kategori başarıyla silindi',
    },
  },
  studySet: {
    title: 'Çalışma Seti',
    description: 'Çalışma seti açıklaması',
    stats: {
      total: 'Toplam Kart',
      totalCards: 'Toplam Kart',
      progress: 'İlerleme',
      mastered: 'Öğrenildi',
      learning: 'Öğreniliyor',
      notStarted: 'Başlanmadı',
      noCards: 'Henüz kart eklenmemiş'
    },
    actions: {
      start: 'Çalışmaya Başla',
      quickReview: 'Hızlı Tekrar',
      quickReviewDesc: 'Öğrendiğin kartları hızlıca gözden geçir',
      test: 'Test',
      testDesc: 'Kendini test et ve ilerlemeni gör',
      edit: 'Düzenle',
      share: 'Paylaş',
      delete: 'Sil'
    },
    tabs: {
      all: 'Tümü',
      mastered: 'Öğrenildi',
      learning: 'Öğreniliyor',
      notStarted: 'Başlanmadı'
    },
    cardStatus: {
      notStarted: 'Başlanmadı',
      not_started: 'Başlanmadı',
      learning: 'Öğreniliyor',
      mastered: 'Öğrenildi'
    },
    cardLabels: {
      front: 'Ön Yüz',
      back: 'Arka Yüz',
      hint: 'İpucu',
      explanation: 'Açıklama'
    },
    empty: 'Henüz kart yok',
    emptySubtext: 'Bu çalışma setine kart ekleyerek öğrenmeye başlayın',
    alerts: {
      shareInfo: 'Yakında',
      shareDesc: 'Bu özellik yakında kullanıma sunulacak'
    },
    addNew: 'Yeni Çalışma Seti',
    addNewSubtitle: 'Yeni bir çalışma seti oluştur',
    steps: {
      name: {
        title: 'Çalışma Seti Adı',
        description: 'Çalışma setiniz için akılda kalıcı bir isim belirleyin'
      },
      description: {
        title: 'Set Açıklaması',
        description: 'Setinizin içeriğini kısaca açıklayın'
      },
      category: {
        title: 'Kategori Seçimi',
        description: 'Çalışma setinizi hangi kategoriye eklemek istediğinizi seçin'
      }
    },
    buttons: {
      continue: 'Devam',
      create: 'Seti Oluştur',
      creating: 'Oluşturuluyor...'
    },
    errors: {
      loadStudySets: 'Çalışma setleri yüklenirken bir hata oluştu',
      createError: 'Çalışma seti oluşturulurken bir hata oluştu',
      nameRequired: 'Set adı boş olamaz',
      nameTooShort: 'Set adı en az 3 karakter olmalıdır',
      descriptionRequired: 'Açıklama boş olamaz',
      descriptionTooShort: 'Açıklama en az 10 karakter olmalıdır',
      categoryRequired: 'Lütfen bir kategori seçin',
      loadCategories: 'Kategoriler yüklenirken bir hata oluştu'
    },
    success: {
      created: 'Çalışma seti başarıyla oluşturuldu'
    },
    header: {
      title: 'Deneme mobil',
      subtitle: '{{count}} çalışma seti'
    },
    card: {
      createdBy: 'testuser',
      progress: 'İlerleme',
      learned: 'Öğrenildi',
      learning: 'Öğreniliyor',
      notStarted: 'Başlanmadı'
    }
  },
  flashcard: {
    title: 'Kartlar',
    category: 'Kategori',
    studySet: 'Çalışma Seti',
    addCard: 'Kart Ekle',
    addNew: 'Kart Ekle',
    addNewSubtitle: 'Yeni kartlar ekle',
    frontSide: 'Ön Yüz',
    backSide: 'Arka Yüz',
    frontPlaceholder: 'Kartın ön yüzünü yazın...',
    backPlaceholder: 'Kartın arka yüzünü yazın...',
    flip: 'Kartı Çevir',
    tips: {
      title: 'İpuçları',
      shortConcise: 'Kısa ve öz ifadeler kullanın',
      clearFormat: 'Anlaşılır ve düzenli yazın',
      examples: 'Mümkünse örnekler ekleyin'
    },
    selectCategory: 'Kartlarınızı eklemek istediğiniz kategoriyi seçin',
    selectedCategory: 'Seçilen kategori:',
    selectStudySet: 'Kartlarınızı hangi çalışma setine eklemek istediğinizi seçin',
    selectedStudySet: 'Seçilen çalışma seti:',
    steps: {
      category: 'Kategori',
      studySet: 'Çalışma Seti',
      cards: 'Kartlar'
    },
    cardCount: '{{current}} / {{total}}',
    errors: {
      loadCategories: 'Kategoriler yüklenirken bir hata oluştu',
      loadStudySets: 'Çalışma setleri yüklenirken bir hata oluştu',
      fillRequired: 'Lütfen kartın ön ve arka yüzünü doldurun',
      maxCards: 'En fazla 50 kart ekleyebilirsiniz',
      requiredFields: 'Lütfen kategori ve çalışma seti seçin',
      createError: 'Kartlar kaydedilirken bir hata oluştu'
    },
    success: {
      created: 'Kartlar başarıyla kaydedildi'
    },
    guide: {
      instruction: 'Her kartın ön ve arka yüzünü doldurun. Ön yüze öğrenmek istediğiniz kelime veya kavramı, arka yüze ise anlamını yazın.'
    }
  },
  notifications: {
    title: 'Bildirimler',
    emailNotifications: 'E-posta Bildirimleri',
    emailNotificationsDesc: 'Önemli güncellemeler ve bildirimler için e-posta al',
    pushNotifications: 'Anlık Bildirimler',
    pushNotificationsDesc: 'Anlık bildirimler ve uyarılar',
    weeklyDigest: 'Haftalık Özet',
    weeklyDigestDesc: 'Haftalık ilerleme ve aktivite özeti',
    marketingEmails: 'Pazarlama E-postaları',
    marketingEmailsDesc: 'Özel teklifler ve kampanyalar hakkında bilgi al',
    systemUpdates: 'Sistem Güncellemeleri',
    systemUpdatesDesc: 'Yeni özellikler ve sistem güncellemeleri',
    securityAlerts: 'Güvenlik Uyarıları',
    securityAlertsDesc: 'Hesap güvenliği ile ilgili önemli bildirimler',
    loadError: 'Bildirim ayarları yüklenemedi',
    updateSuccess: 'Bildirim ayarları güncellendi',
    updateError: 'Bildirim ayarları güncellenirken hata oluştu'
  },
  home: {
    greeting: 'Hoşgeldin {{username}} ✨',
    welcomeBack: 'Haydi öğrenmeye devam edelim!',
    welcome: 'Hoş Geldiniz! 👋',
    welcomeMessage: 'Kelime kartlarınızı oluşturmaya başlayın ve öğrenme yolculuğunuza adım atın.',
    subtitle: 'Öğrenme yolculuğunuzu yönetin',
    quickActions: 'Hızlı Eylemler',
    yourCategories: 'Kategorileriniz',
    createNew: 'Yeni Oluştur',
    stats: {
      categories: 'Kategori',
      studySets: 'Çalışma Seti',
      flashcards: 'Kelime Kartı'
    },
    actions: {
      newCategory: 'Yeni Kategori',
      newCategoryDesc: 'Çalışma setlerinizi düzenlemek için yeni bir kategori oluşturun',
      newStudySet: 'Yeni Çalışma Seti',
      newStudySetDesc: 'Kelime kartlarınızı gruplamak için yeni bir set oluşturun',
      newFlashcard: 'Yeni Kelime Kartı',
      newFlashcardDesc: 'Öğrenmek istediğiniz yeni kelimeler ekleyin'
    }
  },
  navigation: {
    home: 'Ana Sayfa',
    profile: 'Profil'
  }
}; 