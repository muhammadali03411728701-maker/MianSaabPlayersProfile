import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, Text, View, TextInput, ScrollView, 
  TouchableOpacity, Switch, Alert, SafeAreaView 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SYSTEM_ID = "50234";

export default function App() {
  const [view, setView] = useState('home'); 
  const [players, setPlayers] = useState([]);
  
  // Form State
  const [form, setForm] = useState({
    name: '', fatherName: '', phone: '', age: '', 
    cnic: '', joiningDate: new Date().toLocaleDateString(),
    category: 'Junior', type: 'Regular', authorized: false
  });

  // Load data from phone storage on start
  useEffect(() => {
    loadData();
  }, []);

  const saveData = async (data) => {
    try {
      await AsyncStorage.setItem('@players_list', JSON.stringify(data));
    } catch (e) {
      Alert.alert("Error", "Failed to save data locally.");
    }
  };

  const loadData = async () => {
    try {
      const savedPlayers = await AsyncStorage.getItem('@players_list');
      if (savedPlayers !== null) {
        setPlayers(JSON.parse(savedPlayers));
      }
    } catch (e) {
      Alert.alert("Error", "Failed to load records.");
    }
  };

  const registerPlayer = () => {
    if(!form.name || !form.phone) {
      Alert.alert("Empty Fields", "Please enter Player Name and Phone.");
      return;
    }
    const updatedList = [...players, { ...form, id: Date.now().toString(), present: false, stats: {} }];
    setPlayers(updatedList);
    saveData(updatedList);
    Alert.alert("Success", "Player Registered Successfully!");
    setView('home');
    setForm({ name: '', fatherName: '', phone: '', age: '', cnic: '', joiningDate: new Date().toLocaleDateString(), category: 'Junior', type: 'Regular', authorized: false });
  };

  const updateStats = (playerId, field, value) => {
    const updatedList = players.map(p => {
      if (p.id === playerId) {
        return { ...p, stats: { ...p.stats, [field]: value } };
      }
      return p;
    });
    setPlayers(updatedList);
    saveData(updatedList);
  };

  const toggleAttendance = (playerId) => {
    const updatedList = players.map(p => 
      p.id === playerId ? { ...p, present: !p.present } : p
    );
    setPlayers(updatedList);
    saveData(updatedList);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MIAN SAHAB 10</Text>
        <Text style={styles.systemTag}>System ID: {SYSTEM_ID}</Text>
      </View>

      <View style={styles.nav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => setView('home')}>
          <Text style={styles.navText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setView('add')}>
          <Text style={styles.navText}>+ Register</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navBtn} onPress={() => setView('attendance')}>
          <Text style={styles.navText}>Register</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.body}>
        {view === 'home' && (
          <View style={styles.homeCard}>
            <Text style={styles.title}>Welcome to Mian Sahab 10</Text>
            <Text style={styles.subtitle}>Total Registered Players: {players.length}</Text>
            <Text style={styles.infoText}>Manage your team performance and attendance easily.</Text>
          </View>
        )}

        {view === 'add' && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>New Player Account</Text>
            <TextInput style={styles.input} placeholder="Player Name" onChangeText={v => setForm({...form, name: v})} />
            <TextInput style={styles.input} placeholder="Father Name" onChangeText={v => setForm({...form, fatherName: v})} />
            <TextInput style={styles.input} placeholder="Phone Number" keyboardType="numeric" onChangeText={v => setForm({...form, phone: v})} />
            <TextInput style={styles.input} placeholder="Age" keyboardType="numeric" onChangeText={v => setForm({...form, age: v})} />
            <TextInput style={styles.input} placeholder="CNIC Number" onChangeText={v => setForm({...form, cnic: v})} />
            
            <Text style={styles.label}>Category:</Text>
            <View style={styles.catRow}>
              {['U13', 'U16', 'U19', 'Junior', 'Pro', 'Draft'].map(c => (
                <TouchableOpacity key={c} 
                  style={[styles.smallBtn, form.category === c && styles.activeBtn]} 
                  onPress={() => setForm({...form, category: c})}>
                  <Text style={styles.smallBtnText}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.switchRow}>
              <Text>Type: {form.type}</Text>
              <TouchableOpacity onPress={() => setForm({...form, type: form.type==='Regular'?'Draft':'Regular'})}>
                <Text style={styles.linkText}>[Change Type]</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.switchRow}>
              <Text>Authorize Account</Text>
              <Switch value={form.authorized} onValueChange={v => setForm({...form, authorized: v})} />
            </View>

            <TouchableOpacity style={styles.mainBtn} onPress={registerPlayer}>
              <Text style={styles.mainBtnText}>Save Player Account</Text>
            </TouchableOpacity>
          </View>
        )}

        {view === 'attendance' && (
          <View>
            <Text style={styles.title}>Daily Attendance Register</Text>
            <Text style={styles.dateLabel}>Date: {new Date().toLocaleDateString()}</Text>
            {players.map(p => (
              <View key={p.id} style={styles.playerItem}>
                <View style={styles.playerTop}>
                  <View>
                    <Text style={styles.playerName}>{p.name} ({p.type})</Text>
                    <Text style={styles.playerSub}>{p.category} | {p.authorized ? 'Authorized' : 'Pending'}</Text>
                  </View>
                  <TouchableOpacity 
                    style={[styles.attBtn, {backgroundColor: p.present ? '#27ae60' : '#c0392b'}]}
                    onPress={() => toggleAttendance(p.id)}>
                    <Text style={styles.attBtnText}>{p.present ? 'Present' : 'Absent'}</Text>
                  </TouchableOpacity>
                </View>

                {p.present && (
                  <View style={styles.statsBox}>
                    <View style={styles.inputRow}>
                      <TextInput style={styles.miniInput} placeholder="Runs" keyboardType="numeric" onChangeText={v => updateStats(p.id, 'runs', v)} />
                      <TextInput style={styles.miniInput} placeholder="Overs" keyboardType="numeric" onChangeText={v => updateStats(p.id, 'overs', v)} />
                      <TextInput style={styles.miniInput} placeholder="Wkts" keyboardType="numeric" onChangeText={v => updateStats(p.id, 'wkts', v)} />
                    </View>
                    <View style={styles.inputRow}>
                      <TextInput style={styles.miniInput} placeholder="Runs Conceded" keyboardType="numeric" onChangeText={v => updateStats(p.id, 'conceded', v)} />
                      <TextInput style={[styles.miniInput, {width: '64%'}]} placeholder="Food Expense" keyboardType="numeric" onChangeText={v => updateStats(p.id, 'food', v)} />
                    </View>
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
  container: { flex: 1, backgroundColor: '#f4f7f6' },
  header: { backgroundColor: '#1a2a6c', padding: 20, alignItems: 'center' },
  headerTitle: { color: '#f1c40f', fontSize: 24, fontWeight: 'bold' },
  systemTag: { color: '#fff', fontSize: 10, marginTop: 5 },
  nav: { flexDirection: 'row', backgroundColor: '#fff', elevation: 3 },
  navBtn: { flex: 1, padding: 15, alignItems: 'center', borderRightWidth: 1, borderRightColor: '#eee' },
  navText: { fontWeight: 'bold', color: '#1a2a6c' },
  body: { padding: 15 },
  homeCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center', marginTop: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2c3e50', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#7f8c8d' },
  infoText: { marginTop: 15, textAlign: 'center', color: '#95a5a6' },
  formCard: { backgroundColor: '#fff', padding: 15, borderRadius: 10 },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15, color: '#1a2a6c' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 10, marginBottom: 10 },
  label: { fontWeight: 'bold', marginVertical: 5 },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  smallBtn: { padding: 8, backgroundColor: '#eee', borderRadius: 5, marginRight: 5, marginBottom: 5 },
