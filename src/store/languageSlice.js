var LANGUAGES = [
  { code: 'en', label: 'English', dir: 'ltr' },
  { code: 'fr', label: 'Français', dir: 'ltr' },
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];

var getInitialLanguage = function () {
  try {
    var saved = localStorage.getItem('language');
    if (saved) return saved;
  } catch (e) {}
  return 'ar';
};

var initialState = {
  code: getInitialLanguage(),
};

var languageSlice = function (state, action) {
  if (state === void 0) { state = initialState; }
  switch (action.type) {
    case 'language/setLanguage':
      return { code: action.payload };
    default:
      return state;
  }
};

languageSlice.setLanguage = function (code) {
  return { type: 'language/setLanguage', payload: code };
};

export { LANGUAGES, languageSlice };
