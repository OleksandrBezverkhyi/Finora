import { enGB, uk } from "date-fns/locale";

export const LOCALE_COOKIE_NAME = "finora-locale";
export const SUPPORTED_LOCALES = ["en", "uk"];
export const SUPPORTED_CURRENCIES = ["UAH", "USD", "EUR"];

const commonErrorTranslations = {
  "Enter a valid email address": "Введіть коректну адресу електронної пошти",
  "Color must be a valid HEX value": "Колір має бути коректним HEX-значенням",
  "Password must be at least 8 characters long": "Пароль має містити щонайменше 8 символів",
  "Password must be 72 characters or fewer": "Пароль має містити не більше 72 символів",
  "Name must be at least 2 characters long": "Ім'я має містити щонайменше 2 символи",
  "Name must be 50 characters or fewer": "Ім'я має містити не більше 50 символів",
  "Passwords do not match": "Паролі не збігаються",
  "Name must be 40 characters or fewer": "Назва має містити не більше 40 символів",
  "Type must be either INCOME or EXPENSE": "Тип має бути INCOME або EXPENSE",
  "Category is required": "Потрібно вибрати категорію",
  "Amount must be a valid number": "Сума має бути коректним числом",
  "Amount must be greater than 0": "Сума має бути більшою за 0",
  "Amount is too large": "Сума занадто велика",
  "Date must be valid": "Дата має бути коректною",
  "Comment must be 255 characters or fewer": "Коментар має містити не більше 255 символів",
  "Budget amount must be greater than 0": "Ліміт бюджету має бути більшим за 0",
  "Budget amount is too large": "Ліміт бюджету занадто великий",
  "Month must be a valid number": "Місяць має бути коректним числом",
  "Month must be a whole number": "Місяць має бути цілим числом",
  "Month must be between 1 and 12": "Місяць має бути в межах від 1 до 12",
  "Year must be a valid number": "Рік має бути коректним числом",
  "Year must be a whole number": "Рік має бути цілим числом",
  "Year must be 2000 or later": "Рік має бути не раніше 2000",
  "Year must be 2100 or earlier": "Рік має бути не пізніше 2100",
  "Target date must be valid": "Цільова дата має бути коректною",
  "Goal name must be at least 2 characters long": "Назва цілі має містити щонайменше 2 символи",
  "Goal name must be 80 characters or fewer": "Назва цілі має містити не більше 80 символів",
  "Target amount must be a valid number": "Цільова сума має бути коректним числом",
  "Target amount must be greater than 0": "Цільова сума має бути більшою за 0",
  "Target amount is too large": "Цільова сума занадто велика",
  "Current amount must be a valid number": "Поточна сума має бути коректним числом",
  "Current amount cannot be negative": "Поточна сума не може бути від'ємною",
  "Current amount is too large": "Поточна сума занадто велика",
  "Note must be 500 characters or fewer": "Нотатка має містити не більше 500 символів",
  "Status must be ACTIVE, COMPLETED, or ARCHIVED": "Статус має бути ACTIVE, COMPLETED або ARCHIVED",
  "Active goals must use today or a future date.": "Для активної цілі потрібно вказати сьогоднішню або майбутню дату.",
  "Invalid email or password.": "Невірний email або пароль.",
  "Unable to sign in right now. Try again.": "Зараз не вдалося увійти. Спробуйте ще раз.",
  "Unexpected error. Please try again.": "Сталася неочікувана помилка. Спробуйте ще раз.",
  "Unable to create account right now.": "Зараз не вдалося створити акаунт.",
  "Unable to save category right now.": "Зараз не вдалося зберегти категорію.",
  "Unable to delete category right now.": "Зараз не вдалося видалити категорію.",
  "Unable to load budgets right now.": "Зараз не вдалося завантажити бюджети.",
  "Unable to save budget right now.": "Зараз не вдалося зберегти бюджет.",
  "Unable to delete budget right now.": "Зараз не вдалося видалити бюджет.",
  "Unable to save goal right now.": "Зараз не вдалося зберегти ціль.",
  "Unable to delete goal right now.": "Зараз не вдалося видалити ціль.",
  "Unable to load transactions right now.": "Зараз не вдалося завантажити транзакції.",
  "Unable to save transaction right now.": "Зараз не вдалося зберегти транзакцію.",
  "Unable to delete transaction right now.": "Зараз не вдалося видалити транзакцію.",
  "Unable to import transactions right now.": "Зараз не вдалося імпортувати транзакції.",
  "Unable to load dashboard data right now.": "Зараз не вдалося завантажити дані дашборду.",
  "Unable to load analytics right now.": "Зараз не вдалося завантажити аналітику.",
  "Account created successfully. Sign in with your new credentials.": "Акаунт успішно створено. Увійдіть з новими обліковими даними.",
  "Email already exists": "Користувач з таким email уже існує",
  "Unexpected server error": "Неочікувана помилка сервера",
  "Currency must be UAH, USD, or EUR": "Валюта має бути UAH, USD або EUR.",
  "Current password is required to change password.":
    "Щоб змінити пароль, введіть поточний пароль.",
  "New password is required.": "Введіть новий пароль.",
  "Please confirm the new password.": "Підтвердіть новий пароль.",
  "New password must differ from current password.":
    "Новий пароль має відрізнятися від поточного.",
  "Current password is incorrect.": "Поточний пароль введено неправильно.",
  "Unable to save profile right now.": "Зараз не вдалося зберегти профіль.",
  "Profile updated successfully.": "Профіль успішно оновлено.",
  "User not found": "Користувача не знайдено.",
  Unauthorized: "Потрібно увійти в акаунт, щоб виконати цю дію.",
  "Validation failed": "Деякі дані заповнені некоректно. Перевірте форму й спробуйте ще раз.",
  "Expense category not found": "Категорію витрат не знайдено.",
  "Budget for this category and period already exists":
    "Для цієї категорії у вибраному періоді ліміт уже існує.",
  "Internal server error": "Внутрішня помилка сервера.",
  "Goal data is too long": "Дані цілі занадто великі.",
  "Category not found": "Категорію не знайдено.",
  "Invalid category reference": "Вказано некоректну категорію.",
  "Budget not found": "Ліміт не знайдено.",
  "Category name is reserved": "Ця назва категорії зарезервована системою.",
  "Category name is reserved.": "Ця назва категорії зарезервована системою.",
  "Category with this name and type already exists":
    "Категорія з такою назвою та типом уже існує.",
  "Goal not found": "Ціль не знайдено.",
  "Category cannot be modified": "Цю категорію не можна змінювати.",
  "Category cannot be deleted": "Цю категорію не можна видалити.",
  "Category cannot be deleted because it is already used in transactions or budgets":
    "Категорію не можна видалити, оскільки вона вже використовується в транзакціях або лімітах.",
  "Transaction not found": "Транзакцію не знайдено.",
  "CSV file is required.": "Потрібно вибрати CSV-файл.",
  "CSV file could not be parsed.": "Не вдалося розібрати CSV-файл.",
  "CSV file has no transaction rows.": "CSV-файл не містить рядків транзакцій.",
  "CSV preview is ready.": "Попередній перегляд CSV готовий.",
  "Transactions imported successfully.": "Транзакції успішно імпортовано.",
  "Transaction type is invalid.": "Тип транзакції некоректний.",
  "Transaction date is invalid.": "Дата транзакції некоректна.",
  "Transaction amount is invalid.": "Сума транзакції некоректна.",
  "Matching category was not found for this transaction type.":
    "Для цього типу транзакції не знайдено відповідної категорії.",
  "Duplicate row inside the uploaded CSV was skipped.":
    "Дубльований рядок усередині завантаженого CSV було пропущено.",
  "Transaction already exists and was skipped.":
    "Така транзакція вже існує, тому рядок було пропущено.",
  "Category will be created automatically during import.":
    "Категорію буде автоматично створено під час імпорту.",
  "Resolve CSV validation issues before importing.":
    "Перш ніж імпортувати, виправте проблеми валідації у CSV-файлі.",
  "Category delete needs confirmation because related budgets will also be removed":
    "Ця категорія має пов’язані ліміти, тому перед видаленням потрібно підтвердження.",
};

