import React from 'react';
import { Text, StyleSheet, TextStyle } from 'react-native';
import Colors from '../../constants/Colors';

interface InstructionTextProps {
  children: React.ReactNode;
  style?: TextStyle;
}

function InstructionText({ children, style }: InstructionTextProps) {
  return <Text style={[styles.instructionText, style]}>{children}</Text>;
}

export default InstructionText;

const styles = StyleSheet.create({
  instructionText: {
    fontFamily: 'open-sans',
    fontSize: 24,
    color: Colors.accent500,
  },
});