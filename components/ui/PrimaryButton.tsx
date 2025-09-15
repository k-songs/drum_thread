import React from 'react';
import { View, Text, Pressable, StyleSheet, ViewStyle } from "react-native";
import Colors from "../../constants/Colors";

// PrimaryButton.tsx
interface PrimaryButtonProps {
    children: React.ReactNode;
    onPress: () => void;
    disabled?: boolean;
    style?: ViewStyle | ViewStyle[] | (ViewStyle | false)[];
  }

function PrimaryButton({ children, onPress, disabled = false, style }: PrimaryButtonProps) {
  return (
    <View style={[styles.buttonOuterContainer, style]}>
      <Pressable
        style={[
          styles.buttonInnerContainer,
          disabled && styles.disabledButton
        ]}
        onPress={onPress}
        disabled={disabled}
        android_ripple={{ color: Colors.primary600 }}
      >
        <Text style={styles.buttonText}>{children}</Text>
      </Pressable>
    </View>
  );
}

export default PrimaryButton;

const styles = StyleSheet.create({
  buttonOuterContainer: {
    borderRadius: 28,
    margin: 4,
    overflow: "hidden",
    marginBottom: 4,
  },
  buttonInnerContainer: {
    backgroundColor: Colors.primary500,
    paddingVertical: 8,
    paddingHorizontal: 16,
    elevation: 2,
  },
  disabledButton: {
    backgroundColor: Colors.primary700,
    opacity: 0.6,
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontFamily: 'open-sans-bold',
    fontSize: 16,
  },
});