/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import * as Animatable from 'react-native-animatable';
import {fadeIn, slideOutRight} from '../../assets/anim/index';
import {
  Alert,
  BackHandler,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import {_auth} from '../../assets/config';
export default class Login extends Component {
  state = {
    loadTitle: false,
    exit: false,
    cred: {
      email: '',
      password: '',
    },
  };
  backAction = () => {
    Alert.alert('Confirm', 'Are you sure you want to exit?', [
      {
        text: 'Cancel',
        onPress: () => null,
        style: 'cancel',
      },
      {text: 'YES', onPress: () => BackHandler.exitApp()},
    ]);
    return true;
  };

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  render() {
    return (
      <Animatable.View
        duration={1000}
        animation={this.state.exit === false ? fadeIn : slideOutRight}
        style={styles.mainContent}>
        <StatusBar style="dark" />
        <Image
          source={require('../../assets/drawables/logo.png')}
          style={styles.logo}
        />
        <Text style={styles.title}>Enter your login credentials</Text>
        <View style={styles.inputField}>
          <Image
            style={styles.inputIcon}
            source={require('../../assets/drawables/name.png')}
          />
          <TextInput
            style={styles.inputText}
            onChangeText={(text) => {
              const c = this.state.cred;
              c.email = text;
              this.setState({cred: c});
            }}
            value={this.state.cred.email}
            placeholder="Username"
          />
        </View>
        <View style={styles.inputField}>
          <Image
            style={styles.inputIcon}
            source={require('../../assets/drawables/lock.png')}
          />
          <TextInput
            secureTextEntry={true}
            style={styles.inputText}
            onChangeText={(text) => {
              const c = this.state.cred;
              c.password = text;
              this.setState({cred: c});
            }}
            value={this.state.cred.password}
            placeholder="Password"
          />
        </View>
        <View style={styles.btnDiv}>
          <TouchableOpacity
            style={styles.btn}
            onPress={async () => {
              await setTimeout(() => {
                this.backAction();
              }, 100);
            }}>
            <Image
              source={require('../../assets/drawables/exit.png')}
              style={styles.btnImg}
            />
            <Text style={styles.btnText}>Exit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={async () => {
              const c = this.state.cred;
              if (c.email && c.password) {
                this.props.openSnack('Signing In');
                var u;
                await _auth
                  .signInWithEmailAndPassword(c.email + '@bc.io', c.password)
                  .then(async (x) => {
                    this.props.closeSnack();
                    if (x) {
                      u = x;
                    }
                  })
                  .catch(async () => {
                    this.props.closeSnack();
                    await setTimeout(() => {
                      this.props.openTimedSnack('Sign In Failed');
                    }, 100);
                  });
                if (u) {
                  this.setState({exit: true});
                  setTimeout(() => {
                    this.props.authorizeUser();
                  }, 1500);
                  setTimeout(() => {
                    this.props.openTimedSnack('Sign In Sucessfull');
                  }, 200);
                }
              } else {
                this.props.openTimedSnack('All fields are required');
              }
            }}>
            <Image
              source={require('../../assets/drawables/enter.png')}
              style={styles.btnImg}
            />
            <Text style={styles.btnText}>Login</Text>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  mainContent: {
    display: 'flex',
    backgroundColor: '#fff',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  logo: {
    marginTop: 60,
    height: 70,
    marginBottom: 20,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Roboto-Light',
    marginBottom: 10,
    color: '#000',
    alignSelf: 'center',
  },
  inputField: {
    minHeight: 40,
    maxHeight: 55,
    flex: 1,
    marginLeft: 20,
    marginRight: 20,
    borderColor: '#bc65fc',
    borderWidth: 1,
    marginBottom: 5,
    display: 'flex',
    flexDirection: 'row',
    fontFamily: 'bold',
    borderRadius: 5,
  },
  inputIcon: {
    width: 40,
    height: 40,
    alignSelf: 'center',
    marginLeft: 10,
  },
  inputText: {
    marginLeft: 10,
    paddingLeft: 10,
    borderLeftColor: '#fff',
    borderLeftWidth: 2,
    fontFamily: 'Roboto-Light',
    fontSize: 20,
    minWidth: 100,
  },
  btn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    margin: 5,
    borderWidth: 2,
    borderColor: '#bc65fc',
    paddingBottom: 2,
    paddingTop: 2,
    borderRadius: 5,
    backgroundColor: '#bc65fc',
  },
  btnImg: {
    height: 30,
    width: 30,
  },
  btnText: {
    alignSelf: 'center',
    fontFamily: 'Roboto-Medium',
    marginLeft: 10,
    color: '#fff',
  },
  btnDiv: {
    flexDirection: 'row',
    marginRight: 20,
    marginLeft: 20,
    marginTop: 10,
  },
});
