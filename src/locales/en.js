export default {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    retry: 'Retry',
    logout: 'Logout',
    save: 'Save',
    cancel: 'Cancel',
    add: 'Add',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    update: 'Update'
  },
  auth: {
    login: {
      title: 'Login',
      subtitle: 'Sign in to your account',
      username: 'Username',
      password: 'Password',
      forgotPassword: 'Forgot Password?',
      loginButton: 'Login',
      noAccount: "Don't have an account?",
      register: 'Register',
      or: 'or',
      errors: {
        requiredFields: 'Username and password are required',
        usernameLength: 'Username must be at least 3 characters',
        passwordLength: 'Password must be at least 6 characters',
        invalidCredentials: 'Invalid username or password',
      },
    },
    register: {
      title: 'Register',
      subtitle: 'Create a new account',
      username: 'Username',
      email: 'Email',
      password: 'Password',
      firstName: 'First Name',
      lastName: 'Last Name',
      registerButton: 'Register',
      haveAccount: 'Already have an account?',
      login: 'Login',
      or: 'or',
      errors: {
        requiredFields: 'Please fill in all required fields',
        usernameLength: 'Username must be between 3-50 characters',
        invalidEmail: 'Please enter a valid email address',
        passwordLength: 'Password must be at least 6 characters',
      },
    },
    forgotPassword: {
      title: 'Forgot Password',
      subtitle: 'Enter your email address and we will send you a password reset link',
      email: 'Email',
      sendButton: 'Send',
      backToLogin: 'Back to login',
      success: 'Password reset link has been sent to your email',
      error: 'Failed to reset password',
    },
  },
  profile: {
    title: 'Profile',
    settings: 'Settings',
    personalInfo: 'Personal Information',
    notificationSettings: 'Notification Settings',
    languageSettings: 'Language Settings',
    changePassword: 'Change Password',
    changePasswordDescription: 'Change your password for account security',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm New Password',
    enterCurrentPassword: 'Enter your current password',
    enterNewPassword: 'Enter your new password',
    enterConfirmPassword: 'Confirm your new password',
    passwordUpdateSuccess: 'Password successfully updated',
    passwordUpdateError: 'Failed to update password',
    passwordRequiredFields: 'Please fill in all fields',
    passwordTooShort: 'New password must be at least 6 characters',
    passwordsDoNotMatch: 'New passwords do not match',
    guestUser: 'Guest User',
    showProfile: 'View Profile',
    username: 'Username',
    email: 'Email',
    firstName: 'First Name',
    lastName: 'Last Name',
    enterFirstName: 'Enter your first name',
    enterLastName: 'Enter your last name',
    level: 'Level',
    experiencePoints: 'Experience Points',
    totalFlashcards: 'Total Flashcards',
    studyTime: 'Study Time',
    minutes: 'minutes',
    successRate: 'Success Rate',
    fetchError: 'Failed to load information',
    updateSuccess: 'Information updated successfully',
    updateError: 'Failed to update information',
  },
  languages: {
    turkish: 'Turkish',
    english: 'English',
  },
  messages: {
    languageUpdated: 'Language setting updated',
    languageError: 'Failed to change language',
    logoutError: 'Failed to logout',
  },
  categories: {
    title: 'Categories',
    addNew: 'New Category',
    addNewSubtitle: 'Create category',
    empty: "You haven't created any categories yet",
    emptySubtext: 'Click the + button to add a new category',
    name: 'Category Name',
    description: 'Description',
    color: 'Color',
    appearance: {
      title: 'Appearance',
      description: 'You can choose a color and icon for your category (Optional)',
      colorSelection: 'Color Selection',
      iconSelection: 'Icon Selection',
      clearSelection: 'Clear Selection'
    },
    steps: {
      name: {
        title: 'Category Name',
        description: 'Choose a memorable name for your category',
        placeholder: 'E.g.: English Vocabulary'
      },
      description: {
        title: 'Category Description',
        description: 'Explain the purpose and content of your category',
        placeholder: 'E.g.: New words I learn while studying English'
      },
      appearance: {
        title: 'Appearance',
        description: 'You can choose a color and icon for your category (Optional)',
        colorSelection: 'Color Selection',
        iconSelection: 'Icon Selection',
        clearSelection: 'Clear Selection'
      }
    },
    colors: {
      lightBlue: 'Light Blue',
      lightOrange: 'Light Orange',
      lightGreen: 'Light Green',
      lightPurple: 'Light Purple',
      lightRed: 'Light Red',
      gray: 'Gray'
    },
    icons: {
      book: 'Book',
      school: 'School',
      language: 'Language',
      math: 'Math',
      science: 'Science',
      art: 'Art'
    },
    buttons: {
      continue: 'Continue',
      create: 'Create Category',
      creating: 'Creating...'
    },
    studySetCount: '{{count}} study sets',
    noStudySet: 'No study sets',
    oneStudySet: '1 study set',
    errors: {
      nameRequired: 'Category name is required',
      nameTooShort: 'Category name must be at least 3 characters',
      descriptionRequired: 'Description is required',
      descriptionTooShort: 'Description must be at least 10 characters',
      fieldsRequired: 'Please fill in required fields',
      createError: 'Failed to create category',
    },
    success: {
      created: 'Category created successfully',
      updated: 'Category updated successfully',
      deleted: 'Category deleted successfully',
    },
  },
  studySet: {
    title: 'Study Sets',
    empty: "You haven't created any study sets yet",
    emptySubtext: 'Create your first study set to start learning',
    addNew: 'New Study Set',
    addNewSubtitle: 'Create a new study set',
    stats: {
      totalCards: 'Total Cards',
      progress: 'Progress',
      mastered: 'Mastered',
      learning: 'Learning',
      notStarted: 'Not Started',
      noCards: 'No cards added yet'
    },
    steps: {
      name: {
        title: 'Study Set Name',
        description: 'Choose a memorable name for your study set'
      },
      description: {
        title: 'Set Description',
        description: 'Briefly explain the content of your set'
      },
      category: {
        title: 'Category Selection',
        description: 'Select which category you want to add your study set to'
      }
    },
    buttons: {
      continue: 'Continue',
      create: 'Create Set',
      creating: 'Creating...'
    },
    errors: {
      loadStudySets: 'Failed to load study sets',
      createError: 'Failed to create study set',
      nameRequired: 'Set name cannot be empty',
      nameTooShort: 'Set name must be at least 3 characters',
      descriptionRequired: 'Description cannot be empty',
      descriptionTooShort: 'Description must be at least 10 characters',
      categoryRequired: 'Please select a category',
      loadCategories: 'Failed to load categories'
    },
    success: {
      created: 'Study set created successfully'
    },
    header: {
      title: 'Demo mobile',
      subtitle: '{{count}} study sets'
    },
    card: {
      createdBy: 'testuser',
      progress: 'Progress',
      learned: 'Learned',
      learning: 'Learning',
      notStarted: 'Not Started'
    }
  },
  flashcard: {
    title: 'Cards',
    category: 'Category',
    studySet: 'Study Set',
    addCard: 'Add Card',
    addNew: 'Add Card',
    addNewSubtitle: 'Add new cards',
    frontSide: 'Front Side',
    backSide: 'Back Side',
    frontPlaceholder: 'Write the front side of the card...',
    backPlaceholder: 'Write the back side of the card...',
    selectCategory: 'Select the category where you want to add your cards',
    selectedCategory: 'Selected category:',
    selectStudySet: 'Select which study set you want to add your cards to',
    selectedStudySet: 'Selected study set:',
    steps: {
      category: 'Category',
      studySet: 'Study Set',
      cards: 'Cards'
    },
    cardCount: '{{current}} / {{total}}',
    errors: {
      loadCategories: 'Failed to load categories',
      loadStudySets: 'Failed to load study sets',
      fillRequired: 'Please fill in both front and back sides of the card',
      maxCards: 'You can add up to 50 cards',
      requiredFields: 'Please select a category and study set',
      createError: 'Failed to save cards'
    },
    success: {
      created: 'Cards saved successfully'
    }
  },
  notifications: {
    title: 'Notification Settings',
    emailNotifications: 'Email Notifications',
    emailNotificationsDesc: 'Receive emails for important updates and notifications',
    pushNotifications: 'Push Notifications',
    pushNotificationsDesc: 'Instant notifications and alerts',
    weeklyDigest: 'Weekly Digest',
    weeklyDigestDesc: 'Weekly progress and activity summary',
    marketingEmails: 'Marketing Emails',
    marketingEmailsDesc: 'Receive information about special offers and campaigns',
    systemUpdates: 'System Updates',
    systemUpdatesDesc: 'New features and system updates',
    securityAlerts: 'Security Alerts',
    securityAlertsDesc: 'Important notifications about account security',
    loadError: 'Failed to load notification settings',
    updateSuccess: 'Notification settings updated',
    updateError: 'Failed to update notification settings'
  },
  home: {
    greeting: 'Welcome {{username}} ✨',
    welcomeBack: "Let's continue learning!",
    welcome: 'Welcome! 👋',
    welcomeMessage: 'Start creating your flashcards and begin your learning journey.',
    subtitle: 'Manage your learning journey',
    quickActions: 'Quick Actions',
    yourCategories: 'Your Categories',
    createNew: 'Create New',
    stats: {
      categories: 'Category',
      studySets: 'Study Set',
      flashcards: 'Flashcard'
    },
    actions: {
      newCategory: 'New Category',
      newCategoryDesc: 'Create a new category to organize your study sets',
      newStudySet: 'New Study Set',
      newStudySetDesc: 'Create a new set to group your flashcards',
      newFlashcard: 'New Flashcard',
      newFlashcardDesc: 'Add new words you want to learn'
    }
  },
  navigation: {
    home: 'Home',
    profile: 'Profile'
  },
}; 