const messages = {
  en: {
    localeName: "English",
    common: {
      appName: "Finora",
      language: "Language",
      english: "EN",
      ukrainian: "UA",
      signOut: "Sign out",
      apply: "Apply",
      loading: "Loading...",
      refreshing: "Refreshing...",
      show: "Show",
      hide: "Hide",
      previous: "Previous",
      next: "Next",
      saveChanges: "Save changes",
      cancelEdit: "Cancel edit",
      edit: "Edit",
      delete: "Delete",
      deleting: "Deleting...",
      open: "Open",
      noComment: "No comment",
      income: "Income",
      expense: "Expense",
      from: "From",
      to: "To",
      today: "Today",
      thisWeek: "This week",
      thisMonth: "This month",
      allTime: "All time",
      customRange: "Custom range",
      allTypes: "All types",
      allCategories: "All categories",
      previous: "Previous",
      next: "Next",
      search: "Search",
      sort: "Sort",
      type: "Type",
      category: "Category",
      amount: "Amount",
      date: "Date",
      comment: "Comment",
      page: "Page",
      visible: "visible",
      items: "items",
      totals: "total",
      active: "Active",
      completed: "Completed",
      archived: "Archived",
      status: "Status",
      target: "Target",
      saved: "Saved",
      balance: "Balance",
      filters: "Filters",
      history: "History",
      overview: "Overview",
      progress: "Progress",
      insights: "Insights",
      noBaseline: "No comparison data",
      startNow: "now",
      startBeginning: "beginning",
      thisPeriod: "Current period",
      previousPeriod: "Previous period",
    },
    nav: {
      dashboard: "Dashboard",
      transactions: "Transactions",
      categories: "Categories",
      analytics: "Analytics",
      budgets: "Budgets",
      goals: "Goals",
      profile: "Profile",
    },
    appShell: {
      tagline: "Personal finance planner for everyday spending and savings",
    },
    login: {
      eyebrow: "Login",
      heroTitle: "Track income and spending with a cleaner daily workflow.",
      heroText:
        "Stay on top of your budget, follow daily expenses, and keep every financial decision in one organized space.",
      cardOverview: "Overview",
      cardPlanning: "Planning",
      cardControl: "Control",
      cardIncome: "Income",
      cardBudget: "Budget",
      cardBalance: "Balance",
      title: "Welcome back",
      description: "Sign in to review your finances, recent transactions, and current balance.",
      email: "Email",
      password: "Password",
      passwordPlaceholder: "Enter your password",
      submit: "Sign in",
      createAccount: "Create account",
      noAccount: "No account yet?",
      noAccountText: "Create an account in a few steps and start keeping your personal finances in order.",
    },
    register: {
      eyebrow: "Register",
      heroTitle: "Create your workspace before budgeting, analytics, and planning kick in.",
      heroText:
        "Create your account once and start tracking income, expenses, savings goals, and monthly habits in one place.",
      profile: "Profile",
      baseCurrency: "Base currency",
      security: "Security",
      name: "Name",
      hryvnia: "₴ hryvnia",
      hashed: "Hashed",
      title: "Create your account",
      description:
        "Fill in your details to create a personal space for daily financial tracking. All amounts in the app are recorded in hryvnia by default.",
      yourName: "Your name",
      createPassword: "Create a strong password",
      confirmPassword: "Confirm password",
      repeatPassword: "Repeat your password",
      creating: "Creating account...",
      createAccount: "Create account",
      backToLogin: "Back to login",
    },
    profilePage: {
      eyebrow: "Profile",
      title: "Manage your personal details and app currency.",
      description:
        "Update your display name, change your password, and choose which currency the app should use across all pages.",
    },
    profile: {
      accountEyebrow: "Account",
      accountTitle: "Your profile settings",
      accountDescription:
        "Email stays fixed for this account. You can update your name, choose a different base currency, and change your password whenever needed.",
      name: "Name",
      email: "Email",
      currency: "Currency",
      currentPassword: "Current password",
      newPassword: "New password",
      confirmNewPassword: "Confirm new password",
      passwordNote: "Leave the password fields empty if you do not want to change it.",
      save: "Save profile",
      saving: "Saving profile...",
      saved: "Profile updated successfully.",
      currencies: {
        UAH: "Hryvnia (UAH)",
        USD: "US Dollar (USD)",
        EUR: "Euro (EUR)",
      },
    },
    dashboardPage: {
      eyebrow: "Dashboard",
      title: "Welcome back, {name}.",
      description:
        "Keep your finances under control with a clear overview of income, expenses, balance, and your latest transactions.",
    },
    dashboard: {
      title: "Your financial picture at a glance",
      description:
        "Review income, expenses, balance, spending categories, and your latest activity for any period you choose.",
      topExpenseCategories: "Top expense categories",
      noTopExpenseCategories: "No expense categories to show for this period yet.",
      incomeHint: "Money received during the selected period",
      expenseHint: "Money spent during the selected period",
      balanceHint: "Income minus expenses for the current selection",
      alertsTitle: "Alerts and recommendations",
      alertsDescription:
        "Budget pressure, spending spikes, and goal pacing signals for the selected period.",
      noAlerts:
        "No active alerts for this period. Your budgets, spending trend, and goal pacing look stable.",
      recentTransactions: "Recent transactions",
      recentTransactionsDescription: "Your latest recorded income and expense operations.",
      noTransactions: "There are no transactions in this period yet.",
      refreshing: "Refreshing dashboard...",
      budgetType: "Budget",
      trendType: "Trend",
      goalOverdueType: "Goal overdue",
      goalPaceType: "Goal pace",
      alertsCount: "alerts",
      transactionCount: "items",
    },
    categoriesPage: {
      eyebrow: "Categories",
      title: "Organize income and expense groups before adding transactions.",
      description:
        "Keep your records tidy by grouping transactions into clear income and expense categories that match your everyday spending.",
      count: "categories",
    },
    categories: {
      addEyebrow: "Add category",
      editEyebrow: "Edit category",
      addTitle: "Create a new category",
      editTitle: "Update current category",
      description:
        "Use simple, recognizable category names so your reports and transaction history stay easy to read.",
      name: "Name",
      type: "Type",
      color: "Color",
      placeholder: "Groceries",
      create: "Add category",
      creating: "Creating...",
      saving: "Saving...",
      expenseCategories: "Expense categories",
      incomeCategories: "Income categories",
      empty: "You have not added any categories in this section yet.",
      standardColor: "Standard category color",
      page: "Page {current} of {total}",
      previousPage: "Previous",
      nextPage: "Next",
      deleteModalEyebrow: "Delete category",
      deleteModalTitle: "Delete category and related budgets?",
      deleteModalDescription:
        "The category “{category}” still has {budgetsCount} related budget entries. If you continue, those budgets will also be deleted.",
      deleteModalConfirm: "Delete category",
      deleteModalCancel: "Cancel deletion",
    },
    transactionsPage: {
      eyebrow: "Transactions",
      title: "Add records, search history, and inspect spending without leaving one screen.",
      description:
        "Record each operation, quickly find past entries, and understand where your money goes over time.",
      total: "transactions total",
    },
    transactions: {
      addEyebrow: "Add transaction",
      editEyebrow: "Edit transaction",
      addTitle: "Create income and expense records",
      editTitle: "Update income and expense record",
      addDescription:
        "Add each operation as soon as it happens to keep your balance and reports accurate.",
      addCategoriesFirst: "Add categories before creating your first transaction.",
      addCategoriesFirstText:
        "Start with a few categories for income and expenses, then come back here to record your operations.",
      openCategories: "Open categories",
      amountLabel: "Amount",
      optionalNote: "Optional note",
      add: "Add transaction",
      filtersTitle: "Search your history",
      filtersDescription:
        "Narrow the list by period, type, category, amount, or a quick keyword search.",
      period: "Period",
      category: "Category",
      minAmount: "Min amount",
      maxAmount: "Max amount",
      commentOrCategory: "Comment or category",
      applyFilters: "Apply filters",
      reset: "Reset",
      historyTitle: "Transactions list",
      historyDescription: "Showing page {page} of {totalPages}. Total entries: {total}.",
      noMatches: "No transactions match the selected filters yet.",
      actions: "Actions",
      totalVisible: "{count} visible",
      pageOf: "Page {page} of {totalPages}",
      sortDateDesc: "Date: newest first",
      sortDateAsc: "Date: oldest first",
      sortAmountDesc: "Amount: highest first",
      sortAmountAsc: "Amount: lowest first",
      deletedCategoryLabel: "deleted category",
    },
    analyticsPage: {
      eyebrow: "Analytics",
      title: "Financial analytics for {name}.",
      description:
        "Explore income and expense dynamics, category structure, and how your current period compares with the previous one.",
    },
    analytics: {
      title: "Trends, categories, and period comparison",
      description:
        "Review your financial flow over time, see where most expenses go, and compare this period against the previous one.",
      trendTitle: "Income and expense trend",
      trendDescription: "Daily dynamics for the selected period.",
      expenseStructure: "Expense structure",
      expenseStructureDescription: "Categories that shape your spending in this period.",
      noExpenseData: "No expense data is available for this period yet.",
      totalExpenses: "{amount} total",
      shareOfExpenses: "{percent}% of total expenses",
      showAllCategories: "Show {count} more categories",
      showFewerCategories: "Show fewer categories",
      compareTitle: "Current vs previous period",
      compareDescription:
        "Compare how your income, expenses, and balance changed versus the previous period.",
      differenceFromPrevious: "Difference from the previous period",
      refreshing: "Refreshing analytics...",
    },
    importExport: {
      importEyebrow: "CSV import",
      importTitle: "Import transactions",
      importDescription:
        "Upload a CSV file to preview changes and fully replace your current transaction history with the file contents.",
      importFormatNote:
        "Missing categories from the file will be created automatically. Existing transactions in your account will be cleared during import.",
      importFileLabel: "CSV file",
      previewButton: "Preview CSV",
      previewing: "Preparing preview...",
      importButton: "Import transactions",
      importing: "Importing...",
      summaryTitle: "Import summary",
      summaryTotal: "Rows found: {count}",
      summaryValid: "Ready to import: {count}",
      summaryCategoriesToCreate: "Categories to create: {count}",
      summarySkipped: "Empty rows skipped: {count}",
      summaryImported: "Imported: {count}",
      previewTitle: "Preview",
      previewEmpty: "Preview rows will appear here after you check the CSV file.",
      hidePreviewButton: "Hide preview",
      previewPage: "Page {current} of {total}",
      previousPage: "Previous",
      nextPage: "Next",
      previewStatusReady: "Ready",
      previewStatusInvalid: "Invalid",
      exportEyebrow: "CSV export",
      exportTitle: "Export your transactions",
      exportDescription:
        "Download your transaction history in a convenient format for backup, reporting, or working in spreadsheets.",
      exportFormatNote: "The file includes transaction type, category, amount, currency, date, and comment.",
      exportButton: "Export CSV",
    },
    budgetsPage: {
      eyebrow: "Budgets",
      title: "Set monthly spending limits and track progress before you go over budget.",
      description:
        "Create limits for your expense categories and see how much has already been spent in the selected month.",
      count: "budgets this month",
    },
    budgets: {
      periodEyebrow: "Budget period",
      periodDescription: "Select a month to review category limits and current spending progress.",
      planned: "Planned",
      spent: "Spent",
      overLimit: "Over limit",
      noExcess: "No excess",
      addEyebrow: "Add budget",
      editEyebrow: "Edit budget",
      addTitle: "Create spending limit",
      editTitle: "Update category limit",
      addDescription:
        "Budgets apply to expense categories for the selected month and update progress based on your recorded transactions.",
      addCategoryFirst: "Add at least one expense category before creating budgets.",
      monthlyLimit: "Monthly limit",
      addBudget: "Add budget",
      overallExpenses: "Overall expenses",
      progressEyebrow: "Progress",
      progressTitle: "Category limits and spending",
      loadingBudgets: "Loading budgets...",
      noBudgets: "No budgets have been created for this month yet.",
      limitSpent: "Limit {limit} · Spent {spent}",
      usedPercent: "{percent}% used",
      overBy: "Over by {amount}",
      remaining: "Remaining {amount}",
      closeToLimit: "Close to limit",
      onTrack: "On track",
      budgetsCount: "budgets",
    },
    goalsPage: {
      eyebrow: "Goals",
      title: "Track savings goals and see the pace needed to reach them on time.",
      description:
        "Define a target, record your current savings, and review the recommended amount to set aside each week or month.",
      count: "goals tracked",
    },
    goals: {
      target: "Target",
      saved: "Saved",
      activeGoals: "Active goals",
      completedHint: "{count} completed",
      addEyebrow: "Add goal",
      editEyebrow: "Edit goal",
      addTitle: "Create a new savings goal",
      editTitle: "Update savings goal",
      description:
        "Set a target amount, track progress, and optionally define a target date to receive a recommended weekly and monthly savings pace.",
      goalName: "Goal name",
      goalNamePlaceholder: "Emergency fund",
      targetAmount: "Target amount",
      currentAmount: "Current amount",
      targetDate: "Target date",
      note: "Note",
      notePlaceholder: "Describe what you are saving for.",
      addGoal: "Add goal",
      progressEyebrow: "Progress",
      progressTitle: "Goals and savings pace",
      noGoals: "You have not created any goals yet.",
      savedOfTarget: "Saved {saved} of {target}",
      reachedPercent: "{percent}% reached",
      remaining: "Remaining {amount}",
      targetDateValue: "Target {date}",
      addTargetDateRecommendation: "Add a target date to receive a weekly and monthly savings recommendation.",
      completedRecommendation: "Goal achieved. Keep the momentum going toward your next milestone.",
      overdueRecommendation: "Target date has passed. To catch up, set aside {weekly} this week or {monthly} this month.",
      paceRecommendation: "Recommended pace: {weekly} per week or {monthly} per month.",
      overdue: "Overdue",
      goalsCount: "goals",
    },
    csvExport: {
      filenamePrefix: "transactions-export",
      typeIncome: "Income",
      typeExpense: "Expense",
      headers: {
        id: "ID",
        type: "Type",
        category: "Category",
        amount: "Amount",
        currency: "Currency",
        date: "Date",
        comment: "Comment",
        createdAt: "Created at",
        updatedAt: "Updated at",
      },
    },
    periods: {
      day: "Day",
      week: "Week",
      month: "Month",
      all: "All time",
      custom: "Custom",
    },
    sources: {
      "ecb-price-stability": "European Central Bank",
      "ec-financial-literacy": "European Commission",
    },
  },
  uk: {
    localeName: "Українська",
    common: {
      appName: "Finora",
      language: "Мова",
      english: "EN",
      ukrainian: "UA",
      signOut: "Вийти",
      apply: "Застосувати",
      loading: "Завантаження...",
      refreshing: "Оновлення...",
      show: "Показати",
      hide: "Приховати",
      previous: "Назад",
      next: "Далі",
      saveChanges: "Зберегти зміни",
      cancelEdit: "Скасувати редагування",
      edit: "Редагувати",
      delete: "Видалити",
      deleting: "Видалення...",
      open: "Відкрити",
      noComment: "Без коментаря",
      income: "Дохід",
      expense: "Витрати",
      from: "Від",
      to: "До",
      today: "Сьогодні",
      thisWeek: "Цього тижня",
      thisMonth: "Цього місяця",
      allTime: "За весь час",
      customRange: "Свій діапазон",
      allTypes: "Усі типи",
      allCategories: "Усі категорії",
      previous: "Назад",
      next: "Далі",
      search: "Пошук",
      sort: "Сортування",
      type: "Тип",
      category: "Категорія",
      amount: "Сума",
      date: "Дата",
      comment: "Коментар",
      page: "Сторінка",
      visible: "видимих",
      items: "елементів",
      totals: "усього",
      active: "Активна",
      completed: "Виконана",
      archived: "Архівована",
      status: "Статус",
      target: "Ціль",
      saved: "Накопичено",
      balance: "Баланс",
      filters: "Фільтри",
      history: "Історія",
      overview: "Огляд",
      progress: "Прогрес",
      insights: "Аналітика",
      noBaseline: "Відсутні дані",
      startNow: "зараз",
      startBeginning: "початок",
      thisPeriod: "Поточний період",
      previousPeriod: "Попередній період",
    },
    nav: {
      dashboard: "Дашборд",
      transactions: "Транзакції",
      categories: "Категорії",
      analytics: "Аналітика",
      budgets: "Бюджет",
      goals: "Цілі",
      profile: "Профіль",
    },
    appShell: {
      tagline: "Планувальник особистих фінансів для щоденних витрат і заощаджень",
    },
    login: {
      eyebrow: "Вхід",
      heroTitle: "Контролюйте доходи й витрати зручно щодня.",
      heroText:
        "Слідкуйте за бюджетом, переглядайте щоденні витрати й контролюйте свої фінанси в одному впорядкованому просторі.",
      cardOverview: "Огляд",
      cardPlanning: "Планування",
      cardControl: "Контроль",
      cardIncome: "Доходи",
      cardBudget: "Бюджет",
      cardBalance: "Баланс",
      title: "З поверненням",
      description: "Увійдіть, щоб переглянути фінанси, останні транзакції та поточний баланс.",
      email: "Email",
      password: "Пароль",
      passwordPlaceholder: "Введіть пароль",
      submit: "Увійти",
      createAccount: "Створити акаунт",
      noAccount: "Ще немає акаунта?",
      noAccountText: "Створіть акаунт за кілька кроків і почніть контролювати свої фінанси.",
    },
    register: {
      eyebrow: "Реєстрація",
      heroTitle: "Створіть свій акаунт, перш ніж ви зможете насолодитись використанням фінансового планувальника.",
      heroText:
        "Зареєструйтесь один раз і почніть відстежувати доходи, витрати, цілі заощаджень в одному місці.",
      profile: "Профіль",
      baseCurrency: "Базова валюта",
      security: "Безпека",
      name: "Ім'я",
      hryvnia: "₴ гривня",
      hashed: "Хешовано",
      title: "Створіть акаунт",
      description:
        "Заповніть дані, щоб створити персональний акаунт.",
      yourName: "Ваше ім'я",
      createPassword: "Створіть надійний пароль",
      confirmPassword: "Підтвердіть пароль",
      repeatPassword: "Повторіть пароль",
      creating: "Створення акаунта...",
      createAccount: "Створити акаунт",
      backToLogin: "Повернутися до входу",
    },
    profilePage: {
      eyebrow: "Профіль",
      title: "Керуйте особистими даними та валютою застосунку.",
      description:
        "Оновлюйте ім'я користувача, змінюйте пароль і обирайте валюту, яка має використовуватися на всіх сторінках застосунку.",
    },
    profile: {
      accountEyebrow: "Акаунт",
      accountTitle: "Налаштування профілю",
      accountDescription:
        "Ви можете оновити ім'я, вибрати іншу базову валюту та за потреби змінити пароль.",
      name: "Ім'я",
      email: "Email",
      currency: "Валюта",
      currentPassword: "Поточний пароль",
      newPassword: "Новий пароль",
      confirmNewPassword: "Підтвердіть новий пароль",
      passwordNote: "Залиште поля пароля порожніми, якщо не хочете його змінювати.",
      save: "Зберегти профіль",
      saving: "Збереження профілю...",
      saved: "Профіль успішно оновлено.",
      currencies: {
        UAH: "Гривня (UAH)",
        USD: "Долар США (USD)",
        EUR: "Євро (EUR)",
      },
    },
    dashboardPage: {
      eyebrow: "Дашборд",
      title: "З поверненням, {name}.",
      description:
        "Тримайте фінанси під контролем завдяки зрозумілому огляду доходів, витрат, балансу та транзакцій.",
    },
    dashboard: {
      title: "Ваша фінансова картина з першого погляду",
      description:
        "Переглядайте доходи, витрати, баланс, категорії витрат і останню активність за будь-який вибраний період.",
      topExpenseCategories: "Топ категорій витрат",
      noTopExpenseCategories: "За цей період ще немає категорій витрат для показу.",
      incomeHint: "Кошти, отримані за вибраний період",
      expenseHint: "Кошти, витрачені за вибраний період",
      balanceHint: "Доходи мінус витрати за поточний вибір",
      alertsTitle: "Попередження та рекомендації",
      alertsDescription:
        "Повідомлення щодо перевищення бюджетів, стрибків витрат і темпу досягнення цілей за вибраний період.",
      noAlerts:
        "За цей період активних попереджень немає. Ваші бюджети, тренд витрат і темп досягнення цілей виглядають стабільно.",
      recentTransactions: "Останні транзакції",
      recentTransactionsDescription: "Ваші останні зафіксовані доходи та витрати.",
      noTransactions: "У цьому періоді ще немає транзакцій.",
      refreshing: "Оновлюємо дашборд...",
      budgetType: "Бюджет",
      trendType: "Тренд",
      goalOverdueType: "Прострочена ціль",
      goalPaceType: "Темп цілі",
      alertsCount: "попереджень",
      transactionCount: "елементів",
    },
    categoriesPage: {
      eyebrow: "Категорії",
      title: "Створіть категорії доходів і витрат перед додаванням транзакцій.",
      description:
        "Тримайте всі записи впорядкованими, групуючи транзакції в зрозумілі категорії доходів і витрат, що відповідають вашим щоденним витратам.",
      count: "категорій",
    },
    categories: {
      addEyebrow: "Додати категорію",
      editEyebrow: "Редагувати категорію",
      addTitle: "Створіть нову категорію",
      editTitle: "Оновіть поточну категорію",
      description:
        "Радимо використовувати прості назви категорій, щоб звіти та історія транзакцій залишалися легкими для читання.",
      name: "Назва",
      type: "Тип",
      color: "Колір",
      placeholder: "Продукти",
      create: "Додати категорію",
      creating: "Створення...",
      saving: "Збереження...",
      expenseCategories: "Категорії витрат",
      incomeCategories: "Категорії доходів",
      empty: "У цьому розділі ви ще не додали жодної категорії.",
      standardColor: "Стандартний колір категорії",
      page: "Сторінка {current} з {total}",
      previousPage: "Назад",
      nextPage: "Далі",
      deleteModalEyebrow: "Видалення категорії",
      deleteModalTitle: "Видалити категорію та пов’язані ліміти?",
      deleteModalDescription:
        "Категорія “{category}” все ще має {budgetsCount} пов’язаних лімітів. Якщо продовжити, ці ліміти також буде видалено.",
      deleteModalConfirm: "Видалити категорію",
      deleteModalCancel: "Скасувати видалення",
    },
    transactionsPage: {
      eyebrow: "Транзакції",
      title: "Додавайте записи й аналізуйте витрати в одному місці.",
      description:
        "Фіксуйте кожну операцію й відслідковуйте, куди йдуть ваші гроші.",
      total: "транзакцій усього",
    },
    transactions: {
      addEyebrow: "Додати транзакцію",
      editEyebrow: "Редагувати транзакцію",
      addTitle: "Створюйте записи доходів і витрат",
      editTitle: "Оновіть запис доходу або витрати",
      addDescription:
        "Додавайте кожну операцію одразу після її здійснення, щоб баланс і звіти залишалися точними.",
      addCategoriesFirst: "Додайте категорії перед створенням першої транзакції.",
      addCategoriesFirstText:
        "Почніть із кількох категорій для доходів і витрат, а потім поверніться сюди, щоб записувати операції.",
      openCategories: "Відкрити категорії",
      amountLabel: "Сума",
      optionalNote: "Необов'язковий коментар",
      add: "Додати транзакцію",
      filtersTitle: "Пошук в історії",
      filtersDescription:
        "Звужуйте список за періодом, типом, категорією, сумою або швидким пошуком за ключовим словом.",
      period: "Період",
      category: "Категорія",
      minAmount: "Мін. сума",
      maxAmount: "Макс. сума",
      commentOrCategory: "Коментар або категорія",
      applyFilters: "Застосувати фільтри",
      reset: "Скинути",
      historyTitle: "Список транзакцій",
      historyDescription: "Показано сторінку {page} з {totalPages}. Усього записів: {total}.",
      noMatches: "За вибраними фільтрами транзакцій поки не знайдено.",
      actions: "Дії",
      totalVisible: "Показано {count}",
      pageOf: "Сторінка {page} з {totalPages}",
      sortDateDesc: "Дата: спочатку новіші",
      sortDateAsc: "Дата: спочатку старіші",
      sortAmountDesc: "Сума: спочатку більші",
      sortAmountAsc: "Сума: спочатку менші",
      deletedCategoryLabel: "видалена категорія",
    },
    analyticsPage: {
      eyebrow: "Аналітика",
      title: "Фінансова аналітика для {name}.",
      description:
        "Досліджуйте динаміку доходів і витрат, структуру категорій та порівнюйте поточний період із попереднім.",
    },
    analytics: {
      title: "Тренди, категорії та порівняння періодів",
      description:
        "Переглядайте динаміку ваших коштів, дивіться куди йде найбільше витрат.",
      trendTitle: "Тренд доходів і витрат",
      trendDescription: "Щоденна динаміка за вибраний період.",
      expenseStructure: "Структура витрат",
      expenseStructureDescription: "Категорії, які формують ваші витрати в цьому періоді.",
      noExpenseData: "За цей період ще немає даних про витрати.",
      totalExpenses: "{amount} загалом",
      shareOfExpenses: "{percent}% від усіх витрат",
      showAllCategories: "Показати ще {count} категорій",
      showFewerCategories: "Згорнути список категорій",
      compareTitle: "Поточний vs попередній період",
      compareDescription:
        "Порівняйте, як змінилися доходи, витрати та баланс відносно попереднього періоду.",
      differenceFromPrevious: "Різниця відносно попереднього періоду",
      refreshing: "Оновлюємо аналітику...",
    },
    importExport: {
      importEyebrow: "Імпорт CSV",
      importTitle: "Імпорт транзакцій",
      importDescription:
        "Завантажуйте CSV-файл, щоб переглянути зміни та повністю замінити поточну історію транзакцій вмістом файлу.",
      importFormatNote:
        "Категорії, яких немає у файлі, буде створено автоматично. Під час імпорту всі поточні транзакції акаунта буде очищено.",
      importFileLabel: "CSV-файл",
      previewButton: "Переглянути CSV",
      previewing: "Готуємо перегляд...",
      importButton: "Імпортувати транзакції",
      importing: "Імпортуємо...",
      summaryTitle: "Підсумок імпорту",
      summaryTotal: "Знайдено рядків: {count}",
      summaryValid: "Готово до імпорту: {count}",
      summaryCategoriesToCreate: "Категорій буде створено: {count}",
      summarySkipped: "Порожніх рядків пропущено: {count}",
      summaryImported: "Імпортовано: {count}",
      previewTitle: "Попередній перегляд",
      previewEmpty: "Після перевірки CSV тут з’являться рядки попереднього перегляду.",
      hidePreviewButton: "Сховати перегляд",
      previewPage: "Сторінка {current} з {total}",
      previousPage: "Назад",
      nextPage: "Далі",
      previewStatusReady: "Готово",
      previewStatusInvalid: "Помилка",
      exportEyebrow: "Експорт CSV",
      exportTitle: "Експорт транзакцій",
      exportDescription:
        "Завантажуйте історію транзакцій у зручному форматі для резервного збереження, звітності або роботи в таблицях.",
      exportFormatNote: "Файл містить тип транзакції, категорію, суму, валюту, дату та коментар.",
      exportButton: "Експорт CSV",
    },
    budgetsPage: {
      eyebrow: "Бюджет",
      title: "Встановлюйте щомісячні ліміти витрат і відстежуйте прогрес до перевищення бюджету.",
      description:
        "Створюйте ліміти для категорій витрат і дивіться, скільки вже витрачено у вибраному місяці.",
      count: "лімітів цього місяця",
    },
    budgets: {
      periodEyebrow: "Період бюджету",
      periodDescription: "Оберіть місяць, щоб переглянути ліміти категорій і поточний прогрес витрат.",
      planned: "Заплановано",
      spent: "Витрачено",
      overLimit: "Перевищено лімітів",
      noExcess: "Без перевищення",
      addEyebrow: "Додати бюджет",
      editEyebrow: "Редагувати бюджет",
      addTitle: "Створіть ліміт витрат",
      editTitle: "Оновіть ліміт категорії",
      addDescription:
        "Ліміти застосовуються до категорій витрат у вибраному місяці й оновлюють прогрес на основі ваших транзакцій.",
      addCategoryFirst: "Додайте хоча б одну категорію витрат перед створенням бюджетів.",
      monthlyLimit: "Місячний ліміт",
      addBudget: "Додати ліміт",
      overallExpenses: "Загальні витрати",
      progressEyebrow: "Прогрес",
      progressTitle: "Ліміти категорій і витрати",
      loadingBudgets: "Завантаження бюджетів...",
      noBudgets: "На цей місяць ще не створено жодного бюджету.",
      limitSpent: "Ліміт {limit} · Витрачено {spent}",
      usedPercent: "Використано {percent}%",
      overBy: "Перевищення на {amount}",
      remaining: "Залишилось {amount}",
      closeToLimit: "Близько до ліміту",
      onTrack: "У нормі",
      budgetsCount: "бюджетів",
    },
    goalsPage: {
      eyebrow: "Цілі",
      title: "Відстежуйте цілі заощаджень і переглядайте темп, потрібний для вчасного досягнення.",
      description:
        "Визначайте ціль, фіксуйте поточні накопичення й переглядайте рекомендовану суму, яку варто відкладати щотижня або щомісяця.",
      count: "цілей",
    },
    goals: {
      target: "Ціль",
      saved: "Накопичено",
      activeGoals: "Активні цілі",
      completedHint: "виконано: {count}",
      addEyebrow: "Додати ціль",
      editEyebrow: "Редагувати ціль",
      addTitle: "Створіть нову ціль заощаджень",
      editTitle: "Оновіть ціль заощаджень",
      description:
        "Встановіть цільову суму, відстежуйте прогрес і за потреби задайте цільову дату, щоб отримати рекомендований темп відкладання на тиждень і місяць.",
      goalName: "Назва цілі",
      goalNamePlaceholder: "Подушка безпеки",
      targetAmount: "Цільова сума",
      currentAmount: "Поточна сума",
      targetDate: "Цільова дата",
      note: "Нотатка",
      notePlaceholder: "Опишіть, на що саме ви заощаджуєте.",
      addGoal: "Додати ціль",
      progressEyebrow: "Прогрес",
      progressTitle: "Цілі та темп заощаджень",
      noGoals: "Ви ще не створили жодної цілі.",
      savedOfTarget: "Накопичено {saved} з {target}",
      reachedPercent: "Досягнуто {percent}%",
      remaining: "Залишилось {amount}",
      targetDateValue: "Ціль до {date}",
      addTargetDateRecommendation: "Додайте цільову дату, щоб отримати рекомендацію щодо щотижневого та щомісячного темпу заощаджень.",
      completedRecommendation: "Ціль досягнуто. Збережіть темп для наступної фінансової вершини.",
      overdueRecommendation: "Цільова дата вже минула. Щоб наздогнати план, відкладайте {weekly} цього тижня або {monthly} цього місяця.",
      paceRecommendation: "Рекомендований темп: {weekly} на тиждень або {monthly} на місяць.",
      overdue: "Прострочено",
      goalsCount: "цілей",
    },
    csvExport: {
      filenamePrefix: "eksport-tranzaktsii",
      typeIncome: "Дохід",
      typeExpense: "Витрати",
      headers: {
        id: "ID",
        type: "Тип",
        category: "Категорія",
        amount: "Сума",
        currency: "Валюта",
        date: "Дата",
        comment: "Коментар",
        createdAt: "Створено",
        updatedAt: "Оновлено",
      },
    },
    periods: {
      day: "День",
      week: "Тиждень",
      month: "Місяць",
      all: "За весь час",
      custom: "Свій",
    },
    sources: {
      "ecb-price-stability": "Європейський центральний банк",
      "ec-financial-literacy": "Європейська комісія",
    },
  },
};

