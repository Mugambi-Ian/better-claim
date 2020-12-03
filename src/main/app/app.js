/* eslint-disable react-native/no-inline-styles */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {Component} from 'react';
import * as Animatable from 'react-native-animatable';
import {
  fadeIn,
  slideInRight,
  slideInUp,
  slideOutLeft,
  slideOutRight,
} from '../../assets/anim/index';
import {
  Alert,
  BackHandler,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  TextInput,
} from 'react-native';
import {StatusBar} from 'expo-status-bar';
import MapView, {Marker, AnimatedRegion} from 'react-native-maps';
import GetLocation from 'react-native-get-location';
import Spinner from 'react-native-loading-spinner-overlay';
import LocationSwitch from 'react-native-location-permission';
import {_auth, _database} from '../../assets/config';
import KeepScreenOn from 'react-native-keep-screen-on';
navigator.geolocation = require('@react-native-community/geolocation');

export default class Home extends Component {
  state = {
    loadTitle: false,
    exit: false,
    cred: {
      email: '',
      password: '',
    },
    trip: undefined,
    latitude: LATITUDE,
    longitude: LONGITUDE,
    coordinate: new AnimatedRegion({
      latitude: LATITUDE,
      longitude: LONGITUDE,
      latitudeDelta: 0,
      longitudeDelta: 0,
    }),
    loading: true,
    record: undefined,
    j: false,
  };
  backAction = async () => {
    if (this.state.settings) {
      this.setState({
        exit: false,
      });
      await setTimeout(() => {
        this.setState({settings: undefined});
      }, 700);
    } else {
      Alert.alert('Confirm', 'Are you sure you want to exit?', [
        {
          text: 'Cancel',
          onPress: () => null,
          style: 'cancel',
        },
        {text: 'YES', onPress: () => BackHandler.exitApp()},
      ]);
    }
    return true;
  };

