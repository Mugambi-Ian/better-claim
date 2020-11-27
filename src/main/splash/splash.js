/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import * as Animatable from 'react-native-animatable';
import {fadeIn, slideOutLeft} from '../../assets/anim/index';
import {Image, StyleSheet} from 'react-native';
import {StatusBar} from 'expo-status-bar';
export default class Splash extends Component {
  state = {
    loadTitle: false,
    closeSplash: false,
  };
  async componentDidMount() {
    await setTimeout(async () => {
      this.setState({closeSplash: true});
      await setTimeout(() => {
        this.props.closeSplash();
      }, 800);
    }, 2500);
  }

  render() {
    return (
      <Animatable.View
        duration={1000}
        animation={this.state.closeSplash === false ? fadeIn : slideOutLeft}
        style={styles.mainContent}>
        <StatusBar style="light" />
        <Image
          source={require('../../assets/drawables/logo.png')}
          style={styles.mainContentBackground}
        />
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  mainContent: {
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
  },
  mainContentBackground: {
    width: 220,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
  appTitle: {
    height: 80,
    width: 80,
    bottom: 20,
    position: 'absolute',
    alignSelf: 'center',
  },
});
