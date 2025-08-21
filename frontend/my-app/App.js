// import * as React from 'react';
// import { NavigationContainer } from '@react-navigation/native';
// import { createNativeStackNavigator } from '@react-navigation/native-stack';
// import HomeScreen from '../my-app/screens/HomeScreen';
// import BuyEnergyScreen from '../my-app/screens/Buy';
// import SellEnergyScreen from '../my-app/screens/Sell';
// import SettingsScreen from '../my-app/screens/Setting';

// const Stack = createNativeStackNavigator();

// export default function App() {
//   return (
//     <NavigationContainer>
//       <Stack.Navigator initialRouteName="Home">
//         <Stack.Screen name="Home" component={HomeScreen} />
//         <Stack.Screen name="Buy" component={BuyEnergyScreen} />
//         <Stack.Screen name="Sell" component={SellEnergyScreen} />
//         <Stack.Screen name="Settings" component={SettingsScreen} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

import React from 'react';
import AppNavigator from './AppNavigator';

export default function App() {
  return <AppNavigator />;
}