  async componentDidMount() {
    LocationSwitch.isLocationEnabled(
      async () => {},
      () => {
        LocationSwitch.enableLocationService();
      },
    );
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
    GetLocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 15000,
    })
      .then((location) => {
        this.setState({
          longitude: location.longitude,
          latitude: location.latitude,
          coordinate: new AnimatedRegion({
            latitude: location.latitude,
            longitude: location.longitude,
            latitudeDelta: 0,
            longitudeDelta: 0,
          }),
          loading: false,
        });
      })
      .catch((error) => {
        const {code, message} = error;
        console.warn(code, message);
        this.setState({loading: false});
      });
    await setInterval(async () => {
      this.setState({j: !this.state.j});
    }, 60000);
  }
  async watchLocation() {}

  async componentDidUpdate(prevProps, prevState) {
    if (this.props.latitude !== prevState.latitude) {
      if (this.state.record) {
        const t = new Date();
        const _h =
          (t.getHours() <= 9 ? '0' + t.getHours() : t.getHours()) +
          ':' +
          (t.getMinutes() <= 9 ? '0' + t.getMinutes() : t.getMinutes()) +
          ':' +
          (t.getSeconds() <= 9 ? '0' + t.getSeconds() : t.getSeconds());
        const _d =
          t.getDate() + '-' + (t.getMonth() + 1) + '-' + t.getFullYear();
        const stamp = {
          longitude: this.state.longitude,
          latitude: this.state.latitude,
          time: _h,
          date: _d,
          id: _d + '_' + _h,
        };
        console.log(stamp);
        await _database
          .ref('users/' + _auth.currentUser.uid + '/active-trip/' + stamp.id)
          .set(stamp);
      }
    }
  }

  componentWillUnmount() {
    this.backHandler.remove();
    navigator.geolocation.clearWatch(this.watchID);
  }

  render() {
    return !this.state.loading ? (
      !this.state.settings ? (
        <Animatable.View
          duration={800}
          animation={this.state.exit === false ? slideInUp : slideOutLeft}
          style={styles.mainContent}>
          <StatusBar style="dark" />
          <TripTimer
            trip={this.state.trip}
            latitude={this.state.latitude}
            longitude={this.state.longitude}
            coordinate={this.state.coordinate}
            recordRoute={() => {
              this.setState({record: true});
              this.watchLocation();
            }}
            stopRecording={() => {
              this.setState({record: undefined});
            }}
          />
          <Text style={styles.title}>Home</Text>
          <TouchableOpacity style={styles.logOutBtn}>
            <Text
              style={styles.btnTxt}
              onPress={async () => {
                await setTimeout(() => {
                  if (this.state.record) {
                    Alert.alert(
                      'Confirm',
                      'Are you sure you want to end your journey?',
                      [
                        {
                          text: 'Cancel',
                          onPress: () => null,
                          style: 'cancel',
                        },
                        {
                          text: 'YES',
                          onPress: async () => {
                            this.setState({record: undefined});
                            await _database
                              .ref('users/' + _auth.currentUser.uid)
                              .once('value', async (x) => {
                                const t = x.child('active-trip').val();
                                await x.ref.child('completed-trips').push(t);
                                await x.ref.child('active-trip').set(null);
                              });
                            await _auth.signOut().then(() => {
                              this.props.unauthorizeUser();
                            });
                          },
                        },
                      ],
                    );
                  } else {
                    _auth.signOut().then(() => {
                      this.props.unauthorizeUser();
                    });
                  }
                }, 100);
              }}>
              Logout
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={async () => {
              await setTimeout(async () => {
                this.setState({exit: true});
                await setTimeout(() => {
                  this.setState({settings: true});
                }, 700);
              }, 100);
            }}>
            <Text style={styles.btnTxt}>Settings</Text>
          </TouchableOpacity>
        </Animatable.View>
      ) : (
        <Settings
          openSnack={this.props.openSnack}
          closeSnack={this.props.closeSnack}
          openTimedSnack={this.props.openTimedSnack}
          cancel={this.backAction.bind(this)}
          exit={this.state.exit}
        />
      )
    ) : (
      <View style={styles.mainContent}>
        <StatusBar style="dark" />
        <Spinner visible={true} />
      </View>
    );
  }
}
const {width, height} = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.01;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class TripTimer extends Component {
  state = {
    trip: undefined,
  };

  async componentDidMount() {
    KeepScreenOn.setKeepScreenOn(true);
    await _database
      .ref('users/' + _auth.currentUser.uid + '/active-trip')
      .on('value', (z) => {
        if (z.hasChildren()) {
          this.setState({trip: 'active'});
        } else {
          this.setState({trip: undefined});
        }
      });
  }

  getMapRegion = () => ({
    latitude: this.props.latitude,
    longitude: this.props.longitude,
    latitudeDelta: LATITUDE_DELTA,
    longitudeDelta: LONGITUDE_DELTA,
  });

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          showUserLocation
          followUserLocation
          loadingEnabled
          region={this.getMapRegion()}>
          <Marker.Animated
            ref={(marker) => {
              this.marker = marker;
            }}
            coordinate={this.props.coordinate}>
            <Image
              source={require('../../assets/drawables/name.png')}
              style={styles.marker}
            />
            <Text style={styles.markerText}>
              {_auth.currentUser.email.split('@')[0]}
            </Text>
          </Marker.Animated>
        </MapView>
        <TouchableOpacity style={styles.tripButton}>
          <Text
            style={styles.tripButtonText}
            onPress={async () => {
              await setTimeout(async () => {
                if (this.state.trip) {
                  await _database
                    .ref('users/' + _auth.currentUser.uid)
                    .once('value', async (x) => {
                      const t = x.child('active-trip').val();
                      await x.ref.child('completed-trips').push(t);
                      await x.ref.child('active-trip').set(null);
                    });
                  this.props.stopRecording();
                } else {
                  this.props.recordRoute();
                }
              }, 100);
            }}>
            {this.state.trip === undefined ? 'Start Journey' : 'End Journey'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

class Settings extends Component {
  state = {
    password: undefined,
    cred: {current: '', new: '', _new: ''},
  };
  render() {
    return (
      <Animatable.View
        animation={this.props.exit ? slideInRight : slideOutRight}
        style={{...styles.mainContent, justifyContent: 'center'}}>
        <StatusBar style="dark" />
        {this.state.password ? (
          <Animatable.View
            animation={fadeIn}
            style={{...styles.mainContent, justifyContent: 'center'}}>
            <Image
              source={require('../../assets/drawables/logo.png')}
              style={styles.logo}
            />
            <Text style={styles.subTitle}>Enter your current password</Text>
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
                  c.current = text;
                  this.setState({cred: c});
                }}
                value={this.state.cred.current}
                placeholder="Password"
              />
            </View>
            <Text style={styles.subTitle}>Enter your new password</Text>
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
                  c.new = text;
                  this.setState({cred: c});
                }}
                value={this.state.cred.new}
                placeholder="New Password"
              />
            </View>
            <Text style={styles.subTitle}>Confrim your password</Text>
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
                  c._new = text;
                  this.setState({cred: c});
                }}
                value={this.state.cred._new}
                placeholder="Confrim Password"
              />
            </View>
            <TouchableOpacity
              style={styles.btn}
              onPress={async () => {
                const c = this.state.cred;
                if (c._new === c.new && c.current && c.new) {
                  this.props.openSnack('Updating');
                  await _auth
                    .signInWithEmailAndPassword(
                      _auth.currentUser.email,
                      c.current,
                    )
                    .then(async (x) => {
                      this.props.closeSnack();
                      if (x) {
                        this.props.closeSnack();
                        await x.user
                          .updatePassword(c._new)
                          .then(() => {
                            this.props.openTimedSnack('Update Succesfull');
                          })
                          .catch((e) => {
                            this.props.openTimedSnack('Update Failed');
                          });
                      }
                    })
                    .catch(async () => {
                      this.props.closeSnack();
                      await setTimeout(() => {
                        this.props.openTimedSnack('Update Failed');
                      }, 100);
                    });
                } else if (c._new !== c.new) {
                  this.props.openTimedSnack("Passwords don't match");
                } else {
                  this.props.openTimedSnack('All fields are required');
                }
              }}>
              <Text style={styles.btnTxt}>Update</Text>
            </TouchableOpacity>
          </Animatable.View>
        ) : (
          <View>
            <Image
              source={require('../../assets/drawables/user.png')}
              style={styles.userIcon}
            />
            <TouchableOpacity
              style={styles.btn}
              onPress={async () => {
                await setTimeout(() => {
                  this.setState({password: true});
                }, 100);
              }}>
              <Text style={styles.btnTxt}>Change Password</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btn}
              onPress={async () => {
                await setTimeout(async () => {
                  await this.props.cancel();
                }, 100);
              }}>
              <Text style={styles.btnTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </Animatable.View>
    );
  }
}

