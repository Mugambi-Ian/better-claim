/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import {StyleSheet, View} from 'react-native';
import Splash from './splash/splash';
import {Snackbar} from 'react-native-paper';
import {_auth} from '../assets/config/index';
import Login from './login/login';

export default class App extends Component {
  state = {
    activeSplash: true,
    authenticated: false,
    bypassAuth: false,
    snackBar: false,
    snackBarMsg: '',
    snackBarLabel: '',
    snackBarOnClick: () => {},
  };

  async componentDidMount() {
    await _auth.onAuthStateChanged(async (u) => {
      if (this.state.activeSplash === false && this.state.loaded === false) {
        this.setState({activeSplash: true});
      }
      this.setState({loaded: true, startApp: true});
      if (this.state.bypassAuth === false && u !== null) {
        this.setState({authenticated: true});
      }
    });
  }
  async openTimedSnack(m, l, f) {
    this.setState({snackBarMsg: m, snackBar: true});
    if (l && f) {
      this.setState({snackBarLabel: l, snackBarOnClick: f});
    }
    await setTimeout(() => {
      this.setState({snackBarMsg: m, snackBar: false});
    }, 1500);
  }
  async openSnack(m, l, f) {
    this.setState({snackBarMsg: m, snackBar: true});
    if (l && f) {
      this.setState({snackBarLabel: l, snackBarOnClick: f});
    }
  }
  closeSnack() {
    this.setState({snackBar: false});
  }
  render() {
    return (
      <View styles={styles.mainContent}>
        {this.state.activeSplash === true ? (
          <Splash
            closeSplash={() => {
              if (this.state.loaded === true) {
                this.setState({activeSplash: false, startApp: true});
              }
            }}
          />
        ) : this.state.authenticated === false ? (
          <Login
            init={() => {
              this.setState({bypassAuth: true});
            }}
            authorizeUser={() => {
              this.setState({authenticated: true});
            }}
            openSnack={this.openSnack.bind(this)}
            closeSnack={this.closeSnack.bind(this)}
            openTimedSnack={this.openTimedSnack.bind(this)}
          />
        ) : (
          <View
            init={() => {
              this.setState({bypassAuth: true});
            }}
            unauthorizeUser={() => {
              this.setState({authenticated: false});
            }}
            openSnack={this.openSnack.bind(this)}
            closeSnack={this.closeSnack.bind(this)}
            openTimedSnack={this.openTimedSnack.bind(this)}
          />
        )}
        <Snackbar
          visible={this.state.snackBar}
          action={{
            label: this.state.snackBarLabel,
            onPress: this.state.snackBarOnClick,
          }}
          onDismiss={() => {
            return true;
          }}>
          {this.state.snackBarMsg}
        </Snackbar>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  mainContent: {
    display: 'flex',
    height: '100%',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#fff',
  },
});
