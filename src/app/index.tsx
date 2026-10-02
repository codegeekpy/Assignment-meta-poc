import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';


type Lead = {
  name: string;
  email: string;
  phone: string;
};

export default function HomeScreen() {
  const [leads, setLeads] = useState<Lead[]>([]);
  // const [message, setMessage] = useState<string>('');
  useEffect(() => {
    const ws = new WebSocket('ws://192.168.29.178:3000');
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (Array.isArray(data)) {
        setLeads(data);
      } else {
        setLeads((previousLeads) => [...previousLeads, data]);
      }
    };
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    ws.onclose = () => {
      console.log('WebSocket connection closed');
    };
    
    return () => {
      ws.close();
    };
  }, []);

  return (
    //  <> <View style={styles.container}>
    //     <Text style={styles.text}>No Leads yet</Text>
    //   </View>
    <>
      <View style={styles.container}>
        <Text style={styles.text}>Leads List</Text>
        {leads.map((lead, index) => (
          <View key={index}>
            <Text style={styles.text}>Name: {lead.name}</Text>
            <Text style={styles.text}>Email: {lead.email}</Text>
            <Text style={styles.text}>Phone: {lead.phone}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e9dbdb',
  },
});