const styles = StyleSheet.create({
  mainContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
  },
  title: {
    fontSize: 25,
    fontFamily: 'Roboto-Medium',
    marginBottom: 10,
    color: '#000',
    alignSelf: 'center',
    marginTop: 25,
  },
  pager: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    flex: 1,
  },

  logOutBtn: {
    position: 'absolute',
    top: 25,
    left: 20,
    width: 60,
    backgroundColor: '#f3e5fc',
    borderRadius: 5,
  },
  btn: {
    alignSelf: 'center',
    top: 25,
    width: 150,
    backgroundColor: '#f3e5fc',
    borderRadius: 5,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
  },
  settingsBtn: {
    position: 'absolute',
    top: 25,
    right: 20,
    width: 60,
    backgroundColor: '#f3e5fc',
    borderRadius: 5,
  },
  tripButton: {
    position: 'absolute',
    bottom: 15,
    right: 'auto',
    left: 'auto',
    width: 150,
    backgroundColor: '#00e0a0',
    borderRadius: 5,
    alignSelf: 'center',
  },
  tripButtonText: {
    color: '#fff',
    paddingTop: 5,
    paddingBottom: 5,
    fontFamily: 'Roboto-Black',
    textAlign: 'center',
    fontSize: 18,
  },
  btnTxt: {
    color: '#bc65fc',
    paddingTop: 5,
    paddingBottom: 5,
    fontFamily: 'Roboto-Medium',
    textAlign: 'center',
  },
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 60,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  marker: {height: 45, width: 45, alignSelf: 'center'},
  markerText: {
    marginTop: 5,
    color: '#bc65fc',
    fontFamily: 'Roboto-bold',
    fontSize: 20,
    alignSelf: 'center',
    textTransform: 'capitalize',
  },
  userIcon: {
    height: 150,
    width: 150,
    alignSelf: 'center',
  },
  subTitle: {
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
    width: 30,
    height: 30,
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

  btnImg: {
    height: 30,
    width: 30,
  },

  btnDiv: {
    flexDirection: 'row',
    marginRight: 20,
    marginLeft: 20,
    marginTop: 10,
  },
  logo: {
    height: 70,
    marginBottom: 20,
    alignSelf: 'center',
    resizeMode: 'contain',
  },
});
