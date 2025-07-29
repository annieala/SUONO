// File: app/(tabs)/vancouver.tsx

import { StyleSheet, Image, View } from 'react-native';
import CityLink from '../../components/CityLink';
import CityInfo from '../../components/CityInfo'; // Adjust path if needed

export default function VancouverScreen() {
  const vancouverInfo = "Vancouver, a bustling west coast seaport in British Columbia, is among Canada’s densest, most ethnically diverse cities. A popular filming location, it’s surrounded by mountains, and also has thriving art, theatre and music scenes.";

  return (
    <View style={styles.container}>
      {/* You need to add a Vancouver image to your assets folder */}
      <Image 
        source={require('../../assets/vancouver.jpg')} // CHANGE THIS to your image path
        style={styles.cityImage} 
      />
      <CityLink url="https://vancouver.ca/" />
      <CityInfo info={vancouverInfo} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
  },
  cityImage: {
    width: 300,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
});