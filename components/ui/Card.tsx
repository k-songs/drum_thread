import React from 'react';
import { StyleSheet, View, ViewStyle } from "react-native";
import Colors from '../../constants/Colors';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export default Card;

const styles = StyleSheet.create({
  card: {
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 24,
    marginTop: 36,
    padding: 16,
    backgroundColor: Colors.primary800,
    borderRadius: 8,
    elevation: 4,
  },
});