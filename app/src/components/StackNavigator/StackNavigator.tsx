import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Home from '../../screens/Home/Home';
import Login from '../../screens/Login/Login';

export default function StackNavigator(){
    const Stack = createNativeStackNavigator();

    return(
        <Stack.Navigator initialRouteName="login">
            <Stack.Screen name='login' component={Login} options={{headerShown: false}}/>
            <Stack.Screen name='home' component={Home} />
        </Stack.Navigator>
    )
}