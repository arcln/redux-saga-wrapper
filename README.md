# redux-saga-wrapper

A wrapper to write redux reducers and sagas in a minimalist way.

## Installation

```bash
npm i redux-saga-wrapper --save
# or
yarn add redux-saga-wrapper
```

## How to use

Declare your actions. The `...Failed` variant is called if your code throws an error, otherwise the `...Success` one is called with the return value of the saga.

```javascript
const actions = {
  fireRequest: {
    *saga({ payload: [ url ] }) {
      return yield fetch(url);
    },
  },
  fireRequestSuccess: {
    reducer(state, [ response, action ]) {
      return {
        response,
        ...state,
      };
    },
  },
  fireRequestFailed: {
    *saga({ payload: [ error ] }) {
      alert(`something went wrong: ${error.toString()}`);
    },
  },
};
```

Create a store and use it as usual.

```javascript
import { createStore } from 'redux-saga-wrapper';

const initialState = {};
const store = createStore(initialState, actions);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
```

Map the actions to your components' props using `mapDispatchToProps`, and use your actions a you always did!

```javascript
import { mapDispatchToProps } from 'redux-saga-wrapper';

class App extends React.Component {

  // ...

  componentDidMount() {
    this.props.actions.doRequest('https://reqres.in/api/users/2');
  }

  // ...
}

export default connect(() => ({}), mapDispatchToProps)(App);
```

You can also retreive the actions creators to call them from a saga or map them manually:

```javascript
import { actionCreators } from 'redux-saga-wrapper';
```
