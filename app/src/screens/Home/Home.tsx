import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import DeviceInfo from 'react-native-device-info';

export default function Home({navigation, route}){

    const rnBiometrics = new ReactNativeBiometrics();
    const [biometriaHabilitada, setBiometriaHabilitada] = useState<any>(false);
    const [loading, setLoading] = useState<boolean>(false);

    useEffect(()=>{
        const verificaBiometria = async ()=>{
            const {keysExist} = await rnBiometrics.biometricKeysExist();
            setBiometriaHabilitada(keysExist);
        }
        verificaBiometria();
    },[]);

    const ativarBiometria = async () => {
        try{
            setLoading(true);
            const {available} = await rnBiometrics.isSensorAvailable();
            if(available){
                const { success } = await rnBiometrics.simplePrompt({promptMessage: 'Insira a biometria'});
                if(success){
                    const {publicKey} = await rnBiometrics.createKeys();
                    const deviceId = await DeviceInfo.getUniqueId();
                    const usuarioId = route.params.usuario.id;
                    await axios.put("http://localhost:8080/api/cadastro/biometria", {
                        publicKey: publicKey,
                        idUsuario: usuarioId,
                        deviceId: deviceId,
                    }).then(()=>{
                        AsyncStorage.setItem("idUsuarioBiometria", JSON.stringify(usuarioId))
                        setBiometriaHabilitada(true);
                    })
                }
            }
        }finally{
            setLoading(false);
        }
        
    }

    const desativarBiometria = async () => {
        try{
            setLoading(true);
            const {publicKey} = await rnBiometrics.createKeys();
            const deviceId = await DeviceInfo.getUniqueId();
            const usuarioId = route.params.usuario.id;
            await axios.delete("http://localhost:8080/api/cadastro/biometria", { params:{
                    publicKey: publicKey,
                    idUsuario: usuarioId,
                    deviceId: deviceId,
                }}).then(async ()=>{
                    await rnBiometrics.deleteKeys();
                    setBiometriaHabilitada(false);
                });
        }finally{
            setLoading(false);
        }
    }

    const deslogar = () => {
        navigation.reset({index:0, routes:[{name:'login'}]});
    }

    return(
        <View style={styles.container}>
            <Text style={{color:"#000", fontSize:40 }}>Bem-Vindo!</Text>
            <Text style={{color:"#000", fontSize: 20}}>Deseja {biometriaHabilitada ? 'desativar' : 'ativar'} a biometria?</Text>
            
                <TouchableOpacity disabled={loading} style={styles.button} onPress={biometriaHabilitada ? desativarBiometria : ativarBiometria}>
                    {loading ? 
                        <ActivityIndicator/> 
                            :  
                        <Text style={styles.buttonText}>{biometriaHabilitada ? 'Desativar' : 'Ativar'}</Text>
                    }
                </TouchableOpacity>
                
            
            
            <TouchableOpacity style={[styles.button, {marginTop:'auto'}]} onPress={deslogar}>
                <Text style={styles.buttonText}>Deslogar</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container:{
        flex:1,
        gap:10,
        justifyContent:'center',
        alignItems:'center',
        width:'100%',
        marginVertical:"10%"
    },
    button:{
        color:'black',
        
        backgroundColor: '#009DCF',
        width:'30%',
        height: 60,
        borderRadius: 5,
        textAlign:'center',
        alignItems:'center',
        justifyContent:'center'
    },
    buttonText:{
        fontSize: 23,
        color:'#FFF'
    }
});