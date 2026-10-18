var RTL_LANGUAGES = ['ar'];

function getDirection(languageCode) {
  return RTL_LANGUAGES.indexOf(languageCode) !== -1 ? 'rtl' : 'ltr';
}

function isRTL(languageCode) {
  return getDirection(languageCode) === 'rtl';
}

export { getDirection, isRTL, RTL_LANGUAGES };
