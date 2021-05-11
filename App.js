import React, {useState, useEffect} from 'react';
import {
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';

import indy from 'rn-indy-sdk'
import RNFS from 'react-native-fs'
import axios from 'axios'


const App = () => {
  const [poolConfigName, setPoolConfigName] = useState("")
  const [walletName, setWalletName] = useState("")
  const [wallet, setWallet] = useState()
  const [states, setStates] = useState({})

  useEffect(()=>{
    randomizeNames()
  },[])

  const randomizeNames = ()=>{
    const randomNumber = Math.floor(Math.random()*10000)
    setWalletName(`Wallet${randomNumber}`)
    setPoolConfigName(`PoolConfig${randomNumber}`)
  }
  
  const createPoolConfig = async ()=>{
    try{
      console.log("Downloading genesis...")
      let genesis = await axios.get("https://raw.githubusercontent.com/Indicio-tech/indicio-network/main/genesis_files/pool_transactions_testnet_genesis")
      genesis = genesis.data
      const genesisPath = `${RNFS.DocumentDirectoryPath}/genesis`
      await RNFS.writeFile(genesisPath, genesis, 'utf8')
      console.log("Genesis downloaded, creating config")
      const res = await indy.createPoolLedgerConfig(poolConfigName, {"genesis_txn": genesisPath})
      console.log("Pool config created successfully")
      setStates({...states, poolConfig: {bool: true, res:res}})
    }catch(err){
      console.error("Error: ",err)
      setStates({...states, poolConfig: {bool:false, res: err}})
    }
  }

  const openPoolConfig = async ()=>{
    try{
      console.log("Opening pool ledger")
      const res = await indy.openPoolLedger(poolConfigName)
      console.log("Pool ledger opened successfully")
      setStates({...states, poolOpen: {bool: true, res:res}})
    }catch(err){
      console.error("Error: ",err)
      setStates({...states, poolOpen: {bool:false, res: err}})
    }
  }

  const createWallet = async ()=>{
    try{
      console.log("Creating wallet")
      const res = await indy.createWallet({id: walletName}, {key: '123'})
      console.log("Wallet created successfully")
      setStates({...states, createWallet: {bool: true, res:res}})
    }catch(err){
      console.error("Error: ",err)
      setStates({...states, createWallet: {bool:false, res: err}})
    }
  }

  const openWallet = async ()=>{
    try{
      console.log("Opening wallet")
      const wallet = await indy.openWallet({id: walletName}, {key: '123'})
      console.log("Wallet opened successfully")
      setWallet(wallet)
      setStates({...states, openWallet: {bool: true, res:wallet}})
    }catch(err){
      console.error("Error: ",err)
      setStates({...states, openWallet: {bool:false, res: err}})
    }
  }

  const closeWallet = async ()=>{
    try{
      console.log("Closing wallet")
      const res = await indy.closeWallet(wallet)
      console.log("Wallet closed successfully")
      setStates({...states, closeWallet: {bool: true, res:res}})
    }catch(err){
      console.error("Error: ",err)
      setStates({...states, closeWallet: {bool:false, res: err}})
    }
  }

  const deleteWallet = async ()=>{
    try{
      console.log("Deleting wallet")
      const res = await indy.deleteWallet({id: walletName}, {key: '123'})
      console.log("Deleted wallet successfully")
      setStates({...states, deleteWallet: {bool: true, res:res}})
    }catch(err){
      console.error("Error: ",err)
      setStates({...states, deleteWallet: {bool:false, res: err}})
    }
  }

  return (
    <SafeAreaView>
      <ScrollView>
        <View>
          <View style={{marginVertical: 10, display: 'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            <Text style={{fontSize: 20}}>Pool config name:</Text>
            <TextInput style={{flex:1, maxWidth: '50%', borderWidth:1}} value={poolConfigName} onChangeText={setPoolConfigName}/>
          </View>
          <View style={{marginVertical: 10, display: 'flex', flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
            <Text style={{fontSize: 20}}>Wallet name:</Text>
            <TextInput style={{flex:1, maxWidth: '50%', borderWidth:1}} value={walletName} onChangeText={setWalletName}/>
          </View>
          <TestFunctionComponent 
            functionState={states.poolConfig}
            title={"Create pool config"}
            function = {createPoolConfig}
          />
          <TestFunctionComponent 
            functionState={states.poolOpen}
            title={"Open pool"}
            function = {openPoolConfig}
          />
          <TestFunctionComponent 
            functionState={states.createWallet}
            title={"Create wallet"}
            function = {createWallet}
          />
          <TestFunctionComponent 
            functionState={states.openWallet}
            title={"Open wallet"}
            function = {openWallet}
          />
          <TestFunctionComponent 
            functionState={states.closeWallet}
            title={"Close wallet"}
            function = {closeWallet}
          />
          <TestFunctionComponent 
            functionState={states.deleteWallet}
            title={"Delete wallet"}
            function = {deleteWallet}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const TestFunctionComponent = (props)=>{
  const compStyles = StyleSheet.create({
    title: {
      fontSize:20,
    },
    rowContainer: {
      display: 'flex',
      justifyContent: 'space-between',
      flexDirection: 'row'
    },
    container: {
      padding: 10,
      marginVertical: 10,
      borderWidth: 0.5,
    },
    buttonContainer: {
      flex:1,
      maxWidth:'50%'
    },
    resContainer: {
      borderWidth: 0
    }
  })
  

  return (
    <View style={compStyles.container}>
      <View style={compStyles.rowContainer}>
        <Text style={compStyles.title}>{`${props.title}:`}</Text>
        <View style={compStyles.buttonContainer}>
          <Button title={"Test function"} onPress={props.function} color={props.functionState ? props.functionState.bool === true ? 'green' : 'red' : 'blue'} />
        </View>
      </View>
      {props.functionState ? 
        <View style={compStyles.resContainer}>
          <Text>Response: {JSON.stringify(props.functionState.res)}</Text>
        </View>
      : null}
    </View>
  )
}

const styles = StyleSheet.create({
  
});

export default App;
