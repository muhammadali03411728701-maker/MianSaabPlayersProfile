import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, ScrollView, 
  TouchableOpacity, Switch, Alert, SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SYSTEM AUTH CODE: 50234
const VERSION_ID = "50234";

export default function App() {
  const [view, setView] = useState('home'); 
  const [players, setPlayers] = useState([]);
  
  // Registration Form State
  const [regForm, setRegForm] = useState({
    name: '', fName: '', phone: '', age: '', 
    cnic: '', joinDate: new Date().toLocaleDateString(),
    category: 'Junior', isDraft: false, isAuthorized: false
  });

  // Match Context
  const [match, setMatch] = useState({ location: '', opponent: '' });

  // Load Players on Startup
  useEffect(() => {
    const loadData = async () => {
      try {
        const saved = await AsyncStorage.getItem('@mian_sahab_data');
        if (saved) setPlayers(JSON.parse(saved));
      } catch (e) { console.log("Load Error"); }
    };
    loadData();
  }, []);

  const saveToDisk = async (data) => {
    try {
      await AsyncStorage.setItem('@mian_sahab_data', JSON.stringify(data));
    } catch (e) { Alert.alert("Error", "Storage failed"); }
  };

  const handleRegister = () => {
    if (!regForm.name || !regForm.phone) {
      Alert.alert("Required", "Please enter Name and Phone number");
      return;
    }
    const newList = [...players, { ...regForm, id: Date.now().toString(), present: false, stats: {} }];
    setPlayers(newList);
    saveToDisk(newList);
    Alert.alert("Success", "Player account created in Mian Sahab 10");
    setView('home');
    setRegForm({ name: '', fName: '', phone: '', age: '', cnic: '', joinDate: new Date().toLocaleDateString(), category: 'Junior', isDraft: false, isAuthorized: false });
  };

  const updatePerformance = (pId, field, val) => {
    const updated = players.map(p => p.id === pId ? { ...p, stats: { ...p.stats, [field]: val } } : p);
    setPlayers(updated);
    saveToDisk(updated);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>MIAN SAHAB 10</Text>
        <Text style={styles.idTag}>AUTH CODE: {VERSION_ID}</Text>
      </View>

      {/* Navigation */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setView('home')}><Text>Home</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setView('reg')}><Text>+ Register</Text></TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setView('att')}><Text>Register</Text></TouchableOpacity>
      </View>

      <ScrollView style={styles.main}>
        {view === 'home' && (
          <View style={styles.card}>
            <Text style={styles.title}>Team Dashboard</Text>
            <Text style={styles.info}>Total Players: {players.length}</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Today's Match Location" 
              onChangeText={v => setMatch({...match, location: v})} 
            />
            <TextInput 
              style={styles.input} 
              placeholder="Opponent Team Name" 
              onChangeText={v => setMatch({...match, opponent: v})} 
            />
          </View>
        )}

        {view === 'reg' && (
          <View style={styles.card}>
            <Text style={styles.title}>Player Registration</Text>
            <TextInput style={styles.input} placeholder="Player Full Name" onChangeText={v => setRegForm({...regForm, name: v})} />
            <TextInput style={styles.input} placeholder="Father Name" onChangeText={v => setRegForm({...regForm, fName: v})} />
            <TextInput style={styles.input} placeholder="Phone Number" keyboardType="phone-pad" onChangeText={v => setRegForm({...regForm, phone: v})} />
            <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" onChangeText={v => setRegForm({...regForm, age: v})} />
            <TextInput style={styles.input} placeholder="Identity Card / CNIC" onChangeText={v => setRegForm({...regForm, cnic: v})} />
            
            <Text style={styles.label}>Select Category:</Text>
            <View style={styles.tagRow}>
              {['U13', 'U16', 'U19', 'Junior', 'Pro', 'Mixed', 'Draft Player'].map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.tag, regForm.category === cat && styles.tagActive]}
                  onPress={() => setRegForm({...regForm, category: cat})}
                >
                  <Text style={regForm.category === cat ? styles.tagTextActive : null}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <Text>Is Draft Player?</Text>
              <Switch value={regForm.isDraft} onValueChange={v => setRegForm({...regForm, isDraft: v})} />
            </View>

            <View style={styles.row}>
              <Text>Account Authorized?</Text>
              <Switch value={regForm.isAuthorized} onValueChange={v => setRegForm({...regForm, isAuthorized: v})} />
            </View>

            <TouchableOpacity style={styles.btnSave} onPress={handleRegister}>
              <Text style={styles.btnSaveText}>Confirm & Save Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {view === 'att' && (
          <View>
            <Text style={styles.title}>Daily Attendance & Performance</Text>
            {players.map(p => (
              <View key={p.id} style={styles.playerCard}>
                <View style={styles.row}>
                  <View>
                    <Text style={styles.pName}>{p.name} ({p.isDraft ? 'Draft' : 'Regular'})</Text>
                    <Text style={styles.pSub}>{p.category} | {p.isAuthorized ? '✅ Auth' : '❌ Pending'}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.attBtn, {backgroundColor: p.present ? '#2ecc71' : '#e74c3c'}]}
                    onPress={() => {
                      const updated = players.map(item => item.id === p.id ? {...item, present: !item.present} : item);
                      setPlayers(updated); saveToDisk(updated);
                    }}
                  >
                    <Text style={{color: '#fff'}}>{p.present ? 'Present' : 'Absent'}</Text>
                  </TouchableOpacity>
                </View>

                {p.present && (
                  <View style={styles.statsGrid}>
                    <TextInput style={styles.miniInp} placeholder="Runs" keyboardType="numeric" onChangeText={v => updatePerformance(p.id, 'runs', v)} />
                    <TextInput style={styles.miniInp} placeholder="Wkts" keyboardType="numeric" onChangeText={v => updatePerformance(p.id, 'wkts', v)} />
                    <TextInput style={styles.miniInp} placeholder="Overs" keyboardType="numeric" onChangeText={v => updatePerformance(p.id, 'overs', v)} />
                    <TextInput style={styles.miniInp} placeholder="Runs Given" keyboardType="numeric" onChangeText={v => updatePerformance(p.id, 'gave', v)} />
                    <TextInput style={[styles.miniInp, {width: '48%'}]} placeholder="Food Expense" keyboardType="numeric" onChangeText={v => updatePerformance(p.id, 'food', v)} />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  header: { backgroundColor: '#002f6c', padding: 20, alignItems: 'center' },
  headerText: { color: '#ffd700', fontSize: 24, fontWeight: 'bold' },
  idTag: { color: '#fff', fontSize: 10, marginTop: 4 },
  navBar: { flexDirection: 'row', backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#ddd' },
  navBtn: { flex: 1, padding: 15, alignItems: 'center' },
  main: { padding: 15 },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 20, elevation: 2 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  input: { borderBottomWidth: 1, borderColor: '#ccc', padding: 8, marginBottom: 15 },
  label: { fontSize: 14, fontWeight: 'bold', marginVertical: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tag: { padding: 8, backgroundColor: '#eee', borderRadius: 5, marginRight: 5, marginBottom: 5 },
  tagActive: { backgroundColor: '#002f6c' },
  tagTextActive: { color: '#fff' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 10 },
  btnSave: { backgroundColor: '#2ecc71', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  btnSaveText: { color: '#fff', fontWeight: 'bold' },
  playerCard: { backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 10 },
  pName: { fontSize: 16, fontWeight: 'bold' },
  pSub: { fontSize: 12, color: '#666' },
  attBtn: { padding: 10, borderRadius: 5 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 10, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
  miniInp: { borderWidth: 1, borderColor: '#ddd', borderRadius: 4, padding: 5, width: '23%', marginBottom: 10, fontSize: 12 }
});
