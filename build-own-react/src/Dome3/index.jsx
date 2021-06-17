import React, { useRef, useCallback, useEffect } from "react";

class ProfilePageClass extends React.Component {
  showMessage = () => {
    alert('Followed ' + this.props.user);
  };

  handleClick = () => {
    setTimeout(this.showMessage, 3000);
  };

  render() {
    return <button onClick={this.handleClick}>关注</button>;
  }
}

class ProfilePageClassAsFunction1 extends React.Component {
  showMessage = (user) => {
    alert('Followed ' + user);
  };

  handleClick = () => {
    const {user} = this.props;
    setTimeout(() => this.showMessage(user), 3000);
  };

  render() {
    return <button onClick={this.handleClick}>关注</button>;
  }
}

class ProfilePageClassAsFunction2 extends React.Component {
  render() {
    // Capture the props!
    const props = this.props;

    // Note: we are *inside render*.
    // These aren't class methods.
    const showMessage = () => {
      alert('Followed ' + props.user);
    };

    const handleClick = () => {
      setTimeout(showMessage, 3000);
    };

    return <button onClick={handleClick}>关注</button>;
  }
}


function ProfilePageFunction(props) {
  const showMessage = useCallback(() => {
    alert('Followed ' + props.user);
  }, [props]);

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>关注</button>
  );
}

function ProfilePageFunctionAsClass1(props) {
  const ref = useRef();
  useEffect(() => {
    ref.current = props.user;
  });

  const showMessage = () => {
    alert('Followed ' + ref.current);
  }

  const handleClick = () => {
    setTimeout(showMessage, 3000);
  };

  return (
    <button onClick={handleClick}>关注</button>
  );
}



class App extends React.Component {
  state = {
    user: 'A',
  };
  render() {
    return (
      <>
        <label>
          <b>选择博主: </b>
          <select
            value={this.state.user}
            onChange={e => this.setState({ user: e.target.value })}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>
        </label>
        <h1>欢迎来到 {this.state.user} 的微博!</h1>
        <p>
          <ProfilePageFunction user={this.state.user} />
          <b> (function)</b>
          <b> (function as class1)</b><ProfilePageFunctionAsClass1 user={this.state.user}/>
        </p>
        <p>
          <ProfilePageClass user={this.state.user} />
          <b> (class)</b>
          <b> (class as function1)</b><ProfilePageClassAsFunction1 user={this.state.user}/>
          <b> (class as function3)</b><ProfilePageClassAsFunction2 user={this.state.user}/>
        </p>

      </>
    )
  }
}

export default App;
