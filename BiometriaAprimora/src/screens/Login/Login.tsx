import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {useState, useEffect} from 'react';
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator, Alert } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import DeviceInfo from 'react-native-device-info';
const Logo = require('../../assets/logo.png');
const Fingerprint = require('../../assets/fingerprint.png')

export default function Login({navigation}){
    const epochTimeSeconds = Math.round(new Date().getTime() / 1000).toString();
    const payload = epochTimeSeconds + 'some message';
    const rnBiometrics = new ReactNativeBiometrics();

    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [biometriaHabilitada, setBiometriaHabilitada] = useState<any>(false);
    const [loading, setLoading] = useState<boolean>(false)
    const [loginErro, setLoginError] = useState<boolean>(false);

    useEffect(()=>{
        const verificaBiometria = async ()=>{
            const {keysExist} = await rnBiometrics.biometricKeysExist();
            setBiometriaHabilitada(keysExist);
        }
        verificaBiometria();
    },[]);

    const login = async () => {
        try{
            
            const idUsuario = await AsyncStorage.getItem('idUsuarioBiometria');
            if(email === "" || senha === ""){
                Alert.alert("", "Os campos não podem estar vazios.")
                return;
            }
            setLoading(true);
            console.log({
                email: email,
                senha: senha
            } );
            const res = await axios.post('http://localhost:8080/api/login', {
                email: email,
                senha: senha
            })
            if(res.status == 200 ){
                if(res.data.id !== idUsuario){
                    await rnBiometrics.deleteKeys();
                }
                navigation.reset({index:0, routes:[{name:'home', params: { usuario: res.data} }]});
            }
        }finally{
            setLoading(false);
        }
    }

    const loginBiometria = async () => {
        const deviceId = await DeviceInfo.getUniqueId();
        const idUsuario = await AsyncStorage.getItem('idUsuarioBiometria');
        const {signature} = await rnBiometrics.createSignature({promptMessage:'Biometria Aprimora', payload:payload});
        const res = await axios.post('http://localhost:8080/api/loginBiometria', {
            payload,
            deviceId,
            idUsuario,
            signature
        })
        if(res.status == 200 ){
            navigation.reset({index:0, routes:[{name:'home', params: { usuario: res.data} }]});
        }
    }

    return(
        <View style={styles.container}>
            <Image source={Logo}/>
            <View style={styles.inputContainer}>
                <View style={styles.inputContainer}>
                    <Text style={styles.title}>Email</Text>
                    <TextInput value={email} onChangeText={(value) => {setEmail(value)}} style={styles.input}/>
                </View>
                <View style={styles.inputContainer}>
                    <Text style={styles.title}>Senha</Text>
                    <TextInput value={senha} onChangeText={(value) => {setSenha(value)}} style={styles.input} secureTextEntry/>
                </View>
            </View>
            <View>
                <TouchableOpacity style={styles.button} onPress={login}>
                    {loading ? <ActivityIndicator/>  : <Text style={styles.buttonText}>Entrar</Text>}
                    
                </TouchableOpacity>
                {biometriaHabilitada && 
                    <TouchableOpacity style={[styles.button,  {backgroundColor:"#FFF"}]} onPress={loginBiometria}>
                        <Image resizeMode='contain' style={styles.icon} source={Fingerprint}/>
                        <Text style={[styles.buttonText, {color:'#009DCF'}]}>Entrar com biometria</Text>
                    </TouchableOpacity>
                }
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        gap:10,
        justifyContent:'space-evenly',
        alignItems:'center',
        width:'100%',
        height: '100%',
        backgroundColor:'#2596be'
    },
    inputContainer:{width:'90%', marginHorizontal:'5%'},
    title:{
        fontSize:18,
        color: '#FFF',
        marginLeft: 10
    },
    input:{
        width:'100%',
        borderRadius: 5,
        fontSize: 20,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#FFF',
    },
    button:{
        backgroundColor: '#009DCF',
        borderRadius: 5,
        textAlign:'center',
        alignItems:'center',
        justifyContent:'center',
        padding:10,
        flexDirection:'row',
        marginBottom: 25
    },
    buttonText:{
        fontSize: 23,
        color:'#FFF'
    },
    icon:{ width:25, 
        height:25, 
        marginRight: 10
    }
});