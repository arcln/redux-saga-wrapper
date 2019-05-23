import createSagaMiddleware from 'redux-saga';
import { all, fork, takeEvery, put } from 'redux-saga/effects';
import {
  bindActionCreators,
  applyMiddleware,
  createStore as createReduxStore,
} from 'redux';

const sagas = [];
const actionCreators = {};
const reducers = {
  leaveStateUnchanged: state => state,
};

function createAction(action) {
  return (...args) => ({
    type: action,
    payload: [ ...args ],
  });
}

function createStore(initialState, actions) {
  for (let actionType in actions) {
    const action = actions[actionType];
    actionCreators[actionType] = createAction(actionType);
  
    if (action.reducer) {
      reducers[actionType] = action.reducer;
    }
  
    if (action.saga) {
      sagas.push(function*() {
        yield takeEvery(actionType, function*(...args) {
          let ret;

          try {
            ret = yield action.saga(...args);
          }
          catch (error) {
            if (actionCreators[`${actionType}Failed`]) {
              return yield put(actionCreators[`${actionType}Failed`](error, ...args));
            }
            else {
              throw error;
            }
          }

          if (actionCreators[`${actionType}Success`]) {
            return yield put(actionCreators[`${actionType}Success`](ret, ...args));
          }
        });
      });
    }
  }
  
  const sagaMiddleware = createSagaMiddleware();
  const store = createReduxStore(
    (state = initialState, action) => {
      const reducer = reducers[action.type] || reducers.leaveStateUnchanged;
      return reducer(state, action.payload);
    },
    applyMiddleware(sagaMiddleware),
  );

  sagaMiddleware.run(function*() {
    yield all(sagas.map(fork));
  });

  return store;
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(actionCreators, dispatch),
});

export { createStore, actionCreators, mapDispatchToProps };
