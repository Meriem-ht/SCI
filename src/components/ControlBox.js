import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons, MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "../styles/style";

const ControlBox = ({
  title,
  enabled,
  selected,
  onPress,
  iconType,
  iconName,
}) => {
  const IconComponent =
    iconType === "material-community"
      ? MaterialCommunityIcons
      : MaterialIcons;

  return (
    <View style={styles.boxWrapper}>
      <Text
        style={[
          styles.boxTitle,
          {
            borderBottomColor: selected
              ? "#E2FFA3"
              : "transparent",
          },
        ]}
      >
        {title}
      </Text>

      <TouchableOpacity
        style={[
          styles.boxContainer,
          {
            backgroundColor: enabled
              ? "#E2FFA3"
              : "rgba(0,0,0,.34)",
          },
        ]}
        onPress={onPress}
      >
        <TouchableOpacity
          style={[
            styles.miniBoxContainer,
            {
              backgroundColor: enabled
                ? "#242323"
                : "rgba(255,255,255,.24)",
            },
          ]}
          onPress={onPress}
        >
          <IconComponent
            name={iconName}
            style={styles.iconStyle}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </View>
  );
};

export default ControlBox;