export function normalizeLocale(value) {
  return value === "uk" ? "uk" : "en";
}

export function normalizeCurrency(value) {
  return SUPPORTED_CURRENCIES.includes(value) ? value : "UAH";
}

export function getMessages(locale = "en") {
  return messages[normalizeLocale(locale)];
}

export function getHtmlLang(locale = "en") {
  return normalizeLocale(locale) === "uk" ? "uk" : "en-GB";
}

export function getIntlLocale(locale = "en") {
  return normalizeLocale(locale) === "uk" ? "uk-UA" : "en-GB";
}

export function getDateFnsLocale(locale = "en") {
  return normalizeLocale(locale) === "uk" ? uk : enGB;
}

export function translateErrorMessage(message, locale = "en") {
  if (!message || normalizeLocale(locale) === "en") {
    return message;
  }

  return commonErrorTranslations[message] || message;
}

export function interpolate(template, values = {}) {
  return Object.entries(values).reduce((result, [key, value]) => {
    return result.replaceAll(`{${key}}`, String(value));
  }, template);
}

export function formatPlural(locale, count, forms) {
  const value = Number(count);

  if (normalizeLocale(locale) !== "uk") {
    return value === 1 ? forms.one : forms.other;
  }

  const abs = Math.abs(value);
  const mod10 = abs % 10;
  const mod100 = abs % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return forms.one;
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return forms.few;
  }

  return forms.many;
}

