import { View, StyleSheet, Button } from 'react-native';
import { TwitterAuthProvider } from '../../src';

export default function App() {
  const provider = new TwitterAuthProvider({
    clientId: 'YOUR CLIENT ID',
    clientSecret: 'YOUR CLIENT SECRET',
  });

  const handleLogin = async () => {
    try {
      const state = await provider.login();
      console.log(state);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
