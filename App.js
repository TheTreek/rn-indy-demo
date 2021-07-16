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
  const revocRegDefId = 'JxzQW2uoy1nVe14M2XwQhH:4:JxzQW2uoy1nVe14M2XwQhH:3:CL:223074:test_drivers:CL_ACCUM:6a760055-2b68-4ad3-b620-d7b97a8a664b'
  const sovrinGenesis = 'https://raw.githubusercontent.com/sovrin-foundation/sovrin/master/sovrin/pool_transactions_sandbox_genesis'
  const indicioGenesis = 'https://raw.githubusercontent.com/Indicio-tech/indicio-network/main/genesis_files/pool_transactions_testnet_genesis'

  const [poolConfigName, setPoolConfigName] = useState("")
  const [walletName, setWalletName] = useState("")
  const [wallet, setWallet] = useState()
  const [states, setStates] = useState({})
  const [genesisUrl, setGenesisUrl] = useState(sovrinGenesis)

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
      let genesis = await axios.get(genesisUrl)
      genesis = genesis.data
      const genesisPath = `${RNFS.DocumentDirectoryPath}/${genesisUrl === indicioGenesis ? 'indicioGenesis' : 'sovrinGenesis'}`
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
      await indy.setProtocolVersion(2) //Set protocol
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
      setStates({...states, closeWallet: {bool: true, res}})
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
      setStates({...states, deleteWallet: {bool: true, res}})
    }catch(err){
      console.error("Error: ",err)
      setStates({...states, deleteWallet: {bool:false, res: err}})
    }
  }

  const submitRequest = async (request)=>{
    console.log("Submiting request")
    console.log("Pool config type: ", typeof states.poolOpen.res, "Pool config: ", states.poolOpen.res)
    const res = await indy.submitRequest(states.poolOpen.res, request)
    console.log("Request submitted successfully")
    return res
  }

  const buildGetRevocRegDefRequest = async ()=>{
    console.log("Building revoc reg request from ID:", revocRegDefId)
    const res = await indy.buildGetRevocRegDefRequest(null, revocRegDefId)
    console.log("Built request successfully ", res, " typeof req", typeof res)
    return res
  }

  const parseGetRevocRegDefResponse = async (response)=>{
    console.log("Parsing revoc reg response", response)
    const res = await indy.parseGetRevocRegDefResponse(response);
    console.log("Revoc reg response successfully parsed", res)
    return res
  }

  const revocRegDef = async ()=>{
    try{
      const request = await buildGetRevocRegDefRequest()
      const response = await submitRequest(request)
      const [,parsed] = await parseGetRevocRegDefResponse(response)
      setStates({...states, revocRegDef: {bool: true, res: parsed}})
      return parsed
    }catch(err){
      console.error("Error: ",err)
      setStates({...states, revocRegDef: {bool:false, res: err}})
    }
  }

  const buildGetRevocRegDeltaRequest = async ()=>{
    console.log("Building revoc reg delta request from ID:", revocRegDefId)
    const res = await indy.buildGetRevocRegDeltaRequest(null, revocRegDefId,0,new Date().getTime())
    console.log("Build request succesfull:", res)
    return res
  }

  const parseGetRevocRegDeltaResponse = async (response)=>{
    console.log("Parsing revoc reg delta response", response)
    const res = await indy.parseGetRevocRegDeltaResponse(response)
    console.log("Revoc reg delta response successfully parsed", res)
    return res
  }

  const revocRegDelta = async ()=>{
    try{
      const request = await buildGetRevocRegDeltaRequest()
      const response = await submitRequest(request)
      const [,parsed, timestamp] = await parseGetRevocRegDeltaResponse(response)
      console.log("timestamp:",timestamp)
      setStates({...states, revocRegDelta: {bool: true, res: parsed}})
      return parsed
    }catch(err){
      console.error("Error: ",err)
      setStates({...states, revocRegDelta: {bool:false, res: err}})
    }
  }


  const createRevocationState = async ()=>{
    try{
      const revRegDef = await revocRegDef()
      const revRegDelta = await revocRegDelta()
      console.log("Delta:", revRegDelta)

      console.log(revRegDef)
      const filePath = `${RNFS.DocumentDirectoryPath}/revoc`
      const {tailsLocation, tailsHash} = revRegDef.value

      if(!await RNFS.exists(filePath)){
        console.log("Creating revocation directory")
        await RNFS.mkdir(filePath)
      }

      if(!await RNFS.exists(`${filePath}/${tailsHash}`)){
        console.log("Downloading tails file:", tailsLocation)
        const {data} = await axios.get(tailsLocation)
        await RNFS.writeFile(`${filePath}/${tailsHash}`, data, `utf8`)
      }else{
        console.log("Tails file is already downloaded")
      }

      const tailsWriterConfig = {
        base_dir: filePath,
        uri_pattern: ''
      }

      console.log("Opening blobStorage")
      const blobStorageHandler = await indy.openBlobStorageReader("default", tailsWriterConfig)
      console.log("Blob storage is open:", blobStorageHandler)

      console.log("Creating revocation state")
      console.log("STRINGIFIED REGDELTA:", JSON.stringify(revRegDelta))

      const d = {
        blobStorageHandler,
        revRegDef,
        revRegDelta,
        date: new Date().getTime(),
        credRevId: '10'
      }
      console.log("RevocState input:", JSON.stringify(d))
      const revocState = await indy.createRevocationState(
        blobStorageHandler,
        JSON.stringify(revRegDef),
        JSON.stringify(revRegDelta),
        new Date().getTime(),
        '10'
      )
      console.log("Revocation state created:",revocState)
      setStates({...states, createRevocationState: {bool:true, res: revocState}})
    }catch(err){
      console.error("Error: ",err)
      setStates({...states, createRevocationState: {bool:false, res: err}})
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
          <View style={{display: 'flex', flexDirection: 'row', alignItems:'center'}}>
            <Text style={{fontSize: 20}}>Genesis:</Text>
            <View style={{flex: 1, display: 'flex', flexDirection:'row', justifyContent:'space-evenly'}}>
              <View style={{flex:1, maxWidth: '50%', paddingVertical: 10, marginHorizontal:10}}>
                <Button
                  title={"Sovrin"}
                  onPress={()=>{
                    setGenesisUrl(sovrinGenesis)
                  }}
                  color={genesisUrl === sovrinGenesis ? '#03a9f4' : 'grey'}
                />
              </View>
              <View style={{flex:1, maxWidth: '50%', paddingVertical: 10, marginHorizontal:10}}>
                <Button
                  title={"Indicio"}
                  onPress={()=>{
                    setGenesisUrl(indicioGenesis)
                  }}
                  color={genesisUrl === indicioGenesis ? '#03a9f4' : 'grey'}
                />
              </View>
            </View>
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
          <TestFunctionComponent
            functionState={states.revocRegDef}
            title={"Get revRegDef"}
            function = {revocRegDef}
          />
          <TestFunctionComponent
            functionState={states.revocRegDelta}
            title={"Get revRegDelta"}
            function = {revocRegDelta}
          />
          <TestFunctionComponent
            functionState={states.createRevocationState}
            title={"Create Revocation State"}
            function = {createRevocationState}
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

  let [loading, setLoading] = useState(false)

  useEffect(async ()=>{
    if(loading){
      await props.function()
      setLoading(false)
    }
  }, [loading])
  
  const getColor = (props)=>{
    if(loading){
      return '#03a9f4'
    }else if(!!props.disabled){
      return 'grey'
    }else if(!props.functionState){
      return 'blue'
    }else if(!props.functionState.bool){
      return 'red'
    }else{
      return 'green'
    } 
  }

  return (
    <View style={compStyles.container}>
      <View style={compStyles.rowContainer}>
        <Text style={compStyles.title}>{`${props.title}:`}</Text>
        <View style={compStyles.buttonContainer}>
          <Button 
          disabled={!!props.disabled} 
          title={"Test function"} 
          onPress={()=>{
            setLoading(true)
          }} 
          color={getColor(props)}/>
        </View>
      </View>
      {props.functionState ? 
        <View style={compStyles.resContainer}>
          <Text>{JSON.stringify(props.functionState.res)}</Text>
        </View>
      : null}
    </View>
  )
}

const styles = StyleSheet.create({
  
});

export default App;