export function formatMoneyLocalized(value, locale = "en", currency = "UAH") {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency: normalizeCurrency(currency),
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 2,
  }).format(Number(value));
}

export function getCurrencySymbol(currency = "UAH", locale = "en") {
  const parts = new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency: normalizeCurrency(currency),
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(0);

  return parts.find((part) => part.type === "currency")?.value || normalizeCurrency(currency);
}

export function formatDateLocalized(value, locale = "en") {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function formatMonthYearLocalized(date, locale = "en") {
  return new Intl.DateTimeFormat(getIntlLocale(locale), {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function localizeRecommendationSource(source, locale = "en") {
  const normalized = normalizeLocale(locale);
  if (normalized === "en") {
    return source;
  }

  const localizedName = messages.uk.sources[source.id];
  return localizedName ? { ...source, name: localizedName } : source;
}

export function localizeRecommendationAlert(alert, locale = "en", currency = "UAH") {
  const normalized = normalizeLocale(locale);
  if (normalized === "en") {
    return alert;
  }

  if (alert.type === "budget_exceeded") {
    const categoryName = alert.meta.isOverallCategory
      ? messages.uk.budgets.overallExpenses
      : alert.meta.categoryName;

    return {
      ...alert,
      title: `${categoryName} - ліміт перевищено`,
      message:
        `Ви витратили ${formatMoneyLocalized(alert.meta.spentAmount, locale, currency)} при ліміті ` +
        `${formatMoneyLocalized(alert.meta.budgetAmount, locale, currency)} у ${formatMonthYearLocalized(new Date(alert.meta.year, alert.meta.month - 1, 1), locale)}.`,
      actionLabel: "Переглянути ліміт",
    };
  }

  if (alert.type === "spending_spike") {
    return {
      ...alert,
      title: "Виявлено стрибок витрат",
      message:
        `Ваші витрати зросли на ${alert.meta.percentChange}% відносно попереднього періоду, що вище за ` +
        `${alert.meta.benchmarkPercent}% орієнтир цінової стабільності ЄЦБ.`,
      actionLabel: "Відкрити аналітику",
    };
  }

  if (alert.type === "goal_overdue") {
    return {
      ...alert,
      title: `Темп заощаджень для цілі ${alert.meta.goalName}`,
      message:
        `Термін досягнення цілі вже минув. Щоб наздогнати план, відкладайте ` +
        `${formatMoneyLocalized(alert.meta.weeklyAmount, locale, currency)} на тиждень або ` +
        `${formatMoneyLocalized(alert.meta.monthlyAmount, locale, currency)} на місяць.`,
      actionLabel: "Відкрити цілі",
    };
  }

  if (alert.type === "saving_pace") {
    return {
      ...alert,
      title: `Темп заощаджень для цілі ${alert.meta.goalName}`,
      message:
        `Щоб залишатися в графіку, відкладайте ${formatMoneyLocalized(alert.meta.weeklyAmount, locale, currency)} ` +
        `на тиждень або ${formatMoneyLocalized(alert.meta.monthlyAmount, locale, currency)} на місяць.`,
      actionLabel: "Відкрити цілі",
    };
  }

  return alert;
}
