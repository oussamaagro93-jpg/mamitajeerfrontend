import { createStore, combineReducers } from 'redux';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { languageSlice } from './languageSlice';

var rootReducer = combineReducers({
  language: languageSlice,
});

var persistConfig = {
  key: 'root',
  storage: storage,
  whitelist: ['language'],
};

var persistedReducer = persistReducer(persistConfig, rootReducer);

var store = createStore(
  persistedReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

var persistor = persistStore(store);

export { store, persistor };
